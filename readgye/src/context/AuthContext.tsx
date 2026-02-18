import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform } from 'react-native';

const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '';
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? '';
const GUEST_EMAIL = process.env.EXPO_PUBLIC_GUEST_EMAIL ?? '';
const GUEST_PASSWORD = process.env.EXPO_PUBLIC_GUEST_PASSWORD ?? '';

type GoogleSigninModule = {
  GoogleSignin: {
    configure: (config: { webClientId: string; scopes: string[] }) => void;
    hasPlayServices: () => Promise<void>;
    signIn: () => Promise<{
      type: 'success' | 'cancelled';
      data?: {
        user: {
          id: string;
          name?: string | null;
          email: string;
          photo?: string | null;
        };
      };
    }>;
    signOut: () => Promise<void>;
  };
  statusCodes: {
    SIGN_IN_CANCELLED: string;
    IN_PROGRESS: string;
    PLAY_SERVICES_NOT_AVAILABLE: string;
  };
};

let googleSigninModule: GoogleSigninModule | null = null;
try {
  // Expo Go에서는 네이티브 모듈이 없어 require 단계에서 실패할 수 있다.
  googleSigninModule = require('@react-native-google-signin/google-signin');
} catch (e) {
  console.log('Google Sign-In native module unavailable:', e);
}

const isGoogleSignInAvailable = !!googleSigninModule;

if (googleSigninModule) {
  googleSigninModule.GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    scopes: ['profile', 'email'],
  });
}

export type UserInfo = {
  id: string;
  name: string;
  email: string;
  picture: string;
  is_admin?: boolean;
};

export type BackendProfile = {
  id: string;
  email: string;
  name: string;
};

type BackendNotification = {
  id: string;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
  document_id?: string | null;
};

