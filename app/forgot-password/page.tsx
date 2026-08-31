"use client";

import { useState } from "react";
import Link from "next/link";
import { KeyRound, Mail, Lock, CheckCircle2, ArrowRight, ShieldCheck } from "lucide-react";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // STEP 1: Request OTP Code
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to send reset code.");
      }

      setMessage(data.message || "A 6-digit code has been sent to your email.");
      setStep(2);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify 6-Digit OTP Code
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otpCode }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Invalid OTP code.");
      }

      setMessage("OTP Code verified! Please enter your new password below.");
      setStep(3);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid or expired OTP.");
    } finally {
      setLoading(false);
    }
  };

  // STEP 3: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otpCode, newPassword }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to reset password.");
      }

      setMessage("Password updated successfully! Redirecting to login...");
      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-[#F5F0EB] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-[#242424] border border-[#C9A96E]/30 rounded-xl p-8 shadow-2xl space-y-6">
        
        {/* Step Indicator Banner */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#C9A96E]/10 border border-[#C9A96E]/40 flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-[#C9A96E]" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#C9A96E] font-semibold block">
                SECURITY RECOVERY
              </span>
              <h1 className="text-xl font-heading font-bold text-[#F5F0EB]">Password Reset</h1>
            </div>
          </div>
          <span className="text-xs text-gray-400 font-mono">Step {step}/3</span>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="p-3 bg-red-950/60 border border-red-700 text-red-300 text-xs rounded flex items-center gap-2">
            <span>⚠️ {error}</span>
          </div>
        )}
        {message && (
          <div className="p-3 bg-emerald-950/60 border border-emerald-700 text-emerald-300 text-xs rounded flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {/* STEP 1: Enter Email */}
        {step === 1 && (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <p className="text-xs text-[#E0D5C9]/80 font-light leading-relaxed">
              Enter your registered manager account email address to receive a 6-digit security OTP verification code.
            </p>

            <div className="space-y-1">
              <label className="block text-xs text-[#E0D5C9] font-medium">Account Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="manager@tistiches.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-black/50 border border-white/10 rounded text-xs text-white focus:border-[#C9A96E] outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full py-3 bg-[#C9A96E] hover:bg-[#F5F0EB] text-[#1A1A1A] font-bold text-xs uppercase tracking-widest rounded transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? "Sending OTP..." : "Send Verification Code"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STEP 2: Verify OTP Code */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <p className="text-xs text-[#E0D5C9]/80 font-light leading-relaxed">
              Enter the 6-digit OTP code sent to <strong className="text-white">{email}</strong>.
            </p>

            <div className="space-y-1">
              <label className="block text-xs text-[#E0D5C9] font-medium">6-Digit OTP Code</label>
              <div className="relative">
                <ShieldCheck className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  required
                  placeholder="123456"
                  className="w-full pl-9 pr-3 py-2.5 bg-black/50 border border-white/10 rounded text-base font-mono tracking-[0.3em] text-[#C9A96E] text-center focus:border-[#C9A96E] outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || otpCode.length !== 6}
              className="w-full py-3 bg-[#C9A96E] hover:bg-[#F5F0EB] text-[#1A1A1A] font-bold text-xs uppercase tracking-widest rounded transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify Code"}
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-center text-xs text-gray-400 hover:text-white underline pt-1 block"
            >
              Change Email Address
            </button>
          </form>
        )}

        {/* STEP 3: Create New Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <p className="text-xs text-[#E0D5C9]/80 font-light leading-relaxed">
              Create a new secure password for your manager account.
            </p>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="block text-xs text-[#E0D5C9] font-medium">New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 bg-black/50 border border-white/10 rounded text-xs text-white focus:border-[#C9A96E] outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs text-[#E0D5C9] font-medium">Confirm New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 bg-black/50 border border-white/10 rounded text-xs text-white focus:border-[#C9A96E] outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !newPassword || !confirmPassword}
              className="w-full py-3 bg-[#C9A96E] hover:bg-[#F5F0EB] text-[#1A1A1A] font-bold text-xs uppercase tracking-widest rounded transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? "Updating Password..." : "Update Password & Log In"}
            </button>
          </form>
        )}

        {/* Back to Login Link */}
        <div className="pt-2 text-center border-t border-white/10">
          <Link href="/login" className="text-xs text-gray-400 hover:text-[#C9A96E] transition-colors">
            &larr; Back to Manager Login
          </Link>
        </div>
      </div>
    </div>
  );
}
