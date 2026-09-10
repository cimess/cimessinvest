"use client";

import { useState, useEffect, useCallback } from "react";
import { signIn } from "next-auth/react";
import { 
  ShieldCheck, 
  KeyRound, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  HelpCircle,
  RefreshCw,
  Terminal,
  ShieldAlert,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { api } from "@/app/lib/utils/apiClient";

type PageMode = "CHECKING" | "INIT_OTP" | "INIT_SECRET" | "LOGIN" | "RECOVERY_QUESTION" | "RECOVERY_RESET";

export default function SuperadminLoginPage() {
  const [mode, setMode] = useState<PageMode>("CHECKING");
  const [initEmail, setInitEmail] = useState<string>("");
  
  // Login Form State
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Init Form State
  const [initOtp, setInitOtp] = useState("");
  const [initSecret, setInitSecret] = useState("");
  const [showSecret, setShowSecret] = useState(false);

  // Recovery Form State
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [dogAnswer, setDogAnswer] = useState("");
  const [recoveryOtp, setRecoveryOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Loading & Feedback
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // 1. Check initialization status on load
  const checkStatus = useCallback(async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await api.get<{ initialized: boolean; email?: string }>("/api/superadmin/init/status");
      if (res.data.initialized) {
        setMode("LOGIN");
      } else {
        setInitEmail(res.data.email || "");
        setMode("INIT_OTP");
      }
    } catch {
      setFeedback({
        type: "error",
        message: "Failed to connect to platform security core. Please check your network.",
      });
      setMode("LOGIN");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  // 2. Dispatch OTP for First-Time Initialization
  const handleSendInitOtp = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await api.post<{ success?: boolean; message?: string; error?: string }>(
        "/api/superadmin/init/send-otp",
        {}
      );
      if (res.data.success) {
        setFeedback({
          type: "success",
          message: res.data.message || `Verification code sent to ${initEmail}`,
        });
      } else {
        setFeedback({ type: "error", message: res.data.error || "Failed sending verification code." });
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Error dispatching code";
      setFeedback({ type: "error", message: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  // 3. Move from Init OTP to Secret Verification
  const handleProceedToSecret = () => {
    if (!initOtp || initOtp.trim().length !== 6) {
      setFeedback({ type: "error", message: "Please enter the complete 6-digit verification code." });
      return;
    }
    setFeedback(null);
    setMode("INIT_SECRET");
  };

  // 4. Verify Secret & Lock Superadmin
  const handleVerifyAndLock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!initSecret) {
      setFeedback({ type: "error", message: "Please enter the environment secret password." });
      return;
    }

    setLoading(true);
    setFeedback(null);
    try {
      const res = await api.post<{ success?: boolean; message?: string; error?: string }>(
        "/api/superadmin/init/verify-and-lock",
        {
          otp: initOtp.trim(),
          secret: initSecret,
        }
      );

      if (res.data.success) {
        setFeedback({
          type: "success",
          message: "Root authority established and locked! You may now sign in.",
        });
        setLoginEmail(initEmail);
        setLoginPassword(initSecret);
        setMode("LOGIN");
      } else {
        setFeedback({ type: "error", message: res.data.error || "Verification failed." });
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Initialization failed";
      setFeedback({ type: "error", message: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  // 5. Normal Superadmin Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setFeedback({ type: "error", message: "Email and password are both required." });
      return;
    }

    setLoading(true);
    setFeedback(null);
    try {
      const result = await signIn("credentials", {
        email: loginEmail.trim().toLowerCase(),
        password: loginPassword,
        redirect: false,
      });

      if (result?.error) {
        setFeedback({
          type: "error",
          message: result.error.includes("CredentialsSignin")
            ? "Invalid email or password for superadmin authority."
            : result.error,
        });
      } else {
        setFeedback({ type: "success", message: "Authorized! Entering control room..." });
        window.location.href = "/superadmin";
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Authentication failed";
      setFeedback({ type: "error", message: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  // 6. Emergency Recovery: Step 1 (Security Answer Verification)
  const handleRequestRecoveryOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryEmail || !dogAnswer) {
      setFeedback({ type: "error", message: "Email and favorite dog answer are required." });
      return;
    }

    setLoading(true);
    setFeedback(null);
    try {
      const res = await api.post<{ success?: boolean; message?: string; error?: string }>(
        "/api/superadmin/recovery/request",
        {
          email: recoveryEmail.trim().toLowerCase(),
          securityAnswer: dogAnswer.trim(),
        }
      );

      if (res.data.success) {
        setFeedback({
          type: "success",
          message: res.data.message || "Security question confirmed! Recovery code emailed.",
        });
        setMode("RECOVERY_RESET");
      } else {
        setFeedback({ type: "error", message: res.data.error || "Security verification failed." });
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Recovery request failed";
      setFeedback({ type: "error", message: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  // 7. Emergency Recovery: Step 2 (Reset Password with OTP)
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryOtp || !newPassword) {
      setFeedback({ type: "error", message: "Recovery code and new password are required." });
      return;
    }

    if (newPassword !== confirmPassword) {
      setFeedback({ type: "error", message: "Passwords do not match." });
      return;
    }

    if (newPassword.length < 8) {
      setFeedback({ type: "error", message: "Password must be at least 8 characters long." });
      return;
    }

    setLoading(true);
    setFeedback(null);
    try {
      const res = await api.post<{ success?: boolean; message?: string; error?: string }>(
        "/api/superadmin/recovery/reset",
        {
          email: recoveryEmail.trim().toLowerCase(),
          otp: recoveryOtp.trim(),
          newPassword,
        }
      );

      if (res.data.success) {
        setFeedback({
          type: "success",
          message: "Password successfully reset! Please log in with your new credentials.",
        });
        setLoginEmail(recoveryEmail);
        setLoginPassword("");
        setMode("LOGIN");
      } else {
        setFeedback({ type: "error", message: res.data.error || "Password reset failed." });
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Reset execution failed";
      setFeedback({ type: "error", message: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F0EB] flex flex-col justify-center items-center p-4 sm:p-6 font-sans relative selection:bg-[#C9A96E] selection:text-black">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#C9A96E]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full bg-[#141414] border border-[#C9A96E]/30 rounded-xl p-8 shadow-2xl relative z-10 space-y-6">
        {/* Top Header Badge */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-full bg-[#C9A96E]/10 border border-[#C9A96E]/40 flex items-center justify-center mx-auto shadow-inner">
            {mode.startsWith("INIT") ? (
              <Sparkles className="w-6 h-6 text-[#C9A96E]" />
            ) : mode.startsWith("RECOVERY") ? (
              <ShieldAlert className="w-6 h-6 text-[#D9534F]" />
            ) : (
              <ShieldCheck className="w-6 h-6 text-[#C9A96E]" />
            )}
          </div>
          <div>
            <div className="flex items-center justify-center space-x-2">
              <span className="font-brand text-xs uppercase tracking-[0.3em] font-bold text-[#F5F0EB]">
                CIMESSINVEST
              </span>
              <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded bg-[#C9A96E] text-[#141414] font-bold">
                ROOT SECURITY
              </span>
            </div>
            <h1 className="text-xl font-heading font-bold text-[#F5F0EB] mt-1">
              {mode === "INIT_OTP" && "Initialize Root Superadmin"}
              {mode === "INIT_SECRET" && "Verify Master Environment Secret"}
              {mode === "LOGIN" && "Superadmin Control Terminal"}
              {mode === "RECOVERY_QUESTION" && "Emergency Master Recovery"}
              {mode === "RECOVERY_RESET" && "Set New Master Password"}
              {mode === "CHECKING" && "Checking Security Status..."}
            </h1>
          </div>
        </div>

        {/* Global Feedback Notice */}
        {feedback && (
          <div
            className={`p-3.5 rounded text-xs flex items-start space-x-2.5 border ${
              feedback.type === "success"
                ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                : "bg-red-950/40 border-red-500/40 text-red-300"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            )}
            <span className="leading-relaxed">{feedback.message}</span>
          </div>
        )}

        {/* LOADING STATUS SKELETON */}
        {mode === "CHECKING" && (
          <div className="py-8 flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-6 h-6 text-[#C9A96E] animate-spin" />
            <p className="text-xs text-[#A09585]">Connecting to platform security core...</p>
          </div>
        )}

        {/* ================================================================
            MODE A: INITIALIZATION STEP 1 (OTP DISPATCH & INPUT)
        ================================================================ */}
        {mode === "INIT_OTP" && (
          <div className="space-y-5">
            <div className="bg-black/40 border border-white/10 rounded p-4 text-xs text-[#E0D5C9] space-y-2">
              <div className="flex items-center space-x-1.5 text-[#C9A96E] font-semibold uppercase tracking-wider text-[11px]">
                <Terminal className="w-3.5 h-3.5" />
                <span>First-Time Bootstrap Detected</span>
              </div>
              <p className="text-[#A09585] leading-relaxed">
                Superadmin authority has not been claimed yet. Target email declared in environment:
              </p>
              <div className="font-mono text-[#F5F0EB] bg-white/5 px-2.5 py-1.5 rounded border border-white/10 truncate font-semibold">
                {initEmail || "Configured in SUPERADMIN_INIT_EMAIL"}
              </div>
            </div>

            <button
              type="button"
              onClick={handleSendInitOtp}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-white/5 border border-[#C9A96E]/40 hover:bg-[#C9A96E]/10 text-[#C9A96E] text-xs uppercase tracking-wider font-bold rounded flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
            >
              <Mail className="w-4 h-4" />
              <span>{loading ? "Dispatching..." : "Send Verification Code To Email"}</span>
            </button>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-[#A09585] font-medium block">
                Enter 6-Digit Verification Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={initOtp}
                onChange={(e) => setInitOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                className="w-full text-center tracking-[0.5em] text-2xl font-mono bg-black/60 border border-white/15 focus:border-[#C9A96E] rounded px-4 py-2.5 text-[#F5F0EB] outline-none transition-colors"
              />
            </div>

            <button
              type="button"
              onClick={handleProceedToSecret}
              disabled={initOtp.length !== 6 || loading}
              className="w-full py-3 bg-[#C9A96E] hover:bg-[#b5955b] text-[#141414] text-xs uppercase tracking-[0.2em] font-bold rounded transition-colors flex items-center justify-center space-x-2 disabled:opacity-40"
            >
              <span>Verify Code & Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ================================================================
            MODE A: INITIALIZATION STEP 2 (SECRET VERIFICATION & LOCK)
        ================================================================ */}
        {mode === "INIT_SECRET" && (
          <form onSubmit={handleVerifyAndLock} className="space-y-5">
            <div className="bg-black/40 border border-emerald-500/30 rounded p-4 text-xs text-[#E0D5C9] space-y-1.5">
              <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold uppercase tracking-wider text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Code Verified</span>
              </div>
              <p className="text-[#A09585] leading-relaxed">
                Now provide the master password configured in <code className="text-[#C9A96E]">SUPERADMIN_INIT_PASSWORD</code>. This will be hashed with bcrypt to the database and locked.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wider text-[#A09585] font-medium block">
                Master Secret Password
              </label>
              <div className="relative">
                <input
                  type={showSecret ? "text" : "password"}
                  value={initSecret}
                  onChange={(e) => setInitSecret(e.target.value)}
                  placeholder="Enter SUPERADMIN_INIT_PASSWORD"
                  className="w-full bg-black/60 border border-white/15 focus:border-[#C9A96E] rounded px-4 py-2.5 text-sm text-[#F5F0EB] outline-none transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A09585] hover:text-[#F5F0EB]"
                >
                  {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !initSecret}
              className="w-full py-3 bg-[#C9A96E] hover:bg-[#b5955b] text-[#141414] text-xs uppercase tracking-[0.2em] font-bold rounded transition-colors flex items-center justify-center space-x-2 disabled:opacity-40"
            >
              <Lock className="w-4 h-4" />
              <span>{loading ? "Locking Authority..." : "Verify & Permanently Lock"}</span>
            </button>

            <button
              type="button"
              onClick={() => setMode("INIT_OTP")}
              className="w-full text-center text-xs text-[#A09585] hover:text-[#C9A96E] transition-colors"
            >
              &larr; Back to verification code
            </button>
          </form>
        )}

        {/* ================================================================
            MODE B: STANDARD SUPERADMIN LOGIN
        ================================================================ */}
        {mode === "LOGIN" && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wider text-[#A09585] font-medium block">
                Superadmin Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="superadmin@cimessinvest.com"
                  className="w-full bg-black/60 border border-white/15 focus:border-[#C9A96E] rounded px-4 py-2.5 text-sm text-[#F5F0EB] outline-none transition-colors pl-10"
                  required
                />
                <Mail className="w-4 h-4 text-[#A09585] absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs uppercase tracking-wider text-[#A09585] font-medium block">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setFeedback(null);
                    setRecoveryEmail(loginEmail);
                    setMode("RECOVERY_QUESTION");
                  }}
                  className="text-[11px] text-[#C9A96E] hover:underline cursor-pointer"
                >
                  Emergency Recovery?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-black/60 border border-white/15 focus:border-[#C9A96E] rounded px-4 py-2.5 text-sm text-[#F5F0EB] outline-none transition-colors pl-10 pr-10"
                  required
                />
                <KeyRound className="w-4 h-4 text-[#A09585] absolute left-3 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A09585] hover:text-[#F5F0EB]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#C9A96E] hover:bg-[#b5955b] text-[#141414] text-xs uppercase tracking-[0.2em] font-bold rounded transition-colors flex items-center justify-center space-x-2 disabled:opacity-40"
            >
              <Lock className="w-4 h-4" />
              <span>{loading ? "Authenticating..." : "Enter Control Room"}</span>
            </button>

            <div className="pt-2 text-center">
              <Link
                href="/"
                className="text-xs text-[#A09585] hover:text-[#C9A96E] transition-colors inline-flex items-center space-x-1"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Return to Storefront</span>
              </Link>
            </div>
          </form>
        )}

        {/* ================================================================
            MODE C: EMERGENCY RECOVERY STEP 1 (SECURITY QUESTION: FAVORITE DOG)
        ================================================================ */}
        {mode === "RECOVERY_QUESTION" && (
          <form onSubmit={handleRequestRecoveryOtp} className="space-y-4">
            <div className="bg-red-950/30 border border-red-500/30 rounded p-4 text-xs text-[#E0D5C9] space-y-1.5">
              <div className="flex items-center space-x-1.5 text-red-400 font-semibold uppercase tracking-wider text-[11px]">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Emergency Credential Reset</span>
              </div>
              <p className="text-[#A09585] leading-relaxed">
                State your emergency security answer configured in <code className="text-[#C9A96E]">SUPERADMIN_RECOVERY_ANSWER</code> to dispatch a recovery code.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wider text-[#A09585] font-medium block">
                Superadmin Email
              </label>
              <input
                type="email"
                value={recoveryEmail}
                onChange={(e) => setRecoveryEmail(e.target.value)}
                placeholder="superadmin@cimessinvest.com"
                className="w-full bg-black/60 border border-white/15 focus:border-[#C9A96E] rounded px-4 py-2.5 text-sm text-[#F5F0EB] outline-none transition-colors"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wider text-[#C9A96E] font-medium block flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Security Question: What is your favorite dog?</span>
              </label>
              <input
                type="text"
                value={dogAnswer}
                onChange={(e) => setDogAnswer(e.target.value)}
                placeholder="Enter dog breed or name"
                className="w-full bg-black/60 border border-white/15 focus:border-[#C9A96E] rounded px-4 py-2.5 text-sm text-[#F5F0EB] outline-none transition-colors"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || !recoveryEmail || !dogAnswer}
              className="w-full py-3 bg-[#D9534F] hover:bg-[#c9302c] text-white text-xs uppercase tracking-[0.2em] font-bold rounded transition-colors flex items-center justify-center space-x-2 disabled:opacity-40"
            >
              <Mail className="w-4 h-4" />
              <span>{loading ? "Verifying..." : "Verify Answer & Send Recovery Code"}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setFeedback(null);
                setMode("LOGIN");
              }}
              className="w-full text-center text-xs text-[#A09585] hover:text-[#C9A96E] transition-colors"
            >
              &larr; Back to standard login
            </button>
          </form>
        )}

        {/* ================================================================
            MODE C: EMERGENCY RECOVERY STEP 2 (ENTER OTP & NEW PASSWORD)
        ================================================================ */}
        {mode === "RECOVERY_RESET" && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="bg-black/40 border border-emerald-500/30 rounded p-4 text-xs text-[#E0D5C9] space-y-1.5">
              <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold uppercase tracking-wider text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Security Answer Verified</span>
              </div>
              <p className="text-[#A09585] leading-relaxed">
                A 6-digit recovery code was sent to <strong>{recoveryEmail}</strong>. Enter the code and your new password.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wider text-[#A09585] font-medium block">
                6-Digit Recovery Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={recoveryOtp}
                onChange={(e) => setRecoveryOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                className="w-full text-center tracking-[0.5em] text-xl font-mono bg-black/60 border border-white/15 focus:border-[#C9A96E] rounded px-4 py-2 text-[#F5F0EB] outline-none transition-colors"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wider text-[#A09585] font-medium block">
                New Master Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full bg-black/60 border border-white/15 focus:border-[#C9A96E] rounded px-4 py-2 text-sm text-[#F5F0EB] outline-none transition-colors"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wider text-[#A09585] font-medium block">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full bg-black/60 border border-white/15 focus:border-[#C9A96E] rounded px-4 py-2 text-sm text-[#F5F0EB] outline-none transition-colors"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || recoveryOtp.length !== 6 || !newPassword}
              className="w-full py-3 bg-[#C9A96E] hover:bg-[#b5955b] text-[#141414] text-xs uppercase tracking-[0.2em] font-bold rounded transition-colors flex items-center justify-center space-x-2 disabled:opacity-40"
            >
              <Lock className="w-4 h-4" />
              <span>{loading ? "Updating Master Credentials..." : "Reset Password & Unlock"}</span>
            </button>

            <button
              type="button"
              onClick={() => setMode("RECOVERY_QUESTION")}
              className="w-full text-center text-xs text-[#A09585] hover:text-[#C9A96E] transition-colors"
            >
              &larr; Back to security question
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
