import Link from 'next/link';

import Navbar from '@/components/ui/Navbar';

export default function Home() {
  return (
    <>
      <div>
        <div className="flex justify-end p-3">
          <Navbar />
        </div>
        <header className="flex justify-center text-1xl">
          <h1> header </h1>
        </header>
          <main className="flex justify-center text-3xl m-1.5">
            <h1> Welcome to CapChart</h1>
          </main>
        <footer className="flex justify-center text-1xl">
          <h1> footer </h1>
        </footer>
      </div>
    </>
  );
}
