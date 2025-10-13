'use client';

import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export type Role = 'ADMIN' | 'PATIENT' | 'DOCTOR' | 'NURSE';

type UsersResponse = Record<string, Role[]>;

const ALL_ROLES: Role[] = ['ADMIN', 'PATIENT', 'DOCTOR', 'NURSE', 'NURSE'];

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<UsersResponse>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [selection, setSelection] = useState<Record<string, Role | ''>>({});
  const [rowBusy, setRowBusy] = useState<Record<string, boolean>>({});

  const refresh = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get<UsersResponse>('/api/admin/getusers');
      setUsers(res.data || {});
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const rows = useMemo(() => {
    const entries = Object.entries(users);
    if (!query.trim()) return entries;
    const q = query.trim().toLowerCase();
    return entries.filter(([email]) => email.toLowerCase().includes(q));
  }, [users, query]);

  const setBusy = (email: string, v: boolean) => setRowBusy((prev) => ({ ...prev, [email]: v }));

  const onActivate = async (email: string) => {
    try {
      setBusy(email, true);
      await api.post('/api/admin/activate', { email });
    } catch (e) {
      console.error(e);
      alert('Failed to activate user.');
    } finally {
      setBusy(email, false);
    }
  };

  const onDeactivate = async (email: string) => {
    try {
      setBusy(email, true);
      await api.post('/api/admin/deactivate', { email });
    } catch (e) {
      console.error(e);
      alert('Failed to deactivate user.');
    } finally {
      setBusy(email, false);
    }
  };

  const onAddRole = async (email: string) => {
    const role = selection[email];
    if (!role) {
      alert('Select a role first.');
      return;
    }
    try {
      setBusy(email, true);
      await api.post('/api/admin/addroles', { email, roles: [role] });
      // optimistic update
      setUsers((prev) => ({
        ...prev,
        [email]: Array.from(new Set([...(prev[email] || []), role])),
      }));
    } catch (e) {
      console.error(e);
      alert('Failed to add role.');
    } finally {
      setBusy(email, false);
    }
  };

  const onRemoveRole = async (email: string) => {
    const role = selection[email];
    if (!role) {
      alert('Select a role first.');
      return;
    }
    try {
      setBusy(email, true);
      await api.post('/api/admin/removeroles', { email, roles: [role] });
      // optimistic update
      setUsers((prev) => ({
        ...prev,
        [email]: (prev[email] || []).filter((r) => r !== role),
      }));
    } catch (e) {
      console.error(e);
      alert('Failed to remove role.');
    } finally {
      setBusy(email, false);
    }
  };

  return (
    <div className="h-full w-full space-y-4 p-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">Admin Dashboard</h1>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search by email…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-72"
          />
          <Button variant="outline" onClick={refresh} disabled={loading}>
            Refresh
          </Button>
        </div>
      </div>

      <Table>
        <TableCaption>
          {loading ? 'Loading users…' : error ? error : 'Manage users, roles, and status.'}
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[320px]">Email</TableHead>
            <TableHead>Current Roles</TableHead>
            <TableHead className="w-[260px]">Select Role</TableHead>
            <TableHead className="w-[220px]">Role Actions</TableHead>
            <TableHead className="w-[220px] text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(([email, roles]) => (
            <TableRow key={email}>
              <TableCell className="max-w-[300px] truncate font-medium" title={email}>
                {email}
              </TableCell>

              <TableCell className="space-x-2">
                {(roles || []).length === 0 ? (
                  <span className="text-muted-foreground text-sm">No roles</span>
                ) : (
                  roles.map((r) => (
                    <Badge key={r} variant="secondary" className="mb-1">
                      {r}
                    </Badge>
                  ))
                )}
              </TableCell>

              <TableCell>
                <Select
                  value={selection[email] || ''}
                  onValueChange={(v) => setSelection((prev) => ({ ...prev, [email]: v as Role }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_ROLES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>

              <TableCell>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => onAddRole(email)} disabled={rowBusy[email]}>
                    Add
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onRemoveRole(email)}
                    disabled={rowBusy[email]}
                  >
                    Remove
                  </Button>
                </div>
              </TableCell>

              <TableCell className="text-right">
                <div className="inline-flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onActivate(email)}
                    disabled={rowBusy[email]}
                  >
                    Activate
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onDeactivate(email)}
                    disabled={rowBusy[email]}
                  >
                    Deactivate
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
