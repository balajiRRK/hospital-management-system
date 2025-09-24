"use client";

import { useState } from "react";
import { patients, appointments, history, Patient } from "../../data/mock_data";
import Link from "next/link";

export default function PatientsDashboard() {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(
    patients[0]
  );
  const [apptTime, setApptTime] = useState("");

  const patientHistory = selectedPatient
    ? history.filter((h) => h.patientId === selectedPatient.id)
    : [];

  const handleSchedule = () => {
    if (!selectedPatient || !apptTime) return;
    appointments.push({
      id: appointments.length + 1,
      patientId: selectedPatient.id,
      time: apptTime,
      status: "Pending",
    });
    setApptTime("");
  };

  return (
    <div className="p-6">
      <Link href="/" className="mb-4 inline-block px-4 py-2 border rounded">
        Back to Home
      </Link>
      <h1 className="text-2xl font-semibold mb-4">Patient Dashboard</h1>

      <div className="mb-4">
        <label className="block mb-1">Select Patient:</label>
        <select
          className="border px-2 py-1"
          value={selectedPatient?.id}
          onChange={(e) =>
            setSelectedPatient(
              patients.find((p) => p.id === parseInt(e.target.value)) || null
            )
          }
        >
          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {selectedPatient && (
        <>
          <div className="mb-4">
            <h2 className="font-semibold mb-2">Medical History</h2>
            {patientHistory.length ? (
              <table className="min-w-full border border-black">
                <thead>
                  <tr>
                    <th className="px-4 py-2 border">Date</th>
                    <th className="px-4 py-2 border">Visit Reason</th>
                    <th className="px-4 py-2 border">Nurse Notes</th>
                    <th className="px-4 py-2 border">Doctor Result</th>
                  </tr>
                </thead>
                <tbody>
                  {patientHistory.map((h, i) => (
                    <tr key={i}>
                      <td className="px-4 py-2 border">{h.date}</td>
                      <td className="px-4 py-2 border">{h.visit}</td>
                      <td className="px-4 py-2 border">{h.notes}</td>
                      <td className="px-4 py-2 border">
                        {h.visitResult || "Pending"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No history yet</p>
            )}
          </div>

          <div className="mb-4">
            <h2 className="font-semibold mb-2">Schedule Appointment</h2>
            <input
              type="text"
              placeholder="Time (e.g., 2:00 PM)"
              value={apptTime}
              onChange={(e) => setApptTime(e.target.value)}
              className="border px-2 py-1 mr-2"
            />
            <button
              onClick={handleSchedule}
              className="px-3 py-1 border rounded"
            >
              Schedule
            </button>
          </div>
        </>
      )}
    </div>
  );
}
