import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-gray-50 to-white">
      {/* Header / Hero Section */}
      <header className="flex flex-col items-center px-6 py-16 text-center">
        <h1 className="mb-4 text-5xl font-extrabold tracking-tight text-black">
          Welcome to CapChart
        </h1>
        <p className="max-w-2xl text-lg text-gray-600">
          Your health, simplified — manage your care, appointments, and medical records in one
          secure place.
        </p>
        <div className="mt-8 flex gap-4">
          <Button
            asChild
            className="bg-black px-6 py-3 font-semibold text-white shadow transition hover:bg-gray-800"
          >
            <Link href="/Sign-in">Get Started</Link>
          </Button>
        </div>
      </header>

      {/* Feature Highlights */}
      <main className="flex-grow bg-white px-6 py-10">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 p-6 shadow-sm transition hover:shadow-md">
            <h2 className="mb-2 text-xl font-semibold text-black">View Your Health Records</h2>
            <p className="text-gray-600">
              Access lab results, visit summaries, and immunizations anytime, anywhere — securely
              and instantly.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 p-6 shadow-sm transition hover:shadow-md">
            <h2 className="mb-2 text-xl font-semibold text-black">Manage Appointments</h2>
            <p className="text-gray-600">
              Schedule, reschedule, or cancel appointments with your care team effortlessly.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 p-6 shadow-sm transition hover:shadow-md">
            <h2 className="mb-2 text-xl font-semibold text-black">Message Your Providers</h2>
            <p className="text-gray-600">
              Send secure messages to your care team — no waiting on hold or calling the office.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t py-4 text-center text-sm text-gray-500">
        <p>© {new Date().getFullYear()} CapChart Health Systems. All rights reserved.</p>
      </footer>
    </div>
  );
}
