"use client";
import  AuthProvider from "@/app/components/providers/authProvider";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { OpsSidebar } from "@/app/components/dashboard/OpsSidebar";
import { Menu, X } from "lucide-react";

function SessionGuard({ children }: { children: React.ReactNode }) {
  const { status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      window.location.href = "/login";
    }
  }, [status]);

  return <>{children}</>;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <AuthProvider>
      <SessionGuard>
      <div className="flex min-h-screen w-full bg-[#1A1A1A] text-[#F5F0EB]">
        {/* 1. Desktop & Mobile Sidebar Container */}
        <div
          className={`fixed inset-y-0 left-0 z-40 lg:static transition-transform duration-300 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <OpsSidebar
            collapsed={collapsed}
            onToggleCollapse={() => setCollapsed(!collapsed)}
            onCloseMobile={() => setMobileOpen(false)}
          />
        </div>

        {/* Mobile Dark Overlay Backdrop */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/70 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* 2. Main Dashboard Content Area */}
        <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-[#1A1A1A]">
          {/* Mobile Top Header (Visible only on mobile screens) */}
          <div className="lg:hidden h-14 px-4 flex items-center justify-between border-b border-[#C9A96E]/20 bg-[#1A1A1A] text-[#F5F0EB] shrink-0 sticky top-0 z-20">
            <span className="font-brand text-xs tracking-[0.25em] text-[#C9A96E] font-bold uppercase">
              CIMESSINVEST
            </span>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 text-[#E0D5C9] hover:text-[#C9A96E] transition-colors cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Dynamic Page Views ({children}) */}
          <main className="flex-1 bg-[#1A1A1A] w-full min-h-screen">
            {children}
          </main>
        </div>
      </div>
      </SessionGuard>
    </AuthProvider>
  );
}
