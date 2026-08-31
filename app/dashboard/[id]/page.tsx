"use client";

import { Eye, MessageCircle, Shirt, Settings, ArrowUpRight, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function ManagerDashboardPage() {
  const stats = [
    { label: "Total Site Visits", value: "2,840", change: "+14.2%", icon: Eye },
    { label: "WhatsApp Inquiries", value: "186", change: "+24.5%", icon: MessageCircle },
    { label: "Uploaded Designs", value: "24", change: "+4 this week", icon: Shirt },
  ];

  return (
    <div className="p-6 sm:p-10 space-y-8 bg-[#1A1A1A] min-h-screen text-[#F5F0EB]">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#C9A96E]/20 pb-6">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-[#C9A96E] font-semibold">
            Atelier Management
          </span>
          <h1 className="text-3xl font-heading text-[#F5F0EB] mt-1">
            Store Performance & Analytics
          </h1>
        </div>
        
        <Link
          href="/dashboard/manager/settings"
          className="px-5 py-2.5 bg-[#C9A96E] text-[#1A1A1A] text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#F5F0EB] transition-colors flex items-center space-x-2 self-start sm:self-auto"
        >
          <Settings className="w-4 h-4" />
          <span>Customize Site Theme</span>
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="p-6 bg-black/40 border border-[#C9A96E]/20 rounded-lg space-y-4 hover:border-[#C9A96E]/50 transition-colors"
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

      {/* Quick Action & Management Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
        {/* Recent WhatsApp Leads */}
        <div className="p-6 bg-black/40 border border-[#C9A96E]/20 rounded-lg space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="text-lg font-heading text-[#F5F0EB]">Recent Client Inquiries</h3>
            <span className="text-xs text-[#C9A96E] uppercase tracking-widest">Real-time</span>
          </div>

          <div className="space-y-3">
            {[
              { title: "Royal Agbada Ensemble", category: "Ceremonial", time: "10 mins ago" },
              { title: "Sculpted Kaftan", category: "Signature", time: "1 hour ago" },
              { title: "Imperial Senator Suit", category: "Executive", time: "3 hours ago" },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded">
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
        <div className="p-6 bg-black/40 border border-[#C9A96E]/20 rounded-lg space-y-4">
          <div className="border-b border-white/10 pb-4">
            <h3 className="text-lg font-heading text-[#F5F0EB]">Atelier Shortcuts</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/dashboard/manager/products"
              className="p-4 bg-white/5 border border-white/10 hover:border-[#C9A96E] transition-colors rounded block space-y-2 group"
            >
              <div className="flex justify-between items-center text-[#C9A96E]">
                <Shirt className="w-5 h-5" />
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
              <p className="text-sm font-semibold text-[#F5F0EB]">Upload New Design</p>
              <p className="text-xs text-[#E0D5C9]/60 font-light">Add custom native wear images to catalog.</p>
            </Link>

            <Link
              href="/dashboard/manager/settings"
              className="p-4 bg-white/5 border border-white/10 hover:border-[#C9A96E] transition-colors rounded block space-y-2 group"
            >
              <div className="flex justify-between items-center text-[#C9A96E]">
                <Settings className="w-5 h-5" />
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
              <p className="text-sm font-semibold text-[#F5F0EB]">Site Theme & Settings</p>
              <p className="text-xs text-[#E0D5C9]/60 font-light">Toggle fallback images & color scheme.</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
