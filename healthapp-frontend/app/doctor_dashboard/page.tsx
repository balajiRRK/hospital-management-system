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
} from "../mockData";

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
    <div style={{ padding: "10px" }}>
      <div style={{ marginBottom: "20px" }}>
        <h2>Doctor</h2>
        <button onClick={() => setActiveTab("Dashboard")}>
          Dashboard
        </button> |{" "}
        <button onClick={() => setActiveTab("Patients")}>Patients</button> |{" "}
        <button onClick={() => setActiveTab("Appointments")}>
          Appointments
        </button>
      </div>

      <hr />

      <div style={{ marginTop: "20px" }}>
        <h1>{activeTab}</h1>
        <p>
          Doctor: {doctor.name} ({doctor.email})
        </p>

        {activeTab === "Dashboard" && (
          <div>
            <div style={{ margin: "15px 0" }}>
              <h2>Patients</h2>
              <ul>
                {patients.map((p: Patient) => (
                  <li key={p.id}>
                    <button onClick={() => handlePatientClick(p)}>
                      {p.name} - {p.code}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <hr />

            <div style={{ margin: "15px 0" }}>
              <h2>Appointments</h2>
              <ul>
                {appointments.map((a: Appointment) => {
                  const patient = patients.find(
                    (p: Patient) => p.id === a.patientId
                  );
                  return (
                    <li key={a.id}>
                      {patient?.name} - {a.time} - {a.status}
                    </li>
                  );
                })}
              </ul>
            </div>

            <hr />

            <div style={{ margin: "15px 0" }}>
              <h2>
                Medical History{" "}
                {selectedPatient
                  ? `(Patient: ${selectedPatient.name})`
                  : "(Select a patient)"}
              </h2>
              {selectedPatient && patientHistory.length > 0 ? (
                <table border={1} cellPadding={5} cellSpacing={0}>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Visit</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patientHistory.map((h: History, idx: number) => (
                      <tr key={idx}>
                        <td>{h.date}</td>
                        <td>{h.visit}</td>
                        <td>{h.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No history to display</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
