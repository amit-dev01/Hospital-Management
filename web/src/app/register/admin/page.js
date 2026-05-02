"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default function AdminSignup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    employeeId: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const isFormValid = 
    formData.name && 
    formData.email && formData.email.includes("@") &&
    formData.department && 
    formData.employeeId && 
    formData.phone.length >= 10 &&
    isPhoneVerified &&
    formData.password && 
    formData.password === formData.confirmPassword;

  const handleChange = (e) => {
    if (e.target.id === 'phone' || e.target.name === 'phone') {
      setIsPhoneVerified(false);
    }
    setFormData({ ...formData, [e.target.id || e.target.name]: e.target.value });
  };

  const handleVerifyPhoneClick = () => {
    if (formData.phone.length >= 10) {
      setShowOtpModal(true);
      setOtp(["", "", "", ""]);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 3) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;
    
    setLoading(true);
    setError("");

    try {
      const { signUpAdmin } = await import("@/app/actions/auth");
      const res = await signUpAdmin(formData);
      
      if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else if (res?.success) {
        if (res.emailVerificationRequired) {
          setSuccess(true);
          setLoading(false);
        } else {
          // If no email verification needed, show success briefly then redirect
          setSuccess(true);
          setTimeout(() => {
            router.push(res.redirectTo || "/login?role=admin");
          }, 2000);
        }
      }
    } catch (err) {
      // Don't show error if it's just a Next.js redirect
      if (err.message !== "NEXT_REDIRECT") {
        setError("An unexpected error occurred. Please try again.");
        setLoading(false);
      }
    }
  };

  const handleVerifyOtp = () => {
    const otpValue = otp.join("");
    if (otpValue.length === 4) {
      setIsPhoneVerified(true);
      setShowOtpModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020817] text-slate-900 dark:text-slate-50 flex flex-col relative overflow-hidden selection:bg-purple-500/30 transition-colors duration-300">
      {/* Background Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/5 dark:bg-purple-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/5 dark:bg-indigo-600/10 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="w-full z-50 px-6 py-6 flex justify-between items-center max-w-7xl mx-auto relative">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-center group-hover:bg-slate-100 dark:group-hover:bg-slate-800 transition-colors shadow-sm">
            <span className="material-symbols-outlined text-slate-700 dark:text-white" style={{ fontVariationSettings: "'FILL' 1" }}>arrow_back</span>
          </div>
          <span className="text-sm font-bold tracking-wide text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Back to Home</span>
        </Link>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-teal-400 flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>ecg_heart</span>
            </div>
            <span className="text-xl font-black tracking-tighter text-slate-900 dark:text-white">HealthSync</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center px-4 pt-8 pb-20 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[800px]"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 mb-6 border border-purple-200 dark:border-purple-500/20 shadow-inner">
              <span className="material-symbols-outlined text-3xl">local_hospital</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-2">Admin Registration</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Join the HealthSync network to manage facility operations.</p>
          </div>

          {/* Form Card */}
          <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800/60 rounded-3xl p-8 shadow-xl dark:shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-indigo-400"></div>

            {success ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 mb-6">
                  <span className="material-symbols-outlined text-4xl">
                    {formData.email.includes("example.com") || success ? "check_circle" : "mark_email_read"}
                  </span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">
                  {success && !error ? "Registration Successful!" : "Check your email"}
                </h2>
                <p className="text-slate-600 dark:text-slate-400 font-medium mb-8">
                  {success && !error ? (
                    <>Your admin account has been created. Redirecting you to the login page...</>
                  ) : (
                    <>
                      We've sent a verification link to <strong className="text-slate-900 dark:text-white">{formData.email}</strong>. 
                      Please verify your email to access the admin dashboard.
                    </>
                  )}
                </p>
                <Link href="/login?role=admin" className="inline-flex items-center gap-2 font-bold text-purple-600 dark:text-purple-400 hover:underline">
                  Go to Login <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400"
                  >
                    <span className="material-symbols-outlined text-[18px]">error</span>
                    <span className="text-sm font-medium">{error}</span>
                  </motion.div>
                )}
                <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-6">
                
                {/* Row 1: Full Name & Contact Number */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <motion.div variants={fadeUp} className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1" htmlFor="name">Hospital Name</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 dark:text-slate-500 pointer-events-none group-focus-within:text-purple-500 transition-colors">
                        <span className="material-symbols-outlined text-[20px]">badge</span>
                      </div>
                      <input
                        className="w-full h-12 pl-11 pr-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600 font-medium"
                        id="name"
                        placeholder="e.g. City General Hospital"
                        required
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                      />
                    </div>
                  </motion.div>

                  {/* Contact Number */}
                  <motion.div variants={fadeUp} className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1" htmlFor="phone">Contact Number</label>
                    <div className="relative group flex">
                      <div className="flex items-center justify-center px-4 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 border-r-0 rounded-l-xl text-slate-500 font-bold text-sm">
                        +91
                      </div>
                      <input
                        className={`flex-grow h-12 px-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 ${isPhoneVerified || (formData.phone.length >= 10 && !isPhoneVerified) ? '' : 'rounded-r-xl'} text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600 font-medium ${isPhoneVerified ? 'border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-500/5 text-emerald-700 dark:text-emerald-300' : ''}`}
                        id="phone"
                        placeholder="98765 43210"
                        required
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        readOnly={isPhoneVerified}
                      />
                      
                      {/* Inline Verification UI */}
                      {isPhoneVerified ? (
                        <div className="flex items-center justify-center px-4 bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/20 border-l-0 rounded-r-xl text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                          <span className="material-symbols-outlined text-[18px] mr-1">verified</span> Verified
                        </div>
                      ) : formData.phone.length >= 10 ? (
                        <button
                          type="button"
                          onClick={handleVerifyPhoneClick}
                          className="flex items-center justify-center px-4 bg-slate-900 dark:bg-white border border-slate-900 dark:border-white border-l-0 rounded-r-xl text-white dark:text-slate-900 font-bold text-sm hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
                        >
                          Verify
                        </button>
                      ) : null}
                    </div>
                    {!isPhoneVerified && formData.phone.length >= 10 && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 font-medium ml-1 mt-1">Please verify your phone number to continue.</p>
                    )}
                  </motion.div>
                </div>

                {/* Email Address */}
                <motion.div variants={fadeUp} className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1" htmlFor="email">Email Address</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 dark:text-slate-500 pointer-events-none group-focus-within:text-purple-500 transition-colors">
                      <span className="material-symbols-outlined text-[20px]">mail</span>
                    </div>
                    <input
                      className="w-full h-12 pl-11 pr-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600 font-medium"
                      id="email"
                      placeholder="admin@hospital.com"
                      required
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </motion.div>

                {/* Row 2: Dept & Emp ID Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <motion.div variants={fadeUp} className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1" htmlFor="department">Department</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 dark:text-slate-500 pointer-events-none group-focus-within:text-purple-500 transition-colors">
                        <span className="material-symbols-outlined text-[20px]">domain</span>
                      </div>
                      <select
                        className="w-full h-12 pl-11 pr-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all outline-none appearance-none font-medium"
                        id="department"
                        name="department"
                        required
                        value={formData.department}
                        onChange={handleChange}
                      >
                        <option value="" disabled>Select department</option>
                        <option value="government">Government Hospital</option>
                        <option value="private">Private Hospital</option>
                        <option value="clinic">Clinic</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-400">
                        <span className="material-symbols-outlined text-[20px]">expand_more</span>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div variants={fadeUp} className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1" htmlFor="employeeId">Employee ID</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 dark:text-slate-500 pointer-events-none group-focus-within:text-purple-500 transition-colors">
                        <span className="material-symbols-outlined text-[20px]">tag</span>
                      </div>
                      <input
                        className="w-full h-12 pl-11 pr-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600 font-medium"
                        id="employeeId"
                        placeholder="e.g. ADM-4029"
                        required
                        type="text"
                        value={formData.employeeId}
                        onChange={handleChange}
                      />
                    </div>
                  </motion.div>
                </div>

                {/* Row 3: Passwords */}
                <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1" htmlFor="password">Password</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 dark:text-slate-500 pointer-events-none group-focus-within:text-purple-500 transition-colors">
                        <span className="material-symbols-outlined text-[20px]">lock</span>
                      </div>
                      <input
                        className="w-full h-12 pl-11 pr-10 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600 font-medium tracking-widest"
                        id="password"
                        placeholder="••••••••"
                        required
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleChange}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">{showPassword ? "visibility_off" : "visibility"}</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1" htmlFor="confirmPassword">Confirm</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 dark:text-slate-500 pointer-events-none group-focus-within:text-purple-500 transition-colors">
                        <span className="material-symbols-outlined text-[20px]">lock_reset</span>
                      </div>
                      <input
                        className={`w-full h-12 pl-11 pr-4 bg-slate-50 dark:bg-slate-950/50 border rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 transition-all outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600 font-medium tracking-widest ${
                          formData.confirmPassword && formData.password !== formData.confirmPassword 
                            ? "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20" 
                            : "border-slate-200 dark:border-slate-800 focus:border-purple-500/50 focus:ring-purple-500/50"
                        }`}
                        id="confirmPassword"
                        placeholder="••••••••"
                        required
                        type={showPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Submit Button */}
                <motion.div variants={fadeUp} className="pt-4">
                  <button
                    disabled={!isFormValid || loading}
                    type="submit"
                    className={`w-full h-14 text-sm font-bold rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 ${
                      isFormValid && !loading
                        ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] active:scale-[0.98]"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    {loading ? (
                      <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating Account…</>
                    ) : (
                      <>
                        Complete Registration
                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                      </>
                    )}
                  </button>
                </motion.div>
              </motion.div>
            </form>
            )}

            <div className="mt-8 flex items-center justify-center gap-2 border-t border-slate-200 dark:border-slate-800/60 pt-6">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Already registered?</span>
              <Link href="/login?role=admin" className="text-sm font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors">
                Sign In
              </Link>
            </div>
          </div>
        </motion.div>
      </main>

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 backdrop-blur-sm bg-slate-900/60 transition-opacity">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-[400px] w-full shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-indigo-400"></div>
            
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 mb-4">
                <span className="material-symbols-outlined text-3xl">mark_email_read</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Verify Phone</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">We've sent a 4-digit verification code to <strong className="text-slate-700 dark:text-slate-300">+91 {formData.phone}</strong></p>
            </div>

            <div className="flex justify-between gap-3 mb-8">
              {[0, 1, 2, 3].map((index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength={1}
                  className="w-14 h-14 text-center text-2xl font-black bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all outline-none"
                  value={otp[index]}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' && !otp[index] && index > 0) {
                      document.getElementById(`otp-${index - 1}`).focus();
                    }
                  }}
                />
              ))}
            </div>

            <button
              onClick={handleVerifyOtp}
              disabled={otp.join("").length !== 4}
              className={`w-full h-14 text-sm font-bold rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 ${
                otp.join("").length === 4
                  ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] active:scale-[0.98]"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-200 dark:border-slate-700"
              }`}
            >
              Verify OTP
            </button>
            
            <button 
              onClick={() => setShowOtpModal(false)}
              className="w-full mt-4 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            >
              Cancel
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
