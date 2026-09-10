"use client";

import { useState, useEffect, useCallback } from "react";
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
  FileText
} from "lucide-react";
import { api } from "@/app/lib/utils/apiClient";

interface AtelierTelemetry {
  id: string;
  companyName: string;
  email: string;
  planSelected: string;
  subscription_status: string;
  paymentVerified: boolean;
  storageUsedMB: number;
  storageLimitMB: number;
  storagePercent: number;
  monthlyVisits: number;
  trafficLimit: number;
  trafficPercent: number;
  createdAt: string;
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

export default function SuperadminDashboardPage() {
  const [activeTab, setActiveTab] = useState<"quotas" | "deal-desk" | "audit">("quotas");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Telemetry state
  const [ateliers, setAteliers] = useState<AtelierTelemetry[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [summary, setSummary] = useState({
    totalAteliers: 0,
    activeSubscriptions: 0,
    totalStorageUsedMB: 0,
    totalStorageLimitMB: 0,
    totalMonthlyVisits: 0,
  });

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

  // 1. Fetch telemetry and quotes
  const fetchData = useCallback(async () => {
    setErrorMsg(null);
    try {
      const [telemetryRes, quotesRes] = await Promise.all([
        api.get<{
          success?: boolean;
          telemetry?: {
            totalAteliers: number;
            activeSubscriptions: number;
            totalStorageUsedMB: number;
            totalStorageLimitMB: number;
            totalMonthlyVisits: number;
            ateliers: AtelierTelemetry[];
            recentTransactions: RecentTransaction[];
          };
        }>("/api/superadmin/telemetry"),
        api.get<{
          success?: boolean;
          quotes?: CustomQuote[];
        }>("/api/superadmin/quotes").catch(() => ({ data: { quotes: [] } })),
      ]);

      if (telemetryRes.data?.telemetry) {
        const t = telemetryRes.data.telemetry;
        setSummary({
          totalAteliers: t.totalAteliers,
          activeSubscriptions: t.activeSubscriptions,
          totalStorageUsedMB: t.totalStorageUsedMB,
          totalStorageLimitMB: t.totalStorageLimitMB,
          totalMonthlyVisits: t.totalMonthlyVisits,
        });
        setAteliers(t.ateliers || []);
        setRecentTransactions(t.recentTransactions || []);
      }

      if (quotesRes.data?.quotes) {
        setQuotes(quotesRes.data.quotes);
      }
    } catch (err: unknown) {
      console.error("Superadmin fetch notice:", err);
      setErrorMsg("Failed to load platform telemetry from server.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 bg-[#161616] border border-white/10 rounded-lg space-y-2">
          <div className="flex items-center justify-between text-[#A09585]">
            <span className="text-xs uppercase tracking-widest font-light">Total Ateliers</span>
            <Users className="w-4 h-4 text-[#C9A96E]" />
          </div>
          <p className="text-3xl font-heading font-bold text-[#F5F0EB]">{summary.totalAteliers}</p>
          <span className="text-[11px] text-[#A09585]">Registered brands</span>
        </div>

        <div className="p-5 bg-[#161616] border border-white/10 rounded-lg space-y-2">
          <div className="flex items-center justify-between text-[#A09585]">
            <span className="text-xs uppercase tracking-widest font-light">Active Subscriptions</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-heading font-bold text-[#F5F0EB]">{summary.activeSubscriptions}</p>
          <span className="text-[11px] text-emerald-400 font-medium">Paying customer accounts</span>
        </div>

        <div className="p-5 bg-[#161616] border border-white/10 rounded-lg space-y-2">
          <div className="flex items-center justify-between text-[#A09585]">
            <span className="text-xs uppercase tracking-widest font-light">Cloud Storage Used</span>
            <HardDrive className="w-4 h-4 text-[#C9A96E]" />
          </div>
          {(() => {
            const formatted = formatStorage(summary.totalStorageUsedMB);
            return (
              <p className="text-3xl font-heading font-bold text-[#F5F0EB]">
                {formatted.value}{" "}
                <span className="text-sm font-sans font-normal text-[#A09585]">{formatted.unit}</span>
              </p>
            );
          })()}
          <span className="text-[11px] text-[#A09585]">Across Cloudinary CDN</span>
        </div>

        <div className="p-5 bg-[#161616] border border-white/10 rounded-lg space-y-2">
          <div className="flex items-center justify-between text-[#A09585]">
            <span className="text-xs uppercase tracking-widest font-light">Monthly Traffic Hits</span>
            <Activity className="w-4 h-4 text-[#C9A96E]" />
          </div>
          <p className="text-3xl font-heading font-bold text-[#F5F0EB]">
            {summary.totalMonthlyVisits.toLocaleString()}
          </p>
          <span className="text-[11px] text-[#A09585]">Aggregated page visits</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-white/10 space-x-8 text-sm">
        <button
          onClick={() => setActiveTab("quotas")}
          className={`pb-3 font-semibold tracking-wider uppercase text-xs transition-colors relative cursor-pointer ${
            activeTab === "quotas" ? "text-[#C9A96E]" : "text-[#A09585] hover:text-[#F5F0EB]"
          }`}
        >
          Ateliers & Quota Health
          {activeTab === "quotas" && (
            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#C9A96E]"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("deal-desk")}
          className={`pb-3 font-semibold tracking-wider uppercase text-xs transition-colors relative cursor-pointer ${
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
          className={`pb-3 font-semibold tracking-wider uppercase text-xs transition-colors relative cursor-pointer ${
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
                          atelier.subscription_status === "ACTIVE"
                            ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/30"
                            : "bg-red-950/60 text-red-400 border border-red-500/30"
                        }`}
                      >
                        {atelier.subscription_status}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedUserId(atelier.id);
                          setActiveTab("deal-desk");
                        }}
                        className="px-3 py-1.5 bg-[#C9A96E]/10 hover:bg-[#C9A96E] text-[#C9A96E] hover:text-[#111111] border border-[#C9A96E]/30 rounded text-[11px] uppercase font-bold tracking-wider transition-colors cursor-pointer"
                      >
                        Issue Quote
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: DEAL DESK (CUSTOM QUOTE GENERATOR) */}
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
