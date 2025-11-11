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
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { firstName, lastName, email, password } = formData;

  const canSubmit =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    email.trim().length > 3 &&
    password.trim().length >= 8;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading || !canSubmit) return;

    setError(null);
    setLoading(true);

    try {
      const base = process.env.NEXT_PUBLIC_API_URL;
      if (!base) throw new Error('NEXT_PUBLIC_API_URL is not set.');

      await axios.post(
        `${base}/api/auth/register`,
        {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          password: password.trim(),
        },
        { withCredentials: true, headers: { 'Content-Type': 'application/json' } },
      );

      router.push('/dashboard/patient');
    } catch (err: unknown) {
      let msg = 'Sign up failed. Please try again.';
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 409) {
          msg = 'That email is already in use. Try signing in or use another email.';
        } else {
          msg =
            (err.response?.data as { message?: string } | undefined)?.message || err.message || msg;
        }
      } else if (err instanceof Error) {
        msg = err.message;
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
          <div className="flex w-full space-x-4">
            {/* First Name Field */}
            <div className="flex-1 space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                autoComplete="given-name"
                required
                className="h-12 w-full"
                value={firstName}
                onChange={handleChange}
              />
            </div>
            {/* Last Name Field */}
            <div className="flex-1 space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                autoComplete="family-name"
                required
                className="h-12 w-full"
                value={lastName}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="name@example.com"
              required
              className="h-12 w-full"
              value={email}
              onChange={handleChange}
            />
          </div>
          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              className="h-12 w-full"
              value={password}
              onChange={handleChange}
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
