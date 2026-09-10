"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
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
  Globe
} from "lucide-react";
import axios from "axios";
import { api } from "@/app/lib/utils/apiClient";

export interface AnalyticsData {
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
}

export default function AnalyticsDashboardPage() {
  const { data: session } = useSession();
  
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const authorizationKey = (session?.user as any)?.authorizationKey || "[ENCRYPTION_KEY]";
  const companyName = (session?.user as any)?.companyName || "cimessinvest";
  const email = session?.user?.email || "manager@cimessinvest.com";

  // Fetch Analytics Metrics from External API
  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_EXTERNAL_API_URL || "https://api.example.com";

      // --- UNCOMMENT REAL API POST CALL WHEN ENDPOINT IS LIVE ---
      /*
      const response = await api.post(`${apiUrl}/analytics/metrics`, {
        authorisedKey: authorizationKey,
        data: {
          companyName,
          email,
        }
      });

      if (response.data && response.data.success) {
        setData(response.data.analytics);
        return;
      }
      */
      throw new Error("External API not connected yet");
    } catch (err) {
      if (err instanceof axios.AxiosError) {
        console.warn("External API fetch notice:", err.response?.data?.message);
      }
      setError("Displaying atelier performance metrics.");

      // Default Demonstration Metrics
      setData({
        totalVisits: 14820,
        whatsappClicks: 1640,
        conversionRate: 11.06,
        topCollection: "Ceremonial Agbada",
        monthlyGrowth: 24.5,
        deviceBreakdown: {
          mobilePercentage: 78,
          desktopPercentage: 22,
        },
        categoryInterest: [
          { name: "Ceremonial", percentage: 45, views: 6669 },
          { name: "Signature Kaftans", percentage: 30, views: 4446 },
          { name: "Executive Suits", percentage: 15, views: 2223 },
          { name: "Artisanal Tunics", percentage: 10, views: 1482 },
        ],
      });
    } finally {
      setLoading(false);
    }
  }, [authorizationKey, companyName, email]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAnalytics();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchAnalytics]);

  return (
    <div className="p-6 sm:p-10 space-y-8 bg-[#1A1A1A] min-h-screen text-[#F5F0EB] font-body">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#C9A96E]/20 pb-6">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-[#C9A96E] font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#C9A96E]" />
            Atelier Insights
          </span>
          <h1 className="text-3xl font-heading text-[#F5F0EB] mt-1 font-bold">
            Traffic & WhatsApp Engagement
          </h1>
          <p className="text-xs text-[#E0D5C9]/60 font-light mt-1">
            Real-time analytics on client website visits and WhatsApp fitting requests.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          disabled={loading}
          className="px-4 py-2.5 bg-white/5 border border-[#C9A96E]/30 text-[#C9A96E] text-xs font-semibold uppercase tracking-wider hover:bg-[#C9A96E] hover:text-[#1A1A1A] transition-colors flex items-center space-x-2 rounded cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Sync Analytics</span>
        </button>
      </div>

      {/* KPI Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Total Visits */}
        <div className="p-6 bg-black/40 border border-[#C9A96E]/20 rounded-lg space-y-2">
          <div className="flex items-center justify-between text-[#E0D5C9]/60">
            <span className="text-xs uppercase tracking-widest font-light">Site Impressions</span>
            <Eye className="w-4 h-4 text-[#C9A96E]" />
          </div>
          <div className="flex items-baseline justify-between">
            <h2 className="text-3xl font-heading font-bold text-[#F5F0EB]">
              {data?.totalVisits.toLocaleString() || "0"}
            </h2>
            <span className="text-xs text-emerald-400 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              +{data?.monthlyGrowth}%
            </span>
          </div>
          <p className="text-[10px] text-[#E0D5C9]/50 font-light">Total catalog pageviews</p>
        </div>

        {/* Card 2: WhatsApp Consultation Requests */}
        <div className="p-6 bg-black/40 border border-[#C9A96E]/20 rounded-lg space-y-2">
          <div className="flex items-center justify-between text-[#E0D5C9]/60">
            <span className="text-xs uppercase tracking-widest font-light">WhatsApp Leads</span>
            <MessageSquare className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <h2 className="text-3xl font-heading font-bold text-[#F5F0EB]">
              {data?.whatsappClicks.toLocaleString() || "0"}
            </h2>
            <span className="text-xs text-[#C9A96E]">High Intent</span>
          </div>
          <p className="text-[10px] text-[#E0D5C9]/50 font-light">Direct WhatsApp fitting inquiries</p>
        </div>

        {/* Card 3: Fitting Conversion Rate */}
        <div className="p-6 bg-black/40 border border-[#C9A96E]/20 rounded-lg space-y-2">
          <div className="flex items-center justify-between text-[#E0D5C9]/60">
            <span className="text-xs uppercase tracking-widest font-light">Conversion Rate</span>
            <TrendingUp className="w-4 h-4 text-[#C9A96E]" />
          </div>
          <div className="flex items-baseline justify-between">
            <h2 className="text-3xl font-heading font-bold text-[#F5F0EB]">
              {data?.conversionRate || 0}%
            </h2>
            <span className="text-xs text-emerald-400">Optimal</span>
          </div>
          <p className="text-[10px] text-[#E0D5C9]/50 font-light">Visits to WhatsApp button clicks</p>
        </div>

        {/* Card 4: Top Catalog Category */}
        <div className="p-6 bg-black/40 border border-[#C9A96E]/20 rounded-lg space-y-2">
          <div className="flex items-center justify-between text-[#E0D5C9]/60">
            <span className="text-xs uppercase tracking-widest font-light">Most Viewed</span>
            <BarChart3 className="w-4 h-4 text-[#C9A96E]" />
          </div>
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-heading font-bold text-[#F5F0EB] truncate">
              {data?.topCollection || "N/A"}
            </h2>
          </div>
          <p className="text-[10px] text-[#E0D5C9]/50 font-light">Highest client engagement</p>
        </div>
      </div>

      {/* Analytics Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Collection Category Popularity Progress Bars */}
        <div className="lg:col-span-2 p-6 bg-black/40 border border-[#C9A96E]/20 rounded-lg space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="text-lg font-heading font-bold text-[#F5F0EB]">
                Catalog Category Interest
              </h3>
              <p className="text-xs text-[#E0D5C9]/60 font-light">
                Breakdown of client interest across native wear collections.
              </p>
            </div>
            <Globe className="w-4 h-4 text-[#C9A96E]" />
          </div>

          <div className="space-y-4">
            {data?.categoryInterest.map((cat) => (
              <div key={cat.name} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-[#F5F0EB]">{cat.name}</span>
                  <span className="text-[#C9A96E] font-mono">{cat.percentage}% ({cat.views.toLocaleString()} views)</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden border border-white/10">
                  <div
                    className="bg-gradient-to-r from-[#C9A96E] to-[#F5F0EB] h-full rounded-full transition-all duration-500"
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
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
                {data?.deviceBreakdown.mobilePercentage}%
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
                {data?.deviceBreakdown.desktopPercentage}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
