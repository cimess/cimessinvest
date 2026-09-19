"use client";

import { useState, Suspense, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ShieldAlert, CheckCircle2, AlertCircle, Loader2, ArrowLeft, Send } from "lucide-react";
import Link from "next/link";
import { api } from "@/app/lib/utils/apiClient";

function AppealFormContent() {
  const searchParams = useSearchParams();
  const initialStore = searchParams.get("store") || "";

  const [storeIdentifier, setStoreIdentifier] = useState(initialStore);
  const [contactInfo, setContactInfo] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const errorRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (errorMsg && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [errorMsg]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeIdentifier || !reason) {
      setErrorMsg("Please provide your store name/slug and the reason for appeal.");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await api.post("/api/appeal", {
        storeSlugOrName: storeIdentifier,
        contactInfo,
        reason,
      });

      if (res.data?.success) {
        setTicketId(res.data.ticketId);
      }
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.error || "Failed to submit appeal. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-[#F5F0EB] flex items-center justify-center p-4 sm:p-6 font-body">
      <div className="max-w-lg w-full bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-brand font-bold text-[#F5F0EB]">Storefront Status Appeal</h1>
          <p className="text-xs text-[#E0D5C9]/70 leading-relaxed">
            If your merchant storefront has been suspended or flagged, you may submit an appeal for expedited manual review by platform compliance.
          </p>
        </div>



        {ticketId ? (
          <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#F5F0EB]">Appeal Submitted Successfully</h2>
              <p className="text-xs text-[#E0D5C9]/70 mt-1">
                Your ticket has been queued for superadmin inspection.
              </p>
            </div>
            <div className="p-3 bg-black/40 rounded-xl font-mono text-xs text-emerald-400">
              Ticket ID: {ticketId}
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#C9A96E] hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Homepage</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#E0D5C9] mb-1.5">
                Store Subdomain or Brand Name
              </label>
              <input
                type="text"
                value={storeIdentifier}
                onChange={(e) => setStoreIdentifier(e.target.value)}
                placeholder="e.g. adeleke or Ade Bespoke"
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-[#F5F0EB] focus:border-[#C9A96E] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#E0D5C9] mb-1.5">
                Merchant Contact Email or Phone
              </label>
              <input
                type="text"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                placeholder="e.g. owner@brand.com or +2348012345678"
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-[#F5F0EB] focus:border-[#C9A96E] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#E0D5C9] mb-1.5">
                Reason & Details for Appeal
              </label>
              <textarea
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please explain why your store should be reactivated, detailing your compliance with platform terms and order fulfillment records..."
                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-xs text-[#F5F0EB] focus:border-[#C9A96E] focus:outline-none leading-relaxed"
                required
              />
            </div>

            {/* Contextual Error Alert right above Submit Button */}
            {errorMsg && (
              <div
                ref={errorRef}
                className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-3 animate-fadeIn"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="leading-relaxed">{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-xl bg-[#C9A96E] text-black font-bold text-xs uppercase tracking-wider hover:bg-[#D4B87D] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting Appeal...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Appeal Ticket</span>
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <Link href="/" className="text-xs text-[#E0D5C9]/60 hover:text-[#C9A96E] transition-colors">
                Cancel and return to home
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function AppealPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center text-[#C9A96E]">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span className="text-xs uppercase tracking-widest">Loading Appeal Portal...</span>
        </div>
      }
    >
      <AppealFormContent />
    </Suspense>
  );
}
