'use client';

import { Card, CardContent } from '@/components/ui/card';

import { useAuth } from '../providers/AuthProvider';
import AppointmentScheduler from './AppointmentScheduler';
import MyAppointmentsList from './MyAppointmentsList';

export default function Page() {
  const { user, loading } = useAuth();

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <AppointmentScheduler />
      {loading ? (
        <Card className="h-full self-start">
          <CardContent className="text-muted-foreground p-6 text-sm">Loading…</CardContent>
        </Card>
      ) : user?.id ? (
        <MyAppointmentsList meId={user.id} />
      ) : (
        <Card className="h-full self-start">
          <CardContent className="text-muted-foreground p-6 text-sm">
            Sign in to view your appointments.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
