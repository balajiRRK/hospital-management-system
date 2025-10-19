'use client';

import { Card, CardContent } from '@/components/ui/card';

import { useAuth } from '../providers/authProvider';
import AppointmentScheduler from './_components/AppointmentScheduler';
import MyAppointmentsList from './_components/MyAppointmentsList';
import MyAppointmentsListSkeleton from './_components/MyAppointmentsListSkeleton';

export default function AppointmentsPage() {
  const { user, loading } = useAuth();

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <AppointmentScheduler />
      {loading ? (
        <MyAppointmentsListSkeleton />
      ) : user ? (
        <MyAppointmentsList meId={user.id} />
      ) : (
        <Card className="h-full self-start">
          <CardContent className="text-muted-foreground p-6">
            Please sign in to view appointments.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
