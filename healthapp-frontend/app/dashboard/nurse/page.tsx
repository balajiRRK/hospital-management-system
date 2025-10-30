"use client";

import { useEffect, useState } from "react";
import { User, Calendar as CalendarIcon, LayoutDashboard, ClipboardCheck } from "lucide-react";
import {
  getMe,
  MeResponse,
  getAppointmentsForDoctor,
  AppointmentResponse,
  getUserById,
  UserProfileResponse,
  getNurseNote,
  submitNurseNote,
} from "../../../lib/api";
import { Calendar } from "@/components/ui/calendar";

export default function NurseDashboard() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [selectedPatient, setSelectedPatient] = useState<number | null>(null);
  const [selectedPatientProfile, setSelectedPatientProfile] = useState<UserProfileResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [nurse, setNurse] = useState<MeResponse | null>(null);
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [patients, setPatients] = useState<{ id: number }[]>([]);
  const [patientNames, setPatientNames] = useState<Record<number, string>>({});
  const [patientEmails, setPatientEmails] = useState<Record<number, string>>({});
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);
  const [visitReason, setVisitReason] = useState("");
  const [nurseNotes, setNurseNotes] = useState("");

  const tabs = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Appointments", icon: CalendarIcon },
    { name: "Patient Data", icon: ClipboardCheck },
    { name: "Patients", icon: User },
  ];

  useEffect(() => {
    async function fetchNurse() {
      const me = await getMe();
      setNurse(me);
      const nurseAppointments = await getAppointmentsForDoctor(me.id);
      setAppointments(nurseAppointments);
    }
    fetchNurse();
  }, []);

  useEffect(() => {
    if (!nurse) return;
    async function fetchPatients() {
      const nurseAppointments = await getAppointmentsForDoctor(nurse.id);
      setAppointments(nurseAppointments);
      const uniquePatients = Array.from(new Set(nurseAppointments.map(a => a.patientId))).map(id => ({ id }));
      setPatients(uniquePatients);
    }
    fetchPatients();
  }, [nurse]);

  useEffect(() => {
    if (appointments.length === 0) return;
    async function fetchPatientInfo() {
      const names: Record<number, string> = { ...patientNames };
      const emails: Record<number, string> = { ...patientEmails };
      const uniqueIds = Array.from(new Set(appointments.map(a => a.patientId)));
      await Promise.all(
        uniqueIds.map(async id => {
          if (!names[id] || !emails[id]) {
            try {
              const user: UserProfileResponse = await getUserById(id);
              names[id] = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "N/A";
              emails[id] = user.email || "N/A";
            } catch {
              names[id] = "N/A";
              emails[id] = "N/A";
            }
          }
        })
      );
      setPatientNames(names);
      setPatientEmails(emails);
    }
    fetchPatientInfo();
  }, [appointments]);

  useEffect(() => {
    async function fetchNurseNoteForAppointment() {
      if (!selectedAppointmentId) return;
      try {
        const note = await getNurseNote(selectedAppointmentId);
        setNurseNotes(note || "");
        const app = appointments.find(a => a.id === selectedAppointmentId);
        setVisitReason(app?.reason || "");
      } catch {
        setNurseNotes("");
        setVisitReason("");
      }
    }
    fetchNurseNoteForAppointment();
  }, [selectedAppointmentId, appointments]);

  const filteredPatients = patients.filter(p =>
    (patientNames[p.id] || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmitData = async () => {
    if (!selectedAppointmentId) return;
    await submitNurseNote({
      appointmentId: selectedAppointmentId,
      contents: nurseNotes || "",
    });
    alert("Nurse notes saved successfully");
    setNurseNotes("");
  };

  const todayStr = new Date().toISOString().split("T")[0];
  const todaysAppointments = appointments.filter(a => a.startTime.startsWith(todayStr));

  return (
    <div className="flex min-h-screen overflow-y-auto bg-gray-50 dark:bg-gray-900">
      <aside className="w-64 border-r border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <nav className="space-y-2">
          {tabs.map(tab => (
            <button
              key={tab.name}
              onClick={() => {
                setActiveTab(tab.name);
                setSelectedPatient(null);
                setSelectedPatientProfile(null);
                setSelectedAppointmentId(null);
                setVisitReason("");
                setNurseNotes("");
              }}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left ${
                activeTab === tab.name
                  ? "bg-green-600 text-white"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              <tab.icon size={18} /> {tab.name}
            </button>
          ))}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-8 py-4 dark:border-gray-700 dark:bg-gray-800">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{activeTab}</h1>
        </header>

        {activeTab === "Dashboard" && (
          <main className="grid grid-cols-1 gap-6 p-8 md:grid-cols-2">
            <div className="rounded-lg bg-white p-6 shadow md:col-span-2 dark:bg-gray-800">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                Pending Appointments Today
              </h2>
              {todaysAppointments.length > 0 ? (
                <ul className="space-y-3">
                  {todaysAppointments.map(app => (
                    <li key={app.id} className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                      <p className="font-medium text-gray-900 dark:text-gray-100">{app.reason}</p>
                      <p className="text-sm text-gray-500">
                        Patient: {patientNames[app.patientId] || "N/A"} <br />
                        Email: {patientEmails[app.patientId] || "N/A"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(app.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -{" "}
                        {new Date(app.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : <p className="text-gray-500">No pending appointments today</p>}
            </div>
          </main>
        )}

        {activeTab === "Appointments" && (
          <main className="flex gap-6 p-8">
            <div className="w-1/3 flex flex-col rounded-lg bg-white p-4 shadow dark:bg-gray-800">
              <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">Select Date</h2>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="h-full w-full rounded-lg border p-2"
              />
            </div>
            <div className="flex-1 rounded-lg bg-white p-6 shadow dark:bg-gray-800">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">Appointments</h2>
              {selectedDate ? (() => {
                const dateStr = selectedDate.toISOString().split("T")[0];
                const filtered = appointments.filter(a => a.startTime.startsWith(dateStr));
                return filtered.length > 0 ? (
                  <ul className="space-y-3">
                    {filtered.map(app => (
                      <li key={app.id} className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                        <p className="font-medium text-gray-900 dark:text-gray-100">{app.reason}</p>
                        <p className="text-sm text-gray-500">
                          Patient: {patientNames[app.patientId] || "N/A"} <br />
                          Email: {patientEmails[app.patientId] || "N/A"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(app.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -{" "}
                          {new Date(app.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-gray-500">No appointments on {selectedDate.toLocaleDateString()}</p>;
              })() : <p className="text-gray-500">Select a date to view appointments</p>}
            </div>
          </main>
        )}

        {(activeTab === "Patient Data" || activeTab === "Patients") && (
          <main className="flex gap-6 p-8">
            <div className="w-1/3 flex flex-col max-h-[calc(100vh-4rem)] overflow-y-auto rounded-lg bg-white p-6 shadow dark:bg-gray-800">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">Patients</h2>
              {activeTab === "Patient Data" && (
                <input
                  type="text"
                  placeholder="Search patient by name"
                  className="mb-4 w-full rounded border px-2 py-1 text-gray-900 dark:bg-gray-700 dark:text-gray-100"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              )}
              <ul className="space-y-3">
                {(activeTab === "Patient Data" ? filteredPatients : patients).length > 0 ? 
                  (activeTab === "Patient Data" ? filteredPatients : patients).map(p => (
                    <li
                      key={p.id}
                      className={`flex cursor-pointer justify-between rounded-lg border p-3 ${
                        selectedPatient === p.id
                          ? "bg-green-100 dark:bg-green-700"
                          : "border-gray-200 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-700"
                      }`}
                      onClick={async () => {
                        setSelectedPatient(p.id);
                        setSelectedAppointmentId(null);
                        setVisitReason("");
                        setNurseNotes("");
                        try {
                          const profile = await getUserById(p.id);
                          setSelectedPatientProfile(profile || { id: p.id, firstName: "N/A", lastName: "N/A", email: "N/A", phoneNumber: "N/A", dateOfBirth: "N/A", address: null, emergencyContact: null });
                        } catch {
                          setSelectedPatientProfile({ id: p.id, firstName: "N/A", lastName: "N/A", email: "N/A", phoneNumber: "N/A", dateOfBirth: "N/A", address: null, emergencyContact: null });
                        }
                      }}
                    >
                      <span className="text-gray-700 dark:text-gray-300">{patientNames[p.id] || "N/A"}</span>
                      <span className="text-gray-500">{patientEmails[p.id] || "N/A"}</span>
                    </li>
                  )) : <p className="text-gray-500">No patients found</p>
                }
              </ul>
            </div>

            <div className="flex-1 space-y-4">
              {activeTab === "Patient Data" && selectedPatientProfile ? (
                <>
                  <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
                    <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">Patient Appointments</h2>
                    <ul className="space-y-2 max-h-60 overflow-y-auto">
                      {appointments
                        .filter(a => a.patientId === selectedPatientProfile.id)
                        .map(app => (
                          <li
                            key={app.id}
                            className={`cursor-pointer rounded p-2 ${
                              selectedAppointmentId === app.id ? "bg-green-100 dark:bg-green-700" : "hover:bg-gray-100 dark:hover:bg-gray-700"
                            }`}
                            onClick={() => setSelectedAppointmentId(app.id)}
                          >
                            <p className="text-sm text-gray-700 dark:text-gray-200">{new Date(app.startTime).toLocaleString()}</p>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{app.reason}</p>
                          </li>
                        ))}
                    </ul>
                  </div>

                  {selectedAppointmentId && (
                    <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
                      <p className="mb-2 font-medium text-gray-900 dark:text-gray-100">
                        Visit Reason: {visitReason}
                      </p>
                      <textarea
                        placeholder={nurseNotes || "Enter nurse notes here..."}
                        className="w-full rounded border p-2 dark:bg-gray-700 dark:text-gray-100"
                        value={nurseNotes}
                        onChange={e => setNurseNotes(e.target.value)}
                      />
                      <button
                        onClick={handleSubmitData}
                        className="mt-2 rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                      >
                        Save Notes
                      </button>
                    </div>
                  )}
                </>
              ) : selectedPatientProfile ? (
                <div className="space-y-2 rounded-lg bg-white p-4 shadow dark:bg-gray-800">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Patient Details</h2>
                  <p><strong>Name:</strong> {selectedPatientProfile.firstName || "N/A"} {selectedPatientProfile.lastName || "N/A"}</p>
                  <p><strong>Email:</strong> {selectedPatientProfile.email || "N/A"}</p>
                  <p><strong>Phone:</strong> {selectedPatientProfile.phoneNumber || "N/A"}</p>
                  <p><strong>Date of Birth:</strong> {selectedPatientProfile.dateOfBirth || "N/A"}</p>
                  <p><strong>Address:</strong> {selectedPatientProfile.address ? `${selectedPatientProfile.address.streetAddress || "N/A"}, ${selectedPatientProfile.address.city || "N/A"}, ${selectedPatientProfile.address.state || "N/A"}, ${selectedPatientProfile.address.postalCode || "N/A"}, ${selectedPatientProfile.address.country || "N/A"}` : "N/A"}</p>
                  <p><strong>Emergency Contact:</strong> {selectedPatientProfile.emergencyContact ? `${selectedPatientProfile.emergencyContact.name || "N/A"} (${selectedPatientProfile.emergencyContact.phoneNumber || "N/A"})` : "N/A"}</p>
                </div>
              ) : <p className="text-gray-500">Select a patient to view details</p>}
            </div>
          </main>
        )}
      </div>
    </div>
  );
}
