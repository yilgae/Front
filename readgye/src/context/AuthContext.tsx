import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GOOGLE_WEB_CLIENT_ID = '333280411085-vlut8smanu3gk36s4g3p9n253erjult5.apps.googleusercontent.com';
export const API_BASE_URL = 'https://back-production-e1e1.up.railway.app';

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
};

export type BackendProfile = {
  id: string;
  email: string;
  name: string;
};

type AuthContextType = {
  user: UserInfo | null;
  token: string | null;
  isLoading: boolean;
  isGoogleSignInAvailable: boolean;
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

  useEffect(() => {
    loadUser();
  }, []);

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
        } else if (parsedUser.email === 'guest@readgye.app') {
          console.log('게스트 토큰 없음 → 백엔드 자동 로그인 시도');
          await loginToBackend('guest@readgye.app', 'guest1234!', '게스트');
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
    const guestEmail = 'guest@readgye.app';
    const guestPassword = 'guest1234!';
    const guestUser: UserInfo = {
      id: 'guest',
      name: '게스트',
      email: guestEmail,
      picture: '',
    };
    setUser(guestUser);
    await AsyncStorage.setItem('user', JSON.stringify(guestUser));

    await loginToBackend(guestEmail, guestPassword, '게스트');
  };

  const signOut = async () => {
    try {
      if (googleSigninModule) {
        await googleSigninModule.GoogleSignin.signOut();
      }
    } catch (e) {
      // Google 로그인이 아닌 경우 무시
    }
    setUser(null);
    setToken(null);
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
