"use client";

import { useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function BookAppointment() {
  const [bookingMode, setBookingMode] = useState("walkin"); // "walkin" or "schedule"
  const [step, setStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [triageResult, setTriageResult] = useState(null);

  // Form State
  const [symptoms, setSymptoms] = useState("");
  const [specialCategory, setSpecialCategory] = useState("none");
  const [patientId, setPatientId] = useState("");

  const [selectedDate, setSelectedDate] = useState(13);
  const [selectedTime, setSelectedTime] = useState("10:30 AM");

  const dates = [
    { day: "MON", date: 12 },
    { day: "TUE", date: 13 },
    { day: "WED", date: 14 },
    { day: "THU", date: 15 },
    { day: "FRI", date: 16 },
    { day: "SAT", date: 17 },
  ];

  const times = [
    { time: "10:00 AM", available: false },
    { time: "10:15 AM", available: false },
    { time: "10:30 AM", available: true },
    { time: "10:45 AM", available: true },
    { time: "11:00 AM", available: true },
    { time: "11:15 AM", available: false },
    { time: "11:30 AM", available: true },
    { time: "11:45 AM", available: true },
  ];

  const handleTriageSubmit = () => {
    setIsAnalyzing(true);
    // Simulate AI Triage Delay
    setTimeout(() => {
      setIsAnalyzing(false);
      
      // Fake AI Logic based on keywords
      const s = symptoms.toLowerCase();
      if (s.includes("chest pain") || s.includes("breathing") || s.includes("bleeding") || s.includes("unconscious")) {
        setTriageResult({
          priority: "EMERGENCY",
          color: "red",
          department: "ER / Trauma",
          token: "ER-012",
          wait: "0 mins (Proceed Immediately)",
          message: "Please proceed directly to the Emergency Room. A trauma team has been notified."
        });
      } else if (specialCategory !== "none" || s.includes("fever") || s.includes("pain")) {
        setTriageResult({
          priority: "HIGH",
          color: "amber",
          department: "General Medicine",
          token: "GM-045",
          wait: "15 mins",
          message: "You have been placed in the priority queue."
        });
      } else {
        setTriageResult({
          priority: "NORMAL",
          color: "emerald",
          department: "OPD",
          token: "OP-102",
          wait: "45 mins",
          message: "You have been added to the standard queue. Please have a seat in the waiting area."
        });
      }
      setStep(3);
    }, 2000);
  };

  return (
    <div className="bg-slate-50 dark:bg-[#020817] text-slate-900 dark:text-slate-50 min-h-screen pb-32 transition-colors duration-300">
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/patient/dashboard" className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <span className="material-symbols-outlined">arrow_back</span>
            </Link>
            <h1 className="font-bold text-lg">Registration & Triage</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pt-8">
        
        {/* Mode Selector */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-black mb-2">How can we help you?</h2>
              <p className="text-slate-500 dark:text-slate-400">Choose your registration method below.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                onClick={() => { setBookingMode("walkin"); setStep(2); }}
                className="bg-white dark:bg-slate-900 border-2 border-emerald-500/30 hover:border-emerald-500 rounded-2xl p-6 text-left transition-all group shadow-sm hover:shadow-md"
              >
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-2xl">local_hospital</span>
                </div>
                <h3 className="text-lg font-bold mb-1">I am at the Hospital</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Walk-in triage. Get your smart token and live wait time instantly.</p>
              </button>

              <button 
                onClick={() => { setBookingMode("schedule"); setStep(2); }}
                className="bg-white dark:bg-slate-900 border-2 border-sky-500/30 hover:border-sky-500 rounded-2xl p-6 text-left transition-all group shadow-sm hover:shadow-md"
              >
                <div className="w-12 h-12 bg-sky-100 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-2xl">event_upcoming</span>
                </div>
                <h3 className="text-lg font-bold mb-1">Book for Later</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Schedule a future appointment with a specific doctor.</p>
              </button>
            </div>
          </div>
        )}

        {/* WALKIN MODE: AI Triage Form */}
        {bookingMode === "walkin" && step === 2 && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
              <span className="material-symbols-outlined text-emerald-500">smart_toy</span>
              <h2 className="text-xl font-bold">AI Triage & Fast-Track</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Identify Yourself (Optional for Walk-ins)</label>
                <input 
                  type="text" 
                  placeholder="Phone Number or Aadhaar ID"
                  className="w-full h-12 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 outline-none transition-all"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Describe your Symptoms</label>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Our AI will analyze this to assign you to the correct department and priority queue.</p>
                <textarea 
                  rows="4"
                  placeholder="E.g., I have severe chest pain and dizziness..."
                  className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 outline-none transition-all resize-none"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Special Category (Fast-Track)</label>
                <select 
                  className="w-full h-12 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 outline-none transition-all appearance-none"
                  value={specialCategory}
                  onChange={(e) => setSpecialCategory(e.target.value)}
                >
                  <option value="none">None</option>
                  <option value="elderly">Senior Citizen (65+)</option>
                  <option value="pregnant">Pregnant</option>
                  <option value="disabled">Differently Abled</option>
                </select>
              </div>

              <button 
                onClick={handleTriageSubmit}
                disabled={isAnalyzing || symptoms.length < 5}
                className={`w-full h-14 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                  isAnalyzing || symptoms.length < 5 
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed" 
                    : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
                }`}
              >
                {isAnalyzing ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    AI is analyzing symptoms...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">auto_awesome</span>
                    Generate Smart Token
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* WALKIN MODE: Triage Result (Token) */}
        {bookingMode === "walkin" && step === 3 && triageResult && (
          <div className="space-y-6 animate-in fade-in zoom-in duration-500">
            <div className={`bg-${triageResult.color}-500 text-white rounded-3xl p-8 shadow-xl text-center relative overflow-hidden`}>
              {/* Decorative Background */}
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
              
              <div className="relative z-10">
                <span className="inline-block px-4 py-1 bg-white/20 backdrop-blur-md rounded-full text-sm font-bold tracking-widest uppercase mb-6">
                  {triageResult.priority} PRIORITY
                </span>
                
                <h2 className="text-6xl font-black mb-2 tracking-tight">{triageResult.token}</h2>
                <p className="text-lg font-medium text-white/90">{triageResult.department}</p>
                
                <div className="mt-8 bg-white/10 rounded-2xl p-6 backdrop-blur-sm border border-white/20">
                  <p className="text-sm text-white/80 uppercase tracking-wider font-bold mb-1">Estimated Wait Time</p>
                  <p className="text-4xl font-black">{triageResult.wait}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center shadow-sm">
              <span className={`material-symbols-outlined text-4xl text-${triageResult.color}-500 mb-2`}>info</span>
              <p className="font-bold text-slate-900 dark:text-white text-lg">{triageResult.message}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                We will send you a WhatsApp notification when it is your turn. You can also track your live position on the dashboard.
              </p>
            </div>

            <Link href="/patient/dashboard" className="w-full flex items-center justify-center h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors">
              Go to Live Tracker
            </Link>
          </div>
        )}

        {/* SCHEDULE MODE: Traditional Booking */}
        {bookingMode === "schedule" && step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-24 h-24 rounded-2xl bg-sky-100 dark:bg-sky-500/20 text-sky-500 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-5xl">person</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white">Dr. Sarah Johnson</h2>
                      <p className="text-slate-500 dark:text-slate-400 font-medium">Cardiologist • 12 yrs exp</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                      <span className="material-symbols-outlined text-[18px]">local_hospital</span>
                      <span className="text-sm font-medium">City General Hospital</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Slot Selection */}
            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-lg mb-4">Select a Date</h3>
              <div className="flex gap-3 overflow-x-auto pb-4 hide-scrollbar">
                {dates.map((d) => (
                  <button
                    key={d.date}
                    onClick={() => setSelectedDate(d.date)}
                    className={`flex flex-col items-center justify-center min-w-[72px] h-20 rounded-xl transition-all ${
                      selectedDate === d.date
                        ? "bg-sky-500 text-white shadow-lg shadow-sky-500/30 scale-105"
                        : "bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-sky-500"
                    }`}
                  >
                    <span className={`text-[12px] font-bold ${selectedDate === d.date ? "text-white/80" : "text-slate-400"}`}>{d.day}</span>
                    <span className="text-xl font-black">{d.date}</span>
                  </button>
                ))}
              </div>

              <h3 className="font-bold text-lg mt-6 mb-4">Select Time</h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {times.map((t) => (
                  <button
                    key={t.time}
                    disabled={!t.available}
                    onClick={() => setSelectedTime(t.time)}
                    className={`h-12 flex items-center justify-center rounded-xl border transition-all font-bold text-sm ${
                      !t.available
                        ? "border-slate-100 dark:border-slate-800 text-slate-300 dark:text-slate-600 bg-slate-50 dark:bg-slate-900 opacity-50 cursor-not-allowed"
                        : selectedTime === t.time
                        ? "border-sky-500 text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10 shadow-inner"
                        : "border-slate-200 dark:border-slate-700 hover:border-sky-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    {t.time}
                  </button>
                ))}
              </div>
            </section>

            <button className="w-full bg-sky-500 text-white h-14 rounded-xl font-bold shadow-lg shadow-sky-500/20 active:scale-[0.98] transition-transform">
              Confirm Appointment
            </button>
          </div>
        )}

      </main>
    </div>
  );
}
