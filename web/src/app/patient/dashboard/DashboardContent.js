"use client";

import { useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useTranslations } from "next-intl";
import { signOut } from "@/app/actions/auth";

export default function PatientDashboardContent({ profile, roleData }) {
  const t = useTranslations("PatientDashboard");
  const [searchTerm, setSearchTerm] = useState("");

  const doctors = [
    { id: 1, name: "Dr. Sarah Richardson", spec: "Cardiologist", exp: "12 yrs", rating: 4.8, avail: "Today, 2:00 PM" },
    { id: 2, name: "Dr. James Aris", spec: "General Physician", exp: "8 yrs", rating: 4.9, avail: "Tomorrow, 10:00 AM" },
    { id: 3, name: "Dr. Linda May", spec: "Neurologist", exp: "15 yrs", rating: 4.7, avail: "Mon, 9:30 AM" },
    { id: 4, name: "Dr. Robert Wong", spec: "Orthopedic", exp: "10 yrs", rating: 4.6, avail: "Today, 4:15 PM" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020817] text-slate-900 dark:text-slate-50 transition-colors duration-300">
      
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 min-h-[4rem] py-2 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 notranslate">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>ecg_heart</span>
            </div>
            <span className="font-black text-xl tracking-tight text-slate-900 dark:text-white">HealthSync</span>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <LanguageToggle />
              <ThemeToggle />
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => signOut()}
                className="text-sm font-medium text-slate-500 hover:text-red-500 transition-colors"
              >
                Sign Out
              </button>
              <Link href="/patient/profile" className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800 hover:ring-2 hover:ring-emerald-500 transition-all uppercase">
                {profile?.full_name?.substring(0, 2) || 'JD'}
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        
        {/* Welcome Section */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">
              {t("greeting")}, {profile?.full_name?.split(' ')[0] || 'Patient'}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">{t("overview")}</p>
          </div>
          <Link href="/patient/book" className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold transition-colors flex items-center gap-2 shadow-sm">
            <span className="material-symbols-outlined text-[20px]">calendar_add_on</span>
            {t("book_appointment")}
          </Link>
        </section>

        {/* Quick Stats / Overview */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex items-center gap-4 shadow-sm">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl">event</span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t("upcoming_visit")}</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{t("tomorrow")}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex items-center gap-4 shadow-sm">
            <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl">bloodtype</span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Blood Group</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white mt-1 uppercase">{roleData?.blood_group || 'N/A'}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex items-center gap-4 shadow-sm">
            <div className="w-14 h-14 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl">person</span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Age & Gender</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {roleData?.age} yrs • {roleData?.gender || 'N/A'}
              </p>
            </div>
          </div>
        </section>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Smart Booking CTA */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t("quick_actions")}</h2>
            
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-8 shadow-lg shadow-emerald-500/20 relative overflow-hidden group">
              <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-700"></div>
              <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-black/10 rounded-full blur-2xl"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30 flex-shrink-0">
                  <span className="material-symbols-outlined text-white text-5xl">smart_toy</span>
                </div>
                
                <div className="flex-1 text-white">
                  <h3 className="text-3xl font-black mb-2">{t("smart_triage")}</h3>
                  <p className="text-emerald-50 mb-6 text-lg">
                    {t("triage_desc")}
                  </p>
                  
                  <Link href="/patient/book" className="inline-flex items-center gap-2 bg-white text-emerald-600 px-8 py-4 rounded-xl font-black text-lg hover:bg-slate-50 hover:scale-105 transition-all shadow-xl shadow-black/10">
                    <span className="material-symbols-outlined text-[24px]">calendar_add_on</span>
                    {t("book_cta")}
                  </Link>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:border-emerald-500/50 transition-colors cursor-pointer group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-sky-100 dark:bg-sky-500/20 text-sky-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined">health_metrics</span>
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">{t("health_records")}</h3>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm">{t("records_desc")}</p>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:border-emerald-500/50 transition-colors cursor-pointer group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-500/20 text-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined">medication</span>
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">{t("pharmacy")}</h3>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm">{t("pharmacy_desc")}</p>
              </div>
            </div>
          </div>

          {/* Right Column: Upcoming & Activities */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Upcoming Appointment</h2>
            
            <div className="bg-emerald-500 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
              <div className="absolute -right-6 -top-6 text-emerald-400/30">
                <span className="material-symbols-outlined text-[120px]">calendar_month</span>
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm">Confirmed</span>
                  <button className="p-1 hover:bg-white/20 rounded-full transition-colors"><span className="material-symbols-outlined">more_vert</span></button>
                </div>
                
                <h3 className="text-2xl font-black mb-1">Tomorrow</h3>
                <p className="text-emerald-100 font-medium mb-6">10:00 AM - 10:30 AM</p>
                
                <div className="flex items-center gap-3 bg-black/10 p-3 rounded-xl backdrop-blur-sm">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-emerald-600 font-bold">
                    JA
                  </div>
                  <div>
                    <p className="font-bold text-sm">Dr. James Aris</p>
                    <p className="text-xs text-emerald-100">General Physician</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Recent Documents</h2>
                <button className="text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:underline">View All</button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-500 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Blood Test Results</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Oct 12, 2023 • 1.2 MB</p>
                  </div>
                  <button className="text-slate-400 hover:text-emerald-500"><span className="material-symbols-outlined text-[20px]">download</span></button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-500 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">receipt_long</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Prescription - Dr. Aris</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Sep 28, 2023 • 0.8 MB</p>
                  </div>
                  <button className="text-slate-400 hover:text-emerald-500"><span className="material-symbols-outlined text-[20px]">download</span></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
