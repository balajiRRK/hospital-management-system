'use client';

import { useEffect, useState } from 'react';

import { Card, CardContent } from '@/components/ui/card';
import { getAppointmentsForPatient } from '@/lib/api';
import { type AppointmentResponse } from '@/lib/types';

export default function MyAppointmentsList({ meId }: { meId: number }) {
  const [myAppts, setMyAppts] = useState<AppointmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchAppointments = async () => {
      try {
        setErr(null);
        setLoading(true);
        const data = await getAppointmentsForPatient(meId);
        if (!cancelled) {
          setMyAppts(data);
        }
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Failed to load appointments';
        if (!cancelled) {
          setErr(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchAppointments();
    return () => {
      cancelled = true;
    };
  }, [meId]);

  return (
    <Card className="h-full">
      <CardContent className="p-6">
        <h3 className="mb-3 font-semibold">Your Appointments</h3>

        {/* one state at a time */}
        {loading && <div className="text-muted-foreground text-sm">Loading…</div>}

        {err && <div className="text-sm text-red-600">{err}</div>}

        {!loading && !err && myAppts.length === 0 && (
          <div className="text-muted-foreground text-sm">No appointments yet.</div>
        )}

        {!loading && !err && myAppts.length > 0 && (
          <ul className="space-y-1 text-sm">
            {myAppts.map((a) => (
              <li key={a.id}>
                {new Date(a.startTime).toLocaleString()} with Dr. {a.doctorName ?? a.doctorId} —{' '}
                {a.reason}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
