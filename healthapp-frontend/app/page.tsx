import Navbar from '@/components/ui/Navbar';

export default function Home() {
  return (
    <>
      <div>
        <div className="flex justify-end p-3">
          <Navbar />
        </div>
          <header>
              <h1> header </h1>

          </header>
        <main>
          <div className="flex justify-center text-3xl">
            <h1> Main content </h1>
          </div>
        </main>
          <footer  className="flex justify-center text-3xl">
              <h1> footer </h1>
          </footer>
      </div>
    </>
  );
}
