"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useTranslations } from "next-intl";
import { signOut } from "@/app/actions/auth";

export default function PatientDashboardContent({ profile, roleData }) {
  const t = useTranslations("PatientDashboard");
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null); // appointment id being cancelled
  const [cancelConfirm, setCancelConfirm] = useState(null); // appointment id awaiting confirm

  // Fetch real appointments from the API
  const fetchAppointments = useCallback(async () => {
    if (!profile?.id) return;
    try {
      const res = await fetch(`/api/appointments/patient/${profile.id}`);
      if (res.ok) {
        const json = await res.json();
        setAppointments(json.appointments ?? []);
      }
    } catch (e) {
      console.error("Failed to fetch appointments:", e);
    } finally {
      setLoading(false);
    }
  }, [profile?.id]);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  const handleCancel = async (apptId) => {
    setCancelling(apptId);
    setCancelConfirm(null);
    try {
      const res = await fetch(`/api/appointments/${apptId}/cancel`, { method: "PATCH" });
      if (res.ok) await fetchAppointments();
    } catch (e) {
      console.error("Cancel failed:", e);
    } finally {
      setCancelling(null);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  const upcomingAppointments = appointments.filter(
    (a) => a.status === "confirmed" || a.status === "in-progress"
  );
  const nextAppointment = upcomingAppointments[0] ?? null;

  const todayActive = appointments.find(
    (a) => a.date === today && (a.status === "confirmed" || a.status === "in-progress")
  );

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

        {/* Quick Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex items-center gap-4 shadow-sm">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl">event</span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t("upcoming_visit")}</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {loading ? "..." : nextAppointment
                  ? new Date(nextAppointment.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                  : "None booked"}
              </p>
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
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Age &amp; Gender</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {roleData?.age} yrs • {roleData?.gender || 'N/A'}
              </p>
            </div>
          </div>
        </section>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column */}
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
                  <p className="text-emerald-50 mb-6 text-lg">{t("triage_desc")}</p>
                  
                  <Link href="/patient/book" className="inline-flex items-center gap-2 bg-white text-emerald-600 px-8 py-4 rounded-xl font-black text-lg hover:bg-slate-50 hover:scale-105 transition-all shadow-xl shadow-black/10">
                    <span className="material-symbols-outlined text-[24px]">calendar_add_on</span>
                    {t("book_cta")}
                  </Link>
                </div>
              </div>
            </div>

            {/* Today's Live Token — shown only if patient has appointment today */}
            {todayActive && (
              <div className="bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="material-symbols-outlined text-emerald-500">confirmation_number</span>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">Your Token — Today</h3>
                  <span className={`ml-auto px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    todayActive.status === "in-progress"
                      ? "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400"
                      : "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                  }`}>
                    {todayActive.status === "in-progress" ? "🔔 Your Turn!" : "Waiting"}
                  </span>
                </div>
                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                  <div>
                    <p className="text-3xl font-black text-slate-900 dark:text-white">
                      {todayActive.tokens?.[0]?.token_number ?? "—"}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Slot: {todayActive.time_slot} • Priority: {
                        todayActive.priority === 1 ? "🚨 Emergency" :
                        todayActive.priority === 2 ? "🤰 Pregnant" :
                        todayActive.priority === 3 ? "👴 Senior" : "Regular"
                      }
                    </p>
                  </div>
                  {todayActive.queuePosition && (
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-500">Queue Position</p>
                      <p className="text-2xl font-black text-emerald-500">#{todayActive.queuePosition}</p>
                      {todayActive.estimatedWaitTime != null && (
                        <p className="text-xs text-slate-400">~{todayActive.estimatedWaitTime} min wait</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
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

          {/* Right Column */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Upcoming Appointment</h2>
            
            {loading ? (
              <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl h-48 animate-pulse" />
            ) : nextAppointment ? (
              <div className="bg-emerald-500 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
                <div className="absolute -right-6 -top-6 text-emerald-400/30">
                  <span className="material-symbols-outlined text-[120px]">calendar_month</span>
                </div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm ${
                      nextAppointment.status === "in-progress"
                        ? "bg-amber-500/80"
                        : "bg-white/20"
                    }`}>
                      {nextAppointment.status === "in-progress" ? "In Progress" : "Confirmed"}
                    </span>
                    {nextAppointment.is_emergency && (
                      <span className="bg-red-500/80 px-3 py-1 rounded-full text-xs font-bold">🚨 Emergency</span>
                    )}
                  </div>
                  
                  <h3 className="text-2xl font-black mb-1">
                    {nextAppointment.date === today
                      ? "Today"
                      : new Date(nextAppointment.date).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                  </h3>
                  <p className="text-emerald-100 font-medium mb-4">{nextAppointment.time_slot}</p>
                  
                  {nextAppointment.tokens?.[0]?.token_number && (
                    <div className="bg-white/10 rounded-lg px-4 py-2 mb-4 inline-block">
                      <span className="text-sm font-bold">Token: {nextAppointment.tokens[0].token_number}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-3 bg-black/10 p-3 rounded-xl backdrop-blur-sm mb-4">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-emerald-600 font-bold text-xs flex-shrink-0">
                      Dr
                    </div>
                    <div>
                      <p className="font-bold text-sm">Dr. {nextAppointment.doctor?.full_name ?? nextAppointment.doctor_id?.substring(0, 8) ?? 'Unknown'}</p>
                      <p className="text-xs text-emerald-100">{nextAppointment.symptoms ?? "General consultation"}</p>
                    </div>
                  </div>

                  {/* Cancel button — only for confirmed, future appointments */}
                  {nextAppointment.status === "confirmed" && (
                    cancelConfirm === nextAppointment.id ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCancel(nextAppointment.id)}
                          disabled={cancelling === nextAppointment.id}
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
                        >
                          {cancelling === nextAppointment.id ? "Cancelling…" : "Yes, Cancel"}
                        </button>
                        <button
                          onClick={() => setCancelConfirm(null)}
                          className="flex-1 bg-white/20 hover:bg-white/30 text-white py-2 rounded-xl text-sm font-bold transition-colors"
                        >
                          Keep it
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setCancelConfirm(nextAppointment.id)}
                        className="w-full bg-white/10 hover:bg-white/20 text-white/90 border border-white/20 py-2 rounded-xl text-sm font-bold transition-colors"
                      >
                        Cancel Appointment
                      </button>
                    )
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-8 text-center">
                <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 mb-2">event_busy</span>
                <p className="font-bold text-slate-500 dark:text-slate-400">No upcoming appointments</p>
                <Link href="/patient/book" className="mt-4 inline-block text-emerald-500 font-bold hover:underline text-sm">
                  Book one now →
                </Link>
              </div>
            )}

            {/* Appointment History */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Recent Appointments</h2>
                <span className="text-xs font-bold text-slate-400">{appointments.length} total</span>
              </div>
              
              {loading ? (
                <div className="space-y-3">
                  {[1,2].map(i => <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />)}
                </div>
              ) : appointments.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">No appointments yet</p>
              ) : (
                <div className="space-y-3">
                  {appointments.slice(0, 4).map((appt) => (
                    <div key={appt.id} className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        appt.status === "completed" ? "bg-emerald-500" :
                        appt.status === "cancelled" ? "bg-red-400" :
                        appt.status === "in-progress" ? "bg-amber-500" :
                        "bg-sky-500"
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {new Date(appt.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} at {appt.time_slot}
                        </p>
                        <p className="text-xs text-slate-500 truncate">Dr. {appt.doctor?.full_name ?? appt.doctor_id?.substring(0, 8) ?? 'Unknown'} • {appt.symptoms ?? "General consultation"}</p>
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 ${
                        appt.status === "completed" ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600" :
                        appt.status === "cancelled" ? "bg-red-100 dark:bg-red-500/20 text-red-600" :
                        appt.status === "in-progress" ? "bg-amber-100 dark:bg-amber-500/20 text-amber-600" :
                        "bg-sky-100 dark:bg-sky-500/20 text-sky-600"
                      }`}>
                        {appt.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
