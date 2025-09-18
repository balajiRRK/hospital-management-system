"use client";

import { useState } from "react";
import { patients, nurses, history, Patient, Nurse } from "../data/mock_data";
import Link from "next/link";

export default function NurseDashboardPage() {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(
    patients[0]
  );
  const [selectedNurse, setSelectedNurse] = useState<Nurse>(nurses[0]);
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [bp, setBp] = useState("");
  const [visitReason, setVisitReason] = useState("");
  const [nurseNotes, setNurseNotes] = useState("");

  const handleSubmit = () => {
    if (
      !selectedPatient ||
      !visitReason.trim() ||
      !nurseNotes.trim() ||
      !weight.trim() ||
      !height.trim() ||
      !bp.trim()
    ) {
      alert("Please fill in all fields before submitting.");
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    const combinedNurseData = `Nurse: ${selectedNurse.name}, Weight: ${weight}, Height: ${height}, BP: ${bp}, Notes: ${nurseNotes}`;

    const existingIndex = history.findIndex(
      (h) => h.patientId === selectedPatient.id && h.date === today
    );

    if (existingIndex !== -1) {
      history[existingIndex] = {
        ...history[existingIndex],
        visit: visitReason,
        notes: combinedNurseData,
      };
    } else {
      history.push({
        patientId: selectedPatient.id,
        date: today,
        visit: visitReason,
        notes: combinedNurseData,
        visitResult: "",
      });
    }

    setWeight("");
    setHeight("");
    setBp("");
    setVisitReason("");
    setNurseNotes("");
    alert("Nurse visit added successfully!");
  };

  return (
    <div className="p-6">
      <Link href="/" className="mb-4 inline-block px-4 py-2 border rounded">
        Back to Home
      </Link>
      <h1 className="text-2xl font-semibold mb-4">Nurse Dashboard</h1>

      <div className="mb-4">
        <label className="block mb-1">Select Nurse:</label>
        <select
          className="border px-2 py-1 mb-2"
          value={selectedNurse.id}
          onChange={(e) =>
            setSelectedNurse(
              nurses.find((n) => n.id === parseInt(e.target.value)) || nurses[0]
            )
          }
        >
          {nurses.map((n) => (
            <option key={n.id} value={n.id}>
              {n.name}
            </option>
          ))}
        </select>

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

      <div className="space-y-2 mb-4">
        <input
          placeholder="Visit Reason"
          className="border px-2 py-1 w-full"
          value={visitReason}
          onChange={(e) => setVisitReason(e.target.value)}
        />
        <input
          placeholder="Weight"
          className="border px-2 py-1 w-full"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
        />
        <input
          placeholder="Height"
          className="border px-2 py-1 w-full"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
        />
        <input
          placeholder="Blood Pressure"
          className="border px-2 py-1 w-full"
          value={bp}
          onChange={(e) => setBp(e.target.value)}
        />
        <input
          placeholder="Nurse Notes"
          className="border px-2 py-1 w-full"
          value={nurseNotes}
          onChange={(e) => setNurseNotes(e.target.value)}
        />
        <button onClick={handleSubmit} className="px-4 py-2 border rounded">
          Submit
        </button>
      </div>
    </div>
  );
}
