"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { 
  Users, 
  HardDrive, 
  Activity, 
  CreditCard, 
  Plus, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Sparkles, 
  ArrowUpRight,
  ShieldAlert,
  FileText,
  LayoutTemplate,
  Layers,
  Scissors,
  Dumbbell,
  ShoppingBag,
  Check,
  ToggleLeft,
  ToggleRight,
  Columns,
  Palette,
  Eye,
  Sliders,
  Percent,
} from "lucide-react";

import { api } from "@/app/lib/utils/apiClient";

interface AtelierTelemetry {
  id: string;
  companyName: string;
  email: string;
  companyId?: string | null;
  companySlug?: string | null;
  industry?: string;
  activeTemplateId?: string;
  planSelected: string;
  subscription_status: string;
  paymentVerified: boolean;
  status?: string;
  storageUsedMB: number;
  storageLimitMB: number;
  storagePercent: number;
  monthlyVisits: number;
  trafficLimit: number;
  trafficPercent: number;
  createdAt: string;
}

interface PlatformAppeal {
  id: string;
  companyId: string;
  companyName: string;
  companySlug: string;
  companyStatus: string;
  reason: string;
  contactInfo: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reviewedBy?: string | null;
  reviewNote?: string | null;
  createdAt: string;
}

interface PlatformTemplate {
  id: string;
  name: string;
  slug: string;
  industry: string;
  subType?: string;
  brandVibe: string;
  version: number;
  description?: string;
  thumbnailUrl?: string;
  allowedBlocks: string[];
  isActive: boolean;
  companyCount: number;
  pageCount: number;
  theme?: {
    primary: string;
    accent: string;
    background: string;
  };
  componentsCount?: number;
  gridConstraints?: {
    supportsGrid: boolean;
    minColumns: number;
    maxColumns: number;
    defaultColumns: number;
    allowedColumns: number[];
  };
}

interface CustomQuote {
  id: string;
  userId: string;
  companyName: string;
  email: string;
  plan: string;
  authorizedAmountNGN: number;
  authorizedStorageMB: number;
  authorizedTrafficLimit: number | null;
  notes: string | null;
  status: string;
  createdAt: string;
}

interface RecentTransaction {
  id: string;
  reference: string;
  companyName: string;
  amountNGN: number;
  planSelected: string;
  status: string;
  createdAt: string;
}

// Dynamic storage formatting helper (KB, MB, GB)
function formatStorage(mb: number | null | undefined): { value: string; unit: string } {
  const val = Number(mb) || 0;
  if (val <= 0) return { value: "0", unit: "KB" };
  if (val < 1) {
    return { value: Math.round(val * 1024).toString(), unit: "KB" };
  }
  if (val < 1024) {
    const formatted = val % 1 === 0 ? val.toString() : val.toFixed(1);
    return { value: formatted, unit: "MB" };
  }
  return { value: (val / 1024).toFixed(2), unit: "GB" };
}

function formatStorageString(mb: number | null | undefined): string {
  const res = formatStorage(mb);
  return `${res.value} ${res.unit}`;
}

export interface SuperadminTicket {
  id: string;
  ticketNumber: string;
  type: "CUSTOMER_DISPUTE" | "MERCHANT_SUPPORT";
  category: string;
  status: "PENDING" | "INVESTIGATING" | "RESOLVED" | "REJECTED";
  submitterEmail: string;
  submitterName?: string | null;
  submitterPhone?: string | null;
  role?: string | null;
  subject: string;
  description: string;
  orderReference?: string | null;
  adminNotes?: string | null;
  createdAt: string;
  company?: {
    id: string;
    name: string;
    slug: string;
    status: string;
    paystackSubaccountCode?: string | null;
  } | null;
  order?: {
    id: string;
    reference: string;
    invoiceNumber?: string | null;
    amountNaira: number;
    merchantNetNaira: number;
    settlementStatus: string;
    createdAt: string;
  } | null;
}

