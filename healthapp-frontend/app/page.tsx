import Link from 'next/link'

import Navbar from '@/components/ui/Navbar';

export default function Home() {
  return (
    <>
      <div>
        <div className="flex justify-end p-3">
          <Navbar />
        </div>
        <header>
          <h1>  </h1>
        </header>
        <main>
          <div className="flex justify-center text-3xl">
            <div className="flex flex-col items-center gap-6 p-8 rounded-2xl shadow-lg bg-white dark:bg-gray-800">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Welcome
              </h1>

              <div className="flex flex-col gap-3 w-64">
                <Link
                  href="dashboard/doctor"
                  className="px-6 py-3 rounded-xl bg-white border border-black text-black font-medium text-center hover:bg-black hover:text-white transition-colors"
                >
                  Doctor Dashboard
                </Link>

                <Link
                  href="dashboard/patient"
                  className="px-6 py-3 rounded-xl bg-white border border-black text-black font-medium text-center hover:bg-black hover:text-white transition-colors"
                >
                  Patient Dashboard
                </Link>

                <Link
                  href="dashboard/nurse"
                  className="px-6 py-3 rounded-xl bg-white border border-black text-black font-medium text-center hover:bg-black hover:text-white transition-colors"
                >
                  Nurse Dashboard
                </Link>

                <Link
                  href="dashboard/admin"
                  className="px-6 py-3 rounded-xl bg-white border border-black text-black font-medium text-center hover:bg-black hover:text-white transition-colors"
                >
                  Admin Dashboard
                </Link>
              </div>
            </div>
          </div>
        </main>
        <footer  className="flex justify-center text-3xl">
          <h1> footer </h1>
        </footer>
      </div>
    </>
  );
}
