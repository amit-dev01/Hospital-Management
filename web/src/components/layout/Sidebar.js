"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar({ role = "doctor" }) {
  const pathname = usePathname();

  const doctorLinks = [
    { href: "/doctor/dashboard", icon: "dashboard", label: "Dashboard" },
    { href: "/doctor/appointments", icon: "calendar_month", label: "Appointments" },
    { href: "/doctor/patients", icon: "group", label: "My Patients" },
    { href: "/doctor/messages", icon: "forum", label: "Messages" },
    { href: "/doctor/settings", icon: "settings", label: "Settings" },
  ];

  const adminLinks = [
    { href: "/hospital/dashboard", icon: "dashboard", label: "Dashboard" },
    { href: "/hospital/doctors", icon: "medical_services", label: "Doctors" },
    { href: "/hospital/patients", icon: "group", label: "Patients" },
    { href: "/hospital/appointments", icon: "calendar_today", label: "Appointments" },
  ];

  const links = role === "admin" ? adminLinks : doctorLinks;

  return (
    <aside className="fixed left-0 h-screen w-64 border-r border-slate-200 bg-slate-50 dark:bg-slate-950 flex flex-col py-6 z-50">
      <div className="px-6 mb-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-container rounded-lg flex items-center justify-center text-white">
            <span className="material-symbols-outlined">
              {role === "admin" ? "local_hospital" : "stethoscope"}
            </span>
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
              {role === "admin" ? "City General" : "HealthSync"}
            </h1>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
              {role === "admin" ? "Admin Portal" : "Doctor Portal"}
            </p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link 
              key={link.label}
              href={link.href} 
              className={`flex items-center gap-3 px-4 py-3 font-bold transition-all ease-in-out duration-200 rounded-lg ${
                isActive 
                  ? "bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-300 border-r-4 border-sky-600 rounded-r-none" 
                  : "text-slate-600 dark:text-slate-400 hover:text-sky-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <span className="material-symbols-outlined">{link.icon}</span>
              <span className="font-body-md text-label-md">{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-4 mt-auto pt-6 space-y-1">
        {role === "admin" && (
          <button className="w-full mb-4 py-3 px-4 bg-error text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-error/20 active:scale-95 transition-transform">
            <span className="material-symbols-outlined">emergency_home</span>
            Emergency Entry
          </button>
        )}
        <Link href="/" className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:text-error transition-all rounded-lg">
          <span className="material-symbols-outlined">logout</span>
          <span className="font-body-md text-label-md">Logout</span>
        </Link>
      </div>
    </aside>
  );
}
