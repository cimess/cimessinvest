"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  Eye, 
  MessageSquare, 
  Smartphone, 
  Monitor, 
  Sparkles, 
  RefreshCw, 
  ArrowUpRight,
  Globe,
  Users,
  Calendar,
  AlertTriangle,
  Activity
} from "lucide-react";
import { api } from "@/app/lib/utils/apiClient";

export type TimeframeOption = "monthly" | "yearly" | "total";

export interface AnalyticsData {
  timeframe: string;
  totalVisits: number;
  whatsappClicks: number;
  conversionRate: number;
  topCollection: string;
  monthlyGrowth: number;
  deviceBreakdown: {
    mobilePercentage: number;
    desktopPercentage: number;
  };
  categoryInterest: {
    name: string;
    percentage: number;
    views: number;
  }[];
  uploadedDesigns: number;
  merchant: {
    monthly: number;
    yearly: number;
    total: number;
    highestMonth: number;
    monthlyComparisonRatio: number;
    trafficLimit: number;
    whatsappClicks: number;
    conversionRate: number;
  };
  allMerchants: {
    monthly: number;
    yearly: number;
    total: number;
  };
  monthlyHistory: {
    month: string;
    visits: number;
    whatsappClicks: number;
    isHighest: boolean;
    ratioToHighest: number;
  }[];
}

const ZERO_ANALYTICS: AnalyticsData = {
  timeframe: "monthly",
  totalVisits: 0,
  whatsappClicks: 0,
  conversionRate: 0,
  topCollection: "None",
  monthlyGrowth: 0,
  deviceBreakdown: {
    mobilePercentage: 0,
    desktopPercentage: 0,
  },
  categoryInterest: [],
  uploadedDesigns: 0,
  merchant: {
    monthly: 0,
    yearly: 0,
    total: 0,
    highestMonth: 0,
    monthlyComparisonRatio: 0,
    trafficLimit: 0,
    whatsappClicks: 0,
    conversionRate: 0,
  },
  allMerchants: {
    monthly: 0,
    yearly: 0,
    total: 0,
  },
  monthlyHistory: [],
};

