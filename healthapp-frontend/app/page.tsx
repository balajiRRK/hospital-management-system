import Navbar from '@/components/ui/Navbar';

export default function Home() {
  return (
    <>
      <div>
        <div className="flex justify-end p-3">
          <Navbar />
        </div>
        <main>
          <div className="flex justify-center text-3xl">
            <h1> Main content </h1>
          </div>
        </main>
      </div>
    </>
  );
}
