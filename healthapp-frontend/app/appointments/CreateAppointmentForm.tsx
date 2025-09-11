'use client';

import { useState } from 'react';
import { createAppointment } from './appointmentApi';

export default function CreateAppointmentForm() {
  const [form, setForm] = useState({
    patientId: '',
    doctorId: '',
    startTime: '',
    endTime: '',
    reason: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createAppointment(form);
    alert('Appointment created!');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="patientId" placeholder="Patient ID" value={form.patientId} onChange={handleChange} required />
      <input name="doctorId" placeholder="Doctor ID" value={form.doctorId} onChange={handleChange} required />
      <input name="startTime" type="datetime-local" value={form.startTime} onChange={handleChange} required />
      <input name="endTime" type="datetime-local" value={form.endTime} onChange={handleChange} required />
      <textarea name="reason" placeholder="Reason" value={form.reason} onChange={handleChange} required />
      <button type="submit">Create Appointment</button>
    </form>
  );
}