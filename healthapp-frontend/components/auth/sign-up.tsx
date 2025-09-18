'use client';

import axios from 'axios';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SignUp() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = email.trim().length > 3 && password.trim().length >= 6;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading || !canSubmit) return;

    setError(null);
    setLoading(true);

    try {
      const base = process.env.NEXT_PUBLIC_API_URL;
      if (!base) throw new Error('NEXT_PUBLIC_API_URL is not set.');

      await axios.post(
        `${base}/auth/signup`,
        { email: email.trim(), password: password.trim() },
        { withCredentials: true, headers: { 'Content-Type': 'application/json' } },
      );

      // success -> send them on their way to the login page
      router.push('/Sign-up');
      // chat had to help me with the erro handling
    } catch (err: unknown) {
      let msg = 'Sign up failed. Please try again.';
      if (axios.isAxiosError(err)) {
        msg =
          (err.response?.data as { message?: string } | undefined)?.message ||
          err.response?.statusText ||
          err.message ||
          msg;
      } else if (err instanceof Error) {
        msg = err.message || msg;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-background flex min-h-screen w-full items-center justify-center">
      <div className="w-full max-w-md px-6">
        <h1 className="mb-8 text-center text-3xl font-semibold">Create your account</h1>

        <form onSubmit={onSubmit} className="space-y-6">
          {/*  email field  */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="name@example.com"
              required
              className="h-12 w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          {/*  PAssword field  */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              className="h-12 w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-center text-sm text-red-600" role="alert" aria-live="polite">
              {error}
            </p>
          )}

          <Button type="submit" className="h-12 w-full text-base" disabled={loading || !canSubmit}>
            {loading ? 'Creating account…' : 'Create account'}
          </Button>
        </form>

        <div className="text-muted-foreground mt-6 text-center text-sm">
          Already have an account?{' '}
          <a href="/Sign-in" className="font-bold text-black underline hover:no-underline">
            Sign in
          </a>
        </div>
      </div>
    </div>
  );
}
