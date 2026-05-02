"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { createClient } from "@/lib/supabase/client";

// Generate next 7 days from today
function getNext7Days() {
  const days = [];
  const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push({
      label: i === 0 ? "TODAY" : dayNames[d.getDay()],
      date: d.toISOString().split("T")[0],
      display: d.getDate(),
    });
  }
  return days;
}

export default function BookAppointment() {
  const router = useRouter();
  const [bookingMode, setBookingMode] = useState("walkin");
  const [step, setStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [triageResult, setTriageResult] = useState(null);
  const [bookingResult, setBookingResult] = useState(null);
  const [error, setError] = useState(null);

  // Walk-in form
  const [symptoms, setSymptoms] = useState("");
  const [specialCategory, setSpecialCategory] = useState("none");

  // Schedule form
  const dates = getNext7Days();
  const [selectedDate, setSelectedDate] = useState(dates[0].date);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Get current user ID
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setCurrentUserId(data.user.id);
    });
  }, []);

  // Fetch available doctors when date changes
  const fetchDoctors = useCallback(async () => {
    if (!selectedDate) return;
    setLoadingDoctors(true);
    setSelectedDoctor(null);
    setAvailableSlots([]);
    setSelectedTime(null);
    try {
      const res = await fetch(`/api/doctors/available?date=${selectedDate}`);
      if (res.ok) {
        const json = await res.json();
        setDoctors(json.doctors ?? []);
      }
    } catch (e) {
      console.error("Failed to fetch doctors:", e);
    } finally {
      setLoadingDoctors(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    if (bookingMode === "schedule" && step === 2) fetchDoctors();
  }, [bookingMode, step, fetchDoctors]);

  // Fetch slots when doctor is selected
  const fetchSlots = useCallback(async () => {
    if (!selectedDoctor || !selectedDate) return;
    setLoadingSlots(true);
    setSelectedTime(null);
    try {
      const res = await fetch(`/api/doctors/available?date=${selectedDate}&doctorId=${selectedDoctor.id}`);
      if (res.ok) {
        const json = await res.json();
        const docData = json.doctors?.[0];
        if (docData) {
          setAvailableSlots(
            docData.availableSlots.map((t) => ({ time: t, available: true }))
          );
        }
      }
    } catch (e) {
      console.error("Failed to fetch slots:", e);
    } finally {
      setLoadingSlots(false);
    }
  }, [selectedDoctor, selectedDate]);

  useEffect(() => { fetchSlots(); }, [fetchSlots]);

  // ── Walk-in: AI triage (keeps existing logic, adds real token) ───────────────
  const handleTriageSubmit = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      const s = symptoms.toLowerCase();
      if (s.includes("chest pain") || s.includes("breathing") || s.includes("bleeding") || s.includes("unconscious")) {
        setTriageResult({ priority: "EMERGENCY", color: "red", department: "ER / Trauma", wait: "0 mins (Proceed Immediately)", message: "Please proceed directly to the Emergency Room. A trauma team has been notified." });
      } else if (specialCategory !== "none" || s.includes("fever") || s.includes("pain")) {
        setTriageResult({ priority: "HIGH", color: "amber", department: "General Medicine", wait: "15 mins", message: "You have been placed in the priority queue." });
      } else {
        setTriageResult({ priority: "NORMAL", color: "emerald", department: "OPD", wait: "45 mins", message: "You have been added to the standard queue. Please have a seat in the waiting area." });
      }
      setStep(3);
    }, 2000);
  };

  // ── Schedule: Confirm booking via API ────────────────────────────────────────
  const handleConfirmBooking = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime || !currentUserId) {
      setError("Please select a doctor, date, and time slot.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/appointments/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: selectedDoctor.id,
          patientId: currentUserId,
          date: selectedDate,
          timeSlot: selectedTime,
          isEmergency: false,
          isPregnant: specialCategory === "pregnant",
          isSeniorCitizen: specialCategory === "elderly",
          symptoms: symptoms || null,
          notes: null,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Booking failed. Please try again.");
        return;
      }
      setBookingResult(json);
      setStep(3);
    } catch (e) {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-[#020817] text-slate-900 dark:text-slate-50 min-h-screen pb-32 transition-colors duration-300">
      
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/patient/dashboard" className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <span className="material-symbols-outlined">arrow_back</span>
            </Link>
            <h1 className="font-bold text-lg">Registration &amp; Triage</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pt-8">
        
        {/* Step 1: Mode Selector */}
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

        {/* Step 2: Walk-in AI Triage */}
        {bookingMode === "walkin" && step === 2 && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
              <span className="material-symbols-outlined text-emerald-500">smart_toy</span>
              <h2 className="text-xl font-bold">AI Triage &amp; Fast-Track</h2>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Describe your Symptoms</label>
                <textarea 
                  rows="4"
                  placeholder="E.g., I have severe chest pain and dizziness..."
                  className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 outline-none transition-all resize-none"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Special Category (Fast-Track)</label>
                <select 
                  className="w-full h-12 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 focus:ring-2 focus:ring-emerald-500/50 outline-none appearance-none"
                  value={specialCategory}
                  onChange={(e) => setSpecialCategory(e.target.value)}
                >
                  <option value="none">None</option>
                  <option value="elderly">Senior Citizen (60+)</option>
                  <option value="pregnant">Pregnant</option>
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
                  <><span className="material-symbols-outlined animate-spin">progress_activity</span>AI is analyzing symptoms...</>
                ) : (
                  <><span className="material-symbols-outlined">auto_awesome</span>Generate Smart Token</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Walk-in Triage Result */}
        {bookingMode === "walkin" && step === 3 && triageResult && (
          <div className="space-y-6">
            <div className={`bg-${triageResult.color}-500 text-white rounded-3xl p-8 shadow-xl text-center relative overflow-hidden`}>
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
              <div className="relative z-10">
                <span className="inline-block px-4 py-1 bg-white/20 backdrop-blur-md rounded-full text-sm font-bold tracking-widest uppercase mb-6">
                  {triageResult.priority} PRIORITY
                </span>
                <h2 className="text-6xl font-black mb-2 tracking-tight">{triageResult.department}</h2>
                <div className="mt-8 bg-white/10 rounded-2xl p-6 backdrop-blur-sm border border-white/20">
                  <p className="text-sm text-white/80 uppercase tracking-wider font-bold mb-1">Estimated Wait Time</p>
                  <p className="text-4xl font-black">{triageResult.wait}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center shadow-sm">
              <p className="font-bold text-slate-900 dark:text-white text-lg">{triageResult.message}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                You can track your live position on the dashboard.
              </p>
            </div>
            <Link href="/patient/dashboard" className="w-full flex items-center justify-center h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors">
              Go to Dashboard
            </Link>
          </div>
        )}

        {/* Step 2: Schedule Mode */}
        {bookingMode === "schedule" && step === 2 && (
          <div className="space-y-6">

            {error && (
              <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-400 rounded-xl p-4 text-sm font-medium flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                {error}
              </div>
            )}

            {/* Date Selection */}
            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-lg mb-4">Select a Date</h3>
              <div className="flex gap-3 overflow-x-auto pb-2">
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
                    <span className={`text-[11px] font-bold ${selectedDate === d.date ? "text-white/80" : "text-slate-400"}`}>{d.label}</span>
                    <span className="text-xl font-black">{d.display}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Doctor Selection */}
            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-lg mb-4">Select a Doctor</h3>
              {loadingDoctors ? (
                <div className="space-y-3">
                  {[1,2,3].map(i => <div key={i} className="h-20 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />)}
                </div>
              ) : doctors.length === 0 ? (
                <p className="text-slate-500 text-center py-4">No doctors available on this date.</p>
              ) : (
                <div className="space-y-3">
                  {doctors.map((doc) => (
                    <button
                      key={doc.doctor.id}
                      disabled={!doc.isAvailableToday}
                      onClick={() => setSelectedDoctor(doc.doctor)}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                        !doc.isAvailableToday
                          ? "border-slate-100 dark:border-slate-800 opacity-50 cursor-not-allowed"
                          : selectedDoctor?.id === doc.doctor.id
                          ? "border-sky-500 bg-sky-50 dark:bg-sky-500/10"
                          : "border-slate-200 dark:border-slate-700 hover:border-sky-400"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-sky-100 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold flex-shrink-0 uppercase">
                          {doc.doctor.name?.split(" ").filter(w => w.startsWith("Dr") === false).map(w => w[0]).join("").substring(0,2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-900 dark:text-white">{doc.doctor.name}</p>
                          <p className="text-sm text-slate-500">{doc.doctor.specialization} • {doc.doctor.experienceYears} yrs exp</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                            doc.isAvailableToday
                              ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600"
                              : "bg-slate-100 dark:bg-slate-700 text-slate-500"
                          }`}>
                            {doc.availableSlots.length} slots
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </section>

            {/* Time Slot Selection */}
            {selectedDoctor && (
              <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-lg mb-4">Select Time</h3>
                {loadingSlots ? (
                  <div className="grid grid-cols-4 gap-3">
                    {[...Array(8)].map((_,i) => <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />)}
                  </div>
                ) : availableSlots.length === 0 ? (
                  <p className="text-slate-500 text-center py-4">No slots available for this date.</p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {availableSlots.map((t) => (
                      <button
                        key={t.time}
                        disabled={!t.available}
                        onClick={() => setSelectedTime(t.time)}
                        className={`h-12 flex items-center justify-center rounded-xl border transition-all font-bold text-sm ${
                          !t.available
                            ? "border-slate-100 dark:border-slate-800 text-slate-300 dark:text-slate-600 opacity-50 cursor-not-allowed"
                            : selectedTime === t.time
                            ? "border-sky-500 text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10 shadow-inner"
                            : "border-slate-200 dark:border-slate-700 hover:border-sky-500"
                        }`}
                      >
                        {t.time}
                      </button>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Special Category */}
            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-lg mb-4">Special Category <span className="text-slate-400 font-normal text-sm">(optional)</span></h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: "none", label: "None", icon: "person" },
                  { value: "elderly", label: "Senior (60+)", icon: "elderly" },
                  { value: "pregnant", label: "Pregnant", icon: "pregnant_woman" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSpecialCategory(opt.value)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      specialCategory === opt.value
                        ? "border-sky-500 bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400"
                        : "border-slate-200 dark:border-slate-700 hover:border-sky-400 text-slate-500"
                    }`}
                  >
                    <span className="material-symbols-outlined">{opt.icon}</span>
                    <span className="text-xs font-bold text-center">{opt.label}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Symptoms */}
            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-lg mb-4">Symptoms <span className="text-slate-400 font-normal text-sm">(optional)</span></h3>
              <textarea
                rows="3"
                placeholder="Briefly describe your symptoms..."
                className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4 focus:ring-2 focus:ring-sky-500/50 outline-none resize-none"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
              />
            </section>

            <button
              onClick={handleConfirmBooking}
              disabled={isSubmitting || !selectedDoctor || !selectedTime}
              className={`w-full h-14 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                isSubmitting || !selectedDoctor || !selectedTime
                  ? "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                  : "bg-sky-500 hover:bg-sky-600 text-white shadow-lg shadow-sky-500/20 active:scale-[0.98]"
              }`}
            >
              {isSubmitting ? (
                <><span className="material-symbols-outlined animate-spin">progress_activity</span>Booking...</>
              ) : (
                <><span className="material-symbols-outlined">check_circle</span>Confirm Appointment</>
              )}
            </button>
          </div>
        )}

        {/* Step 3: Booking Confirmation */}
        {bookingMode === "schedule" && step === 3 && bookingResult && (
          <div className="space-y-6">
            <div className="bg-emerald-500 text-white rounded-3xl p-8 shadow-xl text-center relative overflow-hidden">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="material-symbols-outlined text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                </div>
                <h2 className="text-3xl font-black mb-2">Appointment Confirmed!</h2>
                <p className="text-emerald-100 mb-6">{selectedDate} at {bookingResult.appointment?.time_slot}</p>

                {bookingResult.token && (
                  <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm border border-white/20">
                    <p className="text-sm text-white/80 uppercase tracking-wider font-bold mb-2">Your Token</p>
                    <p className="text-5xl font-black tracking-tight">{bookingResult.token.token_number}</p>
                    <div className="mt-4 flex justify-center gap-6 text-sm">
                      <div>
                        <p className="text-white/60">Queue Position</p>
                        <p className="font-black text-xl">#{bookingResult.queuePosition}</p>
                      </div>
                      <div>
                        <p className="text-white/60">Est. Wait</p>
                        <p className="font-black text-xl">
                          {bookingResult.estimatedWaitTime != null ? `${bookingResult.estimatedWaitTime} min` : "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Link href="/patient/dashboard" className="w-full flex items-center justify-center h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors">
              Go to Dashboard
            </Link>
          </div>
        )}

      </main>
    </div>
  );
}
