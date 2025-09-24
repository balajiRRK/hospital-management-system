'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { apiLogout, getMe } from '@/app/appointments/api';

type User = { id: number; email: string; name?: string; authorities?: string[] };

type AuthContextShape = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextShape | undefined>(undefined);

const API_BASE = process.env.NEXT_PUBLIC_API_URL!;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const me = await getMe();
      setUser(me);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await fetch(`${API_BASE}/api/auth/loginpatient`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      await refresh();
    },
    [refresh],
  );

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch (e) {
      console.error(e);
    } finally {
      setUser(null); // clear client state no matter what
    }
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, logout, refresh }),
    [user, loading, login, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
