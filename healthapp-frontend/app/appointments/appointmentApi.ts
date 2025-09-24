const API_BASE = "http://localhost:8080/api/appointments";

export async function createAppointment(data: any) {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function getAppointmentsForPatient(patientId: number) {
  const res = await fetch(`${API_BASE}/patient/${patientId}`);
  return res.json();
}