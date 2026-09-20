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

function DashboardContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session } = useSession();
  const userImage = (session?.user as any)?.image;

  return (
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
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full border border-[#C9A96E]/60 overflow-hidden bg-black/50 shrink-0 flex items-center justify-center p-0.5">
              <img
                src={userImage || "/bg-img/native10.jpg"}
                alt="Store Profile"
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/bg-img/native10.jpg";
                }}
              />
            </div>
            <span className="font-brand text-xs tracking-[0.25em] text-[#C9A96E] font-bold uppercase">
              CIMESSINVEST
            </span>
          </div>
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
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <SessionGuard>
        <DashboardContent>{children}</DashboardContent>
      </SessionGuard>
    </AuthProvider>
  );
}
