'use client';

import axios from 'axios';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ROLE_ENDPOINTS: Record<string, string> = {
  patient: '/api/auth/loginpatient',
  doctor: '/api/auth/loginstaff',
  nurse: '/api/auth/loginstaff',
  admin: '/api/auth/register/admin',
};

function normalize(s: string) {
  return s?.trim().toLowerCase();
}

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [role, setRole] = useState<string>('patient'); // default to patient
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const base = process.env.NEXT_PUBLIC_API_URL;
      const url = ROLE_ENDPOINTS[role];
      if (!url || !base) throw new Error('Unknown role or missing API base URL');

      // Hit the API endpoint for the selected role
      const response = await axios.post(
        `${base}${url}`,
        { email, password },
        {
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' },
        },
      );

      // ["Patient", "Doctor"], ["Patient", "Nurse"], ["Patient", "Admin"]
      const rolesFromApi: string[] = Array.isArray(response?.data?.roles)
        ? response.data.roles
        : [];

      const normalized = rolesFromApi.map(normalize);
      const selected = normalize(role);

      // check to see if  role is included in the API roles
      if (!normalized.includes(selected)) {
        toast.error(`You don't have the "${role}" role for this account.`);
        return;
      }

      // Allowed -> redirect based on what they chose
      router.push(`/dashboard/${role}`);
    } catch (err: unknown) {
      // gbt wrote this error handling part because for the life of me i couldnt solve the issue
      let msg = 'Login failed';

      if (axios.isAxiosError(err)) {
        const data = err.response?.data as { message?: string } | undefined;
        msg = data?.message ?? err.message ?? msg;
      } else if (err instanceof Error) {
        msg = err.message ?? msg;
      }

      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  const canSubmit = email.length > 3 && password.length >= 6 && !!role;

  return (
    <div className="bg-background flex items-center justify-center">
      <div className="w-full px-6">
        <h1 className="mb-8 text-center text-3xl font-semibold">Sign in</h1>

        <form onSubmit={onSubmit} className="space-y-6">
          {/* Role select field */}
          <div className="space-y-2">
            <Label htmlFor="role">Sign in as</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger id="role" className="h-12 w-full">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="patient">Patient</SelectItem>
                <SelectItem value="doctor">Doctor</SelectItem>
                <SelectItem value="nurse">Nurse</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Email field */}
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

          {/* Password field */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              className="h-12 w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-center text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" className="h-12 w-full text-base" disabled={loading || !canSubmit}>
            {loading ? 'Signing in…' : 'Log in'}
          </Button>
        </form>

        <div className="text-muted-foreground mt-6 text-center text-sm">
          No account?{' '}
          <a href="/Sign-up" className="font-bold text-black underline hover:no-underline">
            Create one
          </a>
        </div>
      </div>
    </div>
  );
}
