"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function PatientProfile() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020817] text-slate-900 dark:text-slate-50 transition-colors duration-300 pb-32">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/patient/dashboard" className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <span className="material-symbols-outlined">arrow_back</span>
            </Link>
            <h1 className="font-bold text-lg">My Profile</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-8 space-y-8">
        
        {/* Profile Header */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm flex flex-col md:flex-row items-center gap-8">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-4xl font-black border-4 border-white dark:border-slate-900 shadow-xl">
              JD
            </div>
            <button className="absolute bottom-0 right-0 w-10 h-10 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[20px]">edit</span>
            </button>
          </div>
          
          <div className="text-center md:text-left flex-1">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">Johnathan Doe</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Patient ID: HS-940281</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
              <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-bold tracking-wider uppercase">Verified</span>
              <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold tracking-wider uppercase">Male • 28 yrs</span>
              <span className="px-3 py-1 bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-400 rounded-lg text-xs font-bold tracking-wider uppercase">Blood: O+</span>
            </div>
          </div>
        </section>

        {/* Personal Details */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-500">person</span>
              Personal Details
            </h3>
            <button className="text-emerald-600 dark:text-emerald-400 text-sm font-bold hover:underline">Edit</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Full Name</label>
              <p className="font-medium text-slate-900 dark:text-white">Johnathan Doe</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Date of Birth</label>
              <p className="font-medium text-slate-900 dark:text-white">14 May, 1996</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Mobile Number</label>
              <p className="font-medium text-slate-900 dark:text-white">+91 98765 43210</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Email Address</label>
              <p className="font-medium text-slate-900 dark:text-white">johnathan.d@example.com</p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Residential Address</label>
              <p className="font-medium text-slate-900 dark:text-white">142, Orchid Apartments, Indiranagar, Bangalore, Karnataka - 560038</p>
            </div>
          </div>
        </section>

        {/* Medical History */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-red-500">favorite</span>
              Medical History
            </h3>
            <button className="text-emerald-600 dark:text-emerald-400 text-sm font-bold hover:underline">Edit</button>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Known Allergies</label>
              <div className="flex gap-2">
                <span className="px-4 py-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 rounded-xl text-sm font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">warning</span> Penicillin
                </span>
                <span className="px-4 py-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 rounded-xl text-sm font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">warning</span> Peanuts
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Chronic Conditions</label>
              <div className="flex gap-2">
                <span className="px-4 py-2 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 rounded-xl text-sm font-bold">
                  Mild Asthma
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Past Surgeries / Notes</label>
              <p className="font-medium text-slate-900 dark:text-white p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                Appendectomy in 2015 (No complications). Needs regular inhaler usage during winter months.
              </p>
            </div>
          </div>
        </section>

        {/* Emergency Contacts */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-500">emergency</span>
              Emergency Contacts
            </h3>
            <button className="text-emerald-600 dark:text-emerald-400 text-sm font-bold flex items-center gap-1 hover:underline">
              <span className="material-symbols-outlined text-[18px]">add</span> Add
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Sarah Doe</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Wife • +91 99887 76655</p>
              </div>
              <button className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500 hover:text-emerald-500 transition-colors">
                <span className="material-symbols-outlined">call</span>
              </button>
            </div>
            
            <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Michael Doe</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Brother • +91 91234 56789</p>
              </div>
              <button className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500 hover:text-emerald-500 transition-colors">
                <span className="material-symbols-outlined">call</span>
              </button>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
