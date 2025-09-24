'use client';

import { useEffect, useState } from 'react';

import { getAppointmentsForPatient } from './appointmentApi';

export default function AppointmentList({ patientId }: { patientId: number }) {
  const [appointments, setAppointments] = useState<any[]>([]);

  useEffect(() => {
    getAppointmentsForPatient(patientId).then(setAppointments);
  }, [patientId]);

  return (
    <div>
      <h2>Your Appointments</h2>
      <ul>
        {appointments.map(a => (
          <li key={a.id}>
            {a.startTime} with Dr. {a.doctorName} - {a.reason}
          </li>
        ))}
      </ul>
    </div>
  );
}