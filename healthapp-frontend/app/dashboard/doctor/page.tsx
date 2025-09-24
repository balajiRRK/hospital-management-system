"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  doctors,
  patients as initialPatients,
  appointments,
  history,
  Patient,
  History,
  Doctor,
} from "../../data/mock_data";

export default function DoctorDashboard() {
  const [currentDoctor, setCurrentDoctor] = useState<Doctor>(doctors[0]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [visitResultInput, setVisitResultInput] = useState("");
  const [activeTab, setActiveTab] = useState("Dashboard");

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("patients") || "[]");
    if (saved.length) setPatients(saved);
    else setPatients(initialPatients);
  }, []);

  const doctorPatients = patients.filter(
    (p) => p.doctorId === currentDoctor.id
  );
  const doctorAppointments = appointments.filter((a) =>
    doctorPatients.some((p) => p.id === a.patientId)
  );
  const pendingAppointments = doctorAppointments.filter(
    (a) => a.status === "Pending"
  );

  const handlePatientClick = (p: Patient) => setSelectedPatient(p);

  const handleVisitResultSubmit = () => {
    if (!selectedPatient || !visitResultInput.trim()) return;
    const today = new Date().toISOString().split("T")[0];
    const existingIndex = history.findIndex(
      (h) => h.patientId === selectedPatient.id && h.date === today
    );
    if (existingIndex !== -1) {
      history[existingIndex].visitResult = visitResultInput.trim();
    } else {
      history.push({
        patientId: selectedPatient.id,
        date: today,
        visit: "Doctor Visit",
        notes: "",
        visitResult: visitResultInput.trim(),
      });
    }
    setVisitResultInput("");
  };

  const handleStatusChange = (
    apptId: number,
    status: "Pending" | "Confirmed"
  ) => {
    const index = appointments.findIndex((a) => a.id === apptId);
    if (index !== -1) {
      appointments[index].status = status;
    }
  };

  const patientHistory: History[] = selectedPatient
    ? history.filter((h) => h.patientId === selectedPatient.id)
    : [];

  return (
    <div className="p-6">
      <Link
        href="/"
        className="mb-4 inline-block px-4 py-2 border rounded bg-black text-white hover:bg-gray-800"
      >
        Back to Home
      </Link>

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

      {activeTab === "Dashboard" && (
        <div className="mt-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-2">
              Patients with Pending Appointments
            </h2>
            <ul className="space-y-1 w-64">
              {pendingAppointments.map((a) => {
                const patient = doctorPatients.find(
                  (p) => p.id === a.patientId
                );
                if (!patient) return null;
                return (
                  <li key={a.id}>
                    <button
                      className="px-3 py-1 border rounded w-full text-left"
                      onClick={() => handlePatientClick(patient)}
                    >
                      {patient.name} - {patient.code} ({a.time})
                    </button>
                  </li>
                );
              })}
            </ul>

            {selectedPatient && (
              <div className="mt-4">
                <input
                  type="text"
                  placeholder="Enter visit result"
                  className="border px-2 py-1 w-full mb-2"
                  value={visitResultInput}
                  onChange={(e) => setVisitResultInput(e.target.value)}
                />
                <button
                  className="px-4 py-2 border rounded"
                  onClick={handleVisitResultSubmit}
                >
                  Submit
                </button>
              </div>
            )}
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
                      <th className="px-4 py-2 border">Nurse Data</th>
                      <th className="px-4 py-2 border">Visit Reason</th>
                      <th className="px-4 py-2 border">Visit Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patientHistory.map((h, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-2 border">{h.date}</td>
                        <td className="px-4 py-2 border">{h.notes}</td>
                        <td className="px-4 py-2 border">{h.visit}</td>
                        <td className="px-4 py-2 border">{h.visitResult}</td>
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

      {activeTab === "Patients" && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">All Patients</h2>
          <ul className="space-y-1 w-64">
            {doctorPatients.map((p) => (
              <li key={p.id} className="px-3 py-1 border rounded">
                {p.name} - {p.code}
              </li>
            ))}
          </ul>
        </div>
      )}

      {activeTab === "Appointments" && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Appointments</h2>
          {doctorAppointments.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-black">
                <thead>
                  <tr>
                    <th className="px-4 py-2 border">Patient</th>
                    <th className="px-4 py-2 border">Time</th>
                    <th className="px-4 py-2 border">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {doctorAppointments.map((a) => {
                    const patient = doctorPatients.find(
                      (p) => p.id === a.patientId
                    );
                    if (!patient) return null;
                    return (
                      <tr key={a.id}>
                        <td className="px-4 py-2 border">{patient.name}</td>
                        <td className="px-4 py-2 border">{a.time}</td>
                        <td className="px-4 py-2 border">
                          <select
                            value={a.status}
                            onChange={(e) =>
                              handleStatusChange(
                                a.id,
                                e.target.value as "Pending" | "Confirmed"
                              )
                            }
                            className="border px-1 py-0.5"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No appointments scheduled</p>
          )}
        </div>
      )}
    </div>
  );
}