type AuthContextType = {
  user: UserInfo | null;
  token: string | null;
  isLoading: boolean;
  isGoogleSignInAvailable: boolean;
  unreadNotificationCount: number;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  signInAsGuest: () => Promise<void>;
  signOut: () => Promise<void>;
  fetchBackendProfile: () => Promise<BackendProfile | null>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  isGoogleSignInAvailable: false,
  unreadNotificationCount: 0,
  signInWithGoogle: async () => {},
  signInWithEmail: async () => ({ success: false }),
  signUpWithEmail: async () => ({ success: false }),
  signInAsGuest: async () => {},
  signOut: async () => {},
  fetchBackendProfile: async () => null,
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const pollingLockRef = useRef(false);

  useEffect(() => {
    loadUser();
  }, []);

  const showAppAlert = useCallback((title: string, message: string) => {
    if (Platform.OS === 'web') {
      const webAlert = (globalThis as { alert?: (msg: string) => void }).alert;
      if (typeof webAlert === 'function') {
        webAlert(`${title}\n\n${message}`);
      }
      return;
    }
    Alert.alert(title, message);
  }, []);

  const markAllNotificationsAsRead = useCallback(async (accessToken: string) => {
    await fetch(`${API_BASE_URL}/api/notifications/read-all`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  }, []);

  const pollUnreadNotifications = useCallback(async () => {
    if (!token || pollingLockRef.current) {
      return;
    }

    pollingLockRef.current = true;
    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications/unread`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        setUnreadNotificationCount(0);
        return;
      }

      const notifications: BackendNotification[] = await res.json();
      setUnreadNotificationCount(notifications.length);
      if (notifications.length === 0) {
        return;
      }
      if (notifications.length === 1) {
        showAppAlert(notifications[0].title, notifications[0].message);
      } else {
        showAppAlert('분석 완료', `${notifications.length}건의 계약서 분석이 완료되었습니다.`);
      }

      await markAllNotificationsAsRead(token);
      setUnreadNotificationCount(0);
    } catch (e) {
      console.log('Failed to poll notifications', e);
    } finally {
      pollingLockRef.current = false;
    }
  }, [markAllNotificationsAsRead, showAppAlert, token]);

  useEffect(() => {
    if (!token) {
      setUnreadNotificationCount(0);
      return;
    }

    pollUnreadNotifications();
    const timer = setInterval(() => {
      pollUnreadNotifications();
    }, 8000);

    return () => clearInterval(timer);
  }, [pollUnreadNotifications, token]);

  // 백엔드 회원가입 + 로그인을 수행하여 JWT 토큰 획득
  const loginToBackend = async (email: string, password: string, name: string) => {
    try {
      await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      const loginRes = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
      });

      if (loginRes.ok) {
        const tokenData = await loginRes.json();
        setToken(tokenData.access_token);
        await AsyncStorage.setItem('backendToken', tokenData.access_token);

        // is_admin 정보 가져오기
        try {
          const meRes = await fetch(`${API_BASE_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
          });
          if (meRes.ok) {
            const profile = await meRes.json();
            setUser((prev) =>
              prev ? { ...prev, is_admin: profile.is_admin || false } : prev,
            );
          }
        } catch (e) {
          console.log('관리자 정보 조회 실패 (기능에는 영향 없음):', e);
        }

        console.log('백엔드 로그인 성공, 토큰 저장 완료');
      } else {
        console.log('백엔드 로그인 실패:', loginRes.status);
      }
    } catch (e) {
      console.log('백엔드 연결 실패 (서버가 꺼져있을 수 있음):', e);
    }
  };

  const loadUser = async () => {
    try {
      const stored = await AsyncStorage.getItem('user');
      const storedToken = await AsyncStorage.getItem('backendToken');
      if (stored) {
        const parsedUser = JSON.parse(stored);
        setUser(parsedUser);

        if (storedToken) {
          setToken(storedToken);
        } else if (parsedUser.email === GUEST_EMAIL) {
          console.log('게스트 토큰 없음 → 백엔드 자동 로그인 시도');
          await loginToBackend(GUEST_EMAIL, GUEST_PASSWORD, '게스트');
        }
      }
    } catch (e) {
      console.log('Failed to load user', e);
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    if (!googleSigninModule) {
      throw new Error('Expo Go에서는 Google 로그인 네이티브 모듈을 사용할 수 없습니다. Dev Build 또는 EAS 빌드를 사용하세요.');
    }

    const { GoogleSignin, statusCodes } = googleSigninModule;
    try {
      console.log('Google 로그인 시작 (네이티브)');
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();

      if (response.type === 'success' && response.data) {
        const { user: googleUser } = response.data;

        const userData: UserInfo = {
          id: googleUser.id,
          name: googleUser.name || '',
          email: googleUser.email,
          picture: googleUser.photo || '',
        };
        setUser(userData);
        await AsyncStorage.setItem('user', JSON.stringify(userData));

        // 백엔드 로그인
        const googlePassword = `google_${googleUser.id}`;
        await loginToBackend(googleUser.email, googlePassword, googleUser.name || '');

        console.log('Google 로그인 성공:', googleUser.email);
      }
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('Google 로그인 취소');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('Google 로그인 진행 중');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log('Google Play Services 사용 불가');
      } else {
        console.log('Google sign in error:', error);
      }
    }
  };

  const signInWithEmail = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const loginRes = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
      });

      if (!loginRes.ok) {
        const errData = await loginRes.json().catch(() => null);
        return { success: false, error: errData?.detail || '이메일 또는 비밀번호가 틀렸습니다.' };
      }

      const tokenData = await loginRes.json();
      setToken(tokenData.access_token);
      await AsyncStorage.setItem('backendToken', tokenData.access_token);

      const meRes = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      if (meRes.ok) {
        const profile = await meRes.json();
        const userData: UserInfo = {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          picture: '',
          is_admin: profile.is_admin || false,
        };
        setUser(userData);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
      }

      return { success: true };
    } catch (e) {
      return { success: false, error: '서버에 연결할 수 없습니다.' };
    }
  };

  const signUpWithEmail = async (email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const signupRes = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      if (!signupRes.ok) {
        const errData = await signupRes.json().catch(() => null);
        return { success: false, error: errData?.detail || '회원가입에 실패했습니다.' };
      }

      return await signInWithEmail(email, password);
    } catch (e) {
      return { success: false, error: '서버에 연결할 수 없습니다.' };
    }
  };

  const signInAsGuest = async () => {
    const guestUser: UserInfo = {
      id: 'guest',
      name: '게스트',
      email: GUEST_EMAIL,
      picture: '',
    };
    setUser(guestUser);
    await AsyncStorage.setItem('user', JSON.stringify(guestUser));

    await loginToBackend(GUEST_EMAIL, GUEST_PASSWORD, '게스트');
  };

  const signOut = async () => {
    try {
      if (googleSigninModule) {
        await googleSigninModule.GoogleSignin.signOut();
      }
    } catch (e) {
      console.log('Google 로그아웃 실패 (이메일/게스트 로그인이었을 수 있음):', e);
    }
    setUser(null);
    setToken(null);
    setUnreadNotificationCount(0);
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('backendToken');
  };

  const fetchBackendProfile = async (): Promise<BackendProfile | null> => {
    try {
      const currentToken = token || (await AsyncStorage.getItem('backendToken'));
      if (!currentToken) {
        console.log('No backend token available');
        return null;
      }
      const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      if (!res.ok) {
        console.log('Failed to fetch backend profile:', res.status);
        return null;
      }
      const profile: BackendProfile = await res.json();
      return profile;
    } catch (e) {
      console.log('Error fetching backend profile', e);
      return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isGoogleSignInAvailable,
        unreadNotificationCount,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signInAsGuest,
        signOut,
        fetchBackendProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
