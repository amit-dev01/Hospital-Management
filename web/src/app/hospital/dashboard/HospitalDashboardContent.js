"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";
import { signOut, verifyDoctor } from "@/app/actions/auth";

export default function HospitalDashboardContent({ profile, unverifiedDoctors }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [localUnverified, setLocalUnverified] = useState(unverifiedDoctors);
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) setStats(await res.json());
    } catch (e) {
      console.error("Failed to fetch stats:", e);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const handleVerify = async (id) => {
    const res = await verifyDoctor(id);
    if (res.success) {
      setLocalUnverified(prev => prev.filter(d => d.id !== id));
    } else {
      alert(res.error || "Failed to verify doctor");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020817] text-slate-900 dark:text-slate-50 transition-colors duration-300">
      
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 min-h-[4rem] py-2 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 notranslate">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>domain</span>
            </div>
            <span className="font-black text-xl tracking-tight text-slate-900 dark:text-white">HealthSync Admin</span>
          </div>

          <div className="hidden md:flex items-center gap-6 absolute left-1/2 -translate-x-1/2 h-full">
            <button onClick={() => setActiveTab("overview")} className={`h-full px-4 border-b-2 font-bold text-sm transition-colors ${activeTab === "overview" ? "border-indigo-500 text-indigo-600 dark:text-indigo-400" : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"}`}>Overview</button>
            <button onClick={() => setActiveTab("verification")} className={`h-full px-4 border-b-2 font-bold text-sm transition-colors ${activeTab === "verification" ? "border-indigo-500 text-indigo-600 dark:text-indigo-400" : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"}`}>Verification ({localUnverified.length})</button>
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
              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-200 dark:border-indigo-800">
                AD
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="p-8 max-w-[1400px] mx-auto w-full">
        {activeTab === "overview" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8 flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white">Welcome, {profile?.full_name?.split(' ')[0]}</h1>
                <p className="font-medium text-slate-500 dark:text-slate-400 mt-1">Live metrics and staff management.</p>
              </div>
              <button onClick={fetchStats} className="flex items-center gap-1 text-sm font-bold text-indigo-500 hover:underline">
                <span className="material-symbols-outlined text-[16px]">refresh</span>Refresh
              </button>
            </div>

            {/* Real Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[
                {
                  label: "Patients Today",
                  val: loadingStats ? "…" : (stats?.patientsToday ?? 0),
                  icon: "person",
                  color: "blue",
                },
                {
                  label: "Doctors Available",
                  val: loadingStats ? "…" : (stats?.doctorsAvailable ?? 0),
                  sub: stats?.doctorsTotal ? `/${stats.doctorsTotal}` : "",
                  icon: "medical_services",
                  color: "emerald",
                },
                {
                  label: "Pending Verification",
                  val: localUnverified.length,
                  icon: "verified_user",
                  color: "purple",
                },
                {
                  label: "Active Queue",
                  val: loadingStats ? "…" : (stats?.activeQueue ?? 0),
                  sub: " patients",
                  icon: "schedule",
                  color: "amber",
                },
              ].map((m) => (
                <div key={m.label} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-500/50 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 bg-${m.color}-100 dark:bg-${m.color}-500/20 rounded-xl text-${m.color}-600 dark:text-${m.color}-400`}>
                      <span className="material-symbols-outlined">{m.icon}</span>
                    </div>
                  </div>
                  <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">{m.label}</h3>
                  <p className="text-3xl font-black text-slate-900 dark:text-white">
                    {m.val}{m.sub && <span className="text-lg font-bold text-slate-400 dark:text-slate-500 ml-1">{m.sub}</span>}
                  </p>
                </div>
              ))}
            </div>

            {/* Today's Activity Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Appointment breakdown */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Today's Appointment Breakdown</h2>
                {loadingStats ? (
                  <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />)}</div>
                ) : (
                  <div className="space-y-4">
                    {[
                      { label: "Total Appointments", value: stats?.appointmentsToday ?? 0, color: "indigo", icon: "event" },
                      { label: "Completed", value: stats?.completedToday ?? 0, color: "emerald", icon: "check_circle" },
                      { label: "Active in Queue", value: stats?.activeQueue ?? 0, color: "amber", icon: "pending" },
                      { label: "Cancelled", value: stats?.cancelledToday ?? 0, color: "red", icon: "cancel" },
                    ].map(({ label, value, color, icon }) => {
                      const total = stats?.appointmentsToday || 1;
                      const pct = Math.round((value / total) * 100);
                      return (
                        <div key={label}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className={`material-symbols-outlined text-[16px] text-${color}-500`}>{icon}</span>
                              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{label}</span>
                            </div>
                            <span className="text-sm font-black text-slate-900 dark:text-white">{value}</span>
                          </div>
                          <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full bg-${color}-500 rounded-full transition-all duration-700`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Quick actions */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <button
                    onClick={() => setActiveTab("verification")}
                    className="w-full flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-500/10 hover:bg-purple-100 dark:hover:bg-purple-500/20 border border-purple-200 dark:border-purple-500/20 rounded-xl transition-colors text-left"
                  >
                    <span className="material-symbols-outlined text-purple-500">verified_user</span>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white text-sm">Doctor Verification</p>
                      <p className="text-xs text-purple-500 font-bold">{localUnverified.length} pending</p>
                    </div>
                  </button>
                  <div className="w-full flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl">
                    <span className="material-symbols-outlined text-emerald-500">medical_services</span>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white text-sm">Verified Doctors</p>
                      <p className="text-xs text-emerald-500 font-bold">{loadingStats ? "…" : `${stats?.doctorsAvailable ?? 0} active`}</p>
                    </div>
                  </div>
                  <div className="w-full flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl">
                    <span className="material-symbols-outlined text-blue-500">groups</span>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white text-sm">Patients Seen Today</p>
                      <p className="text-xs text-blue-500 font-bold">{loadingStats ? "…" : `${stats?.completedToday ?? 0} completed`}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "verification" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8">
              <h1 className="text-3xl font-black text-slate-900 dark:text-white">Doctor Verifications</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">Review and approve new doctor registrations.</p>
            </div>
            
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Doctor Name</th>
                    <th className="px-6 py-4">Specialization</th>
                    <th className="px-6 py-4">Experience</th>
                    <th className="px-6 py-4">Hospital</th>
                    <th className="px-6 py-4">License</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {localUnverified.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-slate-500 font-medium">
                        No pending verifications.
                      </td>
                    </tr>
                  ) : (
                    localUnverified.map((doc) => (
                      <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs uppercase">
                              {doc.profiles?.full_name?.substring(0, 2)}
                            </div>
                            <span className="font-bold text-slate-900 dark:text-white">{doc.profiles?.full_name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-400">{doc.specialization}</td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-400">{doc.experience_years} years</td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-400">{doc.hospital_name}</td>
                        <td className="px-6 py-4 font-mono text-xs text-slate-500">{doc.license_number}</td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => handleVerify(doc.id)}
                            className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm active:scale-95"
                          >
                            Verify Doctor
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
