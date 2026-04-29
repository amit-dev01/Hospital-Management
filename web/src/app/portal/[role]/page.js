"use client";

import { use } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { notFound } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";

const roleData = {
  patient: {
    title: "Patient Portal",
    desc: "Access your medical records, book appointments, and manage your health journey securely.",
    icon: "person",
    color: "emerald",
    gradient: "from-emerald-500 to-teal-400",
    shadow: "shadow-emerald-500/20",
    bg: "bg-emerald-500/10",
    signupLink: "/register/patient"
  },
  doctor: {
    title: "Doctor Portal",
    desc: "Manage your clinical schedule, view patient histories, and streamline your daily workflow.",
    icon: "stethoscope",
    color: "sky",
    gradient: "from-sky-500 to-blue-400",
    shadow: "shadow-sky-500/20",
    bg: "bg-sky-500/10",
    signupLink: "/register/doctor"
  },
  admin: {
    title: "Admin OS",
    desc: "Monitor hospital metrics, manage staff, and analyze real-time patient flow across the facility.",
    icon: "local_hospital",
    color: "purple",
    gradient: "from-purple-500 to-indigo-400",
    shadow: "shadow-purple-500/20",
    bg: "bg-purple-500/10",
    signupLink: "/register/admin"
  }
};

export default function PortalGateway({ params }) {
  // Unwrap the promise-based params object
  const unwrappedParams = use(params);
  const roleKey = unwrappedParams.role;
  const data = roleData[roleKey];

  if (!data) return notFound();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020817] text-slate-900 dark:text-slate-50 flex flex-col relative overflow-hidden selection:bg-sky-500/30 transition-colors duration-300">
      {/* Background Effects */}
      <div className={`absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full ${data.bg} blur-[120px] pointer-events-none`} />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-slate-300/50 dark:bg-slate-800/50 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="w-full z-50 px-6 py-6 flex justify-between items-center max-w-7xl mx-auto relative">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-center group-hover:bg-slate-100 dark:group-hover:bg-slate-800 transition-colors shadow-sm">
            <span className="material-symbols-outlined text-slate-700 dark:text-white" style={{ fontVariationSettings: "'FILL' 1" }}>arrow_back</span>
          </div>
          <span className="text-sm font-bold tracking-wide text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Back to Home</span>
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-teal-400 flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>ecg_heart</span>
            </div>
            <span className="text-xl font-black tracking-tighter text-slate-900 dark:text-white">HealthSync</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center px-4 relative z-10 pb-20">
        <motion.div 
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[500px]"
        >
          {/* Gateway Card */}
          <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800/60 rounded-3xl p-8 shadow-xl dark:shadow-2xl relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${data.gradient}`}></div>
            
            <div className="flex flex-col items-center text-center mb-10 mt-4">
              <div className={`w-20 h-20 rounded-2xl ${data.bg} border border-slate-200 dark:border-slate-700/50 flex items-center justify-center mb-6 shadow-lg`}>
                <span className="material-symbols-outlined text-4xl text-slate-800 dark:text-white">{data.icon}</span>
              </div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-3">{data.title}</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">{data.desc}</p>
            </div>

            <div className="space-y-4">
              <Link href={`/login?role=${roleKey}`} className="block">
                <button className={`w-full h-14 text-sm font-bold rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 bg-gradient-to-r ${data.gradient} text-white shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] active:scale-[0.98]`}>
                  Sign In to existing account
                  <span className="material-symbols-outlined text-[18px]">login</span>
                </button>
              </Link>

              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800/60"></div>
                <span className="flex-shrink-0 mx-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">or</span>
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800/60"></div>
              </div>

              <Link href={data.signupLink} className="block">
                <button className="w-full h-14 text-sm font-bold rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 bg-white dark:bg-slate-800/50 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-[0.98] shadow-sm">
                  Create a new account
                  <span className="material-symbols-outlined text-[18px]">person_add</span>
                </button>
              </Link>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
