import Link from "next/link";
import { ShieldAlert, ArrowLeft, LayoutDashboard } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <main className="min-h-screen bg-[#0F0F0F] text-[#F5F0EB] flex items-center justify-center p-6 selection:bg-[#C9A96E] selection:text-black">
      <div className="max-w-md w-full bg-[#141414] border border-[#C9A96E]/20 rounded-xl p-8 sm:p-10 shadow-2xl text-center space-y-6 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#C9A96E]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-[#D9534F]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Security Shield Icon */}
        <div className="mx-auto w-16 h-16 rounded-full bg-[#D9534F]/10 border border-[#D9534F]/30 flex items-center justify-center text-[#D9534F]">
          <ShieldAlert className="w-8 h-8" />
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#C9A96E] font-semibold">
            Security & Access Control
          </span>
          <h1 className="text-2xl font-bold uppercase tracking-wider text-[#F5F0EB]">
            Access Restricted
          </h1>
        </div>

        {/* Description */}
        <p className="text-sm text-[#A09585] leading-relaxed">
          You do not have the necessary security credentials or role permissions to access this restricted area.
        </p>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <Link
            href="/"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded bg-transparent border border-white/10 hover:border-[#C9A96E]/40 text-xs uppercase tracking-widest text-[#E0D5C9] hover:text-[#C9A96E] transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Storefront</span>
          </Link>

          <Link
            href="/dashboard/1/payment"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded bg-[#C9A96E] hover:bg-[#b89558] text-xs uppercase tracking-widest text-black font-semibold transition-all shadow-md"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
