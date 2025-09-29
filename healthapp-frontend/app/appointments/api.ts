const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export type MeResponse = { id: number; email: string; name?: string };
export type Doctor = { id: number; email: string; name?: string };
export type AppointmentResponse = {
  id: number;
  doctorId: number;
  doctorName?: string;
  startTime: string;
  endTime: string;
  reason: string;
};
type AvailabilityResponse = { slots: string[] };

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function getMe(): Promise<MeResponse> {
  const res = await fetch(`${API_BASE}/api/me`, { credentials: 'include' });
  return json<MeResponse>(res);
}

// BACKEND: GET /api/doctor/doctors
export async function listDoctors(): Promise<Doctor[]> {
  const res = await fetch(`${API_BASE}/api/doctor/doctors`, { credentials: 'include' });
  return json<Doctor[]>(res);
}

// BACKEND: GET /api/appointments/doctor/{id}/availability?date=yyyy-MM-dd
export async function getDoctorAvailability(
  doctorId: number,
  dateISO: string,
): Promise<AvailabilityResponse> {
  const url = new URL(`${API_BASE}/api/appointments/doctor/${doctorId}/availability`);
  url.searchParams.set('date', dateISO);
  const res = await fetch(url.toString(), { credentials: 'include' });
  return json<AvailabilityResponse>(res);
}

// BACKEND: GET /api/appointments/patient/{id}
export async function getAppointmentsForPatient(patientId: number): Promise<AppointmentResponse[]> {
  const res = await fetch(`${API_BASE}/api/appointments/patient/${patientId}`, {
    credentials: 'include',
  });
  return json<AppointmentResponse[]>(res);
}

// Same function as above, but gets appointments for a specific doctor (based on doctor's id)
export async function getAppointmentsForDoctor(doctorId: number): Promise<AppointmentResponse[]> {
  const res = await fetch(`${API_BASE}/api/appointments/doctor/${doctorId}`, {
    credentials: 'include',
  });
  return json<AppointmentResponse[]>(res);
}

export type PatientsForDoctorResponse = {
  me: MeResponse;
  patients: { id: number; email: string; name?: string }[];
};

export async function listPatientsForDoctor(doctorId: number): Promise<PatientsForDoctorResponse> {
  const res = await fetch(`${API_BASE}/api/appointments/doctor/${doctorId}/patients`, {
    credentials: 'include',
  });
  return json<PatientsForDoctorResponse>(res);
}

// BACKEND: POST /api/appointments
export async function createAppointment(input: {
  doctorId: number;
  startTime: string;
  endTime: string;
  reason: string;
}): Promise<void> {
  const res = await fetch(`${API_BASE}/api/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input),
  });
  await json(res);
}

export async function apiLogout(): Promise<void> {
  const res = await fetch(`${API_BASE}/api/auth/logout`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok && res.status !== 401) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Logout failed (${res.status})`);
  }
}
