'use client';

export type Doctor = {
  id: number;
  name: string;
  email: string;
};

export type Nurse = {
  id: number;
  name: string;
  email: string;
};

export type Patient = {
  id: number;
  name: string;
  code: string;
  doctorId: number;
};

export type Appointment = {
  id: number;
  patientId: number;
  time: string;
  status: 'Confirmed' | 'Pending';
};

export type History = {
  patientId: number;
  date: string;
  visit: string;
  notes: string;
  visitResult: string;
};

export const doctors: Doctor[] = [
  { id: 1, name: 'Dr. Smith', email: 'dr.smith@example.com' },
  { id: 2, name: 'Dr. Johnson', email: 'dr.johnson@example.com' },
];

export const nurses: Nurse[] = [
  { id: 1, name: 'Nurse Amy', email: 'amy@example.com' },
  { id: 2, name: 'Nurse Bob', email: 'bob@example.com' },
];

export const patients: Patient[] = [
  { id: 1, name: 'John Doe', code: 'MAN2785', doctorId: 1 },
  { id: 2, name: 'Jane Smith', code: 'MAN2345', doctorId: 1 },
  { id: 3, name: 'Emily Johnson', code: 'MAN3457', doctorId: 2 },
  { id: 4, name: 'Michael Brown', code: 'MAN4568', doctorId: 2 },
  { id: 5, name: 'Sophia Davis', code: 'MAN5678', doctorId: 1 },
];

export const appointments: Appointment[] = [
  { id: 1, patientId: 1, time: '10:00 AM', status: 'Pending' },
  { id: 2, patientId: 3, time: '1:00 PM', status: 'Pending' },
  { id: 3, patientId: 2, time: '3:00 PM', status: 'Pending' },
  { id: 4, patientId: 5, time: '4:00 PM', status: 'Pending' },
];

export const history: History[] = [
  {
    patientId: 1,
    date: '2024-01-15',
    visit: 'Routine Check-up',
    notes: 'Blood pressure normal',
    visitResult: 'Normal',
  },
  {
    patientId: 1,
    date: '2024-03-12',
    visit: 'Flu symptoms',
    notes: 'Prescribed medication',
    visitResult: 'Flu detected',
  },
  {
    patientId: 2,
    date: '2024-02-10',
    visit: 'Follow-up',
    notes: 'Medication adjusted',
    visitResult: 'Stable',
  },
  {
    patientId: 3,
    date: '2024-04-05',
    visit: 'Annual Check-up',
    notes: 'All normal',
    visitResult: 'Normal',
  },
  {
    patientId: 4,
    date: '2024-05-20',
    visit: 'Back pain',
    notes: 'Referred to physiotherapy',
    visitResult: 'Muscle strain',
  },
  {
    patientId: 5,
    date: '2024-06-15',
    visit: 'Headache',
    notes: 'Prescribed painkillers',
    visitResult: 'Migraine',
  },
];
