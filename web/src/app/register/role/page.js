"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/ThemeToggle";

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default function RoleSelection() {
  const [role, setRole] = useState("patient");
  const router = useRouter();

  const handleContinue = () => {
    if (role === "doctor") {
      router.push("/register/doctor");
    } else if (role === "admin") {
      router.push("/register/admin");
    } else {
      router.push("/register/patient");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020817] text-slate-900 dark:text-slate-50 flex flex-col relative overflow-hidden selection:bg-sky-500/30 transition-colors duration-300">
      {/* Background Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-sky-500/5 dark:bg-sky-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/5 dark:bg-emerald-500/10 blur-[120px] pointer-events-none" />

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
      <main className="flex-grow flex items-center justify-center px-4 pt-8 pb-20 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[600px]"
        >
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-3">Create Your Account</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Select your role to continue your registration</p>
          </div>

          <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            
            {/* Patient Role Card */}
            <motion.label variants={fadeUp} onClick={() => setRole("patient")} className="relative cursor-pointer group">
              <input checked={role === "patient"} readOnly className="peer sr-only" type="radio" />
              <div className={`h-full bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border-2 p-6 rounded-3xl transition-all duration-300 shadow-xl dark:shadow-2xl flex flex-col items-start gap-4 ${role === 'patient' ? 'border-emerald-500 shadow-emerald-500/20' : 'border-slate-200 dark:border-slate-800 hover:border-emerald-500/50'}`}>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors duration-300 ${role === 'patient' ? 'bg-emerald-500 text-white shadow-lg' : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'}`}>
                  <span className="material-symbols-outlined text-3xl">person</span>
                </div>
                <div className="space-y-1 mt-2">
                  <h3 className={`text-xl font-bold ${role === 'patient' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>Patient</h3>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Book appointments, consult doctors, and manage health records.</p>
                </div>
                <div className="absolute top-6 right-6">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors duration-300 ${role === 'patient' ? 'border-emerald-500' : 'border-slate-300 dark:border-slate-700'}`}>
                    {role === 'patient' && <div className="w-3 h-3 rounded-full bg-emerald-500"></div>}
                  </div>
                </div>
              </div>
            </motion.label>

            {/* Doctor Role Card */}
            <motion.label variants={fadeUp} onClick={() => setRole("doctor")} className="relative cursor-pointer group">
              <input checked={role === "doctor"} readOnly className="peer sr-only" type="radio" />
              <div className={`h-full bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border-2 p-6 rounded-3xl transition-all duration-300 shadow-xl dark:shadow-2xl flex flex-col items-start gap-4 ${role === 'doctor' ? 'border-sky-500 shadow-sky-500/20' : 'border-slate-200 dark:border-slate-800 hover:border-sky-500/50'}`}>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors duration-300 ${role === 'doctor' ? 'bg-sky-500 text-white shadow-lg' : 'bg-sky-100 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400'}`}>
                  <span className="material-symbols-outlined text-3xl">stethoscope</span>
                </div>
                <div className="space-y-1 mt-2">
                  <h3 className={`text-xl font-bold ${role === 'doctor' ? 'text-sky-600 dark:text-sky-400' : 'text-slate-900 dark:text-white'}`}>Doctor</h3>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Provide care, manage patients, and schedule your appointments.</p>
                </div>
                <div className="absolute top-6 right-6">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors duration-300 ${role === 'doctor' ? 'border-sky-500' : 'border-slate-300 dark:border-slate-700'}`}>
                    {role === 'doctor' && <div className="w-3 h-3 rounded-full bg-sky-500"></div>}
                  </div>
                </div>
              </div>
            </motion.label>

          </motion.div>

          {/* Footer Action */}
          <motion.div variants={fadeUp} initial="hidden" animate="show" className="flex flex-col items-center gap-6 mt-4">
            <button
              onClick={handleContinue}
              className={`w-full h-14 text-sm font-bold rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 text-white shadow-lg active:scale-[0.98] ${role === 'patient' ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-emerald-500/30' : 'bg-gradient-to-r from-sky-500 to-blue-400 shadow-sky-500/30'}`}
            >
              Continue as {role === 'patient' ? 'Patient' : 'Doctor'}
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
              <span>Already have an account?</span>
              <Link className="text-sky-600 dark:text-white font-bold hover:text-sky-700 dark:hover:text-sky-400 transition-colors" href="/login">Sign in</Link>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
