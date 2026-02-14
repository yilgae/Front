import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID = '333280411085-vlut8smanu3gk36s4g3p9n253erjult5.apps.googleusercontent.com';

export type UserInfo = {
  id: string;
  name: string;
  email: string;
  picture: string;
};

type AuthContextType = {
  user: UserInfo | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInAsGuest: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  signInWithGoogle: async () => {},
  signInAsGuest: async () => {},
  signOut: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_CLIENT_ID,
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

  const loadUser = async () => {
    try {
      const stored = await AsyncStorage.getItem('user');
      if (stored) {
        setUser(JSON.parse(stored));
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

  const signInAsGuest = async () => {
    const guestUser: UserInfo = {
      id: 'guest',
      name: '게스트',
      email: 'guest@readgye.app',
      picture: '',
    };
    setUser(guestUser);
    await AsyncStorage.setItem('user', JSON.stringify(guestUser));
  };

  const signOut = async () => {
    setUser(null);
    await AsyncStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signInWithGoogle, signInAsGuest, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
