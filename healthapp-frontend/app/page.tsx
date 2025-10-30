import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col">
      {/* Header / Hero Section */}
      <header className="flex flex-col items-center text-center py-16 px-6">
        <h1 className="text-5xl font-extrabold text-black mb-4 tracking-tight">
          Welcome to CapChart
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl">
          Your health, simplified — manage your care, appointments, and medical
          records in one secure place.
        </p>
        <div className="mt-8 flex gap-4">
          <Button
            asChild
            className="bg-black text-white font-semibold px-6 py-3 shadow hover:bg-gray-800 transition"
          >
            <Link href="/Sign-in">Get Started</Link>
          </Button>
        </div>
      </header>

      {/* Feature Highlights */}
      <main className="flex-grow px-6 py-10 bg-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          <div className="p-6 border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition">
            <h2 className="text-xl font-semibold text-black mb-2">
              View Your Health Records
            </h2>
            <p className="text-gray-600">
              Access lab results, visit summaries, and immunizations anytime,
              anywhere — securely and instantly.
            </p>
          </div>
          <div className="p-6 border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition">
            <h2 className="text-xl font-semibold text-black mb-2">
              Manage Appointments
            </h2>
            <p className="text-gray-600">
              Schedule, reschedule, or cancel appointments with your care team
              effortlessly.
            </p>
          </div>
          <div className="p-6 border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition">
            <h2 className="text-xl font-semibold text-black mb-2">
              Message Your Providers
            </h2>
            <p className="text-gray-600">
              Send secure messages to your care team — no waiting on hold or
              calling the office.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto text-center text-gray-500 text-sm py-4 border-t">
        <p>© {new Date().getFullYear()} CapChart Health Systems. All rights reserved.</p>
      </footer>
    </div>
  );
}
