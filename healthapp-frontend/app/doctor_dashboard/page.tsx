"use client";

import { useState, useEffect } from "react";
import {
  doctors,
  patients as initialPatients,
  appointments,
  history,
  Patient,
  History,
  Doctor,
} from "../data/mock_data";

export default function DoctorDashboard() {
  const [currentDoctor, setCurrentDoctor] = useState<Doctor>(doctors[0]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [visitInput, setVisitInput] = useState("");
  const [activeTab, setActiveTab] = useState("Dashboard");

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("patients") || "[]");
    if (saved.length) setPatients(saved);
    else setPatients(initialPatients);
  }, []);

  const doctorPatients = patients.filter(
    (p) => p.doctorId === currentDoctor.id
  );

  const savePatients = (updated: Patient[]) => {
    setPatients(updated);
    localStorage.setItem("patients", JSON.stringify(updated));
  };

  const handlePatientClick = (p: Patient) => {
    setSelectedPatient(p);
  };

  const handleVisitSubmit = () => {
    if (!selectedPatient || !visitInput.trim()) return;
    const updatedPatients = patients.map((p) =>
      p.id === selectedPatient.id
        ? { ...p, visitResults: [...p.visitResults, visitInput.trim()] }
        : p
    );
    savePatients(updatedPatients);
    setSelectedPatient(
      updatedPatients.find((p) => p.id === selectedPatient.id) || null
    );
    setVisitInput("");
  };

  const patientHistory: History[] = selectedPatient
    ? history.filter((h) => h.patientId === selectedPatient.id)
    : [];

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Doctor: {currentDoctor.name}</h2>
        <select
          className="border px-2 py-1"
          value={currentDoctor.id}
          onChange={(e) => {
            const doc = doctors.find((d) => d.id === parseInt(e.target.value));
            if (doc) {
              setCurrentDoctor(doc);
              setSelectedPatient(null);
            }
          }}
        >
          {doctors.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-6 flex space-x-2">
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

      <hr className="border-gray-300" />

      <div className="mt-6">
        {activeTab === "Dashboard" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">Patients</h2>
              <ul className="space-y-1 w-64">
                {doctorPatients.map((p) => (
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

              {selectedPatient && (
                <div className="mt-4">
                  <input
                    type="text"
                    placeholder="Enter visit result"
                    className="border px-2 py-1 w-full mb-2"
                    value={visitInput}
                    onChange={(e) => setVisitInput(e.target.value)}
                  />
                  <button
                    className="px-4 py-2 border rounded"
                    onClick={handleVisitSubmit}
                  >
                    Submit
                  </button>

                  {selectedPatient.visitResults.length > 0 && (
                    <div className="mt-4">
                      <h3 className="font-semibold mb-1">Visit Results:</h3>
                      <ul className="list-disc list-inside">
                        {selectedPatient.visitResults.map((res, idx) => (
                          <li key={idx}>{res}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            <hr className="border-gray-300" />

            <div>
              <h2 className="text-lg font-semibold mb-2">Appointments</h2>
              <ul className="space-y-1">
                {appointments.map((a) => {
                  const patient = patients.find(
                    (p) =>
                      p.id === a.patientId && p.doctorId === currentDoctor.id
                  );
                  if (!patient) return null;
                  return (
                    <li key={a.id} className="px-3 py-1 border rounded">
                      {patient.name} - {a.time} - {a.status}
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
                      {patientHistory.map((h, idx) => (
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
