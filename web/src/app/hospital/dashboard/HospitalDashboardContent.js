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
  const [doctorsList, setDoctorsList] = useState([]);
  const [loadingDoctorsList, setLoadingDoctorsList] = useState(false);
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  const [appointments, setAppointments] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [addDoctorLoading, setAddDoctorLoading] = useState(false);
  const [addDoctorError, setAddDoctorError] = useState("");
  const [addDoctorSuccess, setAddDoctorSuccess] = useState(false);
  const [newDoctor, setNewDoctor] = useState({
    name: "", email: "", phone: "", password: "", specialization: "", experience: "", hospitalName: "", licenseNumber: ""
  });

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

  const fetchAppointments = useCallback(async () => {
    setLoadingAppointments(true);
    try {
      const res = await fetch("/api/admin/appointments");
      if (res.ok) {
        const data = await res.json();
        setAppointments(data.appointments || []);
        setTokens(data.tokens || []);
      }
    } catch (e) {
      console.error("Failed to fetch appointments:", e);
    } finally {
      setLoadingAppointments(false);
    }
  }, []);

  const fetchDoctorsList = useCallback(async () => {
    setLoadingDoctorsList(true);
    try {
      const res = await fetch(`/api/admin/doctors/availability?day=${selectedDay}&t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        setDoctorsList(data.doctors || []);
        // Update localUnverified to keep the badge accurate
        setLocalUnverified((data.doctors || []).filter(d => !d.is_verified));
      }
    } catch (e) {
      console.error("Failed to fetch doctors list:", e);
    } finally {
      setLoadingDoctorsList(false);
    }
  }, [selectedDay]);

  useEffect(() => { 
    fetchStats();
    if (activeTab === "appointments") fetchAppointments();
  }, [fetchStats, activeTab, fetchAppointments]);

  // Refresh doctors list when doctors tab becomes active
  useEffect(() => {
    if (activeTab === "doctors") {
      fetchDoctorsList();
    }
  }, [activeTab, fetchDoctorsList]);

  // Auto-refresh appointments when admin is viewing the appointments tab
  useEffect(() => {
    if (activeTab !== "appointments") return;
    const interval = setInterval(fetchAppointments, 10000);
    return () => clearInterval(interval);
  }, [activeTab, fetchAppointments]);

  const handleUpdateAvailability = async (doctorId, isActive, maxPatients) => {
    try {
      const res = await fetch("/api/admin/doctors/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctorId, isActive, maxPatients, day: selectedDay })
      });
      if (res.ok) {
        // Refresh doctors
        fetchDoctorsList();
      } else {
        alert("Failed to update availability.");
      }
    } catch (e) {
      console.error(e);
      alert("Error updating availability.");
    }
  };

  const handleVerify = async (id) => {
    const res = await verifyDoctor(id);
    if (res.success) {
      setLocalUnverified(prev => prev.filter(d => d.id !== id));
      fetchStats(); // Refresh stats after verification
      if (activeTab === "doctors") fetchDoctorsList();
    } else {
      alert(res.error || "Failed to verify doctor");
    }
  };

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    setAddDoctorLoading(true);
    setAddDoctorError("");
    setAddDoctorSuccess(false);

    try {
      const res = await fetch("/api/admin/add-doctor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDoctor)
      });
      const data = await res.json();
      if (res.ok) {
        setAddDoctorSuccess(true);
        setNewDoctor({ name: "", email: "", phone: "", password: "", specialization: "", experience: "", hospitalName: "", licenseNumber: "" });
        fetchStats();
      } else {
        setAddDoctorError(data.error || "Failed to add doctor");
      }
    } catch (err) {
      setAddDoctorError("An unexpected error occurred.");
    } finally {
      setAddDoctorLoading(false);
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
            <button onClick={() => setActiveTab("doctors")} className={`h-full px-4 border-b-2 font-bold text-sm transition-colors ${activeTab === "doctors" ? "border-indigo-500 text-indigo-600 dark:text-indigo-400" : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"}`}>Doctors {localUnverified.length > 0 && <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white rounded-full text-[10px]">{localUnverified.length}</span>}</button>
            <button onClick={() => setActiveTab("appointments")} className={`h-full px-4 border-b-2 font-bold text-sm transition-colors ${activeTab === "appointments" ? "border-indigo-500 text-indigo-600 dark:text-indigo-400" : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"}`}>Appointments</button>
            <button onClick={() => setActiveTab("add_doctor")} className={`h-full px-4 border-b-2 font-bold text-sm transition-colors ${activeTab === "add_doctor" ? "border-indigo-500 text-indigo-600 dark:text-indigo-400" : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"}`}>Add Doctor</button>
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
              {
                [
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
                      <div className={`p-3 rounded-xl ${m.color === 'blue' ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' : m.color === 'emerald' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' : m.color === 'purple' ? 'bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400' : 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400'}`}>
                        <span className="material-symbols-outlined">{m.icon}</span>
                      </div>
                    </div>
                    <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">{m.label}</h3>
                    <p className="text-3xl font-black text-slate-900 dark:text-white">
                      {m.val}{m.sub && <span className="text-lg font-bold text-slate-400 dark:text-slate-500 ml-1">{m.sub}</span>}
                    </p>
                  </div>
                ))
              }
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm mb-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Pending Doctor Registrations</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Review newly registered doctors before approving them for scheduling.</p>
                </div>
                <button
                  onClick={() => setActiveTab("doctors")}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-xl shadow-sm hover:bg-indigo-600 transition-colors"
                >
                  Review Doctors
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>

              {localUnverified.length > 0 ? (
                <div className="grid gap-4">
                  {localUnverified.slice(0, 3).map((doc) => (
                    <div key={doc.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-950/60">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{doc.profiles?.full_name || 'Unnamed Doctor'}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{doc.profiles?.phone || 'No phone provided'}</p>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {doc.specialization ? `${doc.specialization} • ${doc.experience_years} yrs` : 'Doctor profile pending details'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">No pending doctor registration requests at the moment.</p>
              )}
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
                    onClick={() => setActiveTab("doctors")}
                    className="w-full flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-500/10 hover:bg-purple-100 dark:hover:bg-purple-500/20 border border-purple-200 dark:border-purple-500/20 rounded-xl transition-colors text-left"
                  >
                    <span className="material-symbols-outlined text-purple-500">verified_user</span>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white text-sm">Manage Doctors</p>
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

        {activeTab === "doctors" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white">Doctor Management</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Review registrations, set availability, and control patient limits.</p>
              </div>
              
              <div className="flex items-center gap-4">
                <button 
                  onClick={fetchDoctorsList}
                  disabled={loadingDoctorsList}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-bold text-sm transition-all disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[16px]">refresh</span>
                  {loadingDoctorsList ? "Refreshing..." : "Refresh"}
                </button>
                
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day, idx) => (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(idx)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                        selectedDay === idx 
                          ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm" 
                          : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Doctor Details</th>
                    <th className="px-6 py-4">Specialization</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-center">Available on {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][selectedDay]}</th>
                    <th className="px-6 py-4 text-center">Max Patients</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {loadingDoctorsList ? (
                     <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-500">Loading doctors...</td></tr>
                  ) : doctorsList.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-slate-500 font-medium">
                        No doctors registered.
                      </td>
                    </tr>
                  ) : (
                    doctorsList.map((doc) => {
                      const avail = doc.day_availability || { is_active: false, max_patients_per_day: 20 };
                      
                      return (
                        <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs uppercase">
                                {doc.profiles?.full_name?.substring(0, 2)}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-900 dark:text-white">{doc.profiles?.full_name}</span>
                                <span className="text-xs text-slate-500">{doc.profiles?.phone}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{doc.specialization}</span>
                            <div className="text-xs text-slate-400">{doc.experience_years} yrs exp</div>
                          </td>
                          <td className="px-6 py-4">
                            {doc.is_verified ? (
                              <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-full text-xs font-bold">
                                <span className="material-symbols-outlined text-[14px]">check_circle</span> Verified
                              </span>
                            ) : (
                              <button 
                                onClick={() => handleVerify(doc.id)}
                                className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95"
                              >
                                Verify Now
                              </button>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {doc.is_verified ? (
                              <button
                                onClick={() => handleUpdateAvailability(doc.id, !avail.is_active, avail.max_patients_per_day)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${avail.is_active ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                              >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${avail.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                              </button>
                            ) : (
                              <span className="text-slate-400 text-xs">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {doc.is_verified ? (
                              <div className="flex items-center justify-center gap-2">
                                <input
                                  type="number"
                                  min="1"
                                  className="w-16 h-8 text-center bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-bold outline-none focus:border-indigo-500"
                                  defaultValue={avail.max_patients_per_day}
                                  onBlur={(e) => {
                                    const val = parseInt(e.target.value);
                                    if (val && val !== avail.max_patients_per_day) {
                                      handleUpdateAvailability(doc.id, avail.is_active, val);
                                    }
                                  }}
                                />
                              </div>
                            ) : (
                              <span className="text-slate-400 text-xs">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {activeTab === "appointments" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8 flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white">Hospital Appointments</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Live view of all bookings across all doctors.</p>
              </div>
              <button onClick={fetchAppointments} className="flex items-center gap-1 text-sm font-bold text-indigo-500 hover:underline">
                <span className="material-symbols-outlined text-[16px]">refresh</span>Refresh
              </button>
            </div>
            
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Time Slot</th>
                    <th className="px-6 py-4">Patient</th>
                    <th className="px-6 py-4">Doctor & Dept</th>
                    <th className="px-6 py-4">Token / Queue</th>
                    <th className="px-6 py-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {loadingAppointments ? (
                    <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-500">Loading appointments...</td></tr>
                  ) : appointments.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-slate-500 font-medium">
                        No appointments found for today.
                      </td>
                    </tr>
                  ) : (
                    appointments.map((appt) => {
                      const token = tokens.find(t => t.appointment_id === appt.id);
                      return (
                        <tr key={appt.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                            {appt.time_slot}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-900 dark:text-white">{appt.patient?.full_name}</span>
                              <span className="text-xs text-slate-500">{appt.patient?.phone}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-indigo-600 dark:text-indigo-400">{appt.doctor?.full_name}</span>
                              <span className="text-xs font-medium text-slate-500">{appt.doctor_details?.specialization}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {token ? (
                              <div className="flex flex-col">
                                <span className="font-black text-slate-900 dark:text-white">{token.token_number}</span>
                                {token.status === 'waiting' && <span className="text-xs font-medium text-amber-500">Pos: #{token.queue_position}</span>}
                              </div>
                            ) : (
                              <span className="text-slate-400 text-sm">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              appt.status === 'completed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400' :
                              appt.status === 'in-progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400' :
                              appt.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400' :
                              'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400'
                            }`}>
                              {appt.status.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "add_doctor" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-black text-slate-900 dark:text-white">Add New Doctor</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">Directly onboard a doctor to the hospital system. They will be auto-verified.</p>
            </div>
            
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-8">
              {addDoctorSuccess && (
                <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-xl flex items-center gap-3">
                  <span className="material-symbols-outlined">check_circle</span>
                  <span className="font-bold">Doctor added successfully! They can now log in.</span>
                </div>
              )}
              {addDoctorError && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 rounded-xl flex items-center gap-3">
                  <span className="material-symbols-outlined">error</span>
                  <span className="font-bold">{addDoctorError}</span>
                </div>
              )}

              <form onSubmit={handleAddDoctor} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Full Name (with Title)</label>
                    <input required type="text" value={newDoctor.name} onChange={e => setNewDoctor({...newDoctor, name: e.target.value})} className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" placeholder="Dr. John Doe" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                    <input required type="email" value={newDoctor.email} onChange={e => setNewDoctor({...newDoctor, email: e.target.value})} className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" placeholder="doctor@hospital.com" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Contact Number</label>
                    <input required type="tel" value={newDoctor.phone} onChange={e => setNewDoctor({...newDoctor, phone: e.target.value})} className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" placeholder="9876543210" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Temporary Password</label>
                    <input required type="password" value={newDoctor.password} onChange={e => setNewDoctor({...newDoctor, password: e.target.value})} className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" placeholder="••••••••" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Specialization</label>
                    <select required value={newDoctor.specialization} onChange={e => setNewDoctor({...newDoctor, specialization: e.target.value})} className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20">
                      <option value="" disabled>Select Field</option>
                      <option value="Cardiology">Cardiology</option>
                      <option value="Neurology">Neurology</option>
                      <option value="Pediatrics">Pediatrics</option>
                      <option value="Orthopedics">Orthopedics</option>
                      <option value="General Practice">General Practice</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Experience (Years)</label>
                    <input required type="number" min="0" value={newDoctor.experience} onChange={e => setNewDoctor({...newDoctor, experience: e.target.value})} className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" placeholder="5" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Hospital Name</label>
                    <input required type="text" value={newDoctor.hospitalName} onChange={e => setNewDoctor({...newDoctor, hospitalName: e.target.value})} className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" placeholder="City Hospital" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">License Number</label>
                    <input required type="text" value={newDoctor.licenseNumber} onChange={e => setNewDoctor({...newDoctor, licenseNumber: e.target.value})} className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" placeholder="LIC-12345" />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={addDoctorLoading}
                  className="w-full h-14 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {addDoctorLoading ? (
                    <><span className="material-symbols-outlined animate-spin">progress_activity</span> Adding Doctor...</>
                  ) : (
                    <><span className="material-symbols-outlined">person_add</span> Add Doctor</>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
