"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { signIn } from "next-auth/react";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Phone,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  Building2,
  Globe,
  CreditCard,
  Layers,
  Dumbbell,
  Scissors,
  ShoppingBag,
  Check,
  ChevronRight,
  SkipForward,
  AlertCircle,
  Loader2,
  Search,
  Upload,
  X,
} from "lucide-react";
import { api } from "../lib/utils/apiClient";
import { isReservedSubdomain } from "@/app/lib/constants/subdomains";

type OnboardingStep = "account" | "verify" | "plan" | "template" | "payout" | "success";

const NIGERIAN_BANKS = [
  "Access Bank",
  "Guaranty Trust Bank (GTBank)",
  "Zenith Bank",
  "First Bank of Nigeria",
  "United Bank for Africa (UBA)",
  "Kuda Microfinance Bank",
  "Sterling Bank",
  "Fidelity Bank",
  "Stanbic IBTC Bank",
  "Wema Bank / ALAT",
  "OPay / Paycom",
  "Moniepoint MFB",
];

export default function RegisterPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("account");

  // Step 1: Vital Account Data
  const [accountData, setAccountData] = useState({
    fullName: "",
    brandName: "",
    slug: "",
    industry: "FASHION_ATELIER",
    profileImage: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

  // Step 2: Verification Data
  const [otpCode, setOtpCode] = useState("");

  // Step 3: Optional Template Selection
  const [selectedTemplateSlug, setSelectedTemplateSlug] = useState<string>("fashion-store-tailor-v1");

  // Step 4: Optional Payout Account Data
  const [payoutData, setPayoutData] = useState({
    bankName: "Guaranty Trust Bank (GTBank)",
    bankCode: "058",
    accountNumber: "",
    accountName: "",
  });

  // Nigerian Banks directory and live resolution states
  const [banksList, setBanksList] = useState<Array<{ name: string; code: string }>>([
    { name: "OPay / Paycom", code: "999992" },
    { name: "PalmPay", code: "999991" },
    { name: "Moniepoint MFB", code: "50515" },
    { name: "Kuda Microfinance Bank", code: "50211" },
    { name: "Guaranty Trust Bank (GTBank)", code: "058" },
    { name: "Zenith Bank", code: "057" },
    { name: "Access Bank", code: "044" },
    { name: "First Bank of Nigeria", code: "011" },
    { name: "United Bank for Africa (UBA)", code: "033" },
    { name: "Sterling Bank", code: "232" },
    { name: "Fidelity Bank", code: "070" },
    { name: "Stanbic IBTC Bank", code: "221" },
    { name: "Wema Bank / ALAT", code: "035" },
    { name: "First City Monument Bank (FCMB)", code: "214" },
  ]);
  const [resolvingAccount, setResolvingAccount] = useState(false);
  const [resolvedAccountName, setResolvedAccountName] = useState<string | null>(null);
  const [isAccountConfirmed, setIsAccountConfirmed] = useState(false);

  // Form & UI States
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [createdCompany, setCreatedCompany] = useState<{ id: string; name: string; slug: string } | null>(null);
  const [navigating, setNavigating] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"STARTER" | "PROFESSIONAL">("STARTER");
  const [payingPlan, setPayingPlan] = useState(false);
  const [uploadingProfileImage, setUploadingProfileImage] = useState(false);
  const profileFileInputRef = useRef<HTMLInputElement>(null);

  // Profile Image upload handler
  const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Profile image must be less than 5MB.");
      return;
    }

    setUploadingProfileImage(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/registration/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Failed to upload profile image.");
      }

      setAccountData((prev) => ({ ...prev, profileImage: data.url }));
    } catch (err: unknown) {
      const errObj = err as { message?: string };
      setError(errObj?.message || "Failed to upload profile image. Please try again.");
    } finally {
      setUploadingProfileImage(false);
      if (profileFileInputRef.current) {
        profileFileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveProfileImage = () => {
    setAccountData((prev) => ({ ...prev, profileImage: "" }));
    if (profileFileInputRef.current) {
      profileFileInputRef.current.value = "";
    }
  };

  // Real-time store availability queried from SuperAdmin database
  const [storeAvailability, setStoreAvailability] = useState<
    Record<string, { isActive: boolean; comingSoon: boolean; name: string; templateSlug?: string }>
  >({
    FASHION_ATELIER: { isActive: true, comingSoon: false, name: "Fashion & Bespoke Tailor", templateSlug: "fashion-store-tailor-v1" },
    FITNESS_GYM: { isActive: true, comingSoon: false, name: "Fitness & Athletic Gym", templateSlug: "gym-store-fitness-v1" },
  });
  const [templateStatuses, setTemplateStatuses] = useState<Record<string, boolean>>({});

  // Smooth scroll ref to focus error directly on mobile
  const errorRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [error]);

  // Load real-time store availability from SuperAdmin database on mount
  useEffect(() => {
    api
      .get<{
        success: boolean;
        industries: Record<string, { isActive: boolean; comingSoon: boolean; name: string; templateSlug?: string }>;
        templates: Array<{ slug: string; isActive: boolean; comingSoon: boolean }>;
      }>("/api/registration/templates")
      .then((res) => {
        if (res.data?.industries) {
          setStoreAvailability(res.data.industries);

          // If current selection is disabled in Superadmin DB, automatically redirect selection to an active store
          if (
            res.data.industries.FITNESS_GYM?.isActive === false &&
            accountData.industry === "FITNESS_GYM"
          ) {
            setAccountData((prev) => ({ ...prev, industry: "FASHION_ATELIER" }));
            setSelectedTemplateSlug("fashion-store-tailor-v1");
          }
        }
        if (res.data?.templates && Array.isArray(res.data.templates)) {
          const tMap: Record<string, boolean> = {};
          res.data.templates.forEach((t) => {
            tMap[t.slug] = t.isActive !== false;
          });
          setTemplateStatuses(tMap);
        }
      })
      .catch(() => {});
  }, [accountData.industry]);

  // Load complete bank list on mount
  useEffect(() => {
    api.get("/api/bank/list").then((res) => {
      if (res.data?.banks && Array.isArray(res.data.banks)) {
        const seen = new Set<string>();
        const uniqueBanks = res.data.banks.filter((b: any) => {
          if (!b?.code || seen.has(b.code)) return false;
          seen.add(b.code);
          return true;
        });
        setBanksList(uniqueBanks);
      }
    }).catch(() => {});
  }, []);

  // Bank change handler
  const handleBankChange = (code: string) => {
    const selected = banksList.find((b) => b.code === code);
    setPayoutData((prev) => ({
      ...prev,
      bankCode: code,
      bankName: selected?.name || prev.bankName,
    }));
    setResolvedAccountName(null);
    setIsAccountConfirmed(false);
    setError(null);
  };

  // 10-Digit NUBAN resolution handler
  const handleAccountNumberChange = async (val: string) => {
    const cleaned = val.replace(/[^0-9]/g, "");
    setPayoutData((prev) => ({ ...prev, accountNumber: cleaned }));
    setResolvedAccountName(null);
    setIsAccountConfirmed(false);
    setError(null);

    if (cleaned.length === 10) {
      setResolvingAccount(true);
      try {
        const res = await api.post<{ success: boolean; accountName?: string; error?: string }>(
          "/api/bank/resolve",
          {
            accountNumber: cleaned,
            bankCode: payoutData.bankCode,
          }
        );
        if (res.data?.success && res.data.accountName) {
          setResolvedAccountName(res.data.accountName);
          setPayoutData((prev) => ({ ...prev, accountName: res.data.accountName || "" }));
        } else {
          setError(res.data?.error || "Could not resolve account details for this bank.");
        }
      } catch (err: unknown) {
        const axiosErr = err as { response?: { data?: { error?: string } }; message?: string };
        setError(axiosErr?.response?.data?.error || "Could not resolve account details. Please check your bank and account number.");
      } finally {
        setResolvingAccount(false);
      }
    }
  };

  // Auto-generate subdomain slug from Brand Name
  const handleBrandNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const brand = e.target.value;
    const generatedSlug = brand
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    setAccountData((prev) => ({
      ...prev,
      brandName: brand,
      slug: generatedSlug,
    }));

    if (isReservedSubdomain(brand) || isReservedSubdomain(generatedSlug)) {
      setError(`"${brand}" is a reserved system name. Please choose a different brand name.`);
    } else if (error && error.includes("reserved system name")) {
      setError(null);
    }
  };

  // Switch default template when industry changes with real-time SuperAdmin DB check
  const handleIndustryChange = async (industry: string) => {
    // 1. Check current local status
    const currentAvailability = storeAvailability[industry];
    if (currentAvailability && currentAvailability.isActive === false) {
      setError(
        `The ${currentAvailability.name || "selected"} store is currently coming soon. Please choose an active store (such as Fashion & Bespoke Tailor) to proceed.`
      );
      return;
    }

    // 2. Proactively re-verify live with SuperAdmin database
    try {
      const res = await api.get<{
        industries: Record<string, { isActive: boolean; comingSoon: boolean; name: string }>;
      }>("/api/registration/templates");

      const liveStatus = res.data?.industries?.[industry];
      if (liveStatus && liveStatus.isActive === false) {
        setStoreAvailability(res.data.industries);
        setError(
          `The ${liveStatus.name || "selected"} store is currently coming soon. Please choose an active store to proceed.`
        );
        return;
      }
    } catch {
      // Continue if offline check passes
    }

    setError(null);
    setAccountData((prev) => ({ ...prev, industry }));
    if (industry === "FITNESS_GYM") {
      setSelectedTemplateSlug("gym-store-fitness-v1");
    } else {
      setSelectedTemplateSlug("fashion-store-tailor-v1");
    }
  };

  // 1. Submit Vital Account Details (Step 1 -> Step 2)
  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    // Prevent submission if chosen store was disabled by SuperAdmin
    if (storeAvailability[accountData.industry]?.isActive === false) {
      setError(
        `The ${storeAvailability[accountData.industry]?.name || "selected"} store is currently coming soon. Please select an active store to continue.`
      );
      return;
    }

    if (accountData.password !== accountData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!accountData.agreeToTerms) {
      setError("You must agree to the Terms of Service.");
      return;
    }

    if (!accountData.brandName.trim()) {
      setError("Business / Brand Name is required.");
      return;
    }

    if (isReservedSubdomain(accountData.brandName) || isReservedSubdomain(accountData.slug)) {
      setError(`"${accountData.brandName}" is a reserved system name. Please choose a distinctive brand name.`);
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/api/registration", {
        name: accountData.fullName,
        brandName: accountData.brandName,
        email: accountData.email,
        phone: accountData.phone,
        password: accountData.password,
        industry: accountData.industry,
        profileImage: accountData.profileImage || null,
      });

      if (res.data?.requiresVerification) {
        setCurrentStep("verify");
        setSuccessMsg(
          res.data.message || "Account initiated! A 6-digit verification OTP code has been sent to your email."
        );
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } }; message?: string };
      setError(axiosErr?.response?.data?.error || axiosErr?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Submit OTP Code (Step 2 -> Step 3)
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
        email: accountData.email,
        otpCode,
      });

      if (res.data?.success) {
        setSuccessMsg("Email verified successfully! Choose your platform subscription plan.");
        // Auto-authenticate credentials in background so user has valid session token
        if (accountData.email && accountData.password) {
          signIn("credentials", {
            redirect: false,
            email: accountData.email,
            password: accountData.password,
          }).catch((err) => console.warn("Auto-login on OTP verify warning:", err));
        }
        setCurrentStep("plan");
      } else {
        throw new Error(res.data?.error || "Verification failed.");
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } }; message?: string };
      setError(axiosErr?.response?.data?.error || axiosErr?.message || "Invalid or expired OTP code.");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP Code
  const handleResendOtp = async () => {
    setResending(true);
    setError(null);
    try {
      await api.post("/api/auth/forgot-password", { email: accountData.email });
      setSuccessMsg("A new 6-digit verification code has been dispatched to your email.");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } }; message?: string };
      setError(axiosErr?.response?.data?.error || "Failed to resend code.");
    } finally {
      setResending(false);
    }
  };

  // Handle Plan Selection (Starter / Free Trial or Pro Trial)
  const handleSelectPlan = async (plan: "STARTER" | "PROFESSIONAL") => {
    setSelectedPlan(plan);
    setLoading(true);
    setError(null);
    try {
      await api.post("/api/payment/initialize", {
        planSelected: plan,
        trial: true,
        email: accountData.email,
      });
      setCurrentStep("template");
    } catch {
      // Even if user record is still pending onboarding finalization, advance smoothly
      // as /api/registration/complete persists planSelected upon final step
      setCurrentStep("template");
    } finally {
      setLoading(false);
    }
  };

  // Handle Direct Paystack Payment for Professional Plan
  const handlePayForPro = async () => {
    setSelectedPlan("PROFESSIONAL");
    setPayingPlan(true);
    setError(null);

    try {
      const res = await api.post<{
        success: boolean;
        authorization_url: string;
        reference: string;
      }>("/api/payment/initialize", {
        planSelected: "PROFESSIONAL",
        email: accountData.email,
        callbackUrl: `${window.location.origin}/dashboard/${createdCompany?.id || "1"}/payment/callback`,
      });

      if (res.data?.success && res.data.authorization_url) {
        window.location.href = res.data.authorization_url;
      } else {
        throw new Error("Invalid payment authorization URL returned.");
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string; error?: string } }; message?: string };
      setError(axiosErr?.response?.data?.message || axiosErr?.response?.data?.error || "Failed to initialize Paystack payment.");
    } finally {
      setPayingPlan(false);
    }
  };

  // 3. Finalize Onboarding & Create Multi-Tenant Company
  const completeOnboarding = async (skipPayout: boolean = false) => {
    setError(null);
    setLoading(true);

    try {
      const payload = {
        email: accountData.email,
        brandName: accountData.brandName,
        slug: accountData.slug,
        industry: accountData.industry,
        templateSlug: selectedTemplateSlug,
        planSelected: selectedPlan,
        profileImage: accountData.profileImage || null,
        bankInfo:
          !skipPayout && payoutData.accountNumber.length === 10
            ? {
                bankName: payoutData.bankName,
                accountNumber: payoutData.accountNumber,
                accountName: payoutData.accountName || accountData.brandName,
              }
            : null,
      };

      const res = await api.post<{
        success: boolean;
        company: { id: string; name: string; slug: string };
      }>("/api/registration/complete", payload);

      if (res.data?.success && res.data.company) {
        setCreatedCompany(res.data.company);

        // Auto-authenticate merchant session with newly created company & role context
        if (accountData.email && accountData.password) {
          try {
            await signIn("credentials", {
              redirect: false,
              email: accountData.email,
              password: accountData.password,
            });
          } catch (authErr) {
            console.warn("Auto-login during registration warning:", authErr);
          }
        }

        setCurrentStep("success");
      } else {
        throw new Error("Failed to finalize store creation.");
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } }; message?: string };
      setError(axiosErr?.response?.data?.error || "Error finalizing onboarding.");
    } finally {
      setLoading(false);
    }
  };

  // 4. Smooth Navigation into Manager Dashboard (Guarantees fresh cookies & avoids closed stream aborts)
  const handleEnterDashboard = async () => {
    if (!createdCompany) {
      window.location.href = "/login";
      return;
    }

    setNavigating(true);

    // Fallback assurance that session cookie is issued before route transition
    if (accountData.email && accountData.password) {
      try {
        await signIn("credentials", {
          redirect: false,
          email: accountData.email,
          password: accountData.password,
        });
      } catch (authErr) {
        console.warn("Pre-navigation sign-in warning:", authErr);
      }
    }

    // Top-level document navigation cleanly passes authjs cookies to server components
    window.location.href = `/dashboard/${createdCompany.id}`;
  };

  // Template cards strictly isolated per brand vertical
  const templateOptions = useMemo(() => {
    if (accountData.industry === "FITNESS_GYM") {
      return [
        {
          slug: "gym-store-fitness-v1",
          name: "IronCore Athletic Performance",
          badge: "Original Gym Theme",
          vibe: "Industrial Obsidian & Electric Lime",
          desc: "High-energy membership cards, class schedules, coach profiles, and WhatsApp booking concierge.",
          thumbnail: "/bg-img/showcase2.jpeg",
        },
      ];
    }

    // Default: Tailor Brand Vertical
    return [
      {
        slug: "fashion-store-tailor-v1",
        name: "Atelier Haute Couture",
        badge: "Original Tailor Theme",
        vibe: "Royal Luxury & Imperial Gold",
        desc: "Cinematic GSAP storytelling, bespoke lookbook catalog, measurement profiles, and WhatsApp concierge.",
        thumbnail: "/bg-img/showcase1.jpg",
      },
    ];
  }, [accountData.industry]);

  return (
    <main className="min-h-screen bg-[#111114] flex text-[#F5F0EB]">
      {/* Left Panel: Brand & Stepper Progress */}
      <div className="hidden lg:flex lg:w-5/12 relative bg-black overflow-hidden flex-col justify-between p-12 xl:p-16 border-r border-zinc-800">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity scale-105"
          style={{ backgroundImage: "url('/bg-img/native2.jpeg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/90" />

        {/* Top Logo */}
        <div className="relative z-10">
          <Link href="/" className="inline-block">
            <span className="font-brand text-2xl tracking-[0.3em] text-[var(--color-accent,#C9A96E)] uppercase font-bold">
              CIMESSINVEST
            </span>
          </Link>
          <p className="text-xs text-zinc-400 mt-1 uppercase tracking-widest">
            Multi-Tenant Enterprise Commerce
          </p>
        </div>

        {/* Dynamic Stepper Visualizer */}
        <div className="relative z-10 space-y-6">
          <span className="text-[11px] uppercase tracking-[0.3em] text-[var(--color-accent,#C9A96E)] font-bold block">
            Merchant Onboarding Flow
          </span>

          <div className="space-y-4">
            {/* Step 1 */}
            <div className="flex items-center gap-4">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-colors ${
                  currentStep === "account"
                    ? "bg-[var(--color-accent,#C9A96E)] text-black border-[var(--color-accent,#C9A96E)] shadow-lg"
                    : "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                }`}
              >
                {currentStep === "account" ? "1" : <Check className="w-4 h-4" />}
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">1. Account & Brand</h4>
                <p className="text-[11px] text-zinc-400">Owner contact & subdomain handle (Vital)</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-center gap-4">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-colors ${
                  currentStep === "verify"
                    ? "bg-[var(--color-accent,#C9A96E)] text-black border-[var(--color-accent,#C9A96E)]"
                    : currentStep === "account"
                    ? "bg-zinc-900 text-zinc-500 border-zinc-800"
                    : "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                }`}
              >
                {currentStep === "account" || currentStep === "verify" ? "2" : <Check className="w-4 h-4" />}
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">2. Email OTP Verification</h4>
                <p className="text-[11px] text-zinc-400">Security authorization code (Vital)</p>
              </div>
            </div>

            {/* Step 3: Plan Selection */}
            <div className="flex items-center gap-4">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-colors ${
                  currentStep === "plan"
                    ? "bg-[var(--color-accent,#C9A96E)] text-black border-[var(--color-accent,#C9A96E)]"
                    : currentStep === "account" || currentStep === "verify"
                    ? "bg-zinc-900 text-zinc-500 border-zinc-800"
                    : "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                }`}
              >
                {currentStep === "account" || currentStep === "verify" || currentStep === "plan" ? "3" : <Check className="w-4 h-4" />}
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">3. Platform Plan & Tier</h4>
                <p className="text-[11px] text-zinc-400">Starter or Professional (14-day trial)</p>
              </div>
            </div>

            {/* Step 4: Storefront Template */}
            <div className="flex items-center gap-4">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-colors ${
                  currentStep === "template"
                    ? "bg-[var(--color-accent,#C9A96E)] text-black border-[var(--color-accent,#C9A96E)]"
                    : currentStep === "payout" || currentStep === "success"
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                    : "bg-zinc-900 text-zinc-500 border-zinc-800"
                }`}
              >
                {currentStep === "payout" || currentStep === "success" ? <Check className="w-4 h-4" /> : "4"}
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">4. Storefront Template</h4>
                <p className="text-[11px] text-zinc-400">Starting theme & vibe (Optional — skippable)</p>
              </div>
            </div>

            {/* Step 5: Payout Subaccount */}
            <div className="flex items-center gap-4">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-colors ${
                  currentStep === "payout"
                    ? "bg-[var(--color-accent,#C9A96E)] text-black border-[var(--color-accent,#C9A96E)]"
                    : currentStep === "success"
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                    : "bg-zinc-900 text-zinc-500 border-zinc-800"
                }`}
              >
                {currentStep === "success" ? <Check className="w-4 h-4" /> : "5"}
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">5. Payout Subaccount</h4>
                <p className="text-[11px] text-zinc-400">Bank details for Paystack splits (Optional)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-[11px] text-zinc-400 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[var(--color-accent,#C9A96E)]" />
          <span>Includes 14-Day Unlimited Free Trial on all plans.</span>
        </div>
      </div>

      {/* Right Panel: Interactive Step Content */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-6 sm:p-10 lg:p-16 overflow-y-auto">
        <div className="w-full max-w-xl space-y-6">
          {/* Mobile Brand Logo */}
          <div className="lg:hidden text-center">
            <Link href="/">
              <span className="font-brand text-xl tracking-[0.3em] text-[var(--color-accent,#C9A96E)] uppercase font-bold">
                CIMESSINVEST
              </span>
            </Link>
          </div>

          {/* Global Success Alert */}
          {successMsg && (
            <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs rounded-lg flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ============================================================= */}
          {/* STEP 1: VITAL ACCOUNT & BRAND DETAILS                         */}
          {/* ============================================================= */}
          {currentStep === "account" && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--color-accent,#C9A96E)]/10 text-[var(--color-accent,#C9A96E)] rounded-full text-[10px] font-bold uppercase tracking-widest mb-3">
                  <span>Step 1 of 5: Vital Info</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Launch Your Storefront
                </h1>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1 font-light">
                  Set up your business credentials and unique shop subdomain.
                </p>
              </div>

              <form onSubmit={handleAccountSubmit} className="space-y-4">
                {/* Industry Category Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300 block">
                    Choose Your Industry
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleIndustryChange("FASHION_ATELIER")}
                      className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all relative overflow-hidden ${
                        storeAvailability.FASHION_ATELIER?.comingSoon
                          ? "bg-[#18181D]/40 border-dashed border-zinc-800 text-zinc-500 hover:border-amber-500/40"
                          : accountData.industry === "FASHION_ATELIER"
                          ? "bg-[var(--color-accent,#C9A96E)]/10 border-[var(--color-accent,#C9A96E)] shadow-lg text-white"
                          : "bg-[#18181D] border-zinc-800 text-zinc-400 hover:border-zinc-700"
                      }`}
                    >
                      {storeAvailability.FASHION_ATELIER?.comingSoon && (
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[9px] font-bold uppercase tracking-wider">
                          Coming Soon
                        </div>
                      )}
                      <Scissors className="w-5 h-5 text-[var(--color-accent,#C9A96E)] shrink-0 mt-0.5" />
                      <div>
                        <h5 className="text-xs font-bold uppercase text-white">Fashion & Bespoke Tailor</h5>
                        <p className="text-[11px] text-zinc-400 mt-0.5">
                          Native wear, tailoring lookbooks, Agbada & measurements.
                        </p>
                        {storeAvailability.FASHION_ATELIER?.comingSoon && (
                          <p className="text-[10px] text-amber-400/90 mt-1 font-medium">
                            Currently in development · Coming Soon
                          </p>
                        )}
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleIndustryChange("FITNESS_GYM")}
                      className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all relative overflow-hidden ${
                        storeAvailability.FITNESS_GYM?.comingSoon
                          ? "bg-[#18181D]/40 border-dashed border-zinc-800 text-zinc-500 hover:border-amber-500/40"
                          : accountData.industry === "FITNESS_GYM"
                          ? "bg-[#CCFF00]/10 border-[#CCFF00] shadow-lg text-white"
                          : "bg-[#18181D] border-zinc-800 text-zinc-400 hover:border-zinc-700"
                      }`}
                    >
                      {storeAvailability.FITNESS_GYM?.comingSoon && (
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[9px] font-bold uppercase tracking-wider">
                          Coming Soon
                        </div>
                      )}
                      <Dumbbell className={`w-5 h-5 shrink-0 mt-0.5 ${storeAvailability.FITNESS_GYM?.comingSoon ? "text-amber-400" : "text-[#CCFF00]"}`} />
                      <div>
                        <h5 className="text-xs font-bold uppercase text-white">Fitness & Athletic Gym</h5>
                        <p className="text-[11px] text-zinc-400 mt-0.5">
                          Membership tiers, workout programs, equipment & coaching.
                        </p>
                        {storeAvailability.FITNESS_GYM?.comingSoon && (
                          <p className="text-[10px] text-amber-400/90 mt-1 font-medium">
                            Currently in development · Coming Soon
                          </p>
                        )}
                      </div>
                    </button>
                  </div>
                </div>

                {/* Brand Name & Subdomain Handle */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-zinc-300">Brand / Business Name</label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Adeleke Bespoke"
                        value={accountData.brandName}
                        onChange={handleBrandNameChange}
                        className="w-full pl-9 pr-3 py-2.5 bg-[#18181D] border border-zinc-800 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[var(--color-accent,#C9A96E)] transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-zinc-300">Subdomain Handle</label>
                    <div className="relative">
                      <Globe className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        placeholder="adeleke-bespoke"
                        value={accountData.slug}
                        onChange={(e) => setAccountData((prev) => ({ ...prev, slug: e.target.value }))}
                        className="w-full pl-9 pr-3 py-2.5 bg-[#18181D] border border-zinc-800 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[var(--color-accent,#C9A96E)] transition-colors"
                      />
                    </div>
                    <span className="text-[10px] text-zinc-500 block">
                      Preview: {accountData.slug || "your-brand"}.cimessinvest.com
                    </span>
                    {(isReservedSubdomain(accountData.brandName) || isReservedSubdomain(accountData.slug)) && (
                      <span className="text-[10px] text-amber-400 block font-semibold mt-0.5">
                        ⚠️ &quot;{accountData.brandName || accountData.slug}&quot; is reserved by the platform.
                      </span>
                    )}
                  </div>
                </div>

                {/* Brand Profile Image / Logo Upload */}
                <div className="p-4 rounded-xl border border-zinc-800 bg-[#141417] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300 block">
                        Brand Profile Image / Logo
                      </label>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Featured at the top of your merchant dashboard and in your store header.
                      </p>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-zinc-500 bg-zinc-800/80 px-2 py-0.5 rounded border border-zinc-700/60">
                      Optional
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Avatar Preview */}
                    <div className="relative group shrink-0">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-[var(--color-accent,#C9A96E)]/60 overflow-hidden bg-black/60 shadow-md flex items-center justify-center">
                        <img
                          src={accountData.profileImage || "/bg-img/native10.jpg"}
                          alt="Brand Logo"
                          className="w-full h-full object-cover rounded-full"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = "/bg-img/native10.jpg";
                          }}
                        />
                      </div>
                      {accountData.profileImage && (
                        <button
                          type="button"
                          onClick={handleRemoveProfileImage}
                          className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-md"
                          title="Remove custom image"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {/* Upload Buttons & Status */}
                    <div className="flex-1 space-y-2">
                      <input
                        ref={profileFileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        onChange={handleProfileImageChange}
                        className="hidden"
                        id="profile-image-upload"
                      />
                      <div className="flex flex-wrap items-center gap-2">
                        <label
                          htmlFor="profile-image-upload"
                          className={`px-3.5 py-2 text-xs font-medium rounded-lg border transition-all cursor-pointer inline-flex items-center gap-2 ${
                            uploadingProfileImage
                              ? "bg-zinc-800/50 border-zinc-700 text-zinc-400 cursor-not-allowed pointer-events-none"
                              : "bg-[var(--color-accent,#C9A96E)]/10 border-[var(--color-accent,#C9A96E)]/40 text-[var(--color-accent,#C9A96E)] hover:bg-[var(--color-accent,#C9A96E)]/20 hover:border-[var(--color-accent,#C9A96E)]"
                          }`}
                        >
                          {uploadingProfileImage ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Uploading image...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-3.5 h-3.5" />
                              <span>{accountData.profileImage ? "Change Image" : "Upload Profile Image"}</span>
                            </>
                          )}
                        </label>
                        {accountData.profileImage && (
                          <span className="text-[11px] text-emerald-400 font-medium inline-flex items-center gap-1">
                            <Check className="w-3 h-3" /> Custom image attached
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-zinc-500">
                        PNG, JPG, or WEBP up to 5MB. Defaults to classic template avatar if skipped.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Full Name & WhatsApp Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-zinc-300">Contact / Owner Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        placeholder="Full Name"
                        value={accountData.fullName}
                        onChange={(e) => setAccountData((prev) => ({ ...prev, fullName: e.target.value }))}
                        className="w-full pl-9 pr-3 py-2.5 bg-[#18181D] border border-zinc-800 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[var(--color-accent,#C9A96E)] transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-zinc-300">WhatsApp Phone Number</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                      <input
                        type="tel"
                        required
                        placeholder="+2348000000000"
                        value={accountData.phone}
                        onChange={(e) => setAccountData((prev) => ({ ...prev, phone: e.target.value }))}
                        className="w-full pl-9 pr-3 py-2.5 bg-[#18181D] border border-zinc-800 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[var(--color-accent,#C9A96E)] transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300">Business Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="merchant@yourdomain.com"
                      value={accountData.email}
                      onChange={(e) => setAccountData((prev) => ({ ...prev, email: e.target.value }))}
                      className="w-full pl-9 pr-3 py-2.5 bg-[#18181D] border border-zinc-800 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[var(--color-accent,#C9A96E)] transition-colors"
                    />
                  </div>
                </div>

                {/* Password & Confirm Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-zinc-300">Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="••••••••"
                        value={accountData.password}
                        onChange={(e) => setAccountData((prev) => ({ ...prev, password: e.target.value }))}
                        className="w-full pl-9 pr-9 py-2.5 bg-[#18181D] border border-zinc-800 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[var(--color-accent,#C9A96E)] transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-zinc-500 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-zinc-300">Confirm Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="••••••••"
                        value={accountData.confirmPassword}
                        onChange={(e) => setAccountData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                        className="w-full pl-9 pr-3 py-2.5 bg-[#18181D] border border-zinc-800 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[var(--color-accent,#C9A96E)] transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Terms Checkbox */}
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="terms"
                    required
                    checked={accountData.agreeToTerms}
                    onChange={(e) => setAccountData((prev) => ({ ...prev, agreeToTerms: e.target.checked }))}
                    className="w-4 h-4 rounded border-zinc-700 text-[var(--color-accent,#C9A96E)] focus:ring-0 bg-[#18181D]"
                  />
                  <label htmlFor="terms" className="text-xs text-zinc-400 font-light">
                    I agree to the{" "}
                    <Link href="/terms" className="text-[var(--color-accent,#C9A96E)] underline">
                      Terms of Service
                    </Link>{" "}
                    and Privacy Policy.
                  </label>
                </div>

                {/* Contextual Error Alert right above Submit Button */}
                {error && (
                  <div
                    ref={errorRef}
                    className="p-3.5 bg-red-950/60 border border-red-500/50 text-red-300 text-xs rounded-xl flex items-start gap-2.5 animate-fadeIn shadow-lg shadow-red-950/20"
                  >
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed font-medium">{error}</span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-[var(--color-accent,#C9A96E)] hover:bg-[#F5F0EB] text-[#1A1A1A] font-bold text-xs uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 transition-all shadow-xl disabled:opacity-50"
                >
                  {loading ? "Initiating Account..." : "Continue to Email Verification"}
                  <ArrowRight className="w-4 h-4" />
                </button>

                <p className="text-center text-xs text-zinc-500 pt-2">
                  Already have an account?{" "}
                  <Link href="/login" className="text-[var(--color-accent,#C9A96E)] hover:underline font-semibold">
                    Sign in here
                  </Link>
                </p>
              </form>
            </div>
          )}

          {/* ============================================================= */}
          {/* STEP 2: EMAIL OTP VERIFICATION                               */}
          {/* ============================================================= */}
          {currentStep === "verify" && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-bold uppercase tracking-widest mb-3">
                  <span>Step 2 of 5: Security Verification</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Verify Your Email
                </h1>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1 font-light">
                  We sent a 6-digit confirmation code to{" "}
                  <span className="text-white font-medium">{accountData.email}</span>.
                </p>
              </div>

              <form onSubmit={handleVerifyOtpSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-300">Enter 6-Digit OTP Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    placeholder="123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ""))}
                    className="w-full text-center text-2xl font-mono tracking-[0.5em] py-3.5 bg-[#18181D] border border-zinc-800 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-[var(--color-accent,#C9A96E)] transition-colors"
                  />
                </div>

                {/* Contextual Error Alert right above OTP Confirm Button */}
                {error && (
                  <div
                    ref={errorRef}
                    className="p-3.5 bg-red-950/60 border border-red-500/50 text-red-300 text-xs rounded-xl flex items-start gap-2.5 animate-fadeIn shadow-lg shadow-red-950/20"
                  >
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed font-medium">{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || otpCode.length !== 6}
                  className="w-full py-3.5 bg-[var(--color-accent,#C9A96E)] hover:bg-[#F5F0EB] text-[#1A1A1A] font-bold text-xs uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 transition-all shadow-xl disabled:opacity-50"
                >
                  {loading ? "Verifying Code..." : "Confirm & Proceed"}
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex items-center justify-between text-xs text-zinc-400 pt-2 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setCurrentStep("account")}
                    className="text-zinc-500 hover:text-white"
                  >
                    Edit account details
                  </button>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resending}
                    className="text-[var(--color-accent,#C9A96E)] hover:underline font-medium inline-flex items-center gap-1"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${resending ? "animate-spin" : ""}`} />
                    <span>Resend Code</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ============================================================= */}
          {/* STEP 3: PLATFORM PLAN & TIER SELECTION                        */}
          {/* ============================================================= */}
          {currentStep === "plan" && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--color-accent,#C9A96E)]/10 text-[var(--color-accent,#C9A96E)] rounded-full text-[10px] font-bold uppercase tracking-widest mb-3">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Step 3 of 5: Platform Tier</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Select Your Plan
                </h1>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1 font-light">
                  Choose your platform subscription tier. Every plan includes a 14-day unlimited free trial.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Starter Plan Card */}
                <div
                  onClick={() => setSelectedPlan("STARTER")}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                    selectedPlan === "STARTER"
                      ? "bg-[#18181D] border-[var(--color-accent,#C9A96E)] ring-1 ring-[var(--color-accent,#C9A96E)] shadow-xl shadow-[var(--color-accent,#C9A96E)]/5"
                      : "bg-[#18181D]/60 border-zinc-800 hover:border-zinc-700"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase font-bold tracking-wider text-zinc-300">Starter Tier</span>
                      {selectedPlan === "STARTER" && (
                        <span className="w-5 h-5 rounded-full bg-[var(--color-accent,#C9A96E)] text-[#1A1A1A] flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="text-2xl font-extrabold text-white">₦2,000</span>
                      <span className="text-xs text-zinc-400"> /month</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed font-light">
                      Perfect for bespoke artisans and emerging creators launching single-store presence.
                    </p>

                    <ul className="space-y-2 pt-2 border-t border-zinc-800 text-[11px] text-zinc-300">
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-[var(--color-accent,#C9A96E)] shrink-0" />
                        <span>1 Admin Owner Seat</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-[var(--color-accent,#C9A96E)] shrink-0" />
                        <span>500 MB High-Speed Media Storage</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-[var(--color-accent,#C9A96E)] shrink-0" />
                        <span>Unlimited WhatsApp Direct Checkout</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-[var(--color-accent,#C9A96E)] shrink-0" />
                        <span>Standard Traffic (2,000 visits/mo)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="text-emerald-300 font-medium">14-Day Free Trial Included</span>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-5 mt-4 border-t border-zinc-800">
                    <button
                      type="button"
                      disabled={loading}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectPlan("STARTER");
                      }}
                      className={`w-full py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                        selectedPlan === "STARTER"
                          ? "bg-[var(--color-accent,#C9A96E)] text-[#1A1A1A] hover:bg-[#F5F0EB]"
                          : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                      }`}
                    >
                      <span>Continue with Starter</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Professional Plan Card */}
                <div
                  onClick={() => setSelectedPlan("PROFESSIONAL")}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between relative overflow-hidden ${
                    selectedPlan === "PROFESSIONAL"
                      ? "bg-[#18181D] border-amber-400 ring-1 ring-amber-400 shadow-xl shadow-amber-400/10"
                      : "bg-[#18181D]/60 border-zinc-800 hover:border-zinc-700"
                  }`}
                >
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500/20 to-transparent px-3 py-1 text-[9px] uppercase font-bold tracking-widest text-amber-300 rounded-bl-xl border-l border-b border-amber-500/30">
                    Recommended
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase font-bold tracking-wider text-amber-300">Professional</span>
                      {selectedPlan === "PROFESSIONAL" && (
                        <span className="w-5 h-5 rounded-full bg-amber-400 text-[#1A1A1A] flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="text-2xl font-extrabold text-white">₦10,000</span>
                      <span className="text-xs text-zinc-400"> /month</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed font-light">
                      High-performance atelier suite with team collaboration, AI copywriter, and settlement.
                    </p>

                    <ul className="space-y-2 pt-2 border-t border-zinc-800 text-[11px] text-zinc-300">
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>Up to 5 Team Members (1 Admin + 4 Managers)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>2 GB High-Speed Media Storage</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>AI Copywriter Access (10 Credits)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>Automated Paystack Split Settlement</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>15,000 Monthly Storefront Visits</span>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-5 mt-4 border-t border-zinc-800 space-y-2">
                    {/* Direct Pay with Paystack button */}
                    <button
                      type="button"
                      disabled={payingPlan || loading}
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePayForPro();
                      }}
                      className="w-full py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-bold text-xs uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {payingPlan ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Opening Paystack...</span>
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Pay ₦10,000 with Paystack</span>
                        </>
                      )}
                    </button>

                    {/* Or continue with 14-day Pro trial */}
                    <button
                      type="button"
                      disabled={loading || payingPlan}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectPlan("PROFESSIONAL");
                      }}
                      className="w-full py-2 bg-transparent hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-[11px] font-medium rounded-lg transition-all"
                    >
                      <span>Or start with 14-day Pro Trial (Pay Later)</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Contextual Error Alert right above navigation */}
              {error && (
                <div
                  ref={errorRef}
                  className="p-3.5 bg-red-950/60 border border-red-500/50 text-red-300 text-xs rounded-xl flex items-start gap-2.5 animate-fadeIn shadow-lg shadow-red-950/20"
                >
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed font-medium">{error}</span>
                </div>
              )}

              {/* Clear notice regarding Custom Enterprise Tier */}
              <div className="p-3.5 bg-zinc-900/60 rounded-xl border border-zinc-800 text-[11px] text-zinc-400 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[var(--color-accent,#C9A96E)] shrink-0 mt-0.5" />
                <span>
                  Need custom enterprise quotas, bespoke API limits, or multi-branch management? Contact our concierge team after setup to add custom quotes.
                </span>
              </div>
            </div>
          )}

          {/* ============================================================= */}
          {/* STEP 4: OPTIONAL TEMPLATE SELECTION (CAN SKIP)                */}
          {/* ============================================================= */}
          {currentStep === "template" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-[10px] font-bold uppercase tracking-widest mb-3">
                    <span>Step 4 of 5: Storefront Look</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    Choose Storefront Layout
                  </h1>
                  <p className="text-xs text-zinc-400 mt-1 font-light">
                    Pick your starting theme or skip to default (change anytime in dashboard).
                  </p>
                </div>
              </div>

              {/* Template Options Grid */}
              <div className="space-y-4">
                {templateOptions.map((tpl) => {
                  const isAvailable = templateStatuses[tpl.slug] !== false;
                  const isSelected = selectedTemplateSlug === tpl.slug && isAvailable;

                  return (
                    <div
                      key={tpl.slug}
                      onClick={() => {
                        if (!isAvailable) {
                          setError(`The ${tpl.name} template is currently coming soon. Please choose an active storefront template.`);
                          return;
                        }
                        setError(null);
                        setSelectedTemplateSlug(tpl.slug);
                      }}
                      className={`relative rounded-2xl p-5 border transition-all flex flex-col sm:flex-row gap-5 items-center ${
                        !isAvailable
                          ? "bg-[#141418]/50 border-dashed border-zinc-800 opacity-60 cursor-not-allowed"
                          : isSelected
                          ? "bg-[#1C1C22] border-[var(--color-accent,#C9A96E)] shadow-xl shadow-[var(--color-accent,#C9A96E)]/10 cursor-pointer"
                          : "bg-[#141418] border-zinc-800 hover:border-zinc-700 cursor-pointer"
                      }`}
                    >
                      <div className="relative aspect-[16/10] w-full sm:w-44 rounded-xl overflow-hidden bg-black shrink-0">
                        <Image
                          src={tpl.thumbnail}
                          alt={tpl.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="flex-1 space-y-2 text-left w-full">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--color-accent,#C9A96E)]/15 text-[var(--color-accent,#C9A96E)]">
                              {tpl.badge}
                            </span>
                            {!isAvailable && (
                              <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                Coming Soon
                              </span>
                            )}
                          </div>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-[var(--color-accent,#C9A96E)] flex items-center justify-center text-black">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          )}
                        </div>
                        <h4 className="text-base font-bold text-white">{tpl.name}</h4>
                        <p className="text-xs text-zinc-400 font-light">{tpl.desc}</p>
                        {!isAvailable && (
                          <p className="text-[10px] text-amber-400 font-medium">
                            Currently disabled by SuperAdmin · Coming Soon
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Navigation Action Buttons: Select vs. Skip */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setCurrentStep("payout")}
                  className="flex-1 py-3.5 bg-[var(--color-accent,#C9A96E)] text-[#1A1A1A] font-bold text-xs uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 hover:bg-[#F5F0EB] transition-all"
                >
                  <span>Continue with Theme</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentStep("payout")}
                  className="py-3.5 px-6 bg-[#18181D] hover:bg-zinc-800 text-zinc-300 font-semibold text-xs uppercase tracking-widest rounded-lg flex items-center justify-center gap-1.5 transition-all border border-zinc-800"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                  <span>Skip for Now</span>
                </button>
              </div>
            </div>
          )}

          {/* ============================================================= */}
          {/* STEP 5: OPTIONAL PAYOUT SUBACCOUNT (CAN SKIP)                 */}
          {/* ============================================================= */}
          {currentStep === "payout" && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-400 rounded-full text-[10px] font-bold uppercase tracking-widest mb-3">
                  <span>Step 5 of 5: Optional Payout Setup</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Automated Split Payouts
                </h1>
                <p className="text-xs text-zinc-400 mt-1 font-light">
                  Add your Nigerian bank account to receive customer order payouts directly via Paystack.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300">Select Bank or Fintech</label>
                  <select
                    value={payoutData.bankCode}
                    onChange={(e) => handleBankChange(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#18181D] border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-[var(--color-accent,#C9A96E)]"
                  >
                    {banksList.map((bank, idx) => (
                      <option key={`${bank.code}-${idx}`} value={bank.code}>
                        {bank.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-zinc-300">10-Digit NUBAN Account Number</label>
                    {resolvingAccount && (
                      <span className="text-[11px] text-[var(--color-accent,#C9A96E)] flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Resolving name with NIBSS...</span>
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    maxLength={10}
                    placeholder="0123456789"
                    value={payoutData.accountNumber}
                    onChange={(e) => handleAccountNumberChange(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#18181D] border border-zinc-800 rounded-lg text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[var(--color-accent,#C9A96E)] font-mono text-sm tracking-wider"
                  />
                </div>

                {/* Explicit Account Confirmation Card */}
                {resolvedAccountName && !isAccountConfirmed && (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 space-y-3 animate-fadeIn">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Please Confirm Account Ownership</span>
                    </div>
                    <div className="p-3 bg-black/40 rounded-lg border border-amber-500/20">
                      <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Resolved Account Name</span>
                      <span className="text-sm font-bold text-white font-mono block mt-0.5">{resolvedAccountName}</span>
                      <span className="text-[11px] text-zinc-400 mt-1 block">
                        {payoutData.bankName} • {payoutData.accountNumber}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsAccountConfirmed(true)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 shadow-md"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Yes, Confirm & Link</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setResolvedAccountName(null);
                          setPayoutData((prev) => ({ ...prev, accountNumber: "", accountName: "" }));
                        }}
                        className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded-lg transition-all"
                      >
                        Change
                      </button>
                    </div>
                  </div>
                )}

                {/* Verified State Badge */}
                {isAccountConfirmed && (
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between animate-fadeIn">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-white block">{resolvedAccountName}</span>
                        <span className="text-[11px] text-zinc-400">
                          {payoutData.bankName} • {payoutData.accountNumber} • Verified
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAccountConfirmed(false)}
                      className="text-[11px] text-zinc-400 hover:text-white underline cursor-pointer"
                    >
                      Change
                    </button>
                  </div>
                )}

                {/* Quick Skip Notification Callout */}
                <div className="p-4 bg-zinc-900/60 rounded-xl border border-zinc-800 flex items-start gap-3">
                  <CreditCard className="w-5 h-5 text-[var(--color-accent,#C9A96E)] shrink-0 mt-0.5" />
                  <p className="text-[11px] text-zinc-400 font-light leading-relaxed">
                    You don't have a business bank account yet. You can skip this step and configure your payout credentials anytime inside your Manager Dashboard.
                  </p>
                </div>
              </div>

              {/* Contextual Error Alert right above Action Buttons */}
              {error && (
                <div
                  ref={errorRef}
                  className="p-3.5 bg-red-950/60 border border-red-500/50 text-red-300 text-xs rounded-xl flex items-start gap-2.5 animate-fadeIn shadow-lg shadow-red-950/20"
                >
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed font-medium">{error}</span>
                </div>
              )}

              {/* Action Buttons: Save & Launch vs. Skip to Launch */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  disabled={loading || (payoutData.accountNumber.length > 0 && !isAccountConfirmed)}
                  onClick={() => completeOnboarding(false)}
                  className="flex-1 py-3.5 bg-[var(--color-accent,#C9A96E)] text-[#1A1A1A] font-bold text-xs uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 hover:bg-[#F5F0EB] transition-all disabled:opacity-50 shadow-xl"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{loading ? "Creating Storefront..." : "Save & Launch Store"}</span>
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => completeOnboarding(true)}
                  className="py-3.5 px-6 bg-[#18181D] hover:bg-zinc-800 text-zinc-300 font-semibold text-xs uppercase tracking-widest rounded-lg flex items-center justify-center gap-1.5 transition-all border border-zinc-800 disabled:opacity-50"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                  <span>Skip for Now</span>
                </button>
              </div>
            </div>
          )}

          {/* ============================================================= */}
          {/* STEP 5: SUCCESS / LAUNCH CELEBRATION                          */}
          {/* ============================================================= */}
          {currentStep === "success" && (
            <div className="text-center space-y-6 py-6 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <span className="text-[10px] uppercase tracking-[0.3em] text-[var(--color-accent,#C9A96E)] font-bold">
                  Onboarding Complete
                </span>
                <h1 className="text-3xl font-extrabold text-white tracking-tight">
                  Your Store Is Ready!
                </h1>
                <p className="text-xs sm:text-sm text-zinc-400 font-light max-w-md mx-auto leading-relaxed">
                  Congratulations! Your storefront has been created with a 14-day unlimited free trial.
                </p>
              </div>

              {/* Subdomain Card */}
              {createdCompany && (
                <div className="p-5 bg-[#18181D] rounded-2xl border border-zinc-800 max-w-sm mx-auto space-y-2">
                  <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">
                    Your Public Storefront URL
                  </span>
                  <p className="text-sm font-mono text-[var(--color-accent,#C9A96E)] font-bold">
                    https://{createdCompany.slug}.cimessinvest.com
                  </p>
                </div>
              )}

              <div className="pt-4 max-w-sm mx-auto">
                <button
                  type="button"
                  disabled={navigating}
                  onClick={handleEnterDashboard}
                  className="w-full py-4 bg-[var(--color-accent,#C9A96E)] text-[#1A1A1A] font-bold text-xs uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 hover:bg-[#F5F0EB] transition-all shadow-2xl disabled:opacity-70 cursor-pointer"
                >
                  {navigating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Entering Dashboard...</span>
                    </>
                  ) : (
                    <>
                      <span>Enter Manager Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
