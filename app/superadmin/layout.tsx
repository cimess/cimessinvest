"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, LogOut, ArrowLeft } from "lucide-react";
import { signOut } from "next-auth/react";
import AuthProvider from "@/app/components/providers/authProvider";

export default function SuperadminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const handleLogout = async () => {
    await signOut({ callbackUrl: "/superadmin/login" });
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-[#0F0F0F] text-[#F5F0EB] flex flex-col font-sans selection:bg-[#C9A96E] selection:text-black">
        {/* Top Superadmin Control Bar */}
        <header className="h-16 border-b border-[#C9A96E]/20 bg-[#141414] px-6 sm:px-10 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 rounded bg-[#C9A96E]/10 border border-[#C9A96E]/30 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#C9A96E]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-brand text-xs uppercase tracking-[0.25em] font-bold text-[#F5F0EB]">
                  CIMESSINVEST
                </span>
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-[#C9A96E] text-[#141414] font-bold">
                  SUPERADMIN
                </span>
              </div>
              <p className="text-[11px] text-[#A09585] tracking-wide font-light hidden sm:block">
                Platform Infrastructure, Deal Desk & Quota Management — cimessinvest.com
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/"
              className="text-xs uppercase tracking-wider text-[#A09585] hover:text-[#C9A96E] transition-colors flex items-center space-x-1.5 px-3 py-1.5 rounded border border-white/5 hover:border-[#C9A96E]/30"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Storefront</span>
            </Link>

            <button
              onClick={handleLogout}
              className="text-xs uppercase tracking-wider text-[#D9534F] hover:text-[#ff7875] transition-colors flex items-center space-x-1.5 px-3 py-1.5 rounded border border-white/5 hover:border-[#D9534F]/30 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Main Superadmin Content */}
        <main className="flex-1 w-full bg-[#0F0F0F]">
          {children}
        </main>
      </div>
    </AuthProvider>
  );
}
