import Sidebar from "@/components/layout/Sidebar";
import SidebarHeader from "@/components/layout/SidebarHeader";

export default function DoctorLayout({ children }) {
  return (
    <div className="bg-background text-on-background min-h-screen">
      <Sidebar role="doctor" />
      <div className="ml-64 flex flex-col min-h-screen">
        <SidebarHeader role="doctor" />
        <main className="flex-1 w-full relative">
          {children}
        </main>
      </div>
    </div>
  );
}
