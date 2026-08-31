"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, User, Phone, ArrowRight, CheckCircle2, ShieldCheck, RefreshCw } from "lucide-react";
import { api } from "../lib/utils/apiClient";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<"register" | "verify">("register");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });
  const [otpCode, setOtpCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Handle Account Registration Submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!formData.agreeToTerms) {
      setError("You must agree to the Terms of Service.");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/api/registration", {
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });

      if (res.data?.requiresVerification) {
        setStep("verify");
        if (res.data?.pendingVerification) {
          setSuccessMsg(res.data.message || "Continue your registration: Please enter the 6-digit OTP code sent to your email.");
        } else {
          setSuccessMsg("Account created! We have sent a 6-digit verification OTP code to your email.");
        }
      } else {
        router.push("/login?registered=true");
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } }; message?: string };
      const apiError = axiosErr?.response?.data?.error || axiosErr?.message || "An unexpected error occurred.";
      setError(apiError);
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP Code Verification Submit
  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (otpCode.length !== 6) {
      setError("Please enter a valid 6-digit OTP code.");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/api/auth/verify-otp", {
        email: formData.email,
        otpCode,
      });

      if (res.data?.success) {
        setSuccessMsg("Email verified successfully! Redirecting to login...");
        setTimeout(() => {
          router.push("/login?registered=true");
        }, 1500);
      } else {
        throw new Error(res.data?.error || "Verification failed.");
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } }; message?: string };
      const apiError = axiosErr?.response?.data?.error || axiosErr?.message || "Invalid or expired OTP code.";
      setError(apiError);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP Code
  const handleResendOtp = async () => {
    setResending(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await api.post("/api/auth/forgot-password", { email: formData.email });
      setSuccessMsg(res.data?.message || "A new 6-digit OTP verification code has been sent to your email.");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } }; message?: string };
      const apiError = axiosErr?.response?.data?.error || axiosErr?.message || "Failed to resend code. Please try again.";
      setError(apiError);
    } finally {
      setResending(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#1A1A1A] flex text-[#F5F0EB]">
      {/* Left Panel: Atelier Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-black overflow-hidden flex-col justify-between p-16">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity scale-105 transition-transform duration-1000 ease-out hover:scale-100"
          style={{ backgroundImage: "url('/bg-img/native2.jpeg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-transparent to-[#1A1A1A]/80" />

        <div className="relative z-10">
          <Link href="/" className="inline-block">
            <span className="font-brand text-2xl tracking-[0.3em] text-[#C9A96E] uppercase font-bold">
              TI STICHES
            </span>
          </Link>
        </div>

        <div className="relative z-10 max-w-md space-y-4">
          <span className="text-xs uppercase tracking-[0.3em] text-[#C9A96E] font-medium">
            Become a Client
          </span>
          <h2 className="text-4xl font-heading text-[#F5F0EB] leading-tight">
            Begin Your Tailored Fashion Journey
          </h2>
          <ul className="space-y-2 text-xs text-[#E0D5C9]/80 font-light">
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-[#C9A96E]" />
              <span>Personalized digital measurement profile</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-[#C9A96E]" />
              <span>Priority private fitting consultations</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-[#C9A96E]" />
              <span>Exclusive access to limited fabric drops</span>
            </li>
          </ul>
        </div>

        <div className="relative z-10 text-[10px] uppercase tracking-widest text-[#C9A96E]">
          © 2026 Ti Stiches Atelier
        </div>
      </div>

      {/* Right Panel: Form & Verification */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-16 overflow-y-auto">
        <div className="w-full max-w-md space-y-6">
          
          <div className="lg:hidden text-center">
            <Link href="/">
              <span className="font-brand text-xl tracking-[0.3em] text-[#C9A96E] uppercase font-bold">
                TI STICHES
              </span>
            </Link>
          </div>

          <div>
            <h1 className="text-3xl font-heading text-[#F5F0EB] tracking-wide">
              {step === "register" ? "Create an Account" : "Verify Your Email"}
            </h1>
            <p className="mt-1 text-xs text-[#E0D5C9]/70 font-light">
              {step === "register"
                ? "Enter your details to register for your private client account."
                : `Enter the 6-digit OTP code sent to ${formData.email}`}
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-950/40 border border-red-500/40 text-red-300 text-xs rounded-sm">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs rounded-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {step === "register" ? (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="block text-xs uppercase tracking-[0.2em] text-[#C9A96E]">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C9A96E]/60" />
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Oluwaseun Adebayo"
                    className="w-full bg-black/40 border border-white/10 px-11 py-3 text-sm text-[#F5F0EB] placeholder:text-white/20 focus:outline-none focus:border-[#C9A96E] transition-colors"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="block text-xs uppercase tracking-[0.2em] text-[#C9A96E]">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C9A96E]/60" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="client@example.com"
                    className="w-full bg-black/40 border border-white/10 px-11 py-3 text-sm text-[#F5F0EB] placeholder:text-white/20 focus:outline-none focus:border-[#C9A96E] transition-colors"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <label className="block text-xs uppercase tracking-[0.2em] text-[#C9A96E]">
                  Phone Number (WhatsApp)
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C9A96E]/60" />
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+234 800 000 0000"
                    className="w-full bg-black/40 border border-white/10 px-11 py-3 text-sm text-[#F5F0EB] placeholder:text-white/20 focus:outline-none focus:border-[#C9A96E] transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-xs uppercase tracking-[0.2em] text-[#C9A96E]">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C9A96E]/60" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••••••"
                    className="w-full bg-black/40 border border-white/10 pl-11 pr-11 py-3 text-sm text-[#F5F0EB] placeholder:text-white/20 focus:outline-none focus:border-[#C9A96E] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-[#C9A96E] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="block text-xs uppercase tracking-[0.2em] text-[#C9A96E]">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C9A96E]/60" />
                  <input
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="••••••••••••"
                    className="w-full bg-black/40 border border-white/10 px-11 py-3 text-sm text-[#F5F0EB] placeholder:text-white/20 focus:outline-none focus:border-[#C9A96E] transition-colors"
                  />
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start space-x-3 pt-2">
                <input
                  type="checkbox"
                  id="agreeToTerms"
                  required
                  checked={formData.agreeToTerms}
                  onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                  className="mt-0.5 w-4 h-4 accent-[#C9A96E] bg-black border-white/20"
                />
                <label htmlFor="agreeToTerms" className="text-xs text-[#E0D5C9]/80 leading-tight">
                  I agree to the <Link href="/terms" className="text-[#C9A96E] underline">Terms of Service</Link> and <Link href="/privacy" className="text-[#C9A96E] underline">Privacy Policy</Link>.
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#C9A96E] text-[#1A1A1A] text-xs font-bold uppercase tracking-[0.25em] hover:bg-[#F5F0EB] transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer mt-4"
              >
                <span>{loading ? "Creating Profile..." : "Create Client Profile"}</span>
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs uppercase tracking-[0.2em] text-[#C9A96E]">
                  6-Digit OTP Code
                </label>
                <div className="relative">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C9A96E]/60" />
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    className="w-full bg-black/40 border border-white/10 px-11 py-3 text-lg font-mono tracking-[0.4em] text-[#C9A96E] placeholder:text-white/20 focus:outline-none focus:border-[#C9A96E] transition-colors text-center"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || otpCode.length !== 6}
                className="w-full py-4 bg-[#C9A96E] text-[#1A1A1A] text-xs font-bold uppercase tracking-[0.25em] hover:bg-[#F5F0EB] transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
              >
                <span>{loading ? "Verifying OTP..." : "Verify & Complete Registration"}</span>
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>

              <div className="flex items-center justify-between text-xs pt-2">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resending}
                  className="text-[#C9A96E] hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${resending ? "animate-spin" : ""}`} />
                  <span>{resending ? "Resending..." : "Resend OTP Code"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStep("register")}
                  className="text-[#E0D5C9]/60 hover:text-white underline cursor-pointer"
                >
                  Back to Registration
                </button>
              </div>
            </form>
          )}

          {/* Switch to Login */}
          <div className="pt-4 border-t border-white/10 text-center text-xs text-[#E0D5C9]/60">
            Already registered?{" "}
            <Link href="/login" className="text-[#C9A96E] hover:underline font-semibold ml-1">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
