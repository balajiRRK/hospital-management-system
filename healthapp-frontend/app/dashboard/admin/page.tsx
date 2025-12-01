'use client';

import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getAppointmentsForPatient,
  getNurseNote,
  getAppointmentResult,
  getUserById,
  getUserEmailById,
} from "@/lib/api";

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
type UserStatusResponse = Record<string, boolean>; 

const ALL_ROLES: Role[] = ['ADMIN', 'PATIENT', 'DOCTOR', 'NURSE'];

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

// getting the calling the new api function for status (thanks justin)
const getAccountStatus = async (email: string): Promise<boolean> => {
    try {
        const res = await api.get<boolean>(`/api/admin/account-status/${encodeURIComponent(email)}`);
        return res.data;
    } catch (e) {
        console.error(`Failed to get status for ${email}:`, e);
        // tchanged to o disabled if call fails
        return false; 
    }
};

export default function AdminDashboardPage() {
  const router = useRouter();

  const [users, setUsers] = useState<UsersResponse>({});
  // storing all tore the active/disbaled status for each user states
  const [statuses, setStatuses] = useState<UserStatusResponse>({}); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [selection, setSelection] = useState<Record<string, Role | ''>>({});
  const [rowBusy, setRowBusy] = useState<Record<string, boolean>>({});

const refresh = async () => {
  try {
    setLoading(true);
    setError(null);

    // here, I am not getting the user by the id (the method I updated in the back end)
    const res = await api.get<Record<number, Role[]>>('/api/admin/getusers');
    const usersById = res.data || {};

    // now I fetch all the user info for each ID and get the email (I had already made this function back in the day)
    const entries = await Promise.all(
      Object.entries(usersById).map(async ([id, roles]) => {
        const userId = Number(id);
        const user = await getUserById(userId); // get full user
        return [user.email, roles] as [string, Role[]];
      })
    );

    const usersByEmail = Object.fromEntries(entries);
    setUsers(usersByEmail);
    
    // now I also fetch account status for all users
    const emails = Object.keys(usersByEmail);
    const statusPromises = emails.map(getAccountStatus);
    const statusesResults = await Promise.all(statusPromises);
    
    // mapping results back to email keys and update state
    const statusesByEmail = emails.reduce((acc, email, index) => {
        acc[email] = statusesResults[index];
        return acc;
    }, {} as UserStatusResponse);

    setStatuses(statusesByEmail); 

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
      // set status to true (active) after successful activating
      setStatuses((prev) => ({ ...prev, [email]: true })); 
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
      // seting status to false (disabled) after decativating
      setStatuses((prev) => ({ ...prev, [email]: false })); 
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
            <TableHead className="w-[100px] text-center">Status</TableHead> 
            <TableHead className="w-[260px]">Select Role</TableHead>
            <TableHead className="w-[220px]">Role Actions</TableHead>
            <TableHead className="w-[220px] text-right">Status Actions</TableHead> 
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(([email, roles]) => {
            const uniqueRoles = Array.from(new Set(roles || []));
            // checking the status
            const isActive = statuses[email];
            
            return (
              <TableRow key={email}>
                <TableCell
                  className="flex items-center gap-2 max-w-[300px] truncate font-medium"
                  title={email}
                >
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      router.push(`/dashboard/admin/history/${encodeURIComponent(email)}`)
                    }
                  >
                    View History
                  </Button>
                  <span className="truncate">{email}</span>
                </TableCell>

                <TableCell className="space-x-2">
                  {uniqueRoles.length === 0 ? (
                    <span className="text-muted-foreground text-sm">No roles</span>
                  ) : (
                    uniqueRoles.map((r) => (
                      <Badge key={r} variant="secondary" className="mb-1">
                        {r}
                      </Badge>
                    ))
                  )}
                </TableCell>
                
                {/* made this new col for the status */}
                <TableCell className="text-center">
                    <Badge 
                        variant={isActive ? 'default' : 'destructive'} 
                        className='py-1'
                    >
                        {isActive ? 'Active' : 'Disabled'}
                    </Badge>
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
                      // disabped if actibe
                      disabled={rowBusy[email] || isActive} 
                    >
                      Activate
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onDeactivate(email)}
                      // disable if already disabled
                      disabled={rowBusy[email] || !isActive}
                    >
                      Deactivate
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}