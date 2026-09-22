"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Store, 
  Menu, 
  X, 
  ArrowRight, 
  LogIn, 
  FileText, 
  Mail, 
  Sparkles, 
  CheckCircle2, 
  ExternalLink,
  ShieldCheck,
  CreditCard,
  Zap
} from "lucide-react";

export default function MarketingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showDocsModal, setShowDocsModal] = useState(false);

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen || showDocsModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen, showDocsModal]);

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <header className="relative z-30 border-b border-white/5 backdrop-blur-md bg-[#0B0B0E]/85 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          
          {/* LEFT: BRAND & MOBILE 3-BAR BUTTON */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Mobile: Tactile 3-Bar Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-9 h-9 rounded-xl bg-gradient-to-br from-[#C9A96E] to-[#9C7D43] flex items-center justify-center text-black font-bold shadow-md shadow-[#C9A96E]/25 hover:brightness-110 active:scale-95 transition-all cursor-pointer select-none"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-black stroke-[2.5]" />
              ) : (
                <Menu className="w-5 h-5 text-black stroke-[2.5]" />
              )}
            </button>

            {/* Desktop: Brand Icon */}
            <Link 
              href="/" 
              className="hidden md:flex w-10 h-10 rounded-xl bg-gradient-to-br from-[#C9A96E] to-[#9C7D43] items-center justify-center text-black font-bold shadow-md shadow-[#C9A96E]/20 hover:scale-105 transition-transform"
            >
              <Store className="w-5 h-5" />
            </Link>

            {/* Brand Wordmark */}
            <Link href="/" className="flex flex-col" onClick={closeMenu}>
              <span className="font-bold text-base sm:text-lg tracking-wider text-white font-serif">
                CIMESS<span className="text-[#C9A96E]">INVEST</span>
              </span>
              <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.2em] text-zinc-400 font-mono hidden xs:block">
                Social Commerce Infrastructure
              </span>
            </Link>
          </div>

          {/* DESKTOP NAV LINKS */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-medium uppercase tracking-wider text-zinc-300">
            <a href="#features" className="hover:text-[#C9A96E] transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-[#C9A96E] transition-colors">How It Works</a>
            <a href="#settlements" className="hover:text-[#C9A96E] transition-colors">24h Settlement</a>
            <button 
              type="button" 
              onClick={() => setShowDocsModal(true)}
              className="hover:text-[#C9A96E] transition-colors cursor-pointer"
            >
              Platform Docs
            </button>
          </nav>

          {/* RIGHT CTAs */}
          <div className="flex items-center gap-2 sm:gap-3">
             <Link
              href="/docs"
              className="hidden sm:inline-block px-4 py-2 text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
            >
              Documentation
            </Link>
            <Link
              href="/login"
              className="hidden sm:inline-block px-4 py-2 text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-full bg-gradient-to-r from-[#C9A96E] to-[#D4B87D] text-black font-bold text-[11px] sm:text-xs tracking-wider uppercase hover:brightness-110 active:scale-95 transition-all shadow-md shadow-[#C9A96E]/20"
            >
              <span>Launch Store</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* MOBILE SLIDE-DOWN DRAWER */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden animate-fade-in">
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
            onClick={closeMenu}
          />

          {/* Menu Drawer Content */}
          <div className="fixed top-16 inset-x-0 bottom-0 bg-[#0E0E13] border-t border-white/10 overflow-y-auto p-5 flex flex-col justify-between space-y-6">
            <div className="space-y-6">
              {/* Top Quick Actions (Sign In & Launch Store) */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Link
                  href="/login"
                  onClick={closeMenu}
                  className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-white font-medium text-xs tracking-wider hover:bg-white/10 active:scale-95 transition-all"
                >
                  <LogIn className="w-4 h-4 text-[#C9A96E]" />
                  <span>Sign In</span>
                </Link>
                <Link
                  href="/register"
                  onClick={closeMenu}
                  className="flex items-center justify-center gap-1.5 p-3.5 rounded-xl bg-gradient-to-r from-[#C9A96E] to-[#D4B87D] text-black font-bold text-xs tracking-wider uppercase shadow-lg shadow-[#C9A96E]/20 active:scale-95 transition-all"
                >
                  <span>Launch Store</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Navigation Links */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-zinc-500 px-3">
                  Platform Documentation
                </span>
                <div className="space-y-1 pt-1">
                  <a
                    href="/docs"
                    onClick={closeMenu}
                    className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-white/5 text-sm text-zinc-200 transition-colors"
                  >
                    <span className="flex items-center gap-3">
                      <Zap className="w-4 h-4 text-[#C9A96E]" />
                      <span>Platform Features</span>
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-600" />
                  </a>

                  <a
                    href="#how-it-works"
                    onClick={closeMenu}
                    className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-white/5 text-sm text-zinc-200 transition-colors"
                  >
                    <span className="flex items-center gap-3">
                      <Sparkles className="w-4 h-4 text-[#C9A96E]" />
                      <span>How It Works (3 Steps)</span>
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-600" />
                  </a>

                  <a
                    href="#settlements"
                    onClick={closeMenu}
                    className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-white/5 text-sm text-zinc-200 transition-colors"
                  >
                    <span className="flex items-center gap-3">
                      <CreditCard className="w-4 h-4 text-[#C9A96E]" />
                      <span>24h Automated Settlement</span>
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-600" />
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      closeMenu();
                      setShowDocsModal(true);
                    }}
                    className="w-full flex items-center justify-between px-3 py-3 rounded-xl hover:bg-white/5 text-sm text-[#C9A96E] transition-colors text-left"
                  >
                    <span className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-[#C9A96E]" />
                      <span className="font-medium">Platform Docs & Architecture</span>
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#C9A96E]/10 border border-[#C9A96E]/30 uppercase">
                      Docs
                    </span>
                  </button>
                </div>
              </div>

              {/* Direct Contact & Social Channels */}
              <div className="space-y-2 pt-2 border-t border-white/5">
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-zinc-500 px-3">
                  Direct Contact & Support
                </span>
                
                {/* Gmail Support */}
                <a
                  href="mailto:cimessinvest@gmail.com?subject=Merchant%20Support%20Inquiry"
                  className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-[#C9A96E]/40 transition-all text-xs text-zinc-300 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-white font-medium">Official Gmail</span>
                      <span className="text-[11px] text-zinc-400 font-mono">cimessinvest@gmail.com</span>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white" />
                </a>

                {/* X / Twitter Profile */}
                <a
                  href="https://x.com/cimessinvest"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-[#C9A96E]/40 transition-all text-xs text-zinc-300 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 text-white flex items-center justify-center">
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-white font-medium">Follow on X (Twitter)</span>
                      <span className="text-[11px] text-zinc-400 font-mono">@cimessinvest</span>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white" />
                </a>
              </div>
            </div>

            {/* Bottom Footer Note */}
            <div className="pt-4 border-t border-white/5 text-center text-[10px] text-zinc-500 font-mono">
              <span>Cimessinvest Platform • 14-Day Free Trial Available</span>
            </div>
          </div>
        </div>
      )}

      {/* PLATFORM DOCS MODAL */}
      {showDocsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#0E0E13] border border-white/10 rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-2 text-[#C9A96E]">
                <FileText className="w-5 h-5" />
                <h3 className="font-serif font-bold text-lg text-white">Platform Documentation</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDocsModal(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-zinc-300 leading-relaxed">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                <h4 className="font-semibold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#C9A96E]" />
                  What is Cimessinvest?
                </h4>
                <p className="text-zinc-400">
                  Cimessinvest is high-converting social commerce infrastructure for African luxury fashion ateliers, designers, and local merchants. It gives you a dedicated branded subdomain (`yourbrand.cimessinvest.com`) to place directly in your Instagram, TikTok, and WhatsApp bios.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                <h4 className="font-semibold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  How Automated 24h Settlement Works
                </h4>
                <p className="text-zinc-400">
                  We integrate directly with Paystack Split Accounts. Customer orders paid via Debit Card, Bank Transfer, or USSD are escrow-protected and automatically split, landing directly in your verified Nigerian commercial bank account within 24 hours.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                <h4 className="font-semibold text-white flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#C9A96E]" />
                  Official Inquiries & Direct Support
                </h4>
                <p className="text-zinc-400">
                  For platform onboarding, custom brand integrations, or enterprise inquiries:
                </p>
                <div className="pt-1 flex flex-col gap-1 font-mono text-[11px] text-zinc-300">
                  <span>Email: <a href="mailto:cimessinvest@gmail.com" className="text-[#C9A96E] underline">cimessinvest@gmail.com</a></span>
                  <span>X / Twitter: <a href="https://x.com/cimessinvest" target="_blank" rel="noopener noreferrer" className="text-[#C9A96E] underline">@cimessinvest</a></span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowDocsModal(false)}
                className="w-full py-3 rounded-xl bg-[#C9A96E] text-black font-bold text-xs uppercase tracking-wider hover:bg-[#D4B87D] transition-colors shadow-lg shadow-[#C9A96E]/20"
              >
                Close Documentation
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
