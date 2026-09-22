import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/app/lib/prisma/prisma";
import MarketingHeader from "@/app/components/landing/MarketingHeader";
import { 
  Sparkles, 
  ArrowRight, 
  Store, 
  ShieldCheck, 
  Zap, 
  CreditCard, 
  Smartphone, 
  Layers, 
  ChevronRight,
  Clock,
  TrendingUp,
  CheckCircle2,
  Globe,
  MessageSquare
} from "lucide-react";
import CookieConsentBanner from "./components/cookieConsentBanner/cookieconsent";

export const revalidate = 60; // ISR cache 60 seconds

export const metadata: Metadata = {
  title: "Cimessinvest — The Commerce Engine for African Brands & Ateliers",
  description: "Transform your social audience into guaranteed revenue. Bespoke link-in-bio storefronts, multi-image product showcases, and automated 24-hour Paystack settlements.",
};

export default async function PlatformMarketingHomePage() {
  // Fetch active verified merchants strictly for crawler discovery and sitemap indexing
  const activeMerchants = await prisma.company
    .findMany({
      where: { status: "ACTIVE" },
      include: { siteSetting: true },
      orderBy: { updatedAt: "desc" },
      take: 24,
    })
    .catch(() => []);

  // Schema.org structured data for Googlebot and search crawlers
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Cimessinvest",
    "url": "https://cimessinvest.com",
    "description": "Social Commerce Infrastructure for African Brands & Ateliers",
    "hasPart": activeMerchants.map((m) => ({
      "@type": "Store",
      "name": m.siteSetting?.companyName || m.name,
      "url": `https://${m.slug}.cimessinvest.com/store/`,
    })),
  };

  return (
    <div className="min-h-screen bg-[#0B0B0E] text-[#F5F0EB] font-sans selection:bg-[#C9A96E]/30 selection:text-white pb-24 sm:pb-0">
      {/* Schema.org Structured Data for Googlebot Indexing */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Background Ambience Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[340px] sm:w-[700px] h-[340px] sm:h-[500px] bg-gradient-to-b from-[#C9A96E]/15 to-transparent blur-[100px] sm:blur-[140px] rounded-full" />
        <div className="absolute top-[40%] left-[-15%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-[#C9A96E]/5 blur-[120px] sm:blur-[160px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-15%] w-[320px] sm:w-[600px] h-[320px] sm:h-[600px] bg-[#C9A96E]/8 blur-[120px] sm:blur-[180px] rounded-full" />
      </div>

      {/* Global Navigation Header with Mobile 3-Bar Menu */}
      <MarketingHeader />

      {/* CookieConsentBanner Component */}
      <CookieConsentBanner />

      <main className="relative z-10">
        {/* HERO SECTION (MOBILE-FIRST ARCHITECTURE) */}
        <section className="relative pt-10 sm:pt-20 pb-14 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C9A96E]/10 border border-[#C9A96E]/30 text-[#C9A96E] text-[10px] sm:text-xs font-mono tracking-wider uppercase mb-5 sm:mb-8">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Dedicated Social Commerce Engine for Nigerian Merchants</span>
          </div>

          {/* Primary Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-serif tracking-tight text-white leading-[1.15] sm:leading-[1.1] mb-4 sm:mb-6">
            Turn Social Attention Into <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#DFBF82] via-[#C9A96E] to-[#9C7D43]">
              Guaranteed Bank Payouts.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-xs sm:text-base text-zinc-400 font-light leading-relaxed mb-6 sm:mb-10">
            The mobile-first link-in-bio storefront built for Instagram, TikTok, and WhatsApp merchants. Multi-angle product showcases, 1-tap WhatsApp invoices, and automated 24-hour Paystack bank settlements.
          </p>

          {/* Call-to-Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-10 sm:mb-14 w-full max-w-sm sm:max-w-none mx-auto">
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#C9A96E] to-[#D4B87D] text-black font-bold text-xs sm:text-sm uppercase tracking-wider hover:brightness-110 active:scale-[0.98] transition-all shadow-xl shadow-[#C9A96E]/20"
            >
              <span>Create Your Brand Store</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-white font-medium text-xs sm:text-sm tracking-wider hover:bg-white/10 active:scale-[0.98] transition-colors"
            >
              <span>Merchant Sign In</span>
              <ChevronRight className="w-4 h-4 text-[#C9A96E]" />
            </Link>
          </div>

          {/* HERO VISUAL: FLOATING MOBILE STOREFRONT SHOWCASE */}
          <div className="relative max-w-xs sm:max-w-md lg:max-w-lg mx-auto">
            {/* Background Aura */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#C9A96E]/25 via-[#C9A96E]/5 to-transparent blur-3xl -z-10 rounded-full scale-110" />

            {/* Floating Trust Badge - Top Left */}
            <div className="absolute -top-3 -left-2 sm:-left-6 z-20 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0B0B0E]/90 border border-emerald-500/30 text-emerald-400 text-[10px] sm:text-xs font-mono shadow-xl backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-semibold">Paystack 24h Payout</span>
            </div>

            {/* Floating Trust Badge - Bottom Right */}
            <div className="absolute -bottom-3 -right-2 sm:-right-6 z-20 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0B0B0E]/90 border border-[#C9A96E]/40 text-[#C9A96E] text-[10px] sm:text-xs font-mono shadow-xl backdrop-blur-md">
              <MessageSquare className="w-3.5 h-3.5 text-[#25D366]" />
              <span className="font-semibold text-zinc-200">1-Tap WhatsApp Invoice</span>
            </div>

            {/* High-Resolution Mobile Mockup */}
            <div className="relative rounded-3xl p-2 sm:p-3 bg-gradient-to-b from-white/15 to-white/5 border border-white/10 shadow-2xl backdrop-blur-sm overflow-hidden">
              <Image
                src="/images/marketing/mobile-storefront.jpg"
                alt="Cimessinvest Mobile Storefront Preview"
                width={800}
                height={600}
                priority
                sizes="(max-width: 640px) 90vw, (max-width: 1024px) 450px, 540px"
                className="w-full h-auto rounded-2xl object-cover shadow-2xl"
              />
            </div>
          </div>

          {/* CORE TRUST PILLARS (TOUCH-SWIPE ON MOBILE, GRID ON DESKTOP) */}
          <div className="mt-12 sm:mt-16 pt-8 border-t border-white/5 max-w-5xl mx-auto">
            <div className="flex overflow-x-auto no-scrollbar gap-3 pb-2 snap-x sm:grid sm:grid-cols-4 sm:gap-4 text-left">
              <div className="min-w-[240px] sm:min-w-0 snap-center p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                <div className="flex items-center gap-2 text-[#C9A96E] mb-1.5">
                  <CreditCard className="w-4 h-4" />
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-300">Automated Split</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">Zero manual transfers. Paystack splits straight to your subaccount.</p>
              </div>

              <div className="min-w-[240px] sm:min-w-0 snap-center p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                <div className="flex items-center gap-2 text-[#C9A96E] mb-1.5">
                  <Clock className="w-4 h-4" />
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-300">24-Hour Settlement</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">Clear escrow protection & rapid automated payout release.</p>
              </div>

              <div className="min-w-[240px] sm:min-w-0 snap-center p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                <div className="flex items-center gap-2 text-[#C9A96E] mb-1.5">
                  <Smartphone className="w-4 h-4" />
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-300">Mobile-First</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">Touch-swipe multi-angle carousels tailored for social media buyers.</p>
              </div>

              <div className="min-w-[240px] sm:min-w-0 snap-center p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                <div className="flex items-center gap-2 text-[#C9A96E] mb-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-300">Dispute Shield</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">Built-in customer verification prevents fraud & chargebacks.</p>
              </div>
            </div>
          </div>
        </section>

        {/* PLATFORM FEATURES WITH EMBEDDED VISUAL ASSETS */}
        <section id="features" className="py-16 sm:py-24 border-t border-white/5 bg-[#0e0e13]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-2.5">
              <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.25em] text-[#C9A96E]">
                Why Top Brands Choose Cimessinvest
              </span>
              <h2 className="text-2xl sm:text-4xl font-serif font-bold text-white">
                Everything You Need to Run Your Digital Atelier
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 font-light">
                Built specifically for custom clothiers, bespoke tailors, gym facilities, and social retailers in Nigeria.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {/* Feature 1: Subdomain */}
              <div className="p-6 sm:p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-[#C9A96E]/40 transition-all duration-300 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="w-11 h-11 rounded-xl bg-[#C9A96E]/10 border border-[#C9A96E]/30 text-[#C9A96E] flex items-center justify-center">
                    <Zap className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-serif font-semibold text-white">Custom Brand Subdomains</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Instantly deploy your own professional branded link to put in your Instagram & TikTok bio.
                  </p>

                  {/* Simulated URL Pill */}
                  <div className="p-3 rounded-xl bg-black/60 border border-white/10 font-mono text-xs flex items-center justify-between text-zinc-300">
                    <div className="flex items-center gap-2 truncate">
                      <Globe className="w-3.5 h-3.5 text-[#C9A96E] shrink-0" />
                      <span className="text-[#C9A96E] font-bold">yourbrand</span>
                      <span className="text-zinc-500">.cimessinvest.com</span>
                    </div>
                    <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-widest shrink-0">
                      Live
                    </span>
                  </div>
                </div>

                <ul className="space-y-2 text-xs text-zinc-300 pt-4 border-t border-white/5">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#C9A96E]" /> Universal link-in-bio</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#C9A96E]" /> Sub-second load times</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#C9A96E]" /> Custom theme colors</li>
                </ul>
              </div>

              {/* Feature 2: Multi-Angle Bespoke Showcase with Atelier Image */}
              <div className="p-6 sm:p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-[#C9A96E]/40 transition-all duration-300 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="w-11 h-11 rounded-xl bg-[#C9A96E]/10 border border-[#C9A96E]/30 text-[#C9A96E] flex items-center justify-center">
                    <Layers className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-serif font-semibold text-white">Multi-Angle Bespoke Showcase</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Upload multiple high-resolution photos of each outfit, fabric detail, or fitness package with native swipe.
                  </p>

                  {/* Embedded Visual: Atelier Craftsmanship */}
                  <div className="relative rounded-xl overflow-hidden border border-white/10 aspect-video group">
                    <Image
                      src="/images/marketing/atelier-craft.jpg"
                      alt="African Bespoke Atelier Craftsmanship"
                      width={600}
                      height={338}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex items-end p-3">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#C9A96E]">
                        High-Fashion Atelier Quality
                      </span>
                    </div>
                  </div>
                </div>

                <ul className="space-y-2 text-xs text-zinc-300 pt-4 border-t border-white/5">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#C9A96E]" /> Cloudinary CDN optimization</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#C9A96E]" /> Native swipeable carousels</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#C9A96E]" /> 1-Tap item recommendations</li>
                </ul>
              </div>

              {/* Feature 3: Automated Bank Settlement with Fintech Image */}
              <div id="settlements" className="p-6 sm:p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-[#C9A96E]/40 transition-all duration-300 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="w-11 h-11 rounded-xl bg-[#C9A96E]/10 border border-[#C9A96E]/30 text-[#C9A96E] flex items-center justify-center">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-serif font-semibold text-white">Automated Bank Settlement</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Customer payments via Card, USSD, or Bank Transfer are automatically split, clearing into your Nigerian bank account within 24 hours.
                  </p>

                  {/* Embedded Visual: Settlement Dashboard */}
                  <div className="relative rounded-xl overflow-hidden border border-white/10 aspect-video group">
                    <Image
                      src="/images/marketing/fintech-settlement.jpg"
                      alt="Automated Paystack Split Settlements"
                      width={600}
                      height={338}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex items-end p-3">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400">
                        ₦ Naira Direct Bank Payouts
                      </span>
                    </div>
                  </div>
                </div>

                <ul className="space-y-2 text-xs text-zinc-300 pt-4 border-t border-white/5">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#C9A96E]" /> Official Paystack integration</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#C9A96E]" /> Real-time subaccount ledger</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#C9A96E]" /> Zero manual reconciliation</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS SECTION (MOBILE STEPPER) */}
        <section id="how-it-works" className="py-16 sm:py-24 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-2.5">
              <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.25em] text-[#C9A96E]">
                Effortless Onboarding
              </span>
              <h2 className="text-2xl sm:text-4xl font-serif font-bold text-white">
                Launch in 3 Simple Steps
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 font-light">
                From registration to taking customer orders in under 5 minutes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                <span className="text-2xl sm:text-3xl font-serif font-bold text-[#C9A96E]">01</span>
                <h3 className="text-base sm:text-lg font-serif font-semibold text-white">Claim Your Subdomain</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Choose your brand handle (e.g. <code className="text-[#C9A96E] font-mono">yourbrand</code>) and customize your brand logo, bio, and signature theme colors.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                <span className="text-2xl sm:text-3xl font-serif font-bold text-[#C9A96E]">02</span>
                <h3 className="text-base sm:text-lg font-serif font-semibold text-white">Upload Your Showcase</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Batch drop multiple photos per piece. Set your bespoke prices, sizing, and inventory details in your merchant dashboard.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                <span className="text-2xl sm:text-3xl font-serif font-bold text-[#C9A96E]">03</span>
                <h3 className="text-base sm:text-lg font-serif font-semibold text-white">Sell on WhatsApp & Socials</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Paste your link into Instagram bio or send 1-tap checkout links in WhatsApp. Enjoy automated Paystack splits to your bank.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* BOTTOM CALL TO ACTION BANNER */}
        <section className="py-16 sm:py-24 border-t border-white/5 bg-gradient-to-b from-[#111117] to-[#0B0B0E] text-center px-4 sm:px-6">
          <div className="max-w-3xl mx-auto space-y-5 sm:space-y-6">
            <h2 className="text-2xl sm:text-5xl font-serif font-bold text-white tracking-tight">
              Ready to Upgrade Your Social Selling?
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 font-light leading-relaxed max-w-xl mx-auto">
              Join leading fashion ateliers, designers, and local merchants scaling their revenue with dedicated subdomains and automated split payouts.
            </p>
            <div className="pt-2 sm:pt-4">
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-[#C9A96E] to-[#D4B87D] text-black font-bold text-xs sm:text-sm uppercase tracking-wider hover:brightness-110 active:scale-[0.98] transition-all shadow-xl shadow-[#C9A96E]/20"
              >
                <span>Register Your Store (14-Day Free Trial)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <p className="text-[11px] text-zinc-500">
              No long-term contracts. Zero setup fee. Cancel anytime.
            </p>
          </div>
        </section>
      </main>

      {/* SEARCH ENGINE CRAWLABLE INDEX (Semantic index for Googlebot discovery) */}
      {activeMerchants.length > 0 && (
        <section aria-label="Platform Merchant Directory" className="border-t border-white/5 py-3 px-4 sm:px-6 lg:px-8 bg-[#060608] text-[10px] text-zinc-600">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="font-mono text-zinc-500 uppercase tracking-widest text-[9px]">Merchants Stores:</span>
            {activeMerchants.map((m) => (
              <Link
                key={m.id}
                href={`/store/${m.slug}`}
                className="hover:text-zinc-400 transition-colors"
                title={`${m.name} Storefront`}
              >
                {m.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className="border-t border-white/5 bg-[#070709] py-10 sm:py-12 px-4 sm:px-6 lg:px-8 text-zinc-500 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-md bg-[#C9A96E]/20 text-[#C9A96E] flex items-center justify-center font-bold text-xs">
              C
            </div>
            <span className="text-zinc-400 font-mono text-[11px]">
              &copy; {new Date().getFullYear()} Cimessinvest Platform. All rights reserved.
              
            </span>
             <div className="flex space-x-6">
            <Link href="/privacy" className="hover:text-[#C9A96E] text-gray-400">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-[#C9A96E] text-gray-400">Terms of Service</Link>
          </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-zinc-400 text-xs">
            <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link href="/register" className="hover:text-white transition-colors">Register</Link>
            <a href="mailto:cimessinvest@gmail.com" className="hover:text-[#C9A96E] transition-colors">cimessinvest@gmail.com</a>
            <a href="https://x.com/cimessinvest" target="_blank" rel="noopener noreferrer" className="hover:text-[#C9A96E] transition-colors">X: @cimessinvest</a>
          </div>
        </div>
      </footer>

      {/* MOBILE FLOATING CONVERSION DOCK (Sticky on mobile screens) */}
      <div className="fixed bottom-3 inset-x-3 z-40 sm:hidden">
        <div className="bg-[#0B0B0E]/95 border border-[#C9A96E]/30 rounded-2xl p-2.5 px-4 flex items-center justify-between shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-[#C9A96E] uppercase tracking-wider">
              14-Day Free Trial
            </span>
            <span className="text-xs font-semibold text-white">
              Launch Your Brand Store
            </span>
          </div>
          <Link
            href="/register"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#C9A96E] to-[#D4B87D] text-black font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#C9A96E]/25 active:scale-95 transition-transform"
          >
            <span>Start</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
