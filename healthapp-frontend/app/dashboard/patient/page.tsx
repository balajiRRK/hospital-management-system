"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/app/providers/authProvider";
import AppointmentScheduler from "@/app/appointments/_components/AppointmentScheduler";
import MyAppointmentsList from "@/app/appointments/_components/MyAppointmentsList";
import {
  getAppointmentsForPatient,
  getNurseNote,
  getAppointmentResult,
  getUserById,
} from "@/lib/api";

export default function PatientDashboardPage() {
  const { user, loading } = useAuth();
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    const load = async () => {
      setLoadingHistory(true);
      try {
        const appointments = await getAppointmentsForPatient(user.id);

        const enriched = await Promise.all(
          appointments.map(async (a) => {
            const nurseNote = await getNurseNote(a.id).catch(() => "");
            const doctorResult = await getAppointmentResult(a.id).catch(
              () => ""
            );
            const doctorProfile = await getUserById(a.doctorId).catch(
              () => null
            );
            return {
              ...a,
              doctorName: doctorProfile?.firstName
                ? `${doctorProfile.firstName} ${doctorProfile.lastName ?? ""}`
                : a.doctorName ?? "Unknown Doctor",
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
  }, [user?.id]);

  return (
    <div className="">
      <div className="space-y-3 md:col-span-1">
        <h2 className="m-2 flex justify-center text-base font-semibold">
          Book an Appointment
        </h2>
        <AppointmentScheduler />
      </div>

      <div className="">
        {loading ? (
          <Card className="h-full">
            <CardContent className="text-muted-foreground p-6 text-sm">
              Loading…
            </CardContent>
          </Card>
        ) : user?.id ? (
          <MyAppointmentsList meId={user.id} />
        ) : (
          <Card className="h-full">
            <CardContent className="text-muted-foreground p-6 text-sm">
              Sign in to view your appointments.
            </CardContent>
          </Card>
        )}
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold mb-3">Your Appointment History</h2>
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
                        {new Date(appt.startTime).toLocaleString()} –{" "}
                        {new Date(appt.endTime).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      Doctor: {appt.doctorName}
                    </div>
                  </div>
                  {appt.nurseNote ? (
                    <div className="p-3 bg-blue-50 rounded-lg text-sm">
                      <p className="font-medium">Nurse Note</p>
                      <p>{appt.nurseNote}</p>
                    </div>
                  ) : null}
                  {appt.doctorResult ? (
                    <div className="p-3 bg-green-50 rounded-lg text-sm">
                      <p className="font-medium">Doctor Result:</p>
                      <p>{appt.doctorResult}</p>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
