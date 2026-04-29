"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import Header from "@/components/layout/Header";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } }
};

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020817] text-slate-900 dark:text-slate-50 selection:bg-sky-500/30 overflow-hidden relative transition-colors duration-300">
      {/* Background Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-sky-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-teal-500/10 blur-[120px] pointer-events-none" />
      
      {/* Absolute Header (We bypass the standard layout header for a custom stunning landing header) */}
      <header className="absolute top-0 w-full z-50 px-6 py-6 flex justify-between items-center max-w-7xl mx-auto left-0 right-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-teal-400 flex items-center justify-center shadow-lg shadow-sky-500/20">
            <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>ecg_heart</span>
          </div>
          <span className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white">HealthSync</span>
        </div>
        <div className="flex items-center gap-6">
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-32 lg:pt-48 pb-24 relative z-10">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="text-center max-w-4xl mx-auto"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-bold uppercase tracking-widest mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
            </span>
            Next-Gen Hospital OS
          </motion.div>
          
          <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[1.1] mb-6">
            Healthcare, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-teal-300 to-emerald-400">
              Synchronized.
            </span>
          </motion.h1>
          
          <motion.p variants={fadeUp} className="text-lg md:text-xl text-slate-600 dark:text-slate-400 font-medium max-w-2xl mx-auto mb-12">
            A unified, intelligent platform connecting patients, doctors, and hospital administrators in one seamless experience.
          </motion.p>
        </motion.div>

        {/* Quick Portals - Bento Grid */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
        >
          {/* Patient Portal */}
          <Link href="/portal/patient">
            <motion.div 
              variants={fadeUp}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative h-full bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-8 rounded-3xl overflow-hidden cursor-pointer shadow-xl shadow-slate-200/50 dark:shadow-none"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 dark:from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center mb-6 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-500">
                <span className="material-symbols-outlined text-3xl">person</span>
              </div>
              <h3 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">Patient Portal</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Book appointments, view records, and manage your health journey securely.</p>
              <div className="mt-8 flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                Enter Portal <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </div>
            </motion.div>
          </Link>

          {/* Doctor Portal */}
          <Link href="/portal/doctor">
            <motion.div 
              variants={fadeUp}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative h-full bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-8 rounded-3xl overflow-hidden cursor-pointer shadow-xl shadow-slate-200/50 dark:shadow-none"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 dark:from-sky-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="w-14 h-14 rounded-2xl bg-sky-100 dark:bg-sky-500/20 flex items-center justify-center mb-6 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-500/20 group-hover:bg-sky-500 group-hover:text-white transition-colors duration-500">
                <span className="material-symbols-outlined text-3xl">stethoscope</span>
              </div>
              <h3 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">Doctor Portal</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Manage your schedule, access patient histories, and streamline your clinical workflow.</p>
              <div className="mt-8 flex items-center gap-2 text-sky-600 dark:text-sky-400 font-bold text-sm opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                Enter Portal <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </div>
            </motion.div>
          </Link>

          {/* Admin Portal */}
          <Link href="/portal/admin">
            <motion.div 
              variants={fadeUp}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative h-full bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-8 rounded-3xl overflow-hidden cursor-pointer shadow-xl shadow-slate-200/50 dark:shadow-none"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 dark:from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center mb-6 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20 group-hover:bg-purple-500 group-hover:text-white transition-colors duration-500">
                <span className="material-symbols-outlined text-3xl">local_hospital</span>
              </div>
              <h3 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">Admin OS</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Monitor hospital metrics, manage staff loads, and analyze real-time patient flow.</p>
              <div className="mt-8 flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold text-sm opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                Enter Portal <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </div>
            </motion.div>
          </Link>
        </motion.div>
      </main>
    </div>
  );
}
