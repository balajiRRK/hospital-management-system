import Navbar from '@/components/ui/Navbar';

export default function Home() {
  return (
    <>
      <div>
        <div className="flex justify-end p-3">
          <Navbar />
        </div>
        <header className="text-1xl flex justify-center">
          <h1> header </h1>
        </header>
        <main className="m-1.5 flex justify-center text-3xl">
          <h1> Welcome to CapChart</h1>
        </main>
        <footer className="text-1xl flex justify-center">
          <h1> footer </h1>
        </footer>
      </div>
    </>
  );
}
