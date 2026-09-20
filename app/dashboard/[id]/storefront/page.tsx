"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { 
  Palette, 
  LayoutGrid, 
  List, 
  Sparkles, 
  ExternalLink, 
  Check, 
  Loader2, 
  Save, 
  MessageCircle, 
  Building, 
  MapPin, 
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { api } from "@/app/lib/utils/apiClient";
import Link from "next/link";

const PRESET_COLORS = [
  { name: "Luxury Gold", hex: "#C9A96E" },
  { name: "Emerald Luxe", hex: "#10B981" },
  { name: "Sunset Ember", hex: "#FF5722" },
  { name: "Royal Sapphire", hex: "#2563EB" },
  { name: "Amethyst Violet", hex: "#8B5CF6" },
  { name: "Rose Silk", hex: "#F43F5E" },
  { name: "Midnight Charcoal", hex: "#1E293B" },
];

export default function StorefrontSettingsPage() {
  const { data: session } = useSession();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Store & Brand Fields
  const [storeSlug, setStoreSlug] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [brandBio, setBrandBio] = useState("");
  const [brandTone, setBrandTone] = useState("LUXURIOUS_BESPOKE");
  const [physicalAddress, setPhysicalAddress] = useState("");
  const [city, setCity] = useState("Lagos");
  const [state, setState] = useState("Lagos State");

  // Tokens
  const [themeColor, setThemeColor] = useState("#C9A96E");
  const [layoutMode, setLayoutMode] = useState<"GRID_2X2" | "LIST">("GRID_2X2");

  // AI Copywriter
  const [aiCredits, setAiCredits] = useState<number>(10);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiSuggestedBio, setAiSuggestedBio] = useState<string | null>(null);

  const errorRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (errorMsg && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [errorMsg]);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/user/settings");
      if (res?.data) {
        const c = res.data.company;
        const s = res.data.siteSetting;
        const u = res.data.user;

        if (c) {
          setStoreSlug(c.slug || "");
          setCompanyName(c.name || u?.companyName || "");
          setBrandBio(c.brandBio || s?.tailorBioText || "");
          setBrandTone(c.brandTone || "LUXURIOUS_BESPOKE");
          setAiCredits(c.aiCreditsRemaining ?? 10);
        } else {
          setCompanyName(u?.companyName || "");
        }

        if (s) {
          setThemeColor(s.themeColor || s.accentColor || "#C9A96E");
          setLayoutMode(s.layoutMode === "LIST" ? "LIST" : "GRID_2X2");
          setWhatsappNumber(s.whatsappNumber || "");
          setPhysicalAddress(s.physicalAddress || "");
          setCity(s.city || "Lagos");
          setState(s.state || "Lagos State");
        }
      }

    } catch (err) {
      console.warn("Error fetching storefront settings:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await api.put("/api/user/settings", {
        companyName,
        whatsappNumber,
        brandBio,
        brandTone,
        themeColor,
        layoutMode,
        physicalAddress,
        city,
        state,
      });

      if (res?.data?.success) {
        setSuccessMsg("Storefront tokens and brand details saved successfully!");
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.error || "Failed to save storefront settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateAI = async () => {
    if (aiCredits <= 0) {
      setErrorMsg("You have exhausted your free AI credits. Upgrade plan to get more.");
      return;
    }

    setAiGenerating(true);
    setErrorMsg(null);
    try {
      const res = await api.post("/api/ai/generate-store-copy", {
        type: "BIO",
        brandName: companyName || "My Store",
        industry: "Fashion & Bespoke Atelier",
        keywords: aiPrompt || "luxury bespoke handcrafted tailored clothing lagos",
        tone: brandTone,
      });

      if (res?.data?.success && res.data.content) {
        setAiSuggestedBio(res.data.content);
        setAiCredits(res.data.creditsRemaining);
      }
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.error || "AI generation failed. Please try again.");
    } finally {
      setAiGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center text-[#C9A96E]">
        <Loader2 className="w-8 h-8 animate-spin mr-3" />
        <span className="text-xs uppercase tracking-widest font-semibold">Loading Storefront Config...</span>
      </div>
    );
  }

  const liveStoreUrl = storeSlug ? `/store/${storeSlug}` : "/store";

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-[#F5F0EB] p-4 sm:p-6 lg:p-8 space-y-8 font-body max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#C9A96E]/20 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-brand font-bold text-[#F5F0EB] tracking-wide">
              Storefront & Brand Tokens
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#C9A96E]/20 text-[#C9A96E] border border-[#C9A96E]/30">
              Universal Engine
            </span>
          </div>
          <p className="text-xs text-[#E0D5C9]/70 mt-1">
            Configure the 3 core tokens driving your responsive Web Storefront and native mobile feed.
          </p>
        </div>

        {/* Live Storefront Link */}
        <Link
          href={liveStoreUrl}
          target="_blank"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C9A96E] text-black font-semibold text-xs tracking-wider uppercase hover:bg-[#D4B87D] transition-all shadow-lg hover:shadow-[#C9A96E]/20"
        >
          <span>View Live Store</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* TOKEN 1 & 2: THEME COLOR & LAYOUT MODE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Token 1: Brand Theme Color */}
          <div className="bg-white/5 border border-[#C9A96E]/20 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-[#C9A96E]">
              <Palette className="w-4 h-4" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#F5F0EB]">
                Token 1: Brand Theme Color
              </h2>
            </div>
            <p className="text-xs text-[#E0D5C9]/60">
              Used dynamically for buttons, pricing tags, active tabs, and checkout highlights.
            </p>

            {/* Presets */}
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2.5 pt-2">
              {PRESET_COLORS.map((preset) => (
                <button
                  type="button"
                  key={preset.hex}
                  onClick={() => setThemeColor(preset.hex)}
                  title={preset.name}
                  className={`h-10 rounded-xl transition-all flex items-center justify-center border-2 ${
                    themeColor.toLowerCase() === preset.hex.toLowerCase()
                      ? "border-white scale-105 shadow-md shadow-white/10"
                      : "border-transparent opacity-80 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: preset.hex }}
                >
                  {themeColor.toLowerCase() === preset.hex.toLowerCase() && (
                    <Check className="w-4 h-4 text-white drop-shadow" />
                  )}
                </button>
              ))}
            </div>

            {/* Custom Hex Input */}
            <div className="flex items-center gap-3 pt-2">
              <input
                type="color"
                value={themeColor}
                onChange={(e) => setThemeColor(e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
              />
              <input
                type="text"
                value={themeColor}
                onChange={(e) => setThemeColor(e.target.value)}
                placeholder="#C9A96E"
                className="w-32 px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs font-mono uppercase text-[#F5F0EB] focus:border-[#C9A96E] focus:outline-none"
              />
              <div
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-black"
                style={{ backgroundColor: themeColor }}
              >
                Sample Preview
              </div>
            </div>
          </div>

          {/* Token 2: Display Layout Mode */}
          <div className="bg-white/5 border border-[#C9A96E]/20 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-[#C9A96E]">
              <LayoutGrid className="w-4 h-4" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#F5F0EB]">
                Token 2: Display Layout Mode
              </h2>
            </div>
            <p className="text-xs text-[#E0D5C9]/60">
              Controls how product feeds render on both Web Storefront and native React Native screens.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              {/* 2x2 Grid Option */}
              <button
                type="button"
                onClick={() => setLayoutMode("GRID_2X2")}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between h-28 ${
                  layoutMode === "GRID_2X2"
                    ? "bg-[#C9A96E]/10 border-[#C9A96E] text-white shadow-md shadow-[#C9A96E]/10"
                    : "bg-black/30 border-white/10 text-[#E0D5C9]/60 hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between">
                  <LayoutGrid className="w-5 h-5 text-[#C9A96E]" />
                  {layoutMode === "GRID_2X2" && <Check className="w-4 h-4 text-[#C9A96E]" />}
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider">2×2 Grid</div>
                  <div className="text-[11px] opacity-70">Compact multi-column layout</div>
                </div>
              </button>

              {/* 1-Col List Option */}
              <button
                type="button"
                onClick={() => setLayoutMode("LIST")}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between h-28 ${
                  layoutMode === "LIST"
                    ? "bg-[#C9A96E]/10 border-[#C9A96E] text-white shadow-md shadow-[#C9A96E]/10"
                    : "bg-black/30 border-white/10 text-[#E0D5C9]/60 hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between">
                  <List className="w-5 h-5 text-[#C9A96E]" />
                  {layoutMode === "LIST" && <Check className="w-4 h-4 text-[#C9A96E]" />}
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider">1-Column List</div>
                  <div className="text-[11px] opacity-70">High-detail hero product cards</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* TOKEN 3: STORE PROFILE, SOCIAL WHATSAPP & AI BIO */}
        <div className="bg-white/5 border border-[#C9A96E]/20 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#C9A96E]">
              <Building className="w-4 h-4" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#F5F0EB]">
                Token 3: Store Profile & WhatsApp Link
              </h2>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#C9A96E] bg-[#C9A96E]/10 px-3 py-1 rounded-full border border-[#C9A96E]/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{aiCredits} AI Credits Left</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Store Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#E0D5C9] mb-1.5">
                Store / Brand Display Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Ade Bespoke Atelier"
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-[#F5F0EB] focus:border-[#C9A96E] focus:outline-none"
                required
              />
            </div>

            {/* WhatsApp Phone */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#E0D5C9] mb-1.5">
                WhatsApp Inquiry Phone (Direct Chat CTA)
              </label>
              <div className="relative">
                <MessageCircle className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="e.g. +2348012345678"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-[#F5F0EB] focus:border-[#C9A96E] focus:outline-none font-mono"
                />
              </div>
            </div>
          </div>

          {/* AI Copywriter Section */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-transparent border border-amber-500/20 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-amber-300">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  AI Brand Copywriter (Gemini Engine)
                </span>
              </div>
              <button
                type="button"
                onClick={handleGenerateAI}
                disabled={aiGenerating}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-400/20 text-amber-300 hover:bg-amber-400/30 text-xs font-semibold border border-amber-400/30 transition-all cursor-pointer disabled:opacity-50"
              >
                {aiGenerating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Writing Copy...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate Bio with AI</span>
                  </>
                )}
              </button>
            </div>

            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Keywords or vibe (e.g. bespoke senator suits, handcrafted in lekki, nationwide shipping)"
              className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-[#F5F0EB] focus:border-amber-400 focus:outline-none"
            />

            {aiSuggestedBio && (
              <div className="p-3 rounded-lg bg-black/60 border border-amber-400/30 space-y-2">
                <div className="text-[11px] font-semibold text-amber-300 uppercase">AI Suggested Bio:</div>
                <p className="text-xs text-[#F5F0EB]/90 italic leading-relaxed">&ldquo;{aiSuggestedBio}&rdquo;</p>
                <button
                  type="button"
                  onClick={() => {
                    setBrandBio(aiSuggestedBio);
                    setAiSuggestedBio(null);
                  }}
                  className="px-3 py-1 rounded bg-amber-400 text-black font-bold text-[11px] uppercase tracking-wider hover:bg-amber-300 transition-colors"
                >
                  Use This Bio
                </button>
              </div>
            )}
          </div>

          {/* Brand Bio Textarea */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#E0D5C9] mb-1.5">
              Brand Bio / Store Description
            </label>
            <textarea
              rows={3}
              value={brandBio}
              onChange={(e) => setBrandBio(e.target.value)}
              placeholder="Bespoke luxury menswear and accessories handcrafted in Lagos. Available for custom orders and direct shipping."
              className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-xs text-[#F5F0EB] focus:border-[#C9A96E] focus:outline-none leading-relaxed"
            />
          </div>

          {/* Location Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#E0D5C9] mb-1.5">
                Physical Studio / Address
              </label>
              <input
                type="text"
                value={physicalAddress}
                onChange={(e) => setPhysicalAddress(e.target.value)}
                placeholder="e.g. 14 Admiralty Way"
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-[#F5F0EB] focus:border-[#C9A96E] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#E0D5C9] mb-1.5">
                City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Lagos"
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-[#F5F0EB] focus:border-[#C9A96E] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#E0D5C9] mb-1.5">
                State
              </label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="Lagos State"
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-[#F5F0EB] focus:border-[#C9A96E] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Contextual Error Alert right above Save Tokens Button */}
        {errorMsg && (
          <div
            ref={errorRef}
            className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-3 animate-fadeIn"
          >
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="leading-relaxed font-medium">{errorMsg}</span>
          </div>
        )}

        {/* Save Storefront Tokens Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#C9A96E] text-black font-bold text-xs uppercase tracking-wider hover:bg-[#D4B87D] transition-all cursor-pointer shadow-lg disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Tokens...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Storefront Tokens</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* FINTECH: DIRECT PAYOUT & SETTLEMENT NOTICE */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#F5F0EB]">
            Direct Payout & Settlement Bank Account
          </h2>
          <p className="text-xs text-[#E0D5C9]/70 mt-1 leading-relaxed">
            Bank account number details and automated Paystack split settlement settings have been moved to the Fintech & Payments Hub.
          </p>
        </div>
        <Link
          href={`/dashboard/${params?.id || ""}/payment`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C9A96E]/20 hover:bg-[#C9A96E]/30 text-[#C9A96E] border border-[#C9A96E]/30 text-xs font-semibold uppercase tracking-wider transition-all shrink-0 text-center"
        >
          <span>Manage Payout Account</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
