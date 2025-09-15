import Link from "next/link";

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="flex flex-col items-center gap-6 p-8 rounded-2xl shadow-lg bg-white dark:bg-gray-800">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Welcome
        </h1>
        <Link
          href="/doctor_dashboard"
          className="px-6 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
        >
          Doctor Dashboard
        </Link>
      </main>
    </div>
  );
}
