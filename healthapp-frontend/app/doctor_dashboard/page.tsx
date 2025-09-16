"use client";

import { useState } from "react";

type Doctor = {
  name: string;
  email: string;
};

type Patient = {
  id: number;
  name: string;
  code: string;
};

type Appointment = {
  id: number;
  patient: string;
  time: string;
  status: "Confirmed" | "Pending";
};

type History = {
  date: string;
  visit: string;
  notes: string;
};

export default function DoctorDashboard() {
  const doctor: Doctor = {
    name: "Dr. Smith",
    email: "dr.smith@example.com",
  };

  const patients: Patient[] = [
    { id: 1, name: "John Doe", code: "MAN2785" },
    { id: 2, name: "Jane Smith", code: "MAN2345" },
    { id: 3, name: "Emily Johnson", code: "MAN3457" },
    { id: 4, name: "Michael Brown", code: "MAN4568" },
  ];

  const appointments: Appointment[] = [
    { id: 1, patient: "John Doe", time: "10:00 AM", status: "Confirmed" },
    { id: 2, patient: "Emily Johnson", time: "1:00 PM", status: "Pending" },
    { id: 3, patient: "Jane Smith", time: "3:00 PM", status: "Confirmed" },
  ];

  const history: History[] = [
    {
      date: "2024-01-15",
      visit: "Routine Check-up",
      notes: "Blood pressure normal",
    },
    { date: "2024-02-10", visit: "Follow-up", notes: "Medication adjusted" },
  ];

  const [activeTab, setActiveTab] = useState("Dashboard");

  return (
    <div style={{ padding: "10px" }}>
      {/* Sidebar */}
      <div style={{ marginBottom: "20px" }}>
        <h2>Doctor</h2>
        <button onClick={() => setActiveTab("Dashboard")}>
          Dashboard
        </button> |{" "}
        <button onClick={() => setActiveTab("Patients")}>Patients</button> |{" "}
        <button onClick={() => setActiveTab("Appointments")}>
          Appointments
        </button>{" "}
        | <button onClick={() => setActiveTab("Records")}>Records</button> |{" "}
        <button onClick={() => setActiveTab("Messages")}>Messages</button>
      </div>

      <hr />

      {/* Main Content */}
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
                {patients.map((p) => (
                  <li key={p.id}>
                    {p.name} - {p.code}
                  </li>
                ))}
              </ul>
            </div>

            <hr />

            <div style={{ margin: "15px 0" }}>
              <h2>Appointments</h2>
              <ul>
                {appointments.map((a) => (
                  <li key={a.id}>
                    {a.patient} - {a.time} - {a.status}
                  </li>
                ))}
              </ul>
            </div>

            <hr />

            <div style={{ margin: "15px 0" }}>
              <h2>Medical History</h2>
              <table border={1} cellPadding={5} cellSpacing={0}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Visit</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h, idx) => (
                    <tr key={idx}>
                      <td>{h.date}</td>
                      <td>{h.visit}</td>
                      <td>{h.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
