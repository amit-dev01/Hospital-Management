import Sidebar from "@/components/layout/Sidebar";
import SidebarHeader from "@/components/layout/SidebarHeader";

export default function HospitalLayout({ children }) {
  return (
    <div className="bg-background text-on-background min-h-screen">
      <Sidebar role="admin" />
      <div className="ml-64 flex flex-col min-h-screen">
        <SidebarHeader role="admin" />
        <main className="flex-1 w-full relative">
          {children}
        </main>
      </div>
    </div>
  );
}
