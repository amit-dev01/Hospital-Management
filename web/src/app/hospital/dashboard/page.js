"use client";

import { useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function HospitalDashboard() {
  const [searchTerm, setSearchTerm] = useState("");

  const doctors = [
    { name: "Dr. James Aris", initial: "JA", spec: "Cardiology", status: "Available", load: 40, loadText: "Normal", loadColor: "emerald" },
    { name: "Dr. Linda May", initial: "LM", spec: "Neurology", status: "In Surgery", load: 85, loadText: "Busy", loadColor: "amber" },
    { name: "Dr. Robert Wong", initial: "RW", spec: "ER Staff", status: "On Call", load: 95, loadText: "Overloaded", loadColor: "red" },
  ];

  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020817] text-slate-900 dark:text-slate-50 transition-colors duration-300">
      
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>domain</span>
            </div>
            <span className="font-black text-xl tracking-tight text-slate-900 dark:text-white">HealthSync Admin</span>
          </div>

          <div className="hidden md:flex items-center gap-6 absolute left-1/2 -translate-x-1/2 h-full">
            <button onClick={() => setActiveTab("overview")} className={`h-full px-4 border-b-2 font-bold text-sm transition-colors ${activeTab === "overview" ? "border-indigo-500 text-indigo-600 dark:text-indigo-400" : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"}`}>Overview</button>
            <button onClick={() => setActiveTab("queue")} className={`h-full px-4 border-b-2 font-bold text-sm transition-colors ${activeTab === "queue" ? "border-indigo-500 text-indigo-600 dark:text-indigo-400" : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"}`}>Live Queue</button>
            <button onClick={() => setActiveTab("staff")} className={`h-full px-4 border-b-2 font-bold text-sm transition-colors ${activeTab === "staff" ? "border-indigo-500 text-indigo-600 dark:text-indigo-400" : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"}`}>Staff Directory</button>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-200 dark:border-indigo-800">
              AD
            </div>
          </div>
        </div>
      </header>

      <main className="p-8 max-w-[1400px] mx-auto w-full">
        {activeTab === "overview" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mb-8">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">Hospital Operations Overview</h1>
            <p className="font-medium text-slate-500 dark:text-slate-400 mt-1">Live metrics and staff management for City General.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { label: "Total Patients Today", val: "1,284", icon: "person", color: "blue", trend: "+12%" },
              { label: "Doctors Available", val: "42", sub: "/56", icon: "medical_services", color: "emerald", trend: "Live" },
              { label: "Appointments Booked", val: "312", icon: "calendar_month", color: "purple", trend: "+8%" },
              { label: "Avg Waiting Time", val: "18", sub: "min", icon: "schedule", color: "amber", trend: "+4m" },
            ].map((m) => (
              <div key={m.label} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-500/50 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 bg-${m.color}-100 dark:bg-${m.color}-500/20 rounded-xl text-${m.color}-600 dark:text-${m.color}-400`}>
                    <span className="material-symbols-outlined">{m.icon}</span>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 ${m.trend.includes("+") ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"} rounded-lg flex items-center gap-1`}>
                    {m.trend.includes("+") && <span className="material-symbols-outlined text-xs">trending_up</span>}
                    {m.trend}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">{m.label}</h3>
                <p className="text-3xl font-black text-slate-900 dark:text-white">{m.val}{m.sub && <span className="text-lg font-bold text-slate-400 dark:text-slate-500 ml-1">{m.sub}</span>}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 lg:col-span-8 space-y-8">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Patient Flow Analytics</h2>
                  <div className="flex gap-2">
                    <button className="px-4 py-1.5 text-xs font-bold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">Day</button>
                    <button className="px-4 py-1.5 text-xs font-bold rounded-lg bg-indigo-500 text-white">Week</button>
                  </div>
                </div>
                <div className="h-64 flex items-end justify-between gap-2 px-4">
                  {[40, 65, 85, 55, 92, 30, 20].map((h, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 flex-1 group">
                      <div className="w-full bg-indigo-400/50 dark:bg-indigo-500/50 rounded-t-lg transition-all group-hover:bg-indigo-500" style={{ height: `${h}%` }}></div>
                      <span className="text-xs text-slate-400 dark:text-slate-500 font-bold">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Doctor Availability & Load</h2>
                  <button className="text-indigo-600 dark:text-indigo-400 font-bold text-sm hover:underline">View Full Staff</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-4">Name</th>
                        <th className="px-6 py-4">Specialization</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Load Indicator</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {doctors.map((doc) => (
                        <tr key={doc.name} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="px-6 py-4 flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                              doc.initial === "JA" ? "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400" :
                              doc.initial === "LM" ? "bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400" :
                              "bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400"
                            }`}>{doc.initial}</div>
                            <span className="font-bold text-slate-900 dark:text-white">{doc.name}</span>
                          </td>
                          <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-medium">{doc.spec}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              doc.status === "Available" ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" :
                              doc.status === "In Surgery" ? "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400" :
                              "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400"
                            }`}>{doc.status}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className={`h-full ${
                                  doc.loadColor === "emerald" ? "bg-emerald-500" :
                                  doc.loadColor === "amber" ? "bg-amber-500" :
                                  "bg-red-500"
                                }`} style={{ width: `${doc.load}%` }}></div>
                              </div>
                              <span className={`text-xs font-bold ${
                                doc.loadColor === "emerald" ? "text-emerald-600 dark:text-emerald-400" :
                                doc.loadColor === "amber" ? "text-amber-600 dark:text-amber-400" :
                                "text-red-600 dark:text-red-400"
                              }`}>{doc.loadText}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-4 space-y-8">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Live Tracker</h2>
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                </div>
                <div className="space-y-4">
                  {[
                    { id: "01", name: "Alice Smith", doc: "Dr. Aris", time: "10:30 AM", status: "Active", color: "emerald" },
                    { id: "02", name: "Johnathan Doe", doc: "Dr. May", time: "11:00 AM", status: "Waiting", color: "slate" },
                    { id: "03", name: "Sarah Jenkins", doc: "Dr. Wong", time: "11:15 AM", status: "Waiting", color: "slate" },
                    { id: "04", name: "Mark Thompson", doc: "Dr. Aris", time: "11:45 AM", status: "Scheduled", color: "slate" },
                  ].map((appt) => (
                    <div key={appt.id} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                      <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700">{appt.id}</div>
                      <div className="flex-1">
                        <p className="font-bold text-slate-900 dark:text-white">{appt.name}</p>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{appt.doc} • {appt.time}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-lg bg-${appt.color}-100 dark:bg-${appt.color}-500/20 text-${appt.color}-700 dark:text-${appt.color}-400 text-[10px] font-bold uppercase tracking-wider`}>{appt.status}</span>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-6 py-3 border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-sm font-bold rounded-xl hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Manage All Appointments
                </button>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Department Status</h2>
                <div className="space-y-3">
                  {[
                    { name: "Cardiology", icon: "favorite", status: "Normal", color: "emerald" },
                    { name: "Radiology", icon: "visibility", status: "Busy", color: "amber" },
                    { name: "ICU", icon: "emergency", status: "Overloaded", color: "red" },
                    { name: "Laboratory", icon: "biotech", status: "Normal", color: "emerald" },
                  ].map((dept) => (
                    <div key={dept.name} className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400`}>
                          <span className="material-symbols-outlined">{dept.icon}</span>
                        </div>
                        <span className="font-bold text-slate-700 dark:text-slate-300">{dept.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full bg-${dept.color}-500`}></span>
                        <span className={`text-xs font-bold text-${dept.color}-600 dark:text-${dept.color}-400`}>{dept.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Live Queue Tab */}
        {activeTab === "queue" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8 flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white">Live Queue Monitor</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Real-time tracking of patient flow and wait times across all departments.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span className="text-sm font-bold text-emerald-500 uppercase tracking-wider">Live</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {["ER / Trauma", "Cardiology", "General Medicine"].map((dept, index) => (
                <div key={dept} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-black text-lg text-slate-900 dark:text-white">{dept}</h3>
                    <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-xs font-bold">{index === 0 ? "4 Waiting" : "12 Waiting"}</span>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Dummy Data for Queue */}
                    <div className="p-4 rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center font-black text-red-500 border border-red-200 dark:border-red-500/30">
                          {index === 0 ? "ER-012" : "GM-045"}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">Patient #{Math.floor(Math.random() * 1000)}</p>
                          <p className="text-xs font-bold text-red-500 uppercase tracking-wider">Emergency Priority</p>
                        </div>
                      </div>
                      <span className="text-2xl font-black text-slate-900 dark:text-white">0m</span>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center font-bold text-slate-500 border border-slate-200 dark:border-slate-700">
                          {index === 0 ? "ER-013" : "GM-046"}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">Patient #{Math.floor(Math.random() * 1000)}</p>
                          <p className="text-xs text-slate-500">Normal Priority</p>
                        </div>
                      </div>
                      <span className="text-lg font-bold text-slate-500">15m</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Staff Tab */}
        {activeTab === "staff" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8 flex justify-between items-center">
              <h1 className="text-3xl font-black text-slate-900 dark:text-white">Staff Directory</h1>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                <input type="text" placeholder="Search staff..." className="pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium w-[300px] outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Specialization</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {doctors.map((doc, i) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                              doc.initial === "JA" ? "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400" :
                              doc.initial === "LM" ? "bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400" :
                              "bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400"
                            }`}>
                            {doc.initial}
                          </div>
                          <span className="font-bold text-slate-900 dark:text-white">{doc.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-500">{doc.spec}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              doc.status === "Available" ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" :
                              doc.status === "In Surgery" ? "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400" :
                              "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400"
                            }`}>{doc.status}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-indigo-500 hover:text-indigo-600 font-bold text-sm">Manage</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
