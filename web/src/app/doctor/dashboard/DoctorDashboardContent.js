"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";
import { signOut } from "@/app/actions/auth";

export default function DoctorDashboardContent({ profile, roleData }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [loadingQueue, setLoadingQueue] = useState(true);
  const [queueSummary, setQueueSummary] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [availability, setAvailability] = useState(true);
  const [startHour, setStartHour] = useState("9:00 AM");
  const [endHour, setEndHour] = useState("5:00 PM");
  const [updateFeedback, setUpdateFeedback] = useState("Update Hours");
  const [activeTab, setActiveTab] = useState("overview");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchQueue = useCallback(async () => {
    if (!profile?.id) return;
    setLoadingQueue(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const res = await fetch(`/api/appointments/doctor/${profile.id}?date=${today}`);
      if (res.ok) {
        const json = await res.json();
        setAppointments(json.appointments ?? []);
        setQueueSummary(json.summary ?? null);
      }
    } catch (e) {
      console.error("Failed to fetch queue:", e);
    } finally {
      setLoadingQueue(false);
    }
  }, [profile?.id]);

  useEffect(() => { fetchQueue(); }, [fetchQueue]);

  useEffect(() => {
    const savedStart = localStorage.getItem("doctorStartHour");
    const savedEnd = localStorage.getItem("doctorEndHour");
    if (savedStart) setStartHour(savedStart);
    if (savedEnd) setEndHour(savedEnd);
  }, []);

  const handleUpdateHours = () => {
    localStorage.setItem("doctorStartHour", startHour);
    localStorage.setItem("doctorEndHour", endHour);
    setUpdateFeedback("Updated!");
    setTimeout(() => setUpdateFeedback("Update Hours"), 2000);
  };

  const handleNewAppointment = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const patientName = formData.get("patient-name");
    const timeSlot = formData.get("appointment-time");
    const visitType = formData.get("visit-type");

    try {
      // For simplicity in this mock-to-real transition, we'll use a dummy patient ID 
      // or look up the patient. But for now, we'll just show it's wired.
      const res = await fetch("/api/appointments/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: profile.id,
          patientId: profile.id, // In a real app, this would be a selected patient ID
          date: new Date().toISOString().split("T")[0],
          timeSlot: timeSlot,
          symptoms: `Visit Type: ${visitType} (Booked by Doctor)`,
        }),
      });
      if (res.ok) {
        setIsModalOpen(false);
        await fetchQueue();
        e.target.reset();
      }
    } catch (e) {
      console.error("Booking failed:", e);
    }
  };

  const handleStatusUpdate = async (apptId, nextStatus) => {
    setUpdatingId(apptId);
    try {
      const res = await fetch(`/api/appointments/${apptId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) await fetchQueue();
    } catch (e) {
      console.error("Status update failed:", e);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredAppointments = appointments.filter((appt) =>
    (appt.patientName + appt.time_slot + (appt.symptoms ?? "")).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const PRIORITY_BADGE = {
    1: { label: "🚨 Emergency", cls: "bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400" },
    2: { label: "🤰 Pregnant", cls: "bg-pink-100 dark:bg-pink-500/20 text-pink-600 dark:text-pink-400" },
    3: { label: "👴 Senior", cls: "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400" },
    4: { label: "Regular", cls: "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300" },
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020817] text-slate-900 dark:text-slate-50 transition-colors duration-300">
      
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 min-h-[4rem] py-2 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 notranslate">
            <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>stethoscope</span>
            </div>
            <span className="font-black text-xl tracking-tight text-slate-900 dark:text-white">HealthSync Provider</span>
          </div>

          <div className="hidden md:flex items-center gap-6 absolute left-1/2 -translate-x-1/2 h-full">
            <button onClick={() => setActiveTab("overview")} className={`h-full px-4 border-b-2 font-bold text-sm transition-colors ${activeTab === "overview" ? "border-sky-500 text-sky-600 dark:text-sky-400" : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"}`}>Overview</button>
            <button onClick={() => setActiveTab("schedule")} className={`h-full px-4 border-b-2 font-bold text-sm transition-colors ${activeTab === "schedule" ? "border-sky-500 text-sky-600 dark:text-sky-400" : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"}`}>Schedule</button>
            <button onClick={() => setActiveTab("patients")} className={`h-full px-4 border-b-2 font-bold text-sm transition-colors ${activeTab === "patients" ? "border-sky-500 text-sky-600 dark:text-sky-400" : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"}`}>Patients</button>
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
              <div className="w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-900/50 flex items-center justify-center text-sky-600 dark:text-sky-400 font-bold border border-sky-200 dark:border-sky-800 uppercase">
                {profile?.full_name?.substring(0, 2) || 'DR'}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="p-8 max-w-[1400px] mx-auto">
        {activeTab === "overview" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mb-8 flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white">Welcome back, Dr. {profile?.full_name?.split(' ')[0]}.</h1>
              <p className="font-medium text-slate-500 dark:text-slate-400 mt-1">
                {roleData?.specialization} • {roleData?.hospital_name}
              </p>
            </div>
            <button onClick={() => setIsModalOpen(true)} className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-3 rounded-xl font-bold transition-colors flex items-center gap-2 shadow-sm">
              <span className="material-symbols-outlined text-[20px]">add</span>
              New Appointment
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col hover:border-sky-500/50 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-sky-100 dark:bg-sky-500/20 rounded-lg text-sky-600 dark:text-sky-400">
                  <span className="material-symbols-outlined">group</span>
                </div>
              </div>
              <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Total Today</span>
              <span className="text-3xl font-black text-slate-900 dark:text-white">{queueSummary?.total ?? "—"}</span>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col hover:border-sky-500/50 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-amber-100 dark:bg-amber-500/20 rounded-lg text-amber-600 dark:text-amber-400">
                  <span className="material-symbols-outlined">timer</span>
                </div>
              </div>
              <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Waiting</span>
              <span className="text-3xl font-black text-slate-900 dark:text-white">{queueSummary?.waiting ?? "—"}</span>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col hover:border-sky-500/50 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg text-emerald-600 dark:text-emerald-400">
                  <span className="material-symbols-outlined">check_circle</span>
                </div>
              </div>
              <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Completed</span>
              <span className="text-3xl font-black text-slate-900 dark:text-white">{queueSummary?.completed ?? "—"}</span>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col hover:border-sky-500/50 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-red-100 dark:bg-red-500/20 rounded-lg text-red-600 dark:text-red-400">
                  <span className="material-symbols-outlined">emergency</span>
                </div>
              </div>
              <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Emergencies</span>
              <span className="text-3xl font-black text-slate-900 dark:text-white">{queueSummary?.emergencies ?? "—"}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Today's Queue</h2>
                  <button onClick={fetchQueue} className="text-sky-600 dark:text-sky-400 font-bold hover:underline text-sm flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">refresh</span>Refresh
                  </button>
                </div>

                {loadingQueue ? (
                  <div className="space-y-4">
                    {[1,2,3].map(i => <div key={i} className="h-20 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />)}
                  </div>
                ) : filteredAppointments.length === 0 ? (
                  <div className="text-center py-12">
                    <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600">event_busy</span>
                    <p className="text-slate-500 mt-2 font-medium">No appointments today</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredAppointments.map((appt, idx) => {
                      const badge = PRIORITY_BADGE[appt.priority] ?? PRIORITY_BADGE[4];
                      const isInProgress = appt.tokenStatus === "in-progress";
                      const isWaiting = appt.tokenStatus === "waiting";
                      const isDone = appt.status === "completed";
                      return (
                        <div key={appt.id} className={`rounded-xl border-l-4 p-4 flex flex-col sm:flex-row sm:items-center gap-4 transition-colors ${
                          isInProgress ? "bg-amber-50 dark:bg-amber-500/10 border-amber-500" :
                          isDone ? "bg-slate-50 dark:bg-slate-800/50 border-emerald-500 opacity-70" :
                          "bg-white dark:bg-slate-900 border-sky-500"
                        }`}>
                          {/* Position + Token */}
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm ${
                              isInProgress ? "bg-amber-500 text-white" :
                              isDone ? "bg-emerald-500 text-white" :
                              "bg-sky-500 text-white"
                            }`}>{idx + 1}</div>
                            <div>
                              <p className="font-mono text-xs font-bold text-slate-500">{appt.tokenNumber ?? "—"}</p>
                              <p className="text-xs text-slate-400">{appt.time_slot}</p>
                            </div>
                          </div>

                          {/* Patient info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-bold text-slate-900 dark:text-white">{appt.patientName}</p>
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badge.cls}`}>{badge.label}</span>
                              {isInProgress && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-500/30 text-amber-800 dark:text-amber-200">● In Progress</span>}
                            </div>
                            <p className="text-sm text-slate-500 truncate">
                              {appt.patientAge ? `Age: ${appt.patientAge}` : ""}{appt.patientGender ? ` • ${appt.patientGender}` : ""}
                              {appt.symptoms ? ` • ${appt.symptoms}` : ""}
                            </p>
                            {appt.estimatedWaitTime != null && isWaiting && (
                              <p className="text-xs text-sky-500 font-bold mt-1">~{appt.estimatedWaitTime} min wait</p>
                            )}
                          </div>

                          {/* Action button */}
                          <div className="flex-shrink-0">
                            {isDone ? (
                              <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[16px]">check_circle</span>Done
                              </span>
                            ) : isInProgress ? (
                              <button
                                onClick={() => handleStatusUpdate(appt.id, "completed")}
                                disabled={updatingId === appt.id}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all active:scale-95 disabled:opacity-50"
                              >
                                {updatingId === appt.id ? "..." : "Mark Done"}
                              </button>
                            ) : isWaiting ? (
                              <button
                                onClick={() => handleStatusUpdate(appt.id, "in-progress")}
                                disabled={updatingId === appt.id || queueSummary?.inProgress > 0}
                                className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                title={queueSummary?.inProgress > 0 ? "Finish current patient first" : "Call this patient"}
                              >
                                {updatingId === appt.id ? "..." : "Call In"}
                              </button>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>

            <div className="space-y-8">
              <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Slot Management</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">Available for Consultation</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Accepting new patients</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={availability}
                        onChange={(e) => setAvailability(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Working Hours</label>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 relative">
                          <input
                            className="w-full h-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 font-medium focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none"
                            type="text"
                            value={startHour}
                            onChange={(e) => setStartHour(e.target.value)}
                          />
                        </div>
                        <span className="text-slate-500 dark:text-slate-400 font-bold">to</span>
                        <div className="flex-1 relative">
                          <input
                            className="w-full h-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 font-medium focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none"
                            type="text"
                            value={endHour}
                            onChange={(e) => setEndHour(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleUpdateHours}
                      className="w-full border-2 border-sky-500 text-sky-600 dark:text-sky-400 py-3 rounded-xl font-bold hover:bg-sky-50 dark:hover:bg-sky-500/10 transition-colors"
                    >
                      {updateFeedback}
                    </button>
                  </div>
                </div>
              </section>

              <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Patient Load (Next 7 Days)</h3>
                <div className="flex justify-between items-end h-32 gap-2">
                  {[60, 85, 100, 75, 40, 15, 5].map((h, i) => (
                    <div key={i} className="flex flex-col items-center flex-1 gap-2 group">
                      <div className={`w-full rounded-sm transition-all group-hover:opacity-80 ${h === 100 ? "bg-red-500" : h >= 75 ? "bg-amber-400" : "bg-sky-500"}`} style={{ height: `${h}%` }}></div>
                      <span className={`text-xs font-bold text-slate-500 dark:text-slate-400 ${h === 100 ? "text-red-500" : ""}`}>{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
        )}

        {/* Schedule Tab */}
        {activeTab === "schedule" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white">Schedule</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">View and manage appointments by date</p>
              </div>
              <input
                type="date"
                defaultValue={new Date().toISOString().split('T')[0]}
                onChange={async (e) => {
                  setLoadingQueue(true);
                  try {
                    const res = await fetch(`/api/appointments/doctor/${profile?.id}?date=${e.target.value}`);
                    if (res.ok) {
                      const json = await res.json();
                      setAppointments(json.appointments ?? []);
                      setQueueSummary(json.summary ?? null);
                    }
                  } catch (err) { console.error(err); }
                  finally { setLoadingQueue(false); }
                }}
                className="h-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 font-medium focus:border-sky-500 outline-none text-slate-900 dark:text-white"
              />
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total', value: queueSummary?.total ?? '—', color: 'sky' },
                { label: 'Waiting', value: queueSummary?.waiting ?? '—', color: 'amber' },
                { label: 'Completed', value: queueSummary?.completed ?? '—', color: 'emerald' },
                { label: 'Emergencies', value: queueSummary?.emergencies ?? '—', color: 'red' },
              ].map(({ label, value, color }) => (
                <div key={label} className={`bg-${color}-50 dark:bg-${color}-500/10 border border-${color}-100 dark:border-${color}-500/20 rounded-2xl p-5`}>
                  <p className={`text-xs font-bold text-${color}-500 uppercase tracking-wider mb-1`}>{label}</p>
                  <p className={`text-3xl font-black text-${color}-700 dark:text-${color}-400`}>{value}</p>
                </div>
              ))}
            </div>

            {/* Appointment list for selected date */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
              {loadingQueue ? (
                <div className="p-8 space-y-4">
                  {[1,2,3].map(i => <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />)}
                </div>
              ) : appointments.length === 0 ? (
                <div className="text-center py-16">
                  <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600">event_busy</span>
                  <p className="text-slate-500 mt-3 font-medium">No appointments on this date</p>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Token</th>
                      <th className="px-6 py-4">Patient</th>
                      <th className="px-6 py-4">Time</th>
                      <th className="px-6 py-4">Priority</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {appointments.map((appt) => {
                      const badge = PRIORITY_BADGE[appt.priority] ?? PRIORITY_BADGE[4];
                      return (
                        <tr key={appt.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="px-6 py-4 font-mono text-sm font-bold text-slate-600 dark:text-slate-400">{appt.tokenNumber ?? '—'}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-800 flex items-center justify-center font-bold text-sky-600 dark:text-sky-400 text-xs">
                                {(appt.patientName ?? '??').split(' ').map(n => n[0]).join('').substring(0,2)}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 dark:text-white">{appt.patientName ?? 'Unknown'}</p>
                                {appt.patientAge && <p className="text-xs text-slate-400">Age: {appt.patientAge} • {appt.patientGender}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-slate-500">{appt.time_slot}</td>
                          <td className="px-6 py-4">
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${badge.cls}`}>{badge.label}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                              appt.status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' :
                              appt.status === 'cancelled' ? 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400' :
                              appt.status === 'in-progress' ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400' :
                              'bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-400'
                            }`}>{appt.status}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Patients Tab — derived from all appointments this doctor has had */}
        {activeTab === "patients" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8 flex justify-between items-center">
              <h1 className="text-3xl font-black text-slate-900 dark:text-white">Today's Patients</h1>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search patients..."
                  className="pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium w-[300px] outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
              {loadingQueue ? (
                <div className="p-8 space-y-4">
                  {[1,2,3].map(i => <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />)}
                </div>
              ) : filteredAppointments.length === 0 ? (
                <div className="text-center py-16">
                  <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600">person_search</span>
                  <p className="text-slate-500 mt-3 font-medium">No patients found</p>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4">#</th>
                      <th className="px-6 py-4">Patient</th>
                      <th className="px-6 py-4">Time Slot</th>
                      <th className="px-6 py-4">Priority</th>
                      <th className="px-6 py-4">Symptoms</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredAppointments.map((appt, idx) => {
                      const badge = PRIORITY_BADGE[appt.priority] ?? PRIORITY_BADGE[4];
                      return (
                        <tr key={appt.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="px-6 py-4 text-slate-400 font-bold text-sm">{idx + 1}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-sky-100 dark:bg-sky-800 flex items-center justify-center font-bold text-sky-600 dark:text-sky-400 text-xs flex-shrink-0">
                                {(appt.patientName ?? '??').split(' ').map(n => n[0]).join('').substring(0,2)}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 dark:text-white">{appt.patientName ?? 'Unknown'}</p>
                                {appt.patientAge && (
                                  <p className="text-xs text-slate-400">Age {appt.patientAge} • {appt.patientGender} • {appt.patientBloodGroup}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-slate-500">{appt.time_slot}</td>
                          <td className="px-6 py-4">
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${badge.cls}`}>{badge.label}</span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500 max-w-[180px] truncate">{appt.symptoms ?? '—'}</td>
                          <td className="px-6 py-4">
                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                              appt.status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' :
                              appt.status === 'in-progress' ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400' :
                              'bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-400'
                            }`}>{appt.status}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </main>

      {/* New Appointment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-2xl text-slate-900 dark:text-white">New Appointment</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleNewAppointment} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Patient Name</label>
                <input name="patient-name" type="text" required className="w-full h-12 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 outline-none text-slate-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Time</label>
                <input name="appointment-time" type="time" required className="w-full h-12 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 outline-none text-slate-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Type of Visit</label>
                <select name="visit-type" required className="w-full h-12 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 outline-none text-slate-900 dark:text-white appearance-none">
                  <option value="Routine Checkup">Routine Checkup</option>
                  <option value="Consultation">Consultation</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Surgery">Surgery</option>
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-300 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 bg-sky-500 hover:bg-sky-600 text-white py-3 px-4 rounded-xl font-bold shadow-lg shadow-sky-500/30 active:scale-[0.98] transition-all">Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