export default function AnalyticsDashboardPage() {
  const [timeframe, setTimeframe] = useState<TimeframeOption>("monthly");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch Analytics Metrics from Database via API
  const fetchAnalytics = useCallback(async (activeTimeframe: TimeframeOption) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get<{
        success?: boolean;
        analytics?: AnalyticsData;
        totalVisits?: number;
      }>(`/api/analytics?timeframe=${activeTimeframe}`);

      // Support both wrapped payload ({ analytics: ... }) and direct root payload
      const payload = response.data?.analytics || (response.data?.success ? (response.data as unknown as AnalyticsData) : null);

      if (payload && (payload.totalVisits !== undefined || payload.merchant !== undefined)) {
        setData(payload);
        return;
      }
      throw new Error("Unable to read analytics payload from server.");
    } catch (err: unknown) {
      console.error("Analytics fetch error:", err);
      // Fallback strictly to ZERO on network / API errors to avoid misleading numbers
      setData({ ...ZERO_ANALYTICS, timeframe: activeTimeframe });
      setError(
        "Analytics data is currently unreachable due to a network connection error. All figures have been set to 0 to prevent inaccurate readings."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics(timeframe);
  }, [fetchAnalytics, timeframe]);


  // Active Merchant visits for currently selected timeframe
  const activeMerchantVisits =
    timeframe === "yearly"
      ? data?.merchant.yearly ?? 0
      : timeframe === "total"
      ? data?.merchant.total ?? 0
      : data?.merchant.monthly ?? 0;

  return (
    <div className="p-6 sm:p-10 space-y-8 bg-[#1A1A1A] min-h-screen text-[#F5F0EB] font-body">
      {/* Top Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 border-b border-[#C9A96E]/20 pb-6">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-[#C9A96E] font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#C9A96E]" />
            Atelier Insights & Telemetry
          </span>
          <h1 className="text-3xl font-heading text-[#F5F0EB] mt-1 font-bold">
            Traffic, Conversion & Benchmark Analytics
          </h1>
          <p className="text-xs text-[#E0D5C9]/60 font-light mt-1">
            Real database metrics comparing monthly performance, WhatsApp inquiry conversion, and platform-wide totals.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Timeframe Switcher Tabs */}
          <div className="flex items-center bg-black/60 border border-white/10 rounded-lg p-1 text-xs">
            <button
              onClick={() => setTimeframe("monthly")}
              className={`px-3 py-1.5 rounded-md font-semibold tracking-wide transition-colors ${
                timeframe === "monthly"
                  ? "bg-[#C9A96E] text-[#1A1A1A]"
                  : "text-[#A09585] hover:text-[#F5F0EB]"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setTimeframe("yearly")}
              className={`px-3 py-1.5 rounded-md font-semibold tracking-wide transition-colors ${
                timeframe === "yearly"
                  ? "bg-[#C9A96E] text-[#1A1A1A]"
                  : "text-[#A09585] hover:text-[#F5F0EB]"
              }`}
            >
              Yearly
            </button>
            <button
              onClick={() => setTimeframe("total")}
              className={`px-3 py-1.5 rounded-md font-semibold tracking-wide transition-colors ${
                timeframe === "total"
                  ? "bg-[#C9A96E] text-[#1A1A1A]"
                  : "text-[#A09585] hover:text-[#F5F0EB]"
              }`}
            >
              All-Time Total
            </button>
          </div>

          <button
            onClick={() => fetchAnalytics(timeframe)}
            disabled={mounted ? loading : false}
            className="px-4 py-2 bg-white/5 border border-[#C9A96E]/30 text-[#C9A96E] text-xs font-semibold uppercase tracking-wider hover:bg-[#C9A96E] hover:text-[#1A1A1A] transition-colors flex items-center space-x-2 rounded cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Zero Network Error Notification Banner */}
      {error && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs rounded-lg flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-amber-300">Offline / Network Warning</p>
            <p className="text-amber-200/80 leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {/* KPI Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Merchant Visits (Timeframe specific) */}
        <div className="p-6 bg-black/40 border border-[#C9A96E]/20 rounded-lg space-y-2">
          <div className="flex items-center justify-between text-[#E0D5C9]/60">
            <span className="text-xs uppercase tracking-widest font-light">
              Your Visits ({timeframe === "monthly" ? "This Month" : timeframe === "yearly" ? "This Year" : "Lifetime"})
            </span>
            <Eye className="w-4 h-4 text-[#C9A96E]" />
          </div>
          <div className="flex items-baseline justify-between">
            <h2 className="text-3xl font-heading font-bold text-[#F5F0EB]">
              {activeMerchantVisits.toLocaleString()}
            </h2>
            <span className="text-xs text-emerald-400 flex items-center font-mono">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              +{data?.monthlyGrowth || 0}%
            </span>
          </div>
          <p className="text-[10px] text-[#E0D5C9]/50 font-light">
            Verified page visits for your atelier storefront
          </p>
        </div>

        {/* Card 2: Monthly Comparison (Current month divided by highest month) */}
        <div className="p-6 bg-black/40 border border-[#C9A96E]/20 rounded-lg space-y-2">
          <div className="flex items-center justify-between text-[#E0D5C9]/60">
            <span className="text-xs uppercase tracking-widest font-light">Peak Comparison</span>
            <TrendingUp className="w-4 h-4 text-[#C9A96E]" />
          </div>
          <div className="flex items-baseline justify-between">
            <h2 className="text-3xl font-heading font-bold text-[#F5F0EB]">
              {data?.merchant.monthlyComparisonRatio ?? 0}%
            </h2>
            <span className="text-[11px] px-2 py-0.5 rounded bg-[#C9A96E]/15 text-[#C9A96E] border border-[#C9A96E]/30 font-mono">
              vs Peak
            </span>
          </div>
          <p className="text-[10px] text-[#E0D5C9]/50 font-light">
            Month ({data?.merchant.monthly ?? 0}) ÷ Peak Month ({data?.merchant.highestMonth ?? 0})
          </p>
        </div>

        {/* Card 3: WhatsApp Conversion Rate (Clicks after visiting page) */}
        <div className="p-6 bg-black/40 border border-[#C9A96E]/20 rounded-lg space-y-2">
          <div className="flex items-center justify-between text-[#E0D5C9]/60">
            <span className="text-xs uppercase tracking-widest font-light">Inquiry Conversion</span>
            <MessageSquare className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <h2 className="text-3xl font-heading font-bold text-[#F5F0EB]">
              {data?.conversionRate ?? 0}%
            </h2>
            <span className="text-xs text-emerald-400 font-mono">
              {data?.whatsappClicks ?? 0} clicks
            </span>
          </div>
          <p className="text-[10px] text-[#E0D5C9]/50 font-light">
            {data?.whatsappClicks ?? 0} WhatsApp clicks from {activeMerchantVisits.toLocaleString()} page visits
          </p>
        </div>

        {/* Card 4: Monthly Traffic Quota Capacity */}
        <div className="p-6 bg-black/40 border border-[#C9A96E]/20 rounded-lg space-y-2">
          <div className="flex items-center justify-between text-[#E0D5C9]/60">
            <span className="text-xs uppercase tracking-widest font-light">
              Monthly Traffic Quota
            </span>
            <Activity className="w-4 h-4 text-[#C9A96E]" />
          </div>
          <div className="flex items-baseline justify-between">
            <h2 className="text-3xl font-heading font-bold text-[#F5F0EB]">
              {Math.max(0, (data?.merchant.trafficLimit || 2000) - (data?.merchant.monthly || 0)).toLocaleString()}
            </h2>
            <span className="text-[11px] text-[#A09585] font-mono">
              {Math.min(100, Math.round(((data?.merchant.monthly || 0) / (data?.merchant.trafficLimit || 2000)) * 100))}% used
            </span>
          </div>
          <p className="text-[10px] text-[#E0D5C9]/50 font-light">
            {(data?.merchant.monthly ?? 0).toLocaleString()} of {(data?.merchant.trafficLimit || 2000).toLocaleString()} monthly visits used
          </p>
        </div>
      </div>

      {/* Monthly Benchmark History (Monthly divide by highest month) */}
      <div className="p-6 bg-black/40 border border-[#C9A96E]/20 rounded-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-4 gap-2">
          <div>
            <h3 className="text-lg font-heading font-bold text-[#F5F0EB] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#C9A96E]" />
              Monthly Benchmark History (Divided by Peak Month)
            </h3>
            <p className="text-xs text-[#E0D5C9]/60 font-light">
              Each month divided by your highest recorded month ({(data?.merchant.highestMonth ?? 0).toLocaleString()} visits) to measure relative performance.
            </p>
          </div>
          <span className="text-xs font-mono text-[#C9A96E] bg-[#C9A96E]/10 px-3 py-1 rounded border border-[#C9A96E]/30 w-fit">
            Peak Ceiling: {(data?.merchant.highestMonth ?? 0).toLocaleString()} visits
          </span>
        </div>

        {data?.monthlyHistory && data.monthlyHistory.length > 0 ? (
          <div className="space-y-4">
            {data.monthlyHistory.map((m) => (
              <div key={m.month} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#F5F0EB]">{m.month}</span>
                    {m.isHighest && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold uppercase tracking-wider">
                        Peak Month
                      </span>
                    )}
                  </div>
                  <span className="text-[#C9A96E] font-mono">
                    {m.visits.toLocaleString()} visits ({m.ratioToHighest}% of peak)
                  </span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden border border-white/10">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      m.isHighest
                        ? "bg-gradient-to-r from-emerald-500 to-[#C9A96E]"
                        : "bg-gradient-to-r from-[#C9A96E] to-[#F5F0EB]"
                    }`}
                    style={{ width: `${Math.min(100, Math.max(m.ratioToHighest, 2))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-[#E0D5C9]/50">
            No historical visit telemetry recorded yet.
          </div>
        )}
      </div>

      {/* Analytics Breakdown Grid: Catalog Categories & Device Traffic */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Collection Category Popularity */}
        <div className="lg:col-span-2 p-6 bg-black/40 border border-[#C9A96E]/20 rounded-lg space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="text-lg font-heading font-bold text-[#F5F0EB]">
                Catalog Category Distribution
              </h3>
              <p className="text-xs text-[#E0D5C9]/60 font-light">
                Breakdown of client engagement across bespoke garment categories.
              </p>
            </div>
            <Globe className="w-4 h-4 text-[#C9A96E]" />
          </div>

          <div className="space-y-4">
            {data?.categoryInterest && data.categoryInterest.length > 0 ? (
              data.categoryInterest.map((cat) => (
                <div key={cat.name} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-[#F5F0EB]">{cat.name}</span>
                    <span className="text-[#C9A96E] font-mono">
                      {cat.percentage}% ({cat.views.toLocaleString()} visits)
                    </span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden border border-white/10">
                    <div
                      className="bg-gradient-to-r from-[#C9A96E] to-[#F5F0EB] h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(cat.percentage, 2))}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-[#E0D5C9]/50">
                No catalog items uploaded yet.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Device Breakdown (Mobile vs Desktop) */}
        <div className="p-6 bg-black/40 border border-[#C9A96E]/20 rounded-lg space-y-6">
          <div className="border-b border-white/10 pb-4">
            <h3 className="text-lg font-heading font-bold text-[#F5F0EB]">
              Device Traffic Source
            </h3>
            <p className="text-xs text-[#E0D5C9]/60 font-light">
              Client platform preferences.
            </p>
          </div>

          <div className="space-y-6">
            {/* Mobile Traffic */}
            <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-[#C9A96E]/10 border border-[#C9A96E]/30 rounded text-[#C9A96E]">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#F5F0EB]">Mobile Browsers</p>
                  <p className="text-[10px] text-[#E0D5C9]/50">Smartphones & Tablets</p>
                </div>
              </div>
              <span className="text-lg font-bold font-mono text-[#C9A96E]">
                {data?.deviceBreakdown.mobilePercentage ?? 0}%
              </span>
            </div>

            {/* Desktop Traffic */}
            <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/5 border border-white/20 rounded text-[#E0D5C9]">
                  <Monitor className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#F5F0EB]">Desktop Computers</p>
                  <p className="text-[10px] text-[#E0D5C9]/50">Laptops & Monitors</p>
                </div>
              </div>
              <span className="text-lg font-bold font-mono text-[#E0D5C9]">
                {data?.deviceBreakdown.desktopPercentage ?? 0}%
              </span>
            </div>

            {/* Catalog Upload Stat */}
            <div className="p-4 bg-black/40 border border-[#C9A96E]/20 rounded-lg flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#F5F0EB]">Uploaded Designs</p>
                <p className="text-[10px] text-[#E0D5C9]/50">Active in database</p>
              </div>
              <span className="text-lg font-bold font-mono text-[#C9A96E]">
                {data?.uploadedDesigns ?? 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
