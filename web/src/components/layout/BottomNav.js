"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", icon: "home", label: "Home" },
    { href: "/patient/book", icon: "calendar_today", label: "Calendar" },
    { href: "/patient/dashboard", icon: "medical_services", label: "Records" },
    { href: "/patient/dashboard", icon: "person", label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 flex justify-around items-center h-16 px-4 pb-safe max-w-[640px] mx-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-100 dark:border-slate-800 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-50">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
        return (
          <Link 
            key={item.label}
            href={item.href} 
            className={`flex flex-col items-center justify-center rounded-2xl px-3 py-1 active:scale-95 transition-all duration-150 ${
              isActive 
                ? "text-sky-700 dark:text-sky-400 bg-sky-50/50 dark:bg-sky-900/20" 
                : "text-slate-400 dark:text-slate-500 hover:text-sky-600 dark:hover:text-sky-300"
            }`}
          >
            <span 
              className="material-symbols-outlined" 
              style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              {item.icon}
            </span>
            <span className="font-['Public_Sans'] text-[11px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
