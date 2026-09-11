"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { 
  Shield, 
  Crown, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Loader2,
  Lock,
  Mail,
  User,
  Phone,
  Store
} from "lucide-react";

interface InvitePageProps {
  params: Promise<{ token: string }>;
}

export default function ManagerInvitePage({ params }: InvitePageProps) {
  const resolvedParams = use(params);
  const token = resolvedParams.token;
  const router = useRouter();

  const [validating, setValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string>("Haute Couture Atelier");

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [joinedSuccess, setJoinedSuccess] = useState(false);

  useEffect(() => {
    async function checkToken() {
      if (!token) {
        setValidating(false);
        setErrorMessage("Missing invitation token.");
        return;
      }

      try {
        const res = await fetch(`/api/team/join?token=${encodeURIComponent(token)}`);
        const data = await res.json();

        if (res.ok && data.valid) {
          setIsValid(true);
          if (data.companyName) {
            setCompanyName(data.companyName);
          }
        } else {
          setIsValid(false);
          setErrorMessage(data.error || "This invitation link is invalid or has expired.");
        }
      } catch (err) {
        setIsValid(false);
        setErrorMessage("Failed to verify invitation link. Please check your connection.");
      } finally {
        setValidating(false);
      }
    }

    checkToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim() || !email.trim() || !phone.trim() || !password) {
      setFormError("All fields are required.");
      return;
    }

    if (password.length < 6) {
      setFormError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/team/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to accept invitation.");
      }

      setJoinedSuccess(true);
    } catch (err: any) {
      setFormError(err.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  if (validating) {
    return (
      <div className="min-h-screen bg-[#141414] text-[#F5F0EB] flex flex-col items-center justify-center p-6 font-body">
        <div className="w-16 h-16 rounded-full border border-[#C9A96E]/30 flex items-center justify-center animate-pulse mb-4">
          <Loader2 className="w-8 h-8 text-[#C9A96E] animate-spin" />
        </div>
        <p className="text-sm font-medium tracking-widest uppercase text-[#C9A96E]">
          Verifying Invitation Security...
        </p>
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className="min-h-screen bg-[#141414] text-[#F5F0EB] flex flex-col items-center justify-center p-6 font-body">
        <div className="max-w-md w-full bg-[#1A1A1A] border border-red-500/30 rounded-2xl p-8 shadow-2xl text-center">
          <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 mx-auto flex items-center justify-center mb-6">
            <AlertCircle className="w-7 h-7 text-red-400" />
          </div>
          <h1 className="font-brand text-xl font-bold tracking-wider uppercase text-[#F5F0EB] mb-3">
            Invitation Expired or Invalid
          </h1>
          <p className="text-xs text-[#E0D5C9]/70 leading-relaxed mb-8">
            {errorMessage || "This invitation link is no longer valid. Links expire after 7 days or after being used."}
          </p>
          <button
            onClick={() => router.push("/login")}
            className="w-full py-3.5 px-4 rounded-xl bg-[#C9A96E] text-[#1A1A1A] font-bold text-xs uppercase tracking-widest hover:bg-[#D8BA7F] transition-all shadow-lg cursor-pointer"
          >
            Return to Atelier Login
          </button>
        </div>
      </div>
    );
  }

  if (joinedSuccess) {
    return (
      <div className="min-h-screen bg-[#141414] text-[#F5F0EB] flex flex-col items-center justify-center p-6 font-body">
        <div className="max-w-md w-full bg-[#1A1A1A] border border-[#C9A96E]/40 rounded-2xl p-8 shadow-2xl text-center">
          <div className="w-16 h-16 rounded-full bg-[#C9A96E]/15 border border-[#C9A96E]/40 mx-auto flex items-center justify-center mb-6">
            <CheckCircle2 className="w-8 h-8 text-[#C9A96E]" />
          </div>
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#C9A96E] mb-1">
            Welcome to the Team
          </p>
          <h1 className="font-brand text-2xl font-bold tracking-wide uppercase text-[#F5F0EB] mb-3">
            Manager Access Granted
          </h1>
          <p className="text-xs text-[#E0D5C9]/70 leading-relaxed mb-8">
            Your store manager account for <span className="text-[#C9A96E] font-semibold">{companyName}</span> is now active. You can manage media collections, curate catalogues, and configure site branding.
          </p>
          <button
            onClick={() => router.push("/login")}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#C9A96E] to-[#B39358] text-[#1A1A1A] font-bold text-xs uppercase tracking-widest hover:brightness-110 transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Proceed to Login</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-[#F5F0EB] flex flex-col items-center justify-center p-4 sm:p-6 font-body relative overflow-hidden">
      {/* Subtle Atelier Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#C9A96E]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-lg w-full bg-[#1A1A1A]/95 backdrop-blur-xl border border-[#C9A96E]/30 rounded-2xl p-6 sm:p-10 shadow-2xl relative z-10">
        {/* Header Badge */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="px-3 py-1 rounded-full bg-[#C9A96E]/10 border border-[#C9A96E]/30 text-[10px] font-bold tracking-[0.25em] text-[#C9A96E] uppercase flex items-center gap-1.5">
            <Store className="w-3.5 h-3.5" />
            Official Team Invitation
          </span>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="font-brand text-2xl sm:text-3xl font-bold tracking-wider uppercase text-[#F5F0EB]">
            {companyName}
          </h1>
          <p className="text-xs text-[#E0D5C9]/70 mt-2 leading-relaxed">
            You have been invited to join the atelier management team as a <span className="text-[#C9A96E] font-semibold">Store Manager</span>. Create your credentials below.
          </p>
        </div>

        {/* Error Alert */}
        {formError && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{formError}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#E0D5C9]/80 font-medium mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#C9A96E]/60">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Adeyemi Adeleke"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#242424] border border-[#C9A96E]/20 text-xs text-[#F5F0EB] placeholder:text-[#E0D5C9]/30 focus:outline-none focus:border-[#C9A96E] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#E0D5C9]/80 font-medium mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#C9A96E]/60">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="manager@atelier.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#242424] border border-[#C9A96E]/20 text-xs text-[#F5F0EB] placeholder:text-[#E0D5C9]/30 focus:outline-none focus:border-[#C9A96E] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#E0D5C9]/80 font-medium mb-1.5">
              Phone Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#C9A96E]/60">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+234 800 000 0000"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#242424] border border-[#C9A96E]/20 text-xs text-[#F5F0EB] placeholder:text-[#E0D5C9]/30 focus:outline-none focus:border-[#C9A96E] transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#E0D5C9]/80 font-medium mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#C9A96E]/60">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#242424] border border-[#C9A96E]/20 text-xs text-[#F5F0EB] placeholder:text-[#E0D5C9]/30 focus:outline-none focus:border-[#C9A96E] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#E0D5C9]/80 font-medium mb-1.5">
                Confirm
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#C9A96E]/60">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#242424] border border-[#C9A96E]/20 text-xs text-[#F5F0EB] placeholder:text-[#E0D5C9]/30 focus:outline-none focus:border-[#C9A96E] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Privacy & Role Notice */}
          <div className="p-3 rounded-xl bg-[#242424]/60 border border-[#C9A96E]/10 text-[11px] text-[#E0D5C9]/60 leading-relaxed">
            <span className="font-semibold text-[#C9A96E]">Role Notice:</span> Store managers can upload catalogues and update landing configurations under the administrator's plan. Billing and subscription management are reserved exclusively for the atelier administrator.
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#C9A96E] to-[#B39358] text-[#1A1A1A] font-bold text-xs uppercase tracking-widest hover:brightness-110 active:scale-[0.99] transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#1A1A1A]" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Accept Invite & Join</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
