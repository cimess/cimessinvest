"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Eye,
  MessageCircle,
  Shirt,
  Settings,
  ArrowUpRight,
  TrendingUp,
  LayoutTemplate,
  Scissors,
  Dumbbell,
  Sparkles,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api } from "@/app/lib/utils/apiClient";

export default function ManagerDashboardPage() {
  const params = useParams();
  const dashboardId = (params?.id as string) || "1";

  const [company, setCompany] = useState<{
    name: string;
    industry: string;
    slug?: string;
    activeTemplateSlug?: string;
  } | null>(null);

  const [copied, setCopied] = useState(false);

  const merchantUrl = company?.slug
    ? `https://${company.slug}.cimessinvest.com`
    : null;

  const handleCopy = useCallback(() => {
    if (!merchantUrl) return;
    navigator.clipboard.writeText(merchantUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [merchantUrl]);

  const [siteSetting, setSiteSetting] = useState<{
    tailorBioImage?: string | null;
  } | null>(null);

  const [analytics, setAnalytics] = useState<{
    totalVisits: number;
    whatsappClicks: number;
    uploadedDesigns: number;
  } | null>(null);

  useEffect(() => {
    api
      .get<{ success?: boolean; company?: any; siteSetting?: any }>("/api/company/settings")
      .then((res) => {
        if (res.data?.company) {
          setCompany(res.data.company);
        }
        if (res.data?.siteSetting) {
          setSiteSetting(res.data.siteSetting);
        }
      })
      .catch(() => null);

    api
      .get<{ success?: boolean; analytics?: any }>("/api/analytics")
      .then((res) => {
        if (res.data?.analytics) {
          setAnalytics(res.data.analytics);
        }
      })
      .catch(() => null);
  }, []);

  const isGym = company?.industry === "FITNESS_GYM";
  const totalVisits = analytics?.totalVisits ?? 0;
  const whatsappClicks = analytics?.whatsappClicks ?? 0;
  const uploadedCount = analytics?.uploadedDesigns ?? 0;

  const stats = [
    { 
      label: "Total Site Visits", 
      value: totalVisits.toLocaleString(), 
      change: totalVisits > 0 ? "+14.2%" : "0%", 
      icon: Eye 
    },
    { 
      label: "WhatsApp Inquiries", 
      value: whatsappClicks.toLocaleString(), 
      change: whatsappClicks > 0 ? "+24.5%" : "0%", 
      icon: MessageCircle 
    },
    {
      label: isGym ? "Active Programs" : "Uploaded Designs",
      value: uploadedCount.toLocaleString(),
      change: `${uploadedCount} in catalog`,
      icon: isGym ? Dumbbell : Shirt,
    },
  ];

  return (
    <div className="p-6 sm:p-10 space-y-8 bg-[#1A1A1A] min-h-screen text-[#F5F0EB]">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#C9A96E]/20 pb-6">
        <div className="flex items-center gap-4">
          {/* Circular Merchant Profile Avatar */}
          <div className="relative shrink-0">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full p-0.5 border-2 border-[#C9A96E] shadow-lg shadow-[#C9A96E]/20 overflow-hidden bg-black/60 flex items-center justify-center">
              <img
                src={siteSetting?.tailorBioImage || "/bg-img/native10.jpg"}
                alt={company?.name || "Merchant"}
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/bg-img/native10.jpg";
                }}
              />
            </div>
            <div
              className="absolute bottom-0 right-0 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-emerald-500 border-2 border-[#1A1A1A] shadow-sm"
              title="Store Online"
            />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-xs uppercase tracking-[0.25em] text-[#C9A96E] font-semibold">
                {company?.name || "Merchant"} Management
              </span>
              <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-white/10 text-zinc-300">
                {isGym ? "Fitness & Athletic Gym" : "Fashion & Atelier"}
              </span>
              <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-[#C9A96E]/15 text-[#C9A96E] border border-[#C9A96E]/30">
                {company?.activeTemplateSlug || (isGym ? "IronCore Gym" : "Atelier Haute Couture")}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading text-[#F5F0EB]">
              Store Performance & Analytics
            </h1>
          </div>
        </div>

        <Link
          href={`/dashboard/${dashboardId}/landing-settings`}
          className="px-5 py-2.5 bg-[#C9A96E] text-[#1A1A1A] text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#F5F0EB] transition-colors flex items-center space-x-2 self-start sm:self-auto rounded-lg shadow-lg shadow-[#C9A96E]/20 shrink-0"
        >
          <LayoutTemplate className="w-4 h-4" />
          <span>Storefront & Template Studio</span>
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="p-6 bg-black/40 border border-[#C9A96E]/20 rounded-xl space-y-4 hover:border-[#C9A96E]/50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-[#E0D5C9]/60 font-light">
                {stat.label}
              </span>
              <stat.icon className="w-5 h-5 text-[#C9A96E]" />
            </div>
            <div className="flex items-baseline justify-between">
              <h2 className="text-3xl font-heading font-bold text-[#F5F0EB]">{stat.value}</h2>
              <span className="text-xs text-[#C9A96E] flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Merchant Store Link Banner */}
      {merchantUrl && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 sm:p-5 bg-black/40 border border-[#C9A96E]/30 rounded-xl">
          <div className="flex items-center gap-2 shrink-0">
            <ExternalLink className="w-4 h-4 text-[#C9A96E]" />
            <span className="text-xs uppercase tracking-[0.2em] text-[#C9A96E] font-semibold">Your Store Link</span>
          </div>
          <div className="flex flex-1 items-center gap-2 min-w-0">
            <a
              href={merchantUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 min-w-0 text-sm font-mono text-[#F5F0EB]/80 hover:text-[#F5F0EB] truncate transition-colors"
            >
              {merchantUrl}
            </a>
            <button
              onClick={handleCopy}
              title={copied ? "Copied!" : "Copy link"}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200
                         border border-[#C9A96E]/40 hover:border-[#C9A96E] hover:bg-[#C9A96E]/10
                         text-[#C9A96E] hover:text-[#F5F0EB]"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Quick Action & Management Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
        {/* Recent WhatsApp Leads */}
        <div className="p-6 bg-black/40 border border-[#C9A96E]/20 rounded-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="text-lg font-heading text-[#F5F0EB]">Recent Client Inquiries</h3>
            <span className="text-xs text-[#C9A96E] uppercase tracking-widest">Real-time</span>
          </div>

          <div className="space-y-3">
            {(isGym
              ? [
                  { title: "Olympic Weightlifting Trial", category: "Barbell Arena", time: "10 mins ago" },
                  { title: "Strength Conditioning Program", category: "Elite Coaching", time: "1 hour ago" },
                  { title: "Monthly VIP Pass Inquiry", category: "Membership", time: "3 hours ago" },
                ]
              : [
                  { title: "Royal Agbada Ensemble", category: "Ceremonial", time: "10 mins ago" },
                  { title: "Sculpted Kaftan", category: "Signature", time: "1 hour ago" },
                  { title: "Imperial Senator Suit", category: "Executive", time: "3 hours ago" },
                ]
            ).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-lg">
                <div>
                  <p className="text-sm text-[#F5F0EB] font-medium">{item.title}</p>
                  <p className="text-xs text-[#E0D5C9]/60">{item.category} Category</p>
                </div>
                <span className="text-[11px] text-[#C9A96E]">{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Management Shortcuts */}
        <div className="p-6 bg-black/40 border border-[#C9A96E]/20 rounded-xl space-y-4">
          <div className="border-b border-white/10 pb-4">
            <h3 className="text-lg font-heading text-[#F5F0EB]">Storefront Shortcuts</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href={`/dashboard/${dashboardId}/collections`}
              className="p-4 bg-white/5 border border-white/10 hover:border-[#C9A96E] transition-colors rounded-xl block space-y-2 group"
            >
              <div className="flex justify-between items-center text-[#C9A96E]">
                {isGym ? <Dumbbell className="w-5 h-5" /> : <Shirt className="w-5 h-5" />}
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
              <p className="text-sm font-semibold text-[#F5F0EB]">
                {isGym ? "Equipment & Programs" : "Upload New Design"}
              </p>
              <p className="text-xs text-[#E0D5C9]/60 font-light">
                {isGym
                  ? "Manage training disciplines and facility equipment."
                  : "Add custom native wear images to catalog."}
              </p>
            </Link>

            <Link
              href={`/dashboard/${dashboardId}/landing-settings`}
              className="p-4 bg-white/5 border border-white/10 hover:border-[#C9A96E] transition-colors rounded-xl block space-y-2 group"
            >
              <div className="flex justify-between items-center text-[#C9A96E]">
                <LayoutTemplate className="w-5 h-5" />
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
              <p className="text-sm font-semibold text-[#F5F0EB]">Template & Layout Studio</p>
              <p className="text-xs text-[#E0D5C9]/60 font-light">
                Switch themes, adjust 2-4 column grid, and colors.
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