export default function SuperadminDashboardPage() {
  const [activeTab, setActiveTab] = useState<"quotas" | "templates" | "deal-desk" | "audit" | "appeals" | "disputes">("quotas");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Tickets state
  const [tickets, setTickets] = useState<SuperadminTicket[]>([]);
  const [ticketFilter, setTicketFilter] = useState<"ALL" | "CUSTOMER_DISPUTE" | "MERCHANT_SUPPORT">("ALL");
  const [ticketActionLoading, setTicketActionLoading] = useState<string | null>(null);
  const [totalDisputedNaira, setTotalDisputedNaira] = useState<number>(0);

  // Telemetry state
  const [ateliers, setAteliers] = useState<AtelierTelemetry[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [appeals, setAppeals] = useState<PlatformAppeal[]>([]);
  const [togglingCompanyId, setTogglingCompanyId] = useState<string | null>(null);
  const [reviewingAppealId, setReviewingAppealId] = useState<string | null>(null);

  const [summary, setSummary] = useState({
    totalAteliers: 0,
    activeSubscriptions: 0,
    totalStorageUsedMB: 0,
    totalStorageLimitMB: 0,
    totalMonthlyVisits: 0,
    platformGMVNGN: 0,
    platformFeeNGN: 0,
    platformFeePercent: 5.0,
    saasRevenueNGN: 0,
    pendingAppealsCount: 0,
  });

  // Platform Fee Config State
  const [platformFeeInput, setPlatformFeeInput] = useState<number>(5.0);
  const [syncSubaccountsWithPaystack, setSyncSubaccountsWithPaystack] = useState<boolean>(true);
  const [savingPlatformFee, setSavingPlatformFee] = useState<boolean>(false);

  // Templates state
  const [templates, setTemplates] = useState<PlatformTemplate[]>([]);
  const [togglingTemplate, setTogglingTemplate] = useState<string | null>(null);

  // Quotes state
  const [quotes, setQuotes] = useState<CustomQuote[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Deal Desk form state
  const [selectedUserId, setSelectedUserId] = useState("");
  const [quoteAmountNGN, setQuoteAmountNGN] = useState<number>(75000);
  const [quoteStorageMB, setQuoteStorageMB] = useState<number>(25000);
  const [quoteTrafficLimit, setQuoteTrafficLimit] = useState<number>(50000);
  const [quoteNotes, setQuoteNotes] = useState("");
  const [submittingQuote, setSubmittingQuote] = useState(false);

  // 1. Fetch telemetry, templates, quotes, and tickets
  const fetchData = useCallback(async () => {
    setErrorMsg(null);
    try {
      const [telemetryRes, quotesRes, templatesRes, ticketsRes] = await Promise.all([
        api.get<{
          success?: boolean;
          telemetry?: any;
        }>("/api/superadmin/telemetry"),
        api.get<{
          success?: boolean;
          quotes?: CustomQuote[];
        }>("/api/superadmin/quotes").catch(() => ({ data: { quotes: [] } })),
        api.get<{
          success?: boolean;
          templates?: PlatformTemplate[];
        }>("/api/superadmin/templates").catch(() => ({ data: { templates: [] } })),
        api.get<{
          success?: boolean;
          tickets?: SuperadminTicket[];
          stats?: { totalDisputedNaira?: number };
        }>("/api/superadmin/tickets").catch(() => ({ data: { tickets: [], stats: { totalDisputedNaira: 0 } } })),
      ]);

      if (ticketsRes.data?.tickets) {
        setTickets(ticketsRes.data.tickets);
        setTotalDisputedNaira(ticketsRes.data.stats?.totalDisputedNaira || 0);
      }

      if (telemetryRes.data?.telemetry) {
        const t = telemetryRes.data.telemetry;
        const feePercent = typeof t.platformFeePercent === "number" ? t.platformFeePercent : 5.0;
        setSummary({
          totalAteliers: t.totalCompanies ?? t.totalAteliers ?? 0,
          activeSubscriptions: t.activeSubscriptions ?? 0,
          totalStorageUsedMB: t.totalStorageUsedMB ?? 0,
          totalStorageLimitMB: t.totalStorageLimitMB ?? 0,
          totalMonthlyVisits: t.totalMonthlyVisits ?? 0,
          platformGMVNGN: t.platformGMVNGN ?? 0,
          platformFeeNGN: t.platformFeeNGN ?? 0,
          platformFeePercent: feePercent,
          saasRevenueNGN: t.saasRevenueNGN ?? 0,
          pendingAppealsCount: t.pendingAppealsCount ?? 0,
        });
        setPlatformFeeInput(feePercent);


        if (t.companies && t.companies.length > 0) {
          const mapped: AtelierTelemetry[] = t.companies.map((c: any) => ({
            id: c.id,
            companyName: c.name,
            email: c.ownerEmail,
            companyId: c.id,
            companySlug: c.slug,
            industry: c.industry,
            activeTemplateId: "fashion-store-tailor-v1",
            planSelected: c.planSelected,
            subscription_status: c.status === "ACTIVE" ? "ACTIVE" : "SUSPENDED",
            paymentVerified: true,
            status: c.status,
            storageUsedMB: c.storageUsedMB,
            storageLimitMB: c.storageLimitMB,
            storagePercent: c.storagePercent,
            monthlyVisits: c.monthlyVisits,
            trafficLimit: c.trafficLimit,
            trafficPercent: c.trafficPercent,
            createdAt: c.createdAt,
          }));
          setAteliers(mapped);
        } else if (t.ateliers) {
          setAteliers(t.ateliers);
        }

        setAppeals(t.appeals || []);
        setRecentTransactions(t.recentTransactions || []);
      }

      if (quotesRes.data?.quotes) {
        setQuotes(quotesRes.data.quotes);
      }

      if (templatesRes.data?.templates) {
        setTemplates(templatesRes.data.templates);
      }
    } catch (err: unknown) {
      console.error("Superadmin fetch error:", err);
      setErrorMsg("Failed to synchronize superadmin telemetry.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const handleSavePlatformFee = async () => {
    if (
      typeof platformFeeInput !== "number" ||
      isNaN(platformFeeInput) ||
      platformFeeInput < 0 ||
      platformFeeInput > 50
    ) {
      setErrorMsg("Platform fee percentage must be between 0% and 50%.");
      return;
    }
    setSavingPlatformFee(true);
    setErrorMsg(null);
    try {
      const res = await api.patch<{
        success?: boolean;
        message?: string;
        config?: { platformFeePercent: number };
      }>("/api/superadmin/config", {
        platformFeePercent: platformFeeInput,
        syncExistingSubaccounts: syncSubaccountsWithPaystack,
      });

      if (res.data?.success) {
        const newPercent = res.data.config?.platformFeePercent ?? platformFeeInput;
        setSummary((prev) => ({
          ...prev,
          platformFeePercent: newPercent,
        }));
        setPlatformFeeInput(newPercent);
        setSuccessMsg(res.data.message || `Platform fee successfully updated to ${newPercent}%.`);
        setTimeout(() => setSuccessMsg(null), 5000);
      }
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.error || "Failed to update platform fee.");
    } finally {
      setSavingPlatformFee(false);
    }
  };

  const handleToggleCompanyStatus = async (companyId: string, currentStatus: string) => {

    setTogglingCompanyId(companyId);
    setErrorMsg(null);
    try {
      const nextStatus = currentStatus === "SUSPENDED" ? "ACTIVE" : "SUSPENDED";
      const res = await api.post("/api/superadmin/company/status", {
        companyId,
        status: nextStatus,
      });

      if (res.data?.success) {
        setSuccessMsg(res.data.message);
        setTimeout(() => setSuccessMsg(null), 4000);
        fetchData();
      }
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.error || "Failed to update company status.");
    } finally {
      setTogglingCompanyId(null);
    }
  };

  const handleReviewAppeal = async (appealId: string, action: "APPROVE" | "REJECT") => {
    setReviewingAppealId(appealId);
    setErrorMsg(null);
    try {
      const res = await api.post("/api/superadmin/appeals", {
        appealId,
        action,
        reviewNote: action === "APPROVE" ? "Approved by Superadmin" : "Rejected after review",
      });

      if (res.data?.success) {
        setSuccessMsg(res.data.message);
        setTimeout(() => setSuccessMsg(null), 4000);
        fetchData();
      }
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.error || "Failed to review appeal.");
    } finally {
      setReviewingAppealId(null);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle Template Activation Toggle
  const handleToggleTemplateActive = async (slug: string, currentActive: boolean) => {
    setTogglingTemplate(slug);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await api.patch<{ success: boolean; message: string; template: any }>(
        "/api/superadmin/templates",
        {
          slug,
          isActive: !currentActive,
        }
      );
      if (res.data?.success) {
        setSuccessMsg(res.data.message || `Template status updated.`);
        setTemplates((prev) =>
          prev.map((t) => (t.slug === slug ? { ...t, isActive: !currentActive } : t))
        );
      }
    } catch (err: unknown) {
      console.error("Template toggle error:", err);
      setErrorMsg("Failed to update template active status.");
    } finally {
      setTogglingTemplate(null);
    }
  };

  // 2. Handle Deal Desk Quote Submission
  const handleIssueQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) {
      setErrorMsg("Please select an atelier to issue a custom quote.");
      return;
    }

    setSubmittingQuote(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await api.post<{ success: boolean; message: string; quote: CustomQuote }>(
        "/api/superadmin/quotes",
        {
          userId: selectedUserId,
          authorizedAmountNGN: quoteAmountNGN,
          authorizedStorageMB: quoteStorageMB,
          authorizedTrafficLimit: quoteTrafficLimit,
          notes: quoteNotes,
        }
      );

      if (res.data?.success) {
        setSuccessMsg(res.data.message || "Authorized custom quote generated successfully.");
        setQuoteNotes("");
        fetchData();
      }
    } catch (err: unknown) {
      console.error("Quote creation failed:", err);
      setErrorMsg("Failed to generate custom quote. Please verify user ID.");
    } finally {
      setSubmittingQuote(false);
    }
  };

  const handleTicketAction = async (ticketId: string, action: string, note?: string) => {
    setTicketActionLoading(`${ticketId}_${action}`);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await api.post<{ success: boolean; message: string }>("/api/superadmin/tickets/action", {
        ticketId,
        action,
        note,
      });
      if (res.data?.success) {
        setSuccessMsg(res.data.message);
        await fetchData();
      }
    } catch (err: any) {
      console.error("Ticket action error:", err);
      setErrorMsg(err?.response?.data?.error || "Failed to execute ticket action.");
    } finally {
      setTicketActionLoading(null);
    }
  };

  const filteredAteliers = ateliers.filter(
    (a) =>
      a.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8">
      {/* Top Banner & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#C9A96E]/20 pb-6">
        <div>
          <span className="text-[11px] uppercase tracking-[0.3em] text-[#C9A96E] font-bold">
            Platform Operator Operations
          </span>
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-[#F5F0EB] mt-1">
            Superadmin Infrastructure & Deal Desk
          </h1>
        </div>

        <button
          onClick={() => {
            setRefreshing(true);
            fetchData();
          }}
          disabled={refreshing}
          className="px-4 py-2 bg-white/5 border border-white/10 hover:border-[#C9A96E]/40 text-xs uppercase tracking-wider text-[#E0D5C9] hover:text-[#C9A96E] rounded transition-colors flex items-center space-x-2 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-[#C9A96E]" : ""}`} />
          <span>Sync Telemetry</span>
        </button>
      </div>

      {/* Notifications / Alerts */}
      {successMsg && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded text-emerald-300 text-xs flex items-center space-x-3">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 bg-red-950/40 border border-red-500/30 rounded text-red-300 text-xs flex items-center space-x-3">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="p-4 bg-[#161616] border border-white/10 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-[#A09585]">
            <span className="text-[10px] uppercase tracking-wider font-semibold">Total Brands</span>
            <Users className="w-3.5 h-3.5 text-[#C9A96E]" />
          </div>
          <p className="text-2xl font-heading font-bold text-[#F5F0EB]">{summary.totalAteliers}</p>
          <span className="text-[10px] text-[#A09585]">Merchants onboarded</span>
        </div>

        <div className="p-4 bg-[#161616] border border-white/10 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-[#A09585]">
            <span className="text-[10px] uppercase tracking-wider font-semibold">Platform GMV</span>
            <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <p className="text-2xl font-heading font-bold text-emerald-400">
            ₦{summary.platformGMVNGN.toLocaleString()}
          </p>
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-emerald-400/80 font-mono">Store sales</span>
            <span className="text-[#C9A96E] font-semibold">{summary.platformFeePercent}% Fee</span>
          </div>
        </div>

        <div className="p-4 bg-[#161616] border border-white/10 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-[#A09585]">
            <span className="text-[10px] uppercase tracking-wider font-semibold">SaaS Revenue</span>
            <CreditCard className="w-3.5 h-3.5 text-[#C9A96E]" />
          </div>
          <p className="text-2xl font-heading font-bold text-[#C9A96E]">
            ₦{summary.saasRevenueNGN.toLocaleString()}
          </p>
          <span className="text-[10px] text-[#A09585]">Platform subscriptions</span>
        </div>

        <div className="p-4 bg-[#161616] border border-white/10 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-[#A09585]">
            <span className="text-[10px] uppercase tracking-wider font-semibold">Active Subs</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <p className="text-2xl font-heading font-bold text-[#F5F0EB]">{summary.activeSubscriptions}</p>
          <span className="text-[10px] text-emerald-400 font-medium">Paying accounts</span>
        </div>

        <div className="p-4 bg-[#161616] border border-white/10 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-[#A09585]">
            <span className="text-[10px] uppercase tracking-wider font-semibold">Cloud Storage</span>
            <HardDrive className="w-3.5 h-3.5 text-[#C9A96E]" />
          </div>
          {(() => {
            const formatted = formatStorage(summary.totalStorageUsedMB);
            return (
              <p className="text-2xl font-heading font-bold text-[#F5F0EB]">
                {formatted.value}{" "}
                <span className="text-xs font-sans font-normal text-[#A09585]">{formatted.unit}</span>
              </p>
            );
          })()}
          <span className="text-[10px] text-[#A09585]">Cloudinary CDN</span>
        </div>

        <div className="p-4 bg-[#161616] border border-white/10 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-[#A09585]">
            <span className="text-[10px] uppercase tracking-wider font-semibold">Traffic Hits</span>
            <Activity className="w-3.5 h-3.5 text-[#C9A96E]" />
          </div>
          <p className="text-2xl font-heading font-bold text-[#F5F0EB]">
            {summary.totalMonthlyVisits.toLocaleString()}
          </p>
          <span className="text-[10px] text-[#A09585]">Aggregated visits</span>
        </div>
      </div>

      {/* FINTECH ENGINE: DYNAMIC PLATFORM FEE & SPLIT CONFIGURATION */}
      <div className="bg-[#161616] border border-[#C9A96E]/30 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#C9A96E]/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          {/* Left Info & Live Split Visualizer */}
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#C9A96E]/15 text-[#C9A96E] border border-[#C9A96E]/30 uppercase tracking-wider flex items-center gap-1">
                <Percent className="w-3 h-3" />
                Fintech Engine
              </span>
              <span className="text-xs text-[#A09585]">Paystack Split Commission</span>
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-heading font-bold text-[#F5F0EB]">
                Platform Transaction Fee ({summary.platformFeePercent}%)
              </h2>
              <p className="text-xs text-[#E0D5C9]/75 mt-1 leading-relaxed">
                Dynamically controls the platform cut retained on all customer store purchases and WhatsApp invoices. 
                Adjusting this value updates new checkouts, Paystack subaccount provisioning, and webhook splits in real time without code changes.
              </p>
            </div>

            {/* Live Split Bar Visualizer */}
            <div className="pt-1 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-emerald-400 font-semibold">Merchant Net: {Number((100 - platformFeeInput).toFixed(2))}%</span>
                <span className="text-[#C9A96E] font-semibold">Platform Cut: {Number(platformFeeInput.toFixed(2))}%</span>
              </div>
              <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden flex border border-white/10">
                <div 
                  className="h-full bg-emerald-500/80 transition-all duration-300" 
                  style={{ width: `${Math.max(0, Math.min(100, 100 - platformFeeInput))}%` }} 
                />
                <div 
                  className="h-full bg-[#C9A96E] transition-all duration-300" 
                  style={{ width: `${Math.max(0, Math.min(100, platformFeeInput))}%` }} 
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-[#A09585]">
                <span>Total Fees Retained to Date: <strong className="text-[#F5F0EB]">₦{summary.platformFeeNGN.toLocaleString()}</strong></span>
                <span>Configurable: 0.0% — 50.0%</span>
              </div>
            </div>
          </div>

          {/* Right Controls: Stepper, Input, Sync Toggle, Save Button */}
          <div className="bg-black/40 border border-white/10 rounded-xl p-4 sm:p-5 flex flex-col gap-4 w-full lg:w-auto lg:min-w-[340px]">
            <div>
              <label className="block text-[10px] uppercase font-semibold tracking-wider text-[#A09585] mb-2">
                Increase / Decrease Fee Percentage
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPlatformFeeInput((prev) => Math.max(0, Number((prev - 0.5).toFixed(2))))}
                  disabled={savingPlatformFee || platformFeeInput <= 0}
                  className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 hover:border-[#C9A96E]/50 text-[#F5F0EB] hover:text-[#C9A96E] flex items-center justify-center font-bold text-lg cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Decrease by 0.5%"
                >
                  -
                </button>
                <div className="relative flex-1">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="50"
                    value={platformFeeInput}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setPlatformFeeInput(isNaN(val) ? 0 : Math.min(50, Math.max(0, val)));
                    }}
                    className="w-full h-10 px-3 pr-8 rounded-lg bg-[#121212] border border-white/15 text-center font-mono font-bold text-sm text-[#F5F0EB] focus:border-[#C9A96E] focus:outline-none"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-[#C9A96E] font-bold pointer-events-none">%</span>
                </div>
                <button
                  type="button"
                  onClick={() => setPlatformFeeInput((prev) => Math.min(50, Number((prev + 0.5).toFixed(2))))}
                  disabled={savingPlatformFee || platformFeeInput >= 50}
                  className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 hover:border-[#C9A96E]/50 text-[#F5F0EB] hover:text-[#C9A96E] flex items-center justify-center font-bold text-lg cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Increase by 0.5%"
                >
                  +
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2.5 text-xs text-[#E0D5C9] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={syncSubaccountsWithPaystack}
                onChange={(e) => setSyncSubaccountsWithPaystack(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 bg-black/40 text-[#C9A96E] focus:ring-[#C9A96E] cursor-pointer"
              />
              <span className="text-[11px] text-[#A09585]">
                Sync existing Paystack merchant subaccounts
              </span>
            </label>

            <button
              type="button"
              onClick={handleSavePlatformFee}
              disabled={savingPlatformFee}
              className="w-full py-2.5 px-4 bg-[#C9A96E] hover:bg-[#D4B87D] text-[#1A1A1A] text-xs uppercase tracking-wider font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {savingPlatformFee ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving Fee Config...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Save Platform Fee ({platformFeeInput}%)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>


      {/* Tab Navigation */}
      <div className="flex border-b border-white/10 space-x-8 text-sm overflow-x-auto">
        <button
          onClick={() => setActiveTab("quotas")}
          className={`pb-3 font-semibold tracking-wider uppercase text-xs transition-colors relative cursor-pointer shrink-0 ${
            activeTab === "quotas" ? "text-[#C9A96E]" : "text-[#A09585] hover:text-[#F5F0EB]"
          }`}
        >
          Brands & Quota Health
          {activeTab === "quotas" && (
            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#C9A96E]"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("appeals")}
          className={`pb-3 font-semibold tracking-wider uppercase text-xs transition-colors relative cursor-pointer shrink-0 flex items-center gap-2 ${
            activeTab === "appeals" ? "text-[#C9A96E]" : "text-[#A09585] hover:text-[#F5F0EB]"
          }`}
        >
          <span>Storefront Appeals</span>
          {summary.pendingAppealsCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold">
              {summary.pendingAppealsCount}
            </span>
          )}
          {activeTab === "appeals" && (
            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#C9A96E]"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("disputes")}
          className={`pb-3 font-semibold tracking-wider uppercase text-xs transition-colors relative cursor-pointer shrink-0 flex items-center gap-2 ${
            activeTab === "disputes" ? "text-[#C9A96E]" : "text-[#A09585] hover:text-[#F5F0EB]"
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
          <span>Disputes &amp; Support Desk</span>
          {tickets.filter((t) => t.status === "PENDING").length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 font-bold">
              {tickets.filter((t) => t.status === "PENDING").length}
            </span>
          )}
          {activeTab === "disputes" && (
            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#C9A96E]"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("templates")}
          className={`pb-3 font-semibold tracking-wider uppercase text-xs transition-colors relative cursor-pointer shrink-0 flex items-center gap-2 ${
            activeTab === "templates" ? "text-[#C9A96E]" : "text-[#A09585] hover:text-[#F5F0EB]"
          }`}
        >
          <span>Templates & Store Layouts</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/10 text-white font-mono">
            {templates.length}
          </span>
          {activeTab === "templates" && (
            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#C9A96E]"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("deal-desk")}
          className={`pb-3 font-semibold tracking-wider uppercase text-xs transition-colors relative cursor-pointer shrink-0 ${
            activeTab === "deal-desk" ? "text-[#C9A96E]" : "text-[#A09585] hover:text-[#F5F0EB]"
          }`}
        >
          Deal Desk (Custom Quotes)
          {activeTab === "deal-desk" && (
            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#C9A96E]"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("audit")}
          className={`pb-3 font-semibold tracking-wider uppercase text-xs transition-colors relative cursor-pointer shrink-0 ${
            activeTab === "audit" ? "text-[#C9A96E]" : "text-[#A09585] hover:text-[#F5F0EB]"
          }`}
        >
          Financial & Audit Stream
          {activeTab === "audit" && (
            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#C9A96E]"></span>
          )}
        </button>
      </div>

      {/* TAB 1: ATELIERS & QUOTA HEALTH */}
      {activeTab === "quotas" && (
        <div className="space-y-6">
          {/* Search Bar */}
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#A09585] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search atelier name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#161616] border border-white/10 rounded text-xs text-[#F5F0EB] focus:outline-none focus:border-[#C9A96E]"
              />
            </div>
          </div>

          {/* Ateliers Table */}
          <div className="border border-white/10 rounded-lg overflow-x-auto bg-[#141414]">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 text-[#A09585] uppercase tracking-wider text-[10px] border-b border-white/10">
                <tr>
                  <th className="p-4 font-semibold">Atelier / Brand</th>
                  <th className="p-4 font-semibold">Brand Type & Template</th>
                  <th className="p-4 font-semibold">Plan</th>
                  <th className="p-4 font-semibold">Storage Quota</th>
                  <th className="p-4 font-semibold">Traffic Quota (Monthly)</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredAteliers.map((atelier) => (
                  <tr key={atelier.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <p className="font-semibold text-[#F5F0EB]">{atelier.companyName}</p>
                      <p className="text-[11px] text-[#A09585]">{atelier.email}</p>
                    </td>

                    {/* Brand Type & Template Column */}
                    <td className="p-4">
                      <div className="space-y-1">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                            atelier.industry === "FITNESS_GYM"
                              ? "bg-[#CCFF00]/15 text-[#CCFF00] border border-[#CCFF00]/30"
                              : "bg-[#C9A96E]/15 text-[#C9A96E] border border-[#C9A96E]/30"
                          }`}
                        >
                          {atelier.industry === "FITNESS_GYM" ? (
                            <Dumbbell className="w-3 h-3" />
                          ) : (
                            <Scissors className="w-3 h-3" />
                          )}
                          <span>
                            {atelier.industry === "FITNESS_GYM"
                              ? "Fitness & Gym"
                              : "Fashion Atelier"}
                          </span>
                        </span>
                        <p className="text-[10px] text-[#A09585] font-mono">
                          {atelier.activeTemplateId || "fashion-store-tailor-v1"}
                        </p>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-white/5 border border-white/10 text-[#C9A96E]">
                        {atelier.planSelected}
                      </span>
                    </td>

                    {/* Storage Meter */}
                    <td className="p-4 min-w-[160px]">
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-[#A09585]">{formatStorageString(atelier.storageUsedMB)}</span>
                        <span className="text-[#E0D5C9] font-medium">{formatStorageString(atelier.storageLimitMB)}</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-1.5 rounded-full ${
                            atelier.storagePercent >= 90
                              ? "bg-red-500"
                              : atelier.storagePercent >= 80
                              ? "bg-amber-500"
                              : "bg-[#C9A96E]"
                          }`}
                          style={{ width: `${atelier.storagePercent}%` }}
                        ></div>
                      </div>
                    </td>

                    {/* Traffic Meter */}
                    <td className="p-4 min-w-[180px]">
                      <div className="flex justify-between items-center text-[11px] mb-1">
                        <span className="text-[#A09585]">{atelier.monthlyVisits.toLocaleString()}</span>
                        <span className="text-[#E0D5C9] font-medium">{atelier.trafficLimit.toLocaleString()} visits</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-1.5 rounded-full ${
                            atelier.trafficPercent >= 100
                              ? "bg-red-500"
                              : atelier.trafficPercent >= 80
                              ? "bg-amber-500"
                              : "bg-[#C9A96E]"
                          }`}
                          style={{ width: `${Math.min(100, atelier.trafficPercent)}%` }}
                        ></div>
                      </div>
                      {/* Warning Badges */}
                      {atelier.trafficPercent >= 100 ? (
                        <span className="text-[9px] uppercase font-bold tracking-wider text-red-400 mt-1 inline-block">
                          🚨 100% Capped Notice Sent
                        </span>
                      ) : atelier.trafficPercent >= 80 ? (
                        <span className="text-[9px] uppercase font-bold tracking-wider text-amber-400 mt-1 inline-block">
                          ⚠️ 80% Warning Dispatched
                        </span>
                      ) : null}
                    </td>

                    <td className="p-4">
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                          (atelier.status || atelier.subscription_status) === "ACTIVE"
                            ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/30"
                            : "bg-red-950/60 text-red-400 border border-red-500/30"
                        }`}
                      >
                        {atelier.status || atelier.subscription_status}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {atelier.companyId && (
                          <button
                            onClick={() => handleToggleCompanyStatus(atelier.companyId!, atelier.status || "ACTIVE")}
                            disabled={togglingCompanyId === atelier.companyId}
                            className={`px-2.5 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                              atelier.status === "SUSPENDED"
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30"
                                : "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
                            }`}
                          >
                            {togglingCompanyId === atelier.companyId
                              ? "..."
                              : atelier.status === "SUSPENDED"
                              ? "Reactivate"
                              : "Suspend"}
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedUserId(atelier.id);
                            setActiveTab("deal-desk");
                          }}
                          className="px-3 py-1.5 bg-[#C9A96E]/10 hover:bg-[#C9A96E] text-[#C9A96E] hover:text-[#111111] border border-[#C9A96E]/30 rounded text-[11px] uppercase font-bold tracking-wider transition-colors cursor-pointer"
                        >
                          Issue Quote
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: STOREFRONT APPEALS & COMPLIANCE REVIEW */}
      {activeTab === "appeals" && (
        <div className="space-y-6">
          <div className="p-6 bg-[#161616] border border-white/10 rounded-2xl flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                <h3 className="text-xl font-heading font-bold text-[#F5F0EB]">
                  Storefront Compliance & Appeals Inbox
                </h3>
              </div>
              <p className="text-xs text-[#A09585] mt-1 max-w-2xl leading-relaxed">
                Review merchant appeal requests. Approving an appeal automatically sets the store back to ACTIVE and restores public storefront accessibility.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20">
              {appeals.filter((a) => a.status === "PENDING").length} Pending Appeals
            </span>
          </div>

          <div className="border border-white/10 rounded-2xl overflow-x-auto bg-[#141414]">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 text-[#A09585] uppercase tracking-wider text-[10px] border-b border-white/10">
                <tr>
                  <th className="p-4 font-semibold">Store / Brand</th>
                  <th className="p-4 font-semibold">Contact</th>
                  <th className="p-4 font-semibold max-w-xs">Appeal Reason</th>
                  <th className="p-4 font-semibold">Current Store Status</th>
                  <th className="p-4 font-semibold">Ticket Status</th>
                  <th className="p-4 font-semibold">Submitted Date</th>
                  <th className="p-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {appeals.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-xs text-[#A09585]">
                      No merchant appeal requests pending.
                    </td>
                  </tr>
                ) : (
                  appeals.map((app) => (
                    <tr key={app.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-[#F5F0EB]">{app.companyName}</div>
                        <div className="text-[11px] font-mono text-[#A09585]">/{app.companySlug}</div>
                      </td>
                      <td className="p-4 font-mono text-[#E0D5C9]">
                        {app.contactInfo || "N/A"}
                      </td>
                      <td className="p-4 max-w-xs">
                        <p className="text-xs text-[#F5F0EB]/90 leading-relaxed italic line-clamp-3">
                          &ldquo;{app.reason}&rdquo;
                        </p>
                      </td>
                      <td className="p-4">
                        <span
                          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                            app.companyStatus === "ACTIVE"
                              ? "bg-emerald-950 text-emerald-400 border border-emerald-500/30"
                              : "bg-red-950 text-red-400 border border-red-500/30"
                          }`}
                        >
                          {app.companyStatus}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full ${
                            app.status === "APPROVED"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                              : app.status === "REJECTED"
                              ? "bg-red-500/10 text-red-400 border border-red-500/30"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                          }`}
                        >
                          {app.status}
                        </span>
                      </td>
                      <td className="p-4 text-[#A09585]">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right">
                        {app.status === "PENDING" ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleReviewAppeal(app.id, "APPROVE")}
                              disabled={reviewingAppealId === app.id}
                              className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 rounded text-[10px] uppercase font-bold tracking-wider transition-all cursor-pointer disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReviewAppeal(app.id, "REJECT")}
                              disabled={reviewingAppealId === app.id}
                              className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded text-[10px] uppercase font-bold tracking-wider transition-all cursor-pointer disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-[#A09585]">Reviewed</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: DISPUTES & SUPPORT DESK */}
      {activeTab === "disputes" && (
        <div className="space-y-6">
          {/* Header & Financial Metrics */}
          <div className="p-6 bg-[#161616] border border-white/10 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-400" />
                <h3 className="text-xl font-heading font-bold text-[#F5F0EB]">
                  Customer Disputes &amp; Support Desk
                </h3>
              </div>
              <p className="text-xs text-[#A09585] mt-1 max-w-2xl leading-relaxed">
                Review buyer disputes filed within the 24-hour protection window, enforce 1-click merchant store suspensions, issue gateway refunds, and handle merchant technical reports.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/30 text-right">
                <span className="text-[10px] uppercase font-bold text-red-400 block">Funds Frozen in Escrow</span>
                <span className="text-base font-mono font-bold text-red-300">₦{totalDisputedNaira.toLocaleString()}</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-right">
                <span className="text-[10px] uppercase font-bold text-[#A09585] block">Open Tickets</span>
                <span className="text-base font-mono font-bold text-white">
                  {tickets.filter((t) => t.status === "PENDING").length}
                </span>
              </div>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTicketFilter("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                ticketFilter === "ALL"
                  ? "bg-[#C9A96E] text-black font-bold"
                  : "bg-white/5 text-[#A09585] hover:text-white"
              }`}
            >
              All Tickets ({tickets.length})
            </button>
            <button
              onClick={() => setTicketFilter("CUSTOMER_DISPUTE")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 ${
                ticketFilter === "CUSTOMER_DISPUTE"
                  ? "bg-red-500 text-white font-bold"
                  : "bg-white/5 text-[#A09585] hover:text-white"
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Buyer Disputes ({tickets.filter((t) => t.type === "CUSTOMER_DISPUTE").length})</span>
            </button>
            <button
              onClick={() => setTicketFilter("MERCHANT_SUPPORT")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 ${
                ticketFilter === "MERCHANT_SUPPORT"
                  ? "bg-blue-600 text-white font-bold"
                  : "bg-white/5 text-[#A09585] hover:text-white"
              }`}
            >
              <span>Merchant Reports ({tickets.filter((t) => t.type === "MERCHANT_SUPPORT").length})</span>
            </button>
          </div>

          {/* Ticket Table */}
          <div className="border border-white/10 rounded-2xl overflow-x-auto bg-[#141414]">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 text-[#A09585] uppercase tracking-wider text-[10px] border-b border-white/10">
                <tr>
                  <th className="p-4 font-semibold">Ticket #</th>
                  <th className="p-4 font-semibold">Store / Subaccount</th>
                  <th className="p-4 font-semibold">Order &amp; Held Funds</th>
                  <th className="p-4 font-semibold">Submitter Info</th>
                  <th className="p-4 font-semibold max-w-xs">Subject &amp; Issue</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Enforcement Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {tickets
                  .filter((t) => ticketFilter === "ALL" || t.type === ticketFilter)
                  .length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-xs text-[#A09585]">
                      No tickets matching the current filter.
                    </td>
                  </tr>
                ) : (
                  tickets
                    .filter((t) => ticketFilter === "ALL" || t.type === ticketFilter)
                    .map((t) => {
                      const isDispute = t.type === "CUSTOMER_DISPUTE";
                      const storeStatus = t.company?.status || "ACTIVE";
                      const isStoreSuspended = storeStatus === "SUSPENDED";

                      return (
                        <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="p-4">
                            <span className={`font-mono font-bold px-2 py-1 rounded text-[11px] ${
                              isDispute 
                                ? "bg-red-500/20 text-red-400 border border-red-500/30" 
                                : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                            }`}>
                              {t.ticketNumber}
                            </span>
                            <div className="text-[10px] text-[#A09585] mt-1">
                              {new Date(t.createdAt).toLocaleDateString()}
                            </div>
                          </td>

                          <td className="p-4">
                            {t.company ? (
                              <div>
                                <div className="font-bold text-white flex items-center gap-1.5">
                                  <span>{t.company.name}</span>
                                  {isStoreSuspended ? (
                                    <span className="px-1.5 py-0.2 rounded text-[9px] bg-red-950 text-red-400 border border-red-500/40 font-bold uppercase">
                                      Suspended
                                    </span>
                                  ) : (
                                    <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-500/40 font-bold uppercase">
                                      Active
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] font-mono text-[#A09585]">/{t.company.slug}</div>
                                {t.company.paystackSubaccountCode && (
                                  <div className="text-[10px] font-mono text-[#C9A96E]">
                                    {t.company.paystackSubaccountCode}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-[#A09585]">Platform / Unlinked</span>
                            )}
                          </td>

                          <td className="p-4">
                            {t.order ? (
                              <div>
                                <span className="font-mono font-bold text-white block">
                                  {t.order.invoiceNumber || t.order.reference}
                                </span>
                                <span className="text-[11px] font-bold text-[#C9A96E]">
                                  ₦{t.order.amountNaira.toLocaleString()}
                                </span>
                                <div className="mt-0.5">
                                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                    t.order.settlementStatus === "HELD_DISPUTED"
                                      ? "bg-red-950 text-red-300 border border-red-500/30"
                                      : t.order.settlementStatus === "SETTLED"
                                      ? "bg-emerald-950 text-emerald-300 border border-emerald-500/30"
                                      : "bg-white/10 text-[#A09585]"
                                  }`}>
                                    {t.order.settlementStatus}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <span className="font-mono text-[#A09585]">
                                {t.orderReference || "—"}
                              </span>
                            )}
                          </td>

                          <td className="p-4">
                            <div className="text-white font-medium">{t.submitterName || "Submitter"}</div>
                            <div className="text-[11px] text-[#A09585]">{t.submitterEmail}</div>
                            {t.submitterPhone && (
                              <div className="text-[10px] font-mono text-[#7A7468]">{t.submitterPhone}</div>
                            )}
                          </td>

                          <td className="p-4 max-w-xs">
                            <div className="font-semibold text-[#E0D5C9] mb-1 line-clamp-1">{t.subject}</div>
                            <p className="text-[11px] text-[#A09585] italic line-clamp-2">
                              &ldquo;{t.description}&rdquo;
                            </p>
                            {t.adminNotes && (
                              <div className="mt-1 p-1.5 rounded bg-black/40 text-[10px] text-amber-300 font-mono">
                                {t.adminNotes}
                              </div>
                            )}
                          </td>

                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              t.status === "PENDING"
                                ? "bg-amber-950 text-amber-300 border border-amber-500/30"
                                : t.status === "RESOLVED"
                                ? "bg-emerald-950 text-emerald-300 border border-emerald-500/30"
                                : "bg-red-950 text-red-300 border border-red-500/30"
                            }`}>
                              {t.status}
                            </span>
                          </td>

                          <td className="p-4 text-right">
                            <div className="flex flex-col items-end gap-1.5">
                              {/* 1. Store Suspension Toggle */}
                              {t.company && (
                                <button
                                  onClick={() =>
                                    handleTicketAction(
                                      t.id,
                                      isStoreSuspended ? "UNSUSPEND_MERCHANT" : "SUSPEND_MERCHANT",
                                      "Action initiated from Dispute Desk"
                                    )
                                  }
                                  disabled={ticketActionLoading !== null}
                                  className={`px-2.5 py-1 rounded text-[10px] uppercase font-bold tracking-wider transition-all cursor-pointer ${
                                    isStoreSuspended
                                      ? "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30"
                                      : "bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30"
                                  }`}
                                >
                                  {isStoreSuspended ? "Unsuspend Store" : "Suspend Store"}
                                </button>
                              )}

                              {/* 2. Dispute Resolution & Refund Controls */}
                              {isDispute && t.status === "PENDING" && (
                                <div className="flex flex-wrap items-center justify-end gap-1 pt-1">
                                  <button
                                    onClick={() => handleTicketAction(t.id, "REFUND_ORDER")}
                                    disabled={ticketActionLoading !== null}
                                    title="Authorize Paystack Gateway Refund to customer"
                                    className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded text-[9px] uppercase font-bold tracking-wider cursor-pointer"
                                  >
                                    Refund Buyer
                                  </button>
                                  <button
                                    onClick={() => handleTicketAction(t.id, "RELEASE_PAYOUT")}
                                    disabled={ticketActionLoading !== null}
                                    title="Release escrow hold and credit merchant settled balance"
                                    className="px-2 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 rounded text-[9px] uppercase font-bold tracking-wider cursor-pointer"
                                  >
                                    Release to Merchant
                                  </button>
                                  <button
                                    onClick={() => handleTicketAction(t.id, "REJECT_DISPUTE")}
                                    disabled={ticketActionLoading !== null}
                                    className="px-2 py-1 bg-white/5 hover:bg-white/10 text-[#A09585] border border-white/10 rounded text-[9px] uppercase font-bold tracking-wider cursor-pointer"
                                  >
                                    Reject
                                  </button>
                                </div>
                              )}

                              {/* 3. Support Resolution */}
                              {!isDispute && t.status === "PENDING" && (
                                <button
                                  onClick={() => handleTicketAction(t.id, "RESOLVE_SUPPORT")}
                                  disabled={ticketActionLoading !== null}
                                  className="px-2.5 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 rounded text-[10px] uppercase font-bold tracking-wider cursor-pointer"
                                >
                                  Mark Resolved
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: TEMPLATES & STORE LAYOUTS GOVERNANCE */}
      {activeTab === "templates" && (
        <div className="space-y-8">
          {/* Templates Overview Banner */}
          <div className="p-6 bg-[#161616] border border-white/10 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <LayoutTemplate className="w-5 h-5 text-[#C9A96E]" />
                <h3 className="text-xl font-heading font-bold text-[#F5F0EB]">
                  Platform Master Templates & SDUI Engine
                </h3>
              </div>
              <p className="text-xs text-[#A09585] mt-1 max-w-2xl leading-relaxed">
                Universal design system registry. Superadmin controls template availability across all merchant onboarding flows and dashboards.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase">
                {templates.filter((t) => t.isActive).length} Active in Catalog
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[#C9A96E] text-xs font-mono">
                {templates.reduce((acc, t) => acc + (t.companyCount || 0), 0)} Store Adoptions
              </span>
            </div>
          </div>

          {/* Master Templates Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {templates.map((tpl) => {
              const isGym = tpl.slug.includes("gym") || tpl.industry === "FITNESS_GYM";
              const accentColor = isGym ? "#CCFF00" : "#C9A96E";

              return (
                <div
                  key={tpl.slug}
                  className="bg-[#141414] border border-white/10 hover:border-white/20 rounded-2xl p-6 space-y-5 transition-all shadow-xl flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Thumbnail & Badges */}
                    <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-black border border-white/5">
                      <Image
                        src={tpl.thumbnailUrl || (isGym ? "/bg-img/showcase2.jpeg" : "/bg-img/showcase1.jpg")}
                        alt={tpl.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                      
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold uppercase text-white">
                        {tpl.subType === "fitness" || isGym ? (
                          <Dumbbell className="w-3.5 h-3.5 text-[#CCFF00]" />
                        ) : tpl.subType === "boutique" ? (
                          <ShoppingBag className="w-3.5 h-3.5 text-[#E0A96D]" />
                        ) : (
                          <Scissors className="w-3.5 h-3.5 text-[#C9A96E]" />
                        )}
                        <span>
                          {tpl.subType === "fitness" || isGym
                            ? "Fitness & Gym"
                            : tpl.subType === "boutique"
                            ? "Fashion House"
                            : "Tailor Atelier"}
                        </span>
                      </div>

                      <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-mono text-zinc-300">
                        <span>v{tpl.version}</span>
                      </div>

                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                        <span className="font-bold">{tpl.companyCount} Active Merchants</span>
                        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono tracking-wider bg-white/15 backdrop-blur-md">
                          {tpl.brandVibe}
                        </span>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h4 className="text-lg font-heading font-bold text-[#F5F0EB]">{tpl.name}</h4>
                      <p className="text-xs text-[#A09585] mt-1 line-clamp-2 leading-relaxed font-light">
                        {tpl.description || "Production-ready universal storefront theme."}
                      </p>
                    </div>

                    {/* Metadata Badges */}
                    <div className="grid grid-cols-3 gap-2 text-center text-[11px] pt-2 border-t border-white/5">
                      <div className="p-2 bg-white/5 rounded-lg">
                        <span className="text-[10px] text-[#A09585] block uppercase">Pages</span>
                        <span className="font-bold text-[#F5F0EB]">{tpl.pageCount} Core</span>
                      </div>
                      <div className="p-2 bg-white/5 rounded-lg">
                        <span className="text-[10px] text-[#A09585] block uppercase">Components</span>
                        <span className="font-bold text-[#F5F0EB]">{tpl.componentsCount || 7} Blocks</span>
                      </div>
                      <div className="p-2 bg-white/5 rounded-lg">
                        <span className="text-[10px] text-[#A09585] block uppercase">Desktop Grid</span>
                        <span className="font-bold text-[#F5F0EB]">2–4 Cols</span>
                      </div>
                    </div>

                    {/* Theme Color Swatches */}
                    {tpl.theme && (
                      <div className="flex items-center justify-between p-3 bg-black/40 border border-white/5 rounded-xl text-xs">
                        <span className="text-[11px] uppercase tracking-wider text-[#A09585]">
                          Theme Swatches
                        </span>
                        <div className="flex items-center gap-2">
                          <span
                            className="w-5 h-5 rounded-full border border-white/20"
                            style={{ backgroundColor: tpl.theme.primary }}
                            title={`Primary: ${tpl.theme.primary}`}
                          />
                          <span
                            className="w-5 h-5 rounded-full border border-white/20"
                            style={{ backgroundColor: tpl.theme.accent }}
                            title={`Accent: ${tpl.theme.accent}`}
                          />
                          <span
                            className="w-5 h-5 rounded-full border border-white/20"
                            style={{ backgroundColor: tpl.theme.background }}
                            title={`Background: ${tpl.theme.background}`}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* SuperAdmin Activation Controls */}
                  <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#A09585]">Store Status:</span>
                        <span
                          className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            tpl.isActive
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                          }`}
                        >
                          {tpl.isActive ? "Active (Accepting Registrations)" : "Coming Soon (Blocked)"}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#A09585]/70">
                        {tpl.isActive
                          ? "Available for prospective merchants during onboarding."
                          : "Locked as 'Coming Soon'. Prospective merchants are prompted to pick another store."}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={togglingTemplate === tpl.slug}
                      onClick={() => handleToggleTemplateActive(tpl.slug, tpl.isActive)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2.5 cursor-pointer shrink-0 ${
                        tpl.isActive
                          ? "bg-emerald-950/60 hover:bg-amber-950/60 text-emerald-400 hover:text-amber-300 border border-emerald-500/40 hover:border-amber-500/40"
                          : "bg-amber-950/40 hover:bg-emerald-950/60 text-amber-300 hover:text-emerald-300 border border-amber-500/30 hover:border-emerald-500/40 shadow-lg shadow-amber-500/5"
                      }`}
                    >
                      {togglingTemplate === tpl.slug ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : tpl.isActive ? (
                        <>
                          <div className="w-4 h-4 rounded-full bg-emerald-400 text-black flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                          <span>Active (Click to Disable)</span>
                        </>
                      ) : (
                        <>
                          <div className="w-4 h-4 rounded-full bg-amber-400/20 text-amber-400 border border-amber-400/40 flex items-center justify-center text-[10px] font-bold">
                            !
                          </div>
                          <span>Set to Active (Enable)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Architecture Reference Box */}
          <div className="p-6 bg-[#161616] border border-white/10 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#C9A96E]">
              <Sparkles className="w-4 h-4" />
              <span>Platform Engineering & Universal Architecture</span>
            </div>
            <p className="text-xs text-[#A09585] leading-relaxed">
              New merchant templates follow the directory convention <code className="text-white px-1.5 py-0.5 bg-black rounded font-mono">templates/[industry]/store/[subType]/v[N]/</code>. Each template provides modular Server-Driven UI (SDUI) component schemas, responsive grid constraints (2 to 4 columns), and scoped color gradient presets.
            </p>
          </div>
        </div>
      )}

      {/* TAB 3: DEAL DESK (CUSTOM QUOTE GENERATOR) */}
      {activeTab === "deal-desk" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quote Generator Form */}
          <div className="lg:col-span-1 p-6 bg-[#141414] border border-[#C9A96E]/30 rounded-lg space-y-6">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-[#C9A96E] font-bold">
                Custom Enterprise Deals
              </span>
              <h3 className="text-xl font-heading font-bold text-[#F5F0EB] mt-1">
                Authorize Custom Quote
              </h3>
              <p className="text-xs text-[#A09585] mt-1">
                Authorizes tailored pricing and quota for an enterprise atelier. The checkout route will bind to this exact quote.
              </p>
            </div>

            <form onSubmit={handleIssueQuote} className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase font-semibold text-[#E0D5C9] mb-1">
                  Target Atelier
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full p-2.5 bg-[#1C1C1C] border border-white/10 rounded text-xs text-[#F5F0EB] focus:outline-none focus:border-[#C9A96E]"
                  required
                >
                  <option value="">-- Select an Atelier --</option>
                  {ateliers.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.companyName} ({a.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] uppercase font-semibold text-[#E0D5C9] mb-1">
                  Authorized Monthly Price (NGN ₦)
                </label>
                <input
                  type="number"
                  min="10000"
                  step="1000"
                  value={quoteAmountNGN}
                  onChange={(e) => setQuoteAmountNGN(Number(e.target.value))}
                  className="w-full p-2.5 bg-[#1C1C1C] border border-white/10 rounded text-xs text-[#F5F0EB] focus:outline-none focus:border-[#C9A96E]"
                  required
                />
                <span className="text-[10px] text-[#A09585]">e.g. ₦75,000 for luxury boutique tier</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase font-semibold text-[#E0D5C9] mb-1">
                    Storage (MB)
                  </label>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    value={quoteStorageMB}
                    onChange={(e) => setQuoteStorageMB(Number(e.target.value))}
                    className="w-full p-2.5 bg-[#1C1C1C] border border-white/10 rounded text-xs text-[#F5F0EB] focus:outline-none focus:border-[#C9A96E]"
                    required
                  />
                  <span className="text-[10px] text-[#A09585]">{(quoteStorageMB / 1024).toFixed(1)} GB</span>
                </div>

                <div>
                  <label className="block text-[11px] uppercase font-semibold text-[#E0D5C9] mb-1">
                    Traffic Cap (Visits)
                  </label>
                  <input
                    type="number"
                    min="5000"
                    step="5000"
                    value={quoteTrafficLimit}
                    onChange={(e) => setQuoteTrafficLimit(Number(e.target.value))}
                    className="w-full p-2.5 bg-[#1C1C1C] border border-white/10 rounded text-xs text-[#F5F0EB] focus:outline-none focus:border-[#C9A96E]"
                    required
                  />
                  <span className="text-[10px] text-[#A09585]">Monthly visits cap</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase font-semibold text-[#E0D5C9] mb-1">
                  Contract Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={quoteNotes}
                  onChange={(e) => setQuoteNotes(e.target.value)}
                  placeholder="e.g. Approved Q3 flagship expansion package..."
                  className="w-full p-2.5 bg-[#1C1C1C] border border-white/10 rounded text-xs text-[#F5F0EB] focus:outline-none focus:border-[#C9A96E]"
                />
              </div>

              <button
                type="submit"
                disabled={submittingQuote}
                className="w-full py-3 bg-[#C9A96E] hover:bg-[#dfc491] text-[#111111] font-bold text-xs uppercase tracking-widest rounded transition-colors flex items-center justify-center space-x-2 cursor-pointer"
              >
                {submittingQuote ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Issue Authorized Quote</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Active Quotes Ledger */}
          <div className="lg:col-span-2 p-6 bg-[#141414] border border-white/10 rounded-lg space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-lg font-heading font-bold text-[#F5F0EB]">
                Authorized Custom Quotes Ledger
              </h3>
              <span className="text-xs text-[#C9A96E] uppercase tracking-wider">
                {quotes.length} Active / Past Quotes
              </span>
            </div>

            <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto">
              {quotes.length === 0 ? (
                <p className="text-xs text-[#A09585] py-8 text-center">
                  No custom quotes issued yet. Select an atelier to issue a negotiated enterprise quote.
                </p>
              ) : (
                quotes.map((q) => (
                  <div key={q.id} className="py-4 flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-sm text-[#F5F0EB]">{q.companyName}</span>
                        <span
                          className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                            q.status === "APPROVED"
                              ? "bg-emerald-950/80 text-emerald-400 border border-emerald-500/30"
                              : q.status === "CLAIMED"
                              ? "bg-blue-950/80 text-blue-400 border border-blue-500/30"
                              : "bg-white/5 text-[#A09585]"
                          }`}
                        >
                          {q.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#A09585] mt-0.5">
                        ₦{q.authorizedAmountNGN.toLocaleString()} &bull; {(q.authorizedStorageMB / 1024).toFixed(1)} GB &bull;{" "}
                        {q.authorizedTrafficLimit ? `${q.authorizedTrafficLimit.toLocaleString()} visits` : "Standard traffic"}
                      </p>
                      {q.notes && <p className="text-[11px] text-[#C9A96E]/80 italic mt-1">&ldquo;{q.notes}&rdquo;</p>}
                    </div>
                    <span className="text-[11px] text-[#A09585]">{new Date(q.createdAt).toLocaleDateString()}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FINANCIAL & AUDIT STREAM */}
      {activeTab === "audit" && (
        <div className="p-6 bg-[#141414] border border-white/10 rounded-lg space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="text-xl font-heading font-bold text-[#F5F0EB]">
                Payment Webhook & Transaction Stream
              </h3>
              <p className="text-xs text-[#A09585] mt-0.5">
                Zero-Knowledge audit log tracking Paystack charges and webhook verification statuses.
              </p>
            </div>
            <CreditCard className="w-5 h-5 text-[#C9A96E]" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 text-[#A09585] uppercase tracking-wider text-[10px] border-b border-white/10">
                <tr>
                  <th className="p-3">Reference</th>
                  <th className="p-3">Atelier</th>
                  <th className="p-3">Plan</th>
                  <th className="p-3">Amount (NGN)</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-xs text-[#A09585]">
                      No transactions recorded yet.
                    </td>
                  </tr>
                ) : (
                  recentTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-3 font-mono text-[11px] text-[#C9A96E]">{tx.reference}</td>
                      <td className="p-3 font-semibold text-[#F5F0EB]">{tx.companyName}</td>
                      <td className="p-3 uppercase text-[10px] text-[#E0D5C9]">{tx.planSelected}</td>
                      <td className="p-3 font-medium text-[#F5F0EB]">₦{tx.amountNGN.toLocaleString()}</td>
                      <td className="p-3">
                        <span
                          className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded ${
                            tx.status === "COMPLETED"
                              ? "bg-emerald-950 text-emerald-400 border border-emerald-500/30"
                              : "bg-amber-950 text-amber-400 border border-amber-500/30"
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>
                      <td className="p-3 text-right text-[#A09585]">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
