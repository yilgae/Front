import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_WEB_CLIENT_ID = '333280411085-vlut8smanu3gk36s4g3p9n253erjult5.apps.googleusercontent.com';
const GOOGLE_IOS_CLIENT_ID = '333280411085-2fbvg1bhtukco7bqnq2hddm7gcfh743i.apps.googleusercontent.com';
export const API_BASE_URL = 'http://localhost:8000';

export type UserInfo = {
  id: string;
  name: string;
  email: string;
  picture: string;
};

// 백엔드 /api/auth/me 에서 반환하는 프로필 타입
export type BackendProfile = {
  id: string;
  email: string;
  name: string;
};

type AuthContextType = {
  user: UserInfo | null;
  token: string | null;
  isLoading: boolean;
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

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: GOOGLE_WEB_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    webClientId: GOOGLE_WEB_CLIENT_ID,
  });

  // 앱 시작 시 저장된 사용자 정보 불러오기
  useEffect(() => {
    loadUser();
  }, []);

  // Google 로그인 응답 처리
  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      if (authentication?.accessToken) {
        fetchUserInfo(authentication.accessToken);
      }
    }
  }, [response]);

  // 백엔드 회원가입 + 로그인을 수행하여 JWT 토큰 획득
  const loginToBackend = async (email: string, password: string, name: string) => {
    try {
      // 1) 회원가입 시도 (이미 존재하면 400 → 무시하고 로그인 진행)
      await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      // 2) 로그인 (OAuth2PasswordRequestForm → form-urlencoded)
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
          // 기존 게스트 세션인데 백엔드 토큰이 없으면 자동 로그인 시도
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

  const fetchUserInfo = async (accessToken: string) => {
    try {
      const res = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const userInfo = await res.json();
      const userData: UserInfo = {
        id: userInfo.id,
        name: userInfo.name,
        email: userInfo.email,
        picture: userInfo.picture,
      };
      setUser(userData);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
    } catch (e) {
      console.log('Failed to fetch user info', e);
    }
  };

  const signInWithGoogle = async () => {
    try {
      await promptAsync();
    } catch (e) {
      console.log('Google sign in error', e);
    }
  };

  // 이메일 로그인 (POST /api/auth/login)
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

      // /api/auth/me 로 유저 정보 가져오기
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

  // 이메일 회원가입 (POST /api/auth/signup → 자동 로그인)
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

      // 회원가입 성공 → 자동 로그인
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

    // 백엔드에 게스트 계정 자동 생성 & 로그인하여 JWT 토큰 획득
    await loginToBackend(guestEmail, guestPassword, '게스트');
  };

  const signOut = async () => {
    setUser(null);
    setToken(null);
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('backendToken');
  };

  // 백엔드 GET /api/auth/me 호출
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
      value={{ user, token, isLoading, signInWithGoogle, signInWithEmail, signUpWithEmail, signInAsGuest, signOut, fetchBackendProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}
