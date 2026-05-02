export default function HospitalLayout({ children }) {
  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col">
      <main className="flex-1 w-full relative">
        {children}
      </main>
    </div>
  );
}
