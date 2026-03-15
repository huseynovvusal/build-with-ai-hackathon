import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/auth';
import { API_BASE_URL } from '../api/client';

interface AuthContextType {
  user: any | null;
  token: string | null;
  isLoading: boolean;
  login: (access: string, refresh: string, member: any) => void;
  updateUser: (member: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token_access'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token_access');
      if (storedToken) {
        try {
          const userData = await authApi.getMe();
          setUser(userData);
          setToken(storedToken);
        } catch (err) {
          console.error('Failed to restore session', err);
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();

    const handleUnauthorized = () => logout();
    window.addEventListener('unauthorized', handleUnauthorized);
    return () => window.removeEventListener('unauthorized', handleUnauthorized);
  }, []);

  useEffect(() => {
    if (!token) return;

    const streamUrl = `${API_BASE_URL}/auth/stream/?token=${encodeURIComponent(token)}`;
    const eventSource = new EventSource(streamUrl);

    const onMemberUpdate = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        setUser(data);
        window.dispatchEvent(new CustomEvent('member_update', { detail: data }));
      } catch (err) {
        console.error('Failed to parse stream payload', err);
      }
    };

    eventSource.addEventListener('member_update', onMemberUpdate as EventListener);

    eventSource.onerror = () => {
      // Keep silent; browser auto-reconnects EventSource
    };

    return () => {
      eventSource.removeEventListener('member_update', onMemberUpdate as EventListener);
      eventSource.close();
    };
  }, [token]);

  const login = (access: string, refresh: string, member: any) => {
    localStorage.setItem('token_access', access);
    localStorage.setItem('token_refresh', refresh);
    setToken(access);
    setUser(member);
  };

  const logout = () => {
    localStorage.removeItem('token_access');
    localStorage.removeItem('token_refresh');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, updateUser: setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
