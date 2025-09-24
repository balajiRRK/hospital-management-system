'use client';

import { useState } from 'react';
import { doctors, nurses, patients } from '../../data/mock_data';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const [newDoctorName, setNewDoctorName] = useState('');
  const [newDoctorEmail, setNewDoctorEmail] = useState('');
  const [newNurseName, setNewNurseName] = useState('');
  const [newNurseEmail, setNewNurseEmail] = useState('');
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientCode, setNewPatientCode] = useState('');
  const [newPatientDoctorId, setNewPatientDoctorId] = useState<number>(1);

  const handleAddDoctor = () => {
    if (!newDoctorName.trim() || !newDoctorEmail.trim()) {
      alert('Please fill in all fields for the doctor.');
      return;
    }
    doctors.push({
      id: doctors.length + 1,
      name: newDoctorName.trim(),
      email: newDoctorEmail.trim(),
    });
    setNewDoctorName('');
    setNewDoctorEmail('');
  };

  const handleAddNurse = () => {
    if (!newNurseName.trim() || !newNurseEmail.trim()) {
      alert('Please fill in all fields for the nurse.');
      return;
    }
    nurses.push({
      id: nurses.length + 1,
      name: newNurseName.trim(),
      email: newNurseEmail.trim(),
    });
    setNewNurseName('');
    setNewNurseEmail('');
  };

  const handleAddPatient = () => {
    if (!newPatientName.trim() || !newPatientCode.trim() || !newPatientDoctorId) {
      alert('Please fill in all fields for the patient.');
      return;
    }
    patients.push({
      id: patients.length + 1,
      name: newPatientName.trim(),
      code: newPatientCode.trim(),
      doctorId: newPatientDoctorId,
    });
    setNewPatientName('');
    setNewPatientCode('');
    setNewPatientDoctorId(1);
  };

  return (
    <div className="p-6">
      <Link href="/" className="mb-4 inline-block rounded border px-4 py-2">
        Back to Home
      </Link>
      <h1 className="mb-4 text-2xl font-semibold">Admin Dashboard</h1>

      <div className="mb-4">
        <p>Total Doctors: {doctors.length}</p>
        <p>Total Nurses: {nurses.length}</p>
        <p>Total Patients: {patients.length}</p>
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="font-semibold">Add Doctor</h2>
          <input
            className="mb-1 w-full border px-2 py-1"
            placeholder="Doctor Name"
            value={newDoctorName}
            onChange={(e) => setNewDoctorName(e.target.value)}
          />
          <input
            className="mb-1 w-full border px-2 py-1"
            placeholder="Doctor Email"
            value={newDoctorEmail}
            onChange={(e) => setNewDoctorEmail(e.target.value)}
          />
          <button className="rounded border px-4 py-2" onClick={handleAddDoctor}>
            Add
          </button>
        </div>

        <div>
          <h2 className="font-semibold">Add Nurse</h2>
          <input
            className="mb-1 w-full border px-2 py-1"
            placeholder="Nurse Name"
            value={newNurseName}
            onChange={(e) => setNewNurseName(e.target.value)}
          />
          <input
            className="mb-1 w-full border px-2 py-1"
            placeholder="Nurse Email"
            value={newNurseEmail}
            onChange={(e) => setNewNurseEmail(e.target.value)}
          />
          <button className="rounded border px-4 py-2" onClick={handleAddNurse}>
            Add
          </button>
        </div>

        <div>
          <h2 className="font-semibold">Add Patient</h2>
          <input
            className="mb-1 w-full border px-2 py-1"
            placeholder="Patient Name"
            value={newPatientName}
            onChange={(e) => setNewPatientName(e.target.value)}
          />
          <input
            className="mb-1 w-full border px-2 py-1"
            placeholder="Patient Code"
            value={newPatientCode}
            onChange={(e) => setNewPatientCode(e.target.value)}
          />
          <select
            className="mb-1 w-full border px-2 py-1"
            value={newPatientDoctorId}
            onChange={(e) => setNewPatientDoctorId(Number(e.target.value))}
          >
            {doctors.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.name}
              </option>
            ))}
          </select>
          <button className="rounded border px-4 py-2" onClick={handleAddPatient}>
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
