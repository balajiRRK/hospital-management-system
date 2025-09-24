import AppointmentList from './AppointmentList';
import CreateAppointmentForm from './CreateAppointmentForm';

export default function AppointmentsPage() {
  // Replace with actual patient ID from auth/session
  const patientId = 1;

  return (
    <div>
      <h1>Appointments</h1>
      <CreateAppointmentForm />
      <AppointmentList patientId={patientId} />
    </div>
  );
}