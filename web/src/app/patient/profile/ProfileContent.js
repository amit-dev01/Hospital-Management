"use client";

import { useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { signOut } from "@/app/actions/auth";

export default function PatientProfileContent({ profile, roleData, user }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: profile?.full_name ?? "",
    phone: profile?.phone ?? "",
  });

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((w) => w[0]).join("").substring(0, 2).toUpperCase()
    : "??";

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/profile/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: form.full_name, phone: form.phone }),
      });
      if (res.ok) setEditing(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

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
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button onClick={() => signOut()} className="text-sm font-medium text-slate-500 hover:text-red-500 transition-colors">
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-8 space-y-6">

        {/* Profile Header */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm flex flex-col md:flex-row items-center gap-8">
          <div className="w-32 h-32 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-4xl font-black border-4 border-white dark:border-slate-900 shadow-xl flex-shrink-0">
            {initials}
          </div>
          <div className="text-center md:text-left flex-1">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">{profile?.full_name ?? "—"}</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">{user?.email}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
              <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-bold tracking-wider uppercase">Patient</span>
              {roleData?.gender && roleData?.age && (
                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold tracking-wider uppercase">
                  {roleData.gender} • {roleData.age} yrs
                </span>
              )}
              {roleData?.blood_group && (
                <span className="px-3 py-1 bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-400 rounded-lg text-xs font-bold tracking-wider uppercase">
                  Blood: {roleData.blood_group.toUpperCase()}
                </span>
              )}
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
            {!editing ? (
              <button onClick={() => setEditing(true)} className="text-emerald-600 dark:text-emerald-400 text-sm font-bold hover:underline">Edit</button>
            ) : (
              <div className="flex gap-3">
                <button onClick={() => setEditing(false)} className="text-slate-500 text-sm font-bold hover:underline">Cancel</button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Full Name</label>
              {editing ? (
                <input
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  className="w-full h-10 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 font-medium focus:border-emerald-500 outline-none"
                />
              ) : (
                <p className="font-medium text-slate-900 dark:text-white">{profile?.full_name ?? "—"}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Mobile Number</label>
              {editing ? (
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full h-10 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 font-medium focus:border-emerald-500 outline-none"
                />
              ) : (
                <p className="font-medium text-slate-900 dark:text-white">{profile?.phone ?? "—"}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Email Address</label>
              <p className="font-medium text-slate-900 dark:text-white">{user?.email ?? "—"}</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Age</label>
              <p className="font-medium text-slate-900 dark:text-white">{roleData?.age ? `${roleData.age} years` : "—"}</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Gender</label>
              <p className="font-medium text-slate-900 dark:text-white capitalize">{roleData?.gender ?? "—"}</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Blood Group</label>
              <p className="font-medium text-slate-900 dark:text-white uppercase">{roleData?.blood_group ?? "—"}</p>
            </div>
          </div>
        </section>

        {/* Medical Info */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
            <span className="material-symbols-outlined text-red-500">favorite</span>
            <h3 className="text-xl font-bold">Medical Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: "Blood Group", value: roleData?.blood_group?.toUpperCase(), color: "red" },
              { label: "Age", value: roleData?.age ? `${roleData.age} yrs` : null, color: "blue" },
              { label: "Gender", value: roleData?.gender, color: "purple" },
            ].map(({ label, value, color }) => (
              <div key={label} className={`p-4 rounded-2xl bg-${color}-50 dark:bg-${color}-500/10 border border-${color}-100 dark:border-${color}-500/20`}>
                <p className={`text-xs font-bold text-${color}-500 uppercase tracking-wider mb-1`}>{label}</p>
                <p className={`text-2xl font-black text-${color}-700 dark:text-${color}-400 capitalize`}>{value ?? "—"}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Links */}
        <section className="grid grid-cols-2 gap-4">
          <Link href="/patient/book" className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl p-6 flex items-center gap-4 transition-colors shadow-lg shadow-emerald-500/20">
            <span className="material-symbols-outlined text-3xl">calendar_add_on</span>
            <div>
              <p className="font-black text-lg">Book Appointment</p>
              <p className="text-emerald-100 text-sm">Schedule a visit</p>
            </div>
          </Link>
          <Link href="/patient/dashboard" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex items-center gap-4 hover:border-emerald-500/50 transition-colors shadow-sm">
            <span className="material-symbols-outlined text-3xl text-emerald-500">dashboard</span>
            <div>
              <p className="font-black text-lg text-slate-900 dark:text-white">Dashboard</p>
              <p className="text-slate-400 text-sm">View queue &amp; tokens</p>
            </div>
          </Link>
        </section>

      </main>
    </div>
  );
}
