'use client';
import { useEffect } from 'react';

import { useAuth } from '@/app/providers/AuthProvider';

export default function SignOutPage() {
  const { logout } = useAuth();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await logout();
      if (!cancelled) window.location.replace('/'); // hard nav to re-read cookies
    })();
    return () => {
      cancelled = true;
    };
  }, [logout]);

  return <p className="p-6 text-sm">Signing you out…</p>;
}
