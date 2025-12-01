'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import {
  getAppointmentsForPatient,
  getNurseNote,
  getAppointmentResult,
  getUserById,
} from '@/lib/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function AdminUserHistoryPage() {
  const params = useParams();
  const router = useRouter();
  const email = params.email;
  const decodedEmail = email ? decodeURIComponent(email) : '';

  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    if (!decodedEmail) return;

    const load = async () => {
      setLoadingHistory(true);
      try {
        const res = await fetch(`${API_BASE}/api/admin/getusers`, {
          credentials: 'include',
        });
        const usersById: Record<number, string[]> = await res.json();

        const entries = await Promise.all(
          Object.keys(usersById).map(async (idStr) => {
            const id = Number(idStr);
            const user = await getUserById(id);
            return [user.email, id] as [string, number];
          })
        );

        const emailToIdMap = Object.fromEntries(entries);
        const id = emailToIdMap[decodedEmail];
        if (!id) return;
        setUserId(id);

        const appointments = await getAppointmentsForPatient(id);

        const enriched = await Promise.all(
          appointments.map(async (a) => {
            const nurseNote = await getNurseNote(a.id).catch(() => '');
            const doctorResult = await getAppointmentResult(a.id).catch(() => '');
            return {
              ...a,
              doctorName: a.doctorName ?? 'Unknown Doctor',
              nurseNote,
              doctorResult,
            };
          })
        );

        setHistory(enriched);
      } finally {
        setLoadingHistory(false);
      }
    };

    load();
  }, [decodedEmail]);

  return (
    <div className="space-y-4 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Appointment History for {decodedEmail}</h1>
        <button
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          onClick={() => router.push('/dashboard/admin')}
        >
          Go Back to Dashboard
        </button>
      </div>

      {loadingHistory ? (
        <Card>
          <CardContent className="p-6 text-muted-foreground text-sm">
            Loading history…
          </CardContent>
        </Card>
      ) : history.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-muted-foreground text-sm">
            No past appointments.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {history.map((appt) => (
            <Card key={appt.id} className="border border-gray-200 shadow-sm">
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <div>
                    <p className="font-semibold">{appt.reason}</p>
                    <p className="text-muted-foreground text-xs">
                      {new Date(appt.startTime).toLocaleString()} –{' '}
                      {new Date(appt.endTime).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    Doctor: {appt.doctorName}
                  </div>
                </div>
                {appt.nurseNote && (
                  <div className="p-3 bg-blue-50 rounded-lg text-sm">
                    <p className="font-medium">Nurse Note</p>
                    <p>{appt.nurseNote}</p>
                  </div>
                )}
                {appt.doctorResult && (
                  <div className="p-3 bg-green-50 rounded-lg text-sm">
                    <p className="font-medium">Doctor Result:</p>
                    <p>{appt.doctorResult}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
