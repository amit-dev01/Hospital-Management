"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";

function LoginContent() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const role = searchParams.get("role") || "";
  const isFormValid = identifier.length > 0 && password.length > 0;

  const handleLogin = (e) => {
    e.preventDefault();
    if (!isFormValid) return;
    
    // Use role parameter if present, otherwise fallback to identifier mock logic
    if (role === "doctor" || identifier.toLowerCase().includes("doctor")) {
      router.push("/doctor/dashboard");
    } else if (role === "admin" || identifier.toLowerCase().includes("admin") || identifier.toLowerCase().includes("hospital")) {
      router.push("/hospital/dashboard");
    } else {
      router.push("/patient/dashboard");
    }
  };

  return (
    <>
      {/* Header */}
      <header className="w-full z-50 px-6 py-6 flex justify-between items-center max-w-7xl mx-auto relative">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-center group-hover:bg-slate-100 dark:group-hover:bg-slate-800 transition-colors shadow-sm">
            <span className="material-symbols-outlined text-slate-700 dark:text-white" style={{ fontVariationSettings: "'FILL' 1" }}>arrow_back</span>
          </div>
          <span className="text-sm font-bold tracking-wide text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Back to Home</span>
        </Link>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-teal-400 flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>ecg_heart</span>
            </div>
            <span className="text-xl font-black tracking-tighter text-slate-900 dark:text-white">HealthSync</span>
          </div>
        </div>
      </header>

      {/* Main Form Area */}
      <main className="flex-grow flex items-center justify-center px-4 relative z-10 pb-20">
        <motion.div 
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[440px]"
        >
          {/* Welcome Text */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-2">Welcome Back</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Sign in to access your secure portal</p>
          </div>

          {/* Glass Form Card */}
          <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800/60 rounded-3xl p-8 shadow-xl dark:shadow-2xl">
            <form className="space-y-6" onSubmit={handleLogin}>
              
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">Email or ID</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 dark:text-slate-500 pointer-events-none group-focus-within:text-sky-500 dark:group-focus-within:text-sky-400 transition-colors">
                    <span className="material-symbols-outlined text-[20px]">person</span>
                  </div>
                  <input
                    className="w-full h-14 pl-12 pr-4 bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600 font-medium shadow-sm dark:shadow-none"
                    placeholder="doctor / admin / patient"
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Password</label>
                  <Link className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:text-sky-500 dark:hover:text-sky-300 transition-colors" href="#">Forgot?</Link>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 dark:text-slate-500 pointer-events-none group-focus-within:text-sky-500 dark:group-focus-within:text-sky-400 transition-colors">
                    <span className="material-symbols-outlined text-[20px]">lock</span>
                  </div>
                  <input
                    className="w-full h-14 pl-12 pr-12 bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600 font-medium tracking-widest shadow-sm dark:shadow-none"
                    placeholder="••••••••"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">{showPassword ? "visibility_off" : "visibility"}</span>
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!isFormValid}
                  className={`w-full h-14 text-sm font-bold rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 ${
                    isFormValid
                      ? "bg-gradient-to-r from-sky-500 to-teal-400 text-white shadow-[0_0_20px_rgba(14,165,233,0.3)] hover:shadow-[0_0_30px_rgba(14,165,233,0.5)] active:scale-[0.98]"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-200 dark:border-slate-700"
                  }`}
                >
                  Sign In to Secure Portal
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </div>
            </form>

            <div className="mt-8 flex items-center justify-center gap-2 border-t border-slate-200 dark:border-slate-800/60 pt-6">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">New to HealthSync?</span>
              <Link href={role ? `/register/${role}` : "/register/role"} className="text-sm font-bold text-sky-600 dark:text-white hover:text-sky-700 dark:hover:text-sky-400 transition-colors">
                Create an Account
              </Link>
            </div>
          </div>
        </motion.div>
      </main>
    </>
  );
}

export default function Login() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020817] text-slate-900 dark:text-slate-50 flex flex-col relative overflow-hidden selection:bg-sky-500/30 transition-colors duration-300">
      {/* Background Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-sky-500/5 dark:bg-sky-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/5 dark:bg-emerald-500/10 blur-[120px] pointer-events-none" />

      <Suspense fallback={<div className="flex-grow flex items-center justify-center">Loading...</div>}>
        <LoginContent />
      </Suspense>
    </div>
  );
}
