'use client';

import axios from 'axios';
import { useRouter } from 'next/navigation';
import React, {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
} from 'react';

import { dtoToUi, UserProfile, UserProfileResponseDto } from '@/lib/types';

type AuthContextShape = {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string, role?: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextShape | undefined>(undefined);

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const mountedRef = useRef(true);
  useEffect(() => () => { mountedRef.current = false; }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<UserProfileResponseDto>('/api/users/me');
      if (!mountedRef.current) return;
      setUser(dtoToUi(res.data));
    } catch {
      if (!mountedRef.current) return;
      setUser(null);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'visible') void refresh();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [refresh]);

  const login = useCallback(
    async (email: string, password: string, role?: string) => {
      const base = process.env.NEXT_PUBLIC_API_URL;
      if (!base) throw new Error('Missing NEXT_PUBLIC_API_URL');
      const rolePath =
        role === 'patient' ? '/api/auth/loginpatient' : '/api/auth/loginstaff';
      await api.post(rolePath, { email, password });
      await refresh();
    },
    [refresh],
  );

  const logout = useCallback(async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (e) {
      console.error('Logout failed:', e);
    } finally {
      if (mountedRef.current) setUser(null);
      router.push('/');     // soft nav
      router.refresh();
    }
  }, [router]);

  const value = useMemo(
    () => ({ user, loading, login, logout, refresh }),
    [user, loading, login, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
