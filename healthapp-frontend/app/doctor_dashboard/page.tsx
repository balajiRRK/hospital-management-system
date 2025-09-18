"use client";

import { useState } from "react";
import {
  doctor,
  patients,
  appointments,
  history,
  Patient,
  History,
  Appointment,
} from "../data/mock_data";

export default function DoctorDashboard() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const handlePatientClick = (patient: Patient) => {
    setSelectedPatient(patient);
  };

  const patientHistory: History[] = selectedPatient
    ? history.filter((h: History) => h.patientId === selectedPatient.id)
    : [];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Doctor</h2>
        <div className="flex space-x-2">
          <button
            className={`px-4 py-2 rounded border ${
              activeTab === "Dashboard"
                ? "border-black font-semibold"
                : "border-gray-400"
            }`}
            onClick={() => setActiveTab("Dashboard")}
          >
            Dashboard
          </button>
          <button
            className={`px-4 py-2 rounded border ${
              activeTab === "Patients"
                ? "border-black font-semibold"
                : "border-gray-400"
            }`}
            onClick={() => setActiveTab("Patients")}
          >
            Patients
          </button>
          <button
            className={`px-4 py-2 rounded border ${
              activeTab === "Appointments"
                ? "border-black font-semibold"
                : "border-gray-400"
            }`}
            onClick={() => setActiveTab("Appointments")}
          >
            Appointments
          </button>
        </div>
      </div>

      <hr className="border-gray-300" />

      <div className="mt-6">
        <h1 className="text-xl font-bold mb-2">{activeTab}</h1>
        <p className="mb-4">
          Doctor: <span className="font-medium">{doctor.name}</span> (
          {doctor.email})
        </p>

        {activeTab === "Dashboard" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">Patients</h2>
              <ul className="space-y-1 w-64">
                {patients.map((p: Patient) => (
                  <li key={p.id}>
                    <button
                      className="px-3 py-1 border rounded w-full text-left"
                      onClick={() => handlePatientClick(p)}
                    >
                      {p.name} - {p.code}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <hr className="border-gray-300" />

            <div>
              <h2 className="text-lg font-semibold mb-2">Appointments</h2>
              <ul className="space-y-1">
                {appointments.map((a: Appointment) => {
                  const patient = patients.find(
                    (p: Patient) => p.id === a.patientId
                  );
                  return (
                    <li key={a.id} className="px-3 py-1 border rounded">
                      {patient?.name} - {a.time} - {a.status}
                    </li>
                  );
                })}
              </ul>
            </div>

            <hr className="border-gray-300" />

            <div>
              <h2 className="text-lg font-semibold mb-2">
                Medical History{" "}
                {selectedPatient
                  ? `(Patient: ${selectedPatient.name})`
                  : "(Select a patient)"}
              </h2>
              {selectedPatient && patientHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-black">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 border">Date</th>
                        <th className="px-4 py-2 border">Visit</th>
                        <th className="px-4 py-2 border">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patientHistory.map((h: History, idx: number) => (
                        <tr key={idx}>
                          <td className="px-4 py-2 border">{h.date}</td>
                          <td className="px-4 py-2 border">{h.visit}</td>
                          <td className="px-4 py-2 border">{h.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">No history to display</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
