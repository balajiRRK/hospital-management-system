import CreateAppointmentForm from './appointments/CreateAppointmentForm';
import AppointmentList from './appointments/AppointmentList';

export default function AppointmentsPage() {
  // Replace with actual patient ID from auth/session if available
  const patientId = 1;

  return (
    <main>
      <h1>Appointments</h1>
      <CreateAppointmentForm />
      <AppointmentList patientId={patientId} />
    </main>
  );
}