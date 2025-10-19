'use client';
import { useEffect } from 'react';

import { useAuth } from '@/app/providers/authProvider';

export default function SignOutPage() {
  const { logout } = useAuth();

  useEffect(() => {
    void logout();
  }, [logout]);

  return <p className="p-6 text-sm">Signing you out…</p>;
}
