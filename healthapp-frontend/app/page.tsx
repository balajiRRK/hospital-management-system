"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="flex flex-col items-center gap-6 p-8 rounded-2xl shadow-lg bg-white dark:bg-gray-800">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Welcome
        </h1>

        <div className="flex flex-col gap-3 w-64">
          <Link
            href="/doctor_dashboard"
            className="px-6 py-3 rounded-xl bg-white border border-black text-black font-medium text-center hover:bg-black hover:text-white transition-colors"
          >
            Doctor Dashboard
          </Link>

          <Link
            href="/patient_dashboard"
            className="px-6 py-3 rounded-xl bg-white border border-black text-black font-medium text-center hover:bg-black hover:text-white transition-colors"
          >
            Patient Dashboard
          </Link>

          <Link
            href="/nurse_dashboard"
            className="px-6 py-3 rounded-xl bg-white border border-black text-black font-medium text-center hover:bg-black hover:text-white transition-colors"
          >
            Nurse Dashboard
          </Link>

          <Link
            href="/admin_dashboard"
            className="px-6 py-3 rounded-xl bg-white border border-black text-black font-medium text-center hover:bg-black hover:text-white transition-colors"
          >
            Admin Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
