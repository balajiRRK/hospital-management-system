"use client";

import { useEffect, useState } from "react";
import {
  User,
  Calendar as CalendarIcon,
  LayoutDashboard,
  ClipboardCheck,
} from "lucide-react";
import {
  getMe,
  MeResponse,
  apiLogout,
  getAppointmentsForDoctor,
  AppointmentResponse,
} from "../../appointments/api";
import { useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";

export default function DoctorDashboard() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [selectedPatient, setSelectedPatient] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [doctor, setDoctor] = useState<MeResponse | null>(null);
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [patients, setPatients] = useState<{ id: number }[]>([]);
  const [patientEmails, setPatientEmails] = useState<Record<number, string>>({});
  const [resultText, setResultText] = useState("");
  const router = useRouter();

  const tabs = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Appointments", icon: CalendarIcon },
    { name: "Results", icon: ClipboardCheck },
    { name: "Patients", icon: User },
  ];

  useEffect(() => {
    async function fetchDoctor() {
      const me = await getMe();
      setDoctor(me);
      const doctorAppointments = await getAppointmentsForDoctor(me.id);
      setAppointments(doctorAppointments);
    }
    fetchDoctor();
  }, []);

  useEffect(() => {
    if (!doctor) return;
    async function fetchPatients() {
      const doctorAppointments = await getAppointmentsForDoctor(doctor.id);
      setAppointments(doctorAppointments);
      const uniquePatients = Array.from(new Set(doctorAppointments.map(a => a.patientId))).map(id => ({ id }));
      setPatients(uniquePatients);
    }
    fetchPatients();
  }, [doctor]);

  useEffect(() => {
    if (appointments.length === 0) return;
    async function fetchEmails() {
      const emails: Record<number, string> = { ...patientEmails };
      const uniqueIds = Array.from(new Set(appointments.map(a => a.patientId)));
      await Promise.all(
        uniqueIds.map(async id => {
          if (!emails[id]) {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${id}/email`, {
              credentials: "include",
            });
            emails[id] = await res.text();
          }
        })
      );
      setPatientEmails(emails);
    }
    fetchEmails();
  }, [appointments]);

  const handleLogout = async () => {
    await apiLogout();
    router.push("/Sign-in");
  };

  const handleSaveResult = async () => {
    if (!selectedPatient || !resultText) return;
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/results`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        doctorId: doctor?.id,
        patientId: selectedPatient,
        result: resultText,
      }),
    });
    setResultText("");
  };

  const todayStr = new Date().toISOString().split("T")[0];
  const todaysAppointments = appointments.filter(a => a.startTime.startsWith(todayStr));
  const patientsWithAppointments = Array.from(new Set(appointments.map(a => a.patientId))).map(id => ({ id }));

  return (
    <div className="flex min-h-screen overflow-y-auto bg-gray-50 dark:bg-gray-900">
      <aside className="w-64 border-r border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-lg font-bold text-white">
            {doctor?.email?.charAt(0).toUpperCase() || "D"}
          </div>
          <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {doctor?.email || "Loading..."}
          </span>
        </div>
        <nav className="space-y-2">
          {tabs.map(tab => (
            <button
              key={tab.name}
              onClick={() => {
                setActiveTab(tab.name);
                setSelectedPatient(null);
              }}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left ${
                activeTab === tab.name
                  ? "bg-blue-600 text-white"
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
          <button
            onClick={handleLogout}
            className="rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-700"
          >
            Logout
          </button>
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
                        Patient ID: {app.patientId} <br />
                        Email: {patientEmails[app.patientId] || "Loading..."}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(app.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -{" "}
                        {new Date(app.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No pending appointments today</p>
              )}
            </div>
          </main>
        )}

        {activeTab === "Appointments" && (
          <main className="flex gap-6 p-8">
            <div className="w-1/3 rounded-lg bg-white p-4 shadow dark:bg-gray-800">
              <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">Select Date</h2>
              <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} className="rounded-lg border p-2" />
            </div>
            <div className="flex-1 rounded-lg bg-white p-6 shadow dark:bg-gray-800">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">Appointments</h2>
              {selectedDate ? (
                (() => {
                  const dateStr = selectedDate.toISOString().split("T")[0];
                  const filtered = appointments.filter(a => a.startTime.startsWith(dateStr));
                  return filtered.length > 0 ? (
                    <ul className="space-y-3">
                      {filtered.map(app => (
                        <li key={app.id} className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                          <p className="font-medium text-gray-900 dark:text-gray-100">{app.reason}</p>
                          <p className="text-sm text-gray-500">
                            Patient ID: {app.patientId} <br />
                            Email: {patientEmails[app.patientId] || "Loading..."}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(app.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -{" "}
                            {new Date(app.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500">No appointments on {selectedDate.toLocaleDateString()}</p>
                  );
                })()
              ) : (
                <p className="text-gray-500">Select a date to view appointments</p>
              )}
            </div>
          </main>
        )}

        {activeTab === "Results" && (
          <main className="grid grid-cols-1 gap-6 p-8">
            <section className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">Select Patient</h2>
              <select
                className="w-full rounded border bg-gray-50 px-2 py-2 text-gray-900 dark:bg-gray-700 dark:text-gray-100"
                value={selectedPatient ?? ""}
                onChange={e => setSelectedPatient(Number(e.target.value))}
              >
                <option value="">-- Select --</option>
                {patientsWithAppointments.map(p => (
                  <option key={p.id} value={p.id}>
                    {patientEmails[p.id] || "Loading..."} (ID: {p.id})
                  </option>
                ))}
              </select>
            </section>

            {selectedPatient && (
              <section className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">Enter Visit Result</h2>
                <textarea
                  className="mb-2 w-full rounded border bg-gray-50 px-2 py-3 text-gray-900 dark:bg-gray-700 dark:text-gray-100"
                  value={resultText}
                  onChange={e => setResultText(e.target.value)}
                />
                <button
                  onClick={handleSaveResult}
                  className="rounded border bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  Save Result
                </button>
              </section>
            )}
          </main>
        )}

        {activeTab === "Patients" && (
          <main className="flex gap-6 p-8">
            <div className="max-h-[calc(100vh-4rem)] w-1/3 overflow-y-auto rounded-lg bg-white p-6 shadow dark:bg-gray-800">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">Patients</h2>
              <ul className="space-y-3">
                {patients.length > 0 ? (
                  patients.map(p => (
                    <li
                      key={p.id}
                      className="flex cursor-pointer justify-between rounded-lg border border-gray-200 p-3 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-700"
                      onClick={() => setSelectedPatient(p.id)}
                    >
                      <span className="text-gray-700 dark:text-gray-300">Patient ID: {p.id}</span>
                      <span className="text-gray-500">{patientEmails[p.id] || "Loading..."}</span>
                    </li>
                  ))
                ) : (
                  <p className="text-gray-500">No patients with appointments</p>
                )}
              </ul>
            </div>
            <div className="flex-1 rounded-lg bg-white p-6 shadow dark:bg-gray-800">
              <p className="text-gray-500">Select a patient to view details</p>
            </div>
          </main>
        )}
      </div>
    </div>
  );
}
