"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function DoctorDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [appointments, setAppointments] = useState([
    { id: 1, time: "10:00 AM", type: "Routine Checkup", patient: "4 Patients", status: "Completed" },
    { id: 2, time: "10:30 AM", type: "Cardiac Consultation", patient: "Arjun Malhotra", status: "Ongoing", isCurrent: true },
    { id: 3, time: "11:30 AM", type: "Post-Op Review", patient: "2 Patients", status: "Upcoming" },
    { id: 4, time: "02:00 PM", type: "Surgery Block", patient: "No Slots", status: "Fully Booked" },
  ]);
  const [searchTerm, setSearchTerm] = useState("");
  const [availability, setAvailability] = useState(true);
  const [startHour, setStartHour] = useState("9:00 AM");
  const [endHour, setEndHour] = useState("5:00 PM");
  const [updateFeedback, setUpdateFeedback] = useState("Update Hours");

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

  const handleNewAppointment = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const patientName = formData.get("patient-name");
    const timeVal = formData.get("appointment-time");
    const visitType = formData.get("visit-type");

    const [hours, minutes] = timeVal.split(":");
    let h = parseInt(hours);
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12;
    h = h ? h : 12;
    const formattedTime = `${h}:${minutes} ${ampm}`;

    const newAppt = {
      id: Date.now(),
      time: formattedTime,
      type: visitType,
      patient: patientName,
      status: "Upcoming",
    };

    setAppointments([...appointments, newAppt]);
    setIsModalOpen(false);
    e.target.reset();
  };

  const filteredAppointments = appointments.filter((appt) =>
    (appt.patient + appt.type + appt.time).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020817] text-slate-900 dark:text-slate-50 transition-colors duration-300">
      
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
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

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-900/50 flex items-center justify-center text-sky-600 dark:text-sky-400 font-bold border border-sky-200 dark:border-sky-800">
              DR
            </div>
          </div>
        </div>
      </header>

      <main className="p-8 max-w-[1400px] mx-auto">
        {activeTab === "overview" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mb-8 flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white">Welcome back, Dr. Richardson.</h1>
              <p className="font-medium text-slate-500 dark:text-slate-400 mt-1">You have 5 surgeries and 12 consultations today.</p>
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
                <span className="text-xs font-bold text-sky-500">+12%</span>
              </div>
              <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Total Patients Today</span>
              <span className="text-3xl font-black text-slate-900 dark:text-white">24</span>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col hover:border-sky-500/50 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-amber-100 dark:bg-amber-500/20 rounded-lg text-amber-600 dark:text-amber-400">
                  <span className="material-symbols-outlined">timer</span>
                </div>
                <span className="text-xs font-bold text-amber-500">On Track</span>
              </div>
              <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Current Slot</span>
              <span className="text-3xl font-black text-slate-900 dark:text-white">3</span>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col hover:border-sky-500/50 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-500/20 rounded-lg text-purple-600 dark:text-purple-400">
                  <span className="material-symbols-outlined">event_upcoming</span>
                </div>
                <span className="text-xs font-bold text-purple-500">Next 2h</span>
              </div>
              <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Upcoming</span>
              <span className="text-3xl font-black text-slate-900 dark:text-white">5</span>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col hover:border-sky-500/50 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg text-emerald-600 dark:text-emerald-400">
                  <span className="material-symbols-outlined">calendar_today</span>
                </div>
                <span className="text-xs font-bold text-emerald-500">Target 120</span>
              </div>
              <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Weekly Bookings</span>
              <span className="text-3xl font-black text-slate-900 dark:text-white">112</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Today's Schedule</h2>
                  <button className="text-sky-600 dark:text-sky-400 font-bold hover:underline">View All</button>
                </div>
                <div className="space-y-6 relative before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                  {filteredAppointments.map((appt) => (
                    <div key={appt.id} className={`flex gap-6 relative ${appt.status === "Fully Booked" ? "opacity-60" : ""}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 ${
                        appt.status === "Completed" ? "bg-emerald-500 text-white" :
                        appt.isCurrent ? "bg-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.5)]" :
                        appt.status === "Fully Booked" ? "bg-slate-400 dark:bg-slate-600 text-white" :
                        "bg-sky-500 text-white"
                      }`}>
                        <span className="material-symbols-outlined text-[14px]">
                          {appt.status === "Completed" ? "check" :
                           appt.isCurrent ? "play_arrow" :
                           appt.status === "Fully Booked" ? "block" :
                           "schedule"}
                        </span>
                      </div>
                      <div className={`flex-1 p-4 rounded-lg flex ${appt.isCurrent ? "flex-col gap-4" : "items-center justify-between"} border-l-4 ${
                        appt.status === "Completed" ? "bg-slate-50 dark:bg-slate-800/50 border-emerald-500" :
                        appt.isCurrent ? "bg-amber-50 dark:bg-amber-500/10 border-amber-500" :
                        appt.status === "Fully Booked" ? "bg-slate-50 dark:bg-slate-800/50 border-slate-400 dark:border-slate-600" :
                        "bg-sky-50 dark:bg-sky-500/10 border-sky-500"
                      }`}>
                        <div className={appt.isCurrent ? "flex items-center justify-between" : ""}>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{appt.time}</p>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{appt.type} • {appt.patient}</p>
                          </div>
                          {appt.isCurrent && (
                            <span className="px-3 py-1 bg-amber-200 dark:bg-amber-500/30 text-amber-800 dark:text-amber-200 rounded-full text-xs font-bold uppercase tracking-wider">Ongoing</span>
                          )}
                        </div>
                        {!appt.isCurrent && (
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            appt.status === "Completed" ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400" :
                            appt.status === "Fully Booked" ? "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300" :
                            "bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-400"
                          }`}>
                            {appt.status}
                          </span>
                        )}
                        {appt.isCurrent && (
                          <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-amber-200 dark:border-amber-500/30">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-600 dark:text-slate-400">
                                  AM
                                </div>
                                <div>
                                  <p className="font-bold text-slate-900 dark:text-white">Arjun Malhotra</p>
                                  <p className="text-xs text-slate-500 dark:text-slate-400">Age: 28 • Male</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-xs font-bold text-red-500">Hypertension</p>
                                <div className="flex items-center gap-1 text-emerald-500 mt-1">
                                  <span className="material-symbols-outlined text-[14px]">verified</span>
                                  <span className="text-xs font-bold">Checked In</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
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
                <div className="mt-6 flex justify-between items-center text-xs font-bold">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-sky-500"></div>
                    <span className="text-slate-500 dark:text-slate-400">Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                    <span className="text-slate-500 dark:text-slate-400">Filling Up</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                    <span className="text-slate-500 dark:text-slate-400">Full</span>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
        )}

        {/* Schedule Tab */}
        {activeTab === "schedule" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8 flex justify-between items-center">
              <h1 className="text-3xl font-black text-slate-900 dark:text-white">Weekly Schedule</h1>
              <div className="flex bg-white dark:bg-slate-900 rounded-lg p-1 border border-slate-200 dark:border-slate-800">
                <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-md text-sm font-bold shadow-sm">Week</button>
                <button className="px-4 py-2 text-slate-500 text-sm font-bold hover:text-slate-900 dark:hover:text-white">Month</button>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden min-h-[600px] flex items-center justify-center">
              <div className="text-center">
                <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-700 mb-4">calendar_month</span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Calendar View</h3>
                <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto">This UI component will render the full drag-and-drop calendar once we connect the database.</p>
              </div>
            </div>
          </div>
        )}

        {/* Patients Tab */}
        {activeTab === "patients" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8 flex justify-between items-center">
              <h1 className="text-3xl font-black text-slate-900 dark:text-white">My Patients</h1>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                <input type="text" placeholder="Search patients..." className="pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium w-[300px] outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500" />
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Patient Name</th>
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Last Visit</th>
                    <th className="px-6 py-4">Condition</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {[
                    { name: "Arjun Malhotra", id: "PT-94028", visit: "Today, 10:30 AM", cond: "Hypertension", color: "red" },
                    { name: "Sarah Jenkins", id: "PT-83921", visit: "Oct 12, 2023", cond: "Routine Checkup", color: "emerald" },
                    { name: "Michael Chang", id: "PT-10294", visit: "Sep 28, 2023", cond: "Post-Op Review", color: "amber" },
                  ].map((p, i) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-600 dark:text-slate-400 text-xs">
                            {p.name.split(' ').map(n=>n[0]).join('')}
                          </div>
                          <span className="font-bold text-slate-900 dark:text-white">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-500">{p.id}</td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-500">{p.visit}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-bold bg-${p.color}-100 dark:bg-${p.color}-500/20 text-${p.color}-600 dark:text-${p.color}-400`}>{p.cond}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-sky-500 hover:text-sky-600 font-bold text-sm">View Profile</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
