"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Header() {
  const pathname = usePathname();
  const isAuthPage = pathname.includes("/login") || pathname.includes("/register");

  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 shadow-sm shadow-slate-200/50 sticky top-0 z-50">
      <div className="flex justify-between items-center w-full px-4 md:px-6 h-16 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[28px]">medical_services</span>
          <span className="font-['Public_Sans'] text-xl font-bold tracking-tight text-sky-700 dark:text-sky-400">
            HealthSync
          </span>
        </Link>

        {!isAuthPage ? (
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/login" className="text-label-md font-label-md text-primary hover:underline hidden md:block">
              Sign In
            </Link>
            <button className="p-2 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-500">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden cursor-pointer border-2 border-transparent hover:border-primary transition-colors">
              <img 
                alt="User profile avatar" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQbWq1XGMuVNJm6YlQZICBp47AHH_3GzZtg5ghCbsvP-ooIAZKmWOQeOMvWERf6mWSaok--XmcT8tPi0iJDhQkfIXUuzuler2X9bMcf1aXQrPbxKw0i2Y112-vA3tvCEaSnbgKrXTAWafqgcsJLPXNh2MAvGuY2-RGNC-l5RTxwQAsrNLn_GMthSue35awMjcxlTsf9yU8AEqEo6UUxnIh3blxh7m6OMvVEdPu0mmiKi7PN1pL4M42vys8xK0aO6F_-d4K94lIcWBc"
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <span className="text-label-md font-label-md text-slate-500 hidden md:inline">English</span>
            <span className="material-symbols-outlined text-slate-400 text-xl">language</span>
          </div>
        )}
      </div>
    </header>
  );
}
