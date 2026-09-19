"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import {
  LifeBuoy,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Send,
  Loader2,
  FileQuestion,
  CreditCard,
  Sparkles,
  HelpCircle,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function MerchantSupportPage() {
  const params = useParams();
  const companyId = params?.id as string;

  const [category, setCategory] = useState("PAYMENT_ISSUE");
  const [subject, setSubject] = useState("");
  const [orderReference, setOrderReference] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ticketResult, setTicketResult] = useState<{
    ticketNumber: string;
    message: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      setError("Please provide both a subject and a detailed description.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/merchant/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          subject,
          orderReference: orderReference.trim() || undefined,
          description,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Failed to submit report. Please try again.");
      } else {
        setTicketResult({
          ticketNumber: data.ticketNumber,
          message: data.message,
        });
        setSubject("");
        setOrderReference("");
        setDescription("");
      }
    } catch (err) {
      console.error("Support submission error:", err);
      setError("Network error submitting report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0E0E0E] text-[#F5F0EB] p-6 sm:p-10 font-sans space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-[#C9A96E] text-xs font-semibold uppercase tracking-wider mb-1">
            <LifeBuoy className="w-4 h-4" />
            <span>Merchant Support &amp; Technical Desk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-white">
            Support, Bug Reports &amp; Advice
          </h1>
          <p className="text-xs sm:text-sm text-[#A0988A] mt-1">
            Report payment disputes, settlement inquiries, UI issues, or submit feedback and platform advice.
          </p>
        </div>

        <Link
          href={`/dashboard/${companyId}/payment`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-[#E0D5C9] font-medium transition-colors self-start"
        >
          <CreditCard className="w-4 h-4 text-[#C9A96E]" />
          <span>View Payment &amp; Balances</span>
        </Link>
      </div>

      <div className="max-w-3xl space-y-6">
        {/* Ticket Created Success Screen */}
        {ticketResult && (
          <div className="bg-gradient-to-b from-emerald-950/40 to-black border border-emerald-500/40 rounded-3xl p-6 sm:p-8 space-y-3 shadow-2xl text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
              Ticket Logged Successfully
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Ticket #{ticketResult.ticketNumber}
            </h2>
            <p className="text-xs sm:text-sm text-[#D5CEBF] leading-relaxed max-w-md mx-auto">
              {ticketResult.message}
            </p>
            <p className="text-[11px] text-[#A0988A] pt-2">
              An acknowledgment email with your ticket reference has been sent to your registered store address. Our engineering and compliance team is reviewing the issue.
            </p>
            <button
              onClick={() => setTicketResult(null)}
              className="mt-4 px-6 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-white font-semibold transition-colors"
            >
              Submit Another Report
            </button>
          </div>
        )}

        {/* Report Form */}
        {!ticketResult && (
          <form
            onSubmit={handleSubmit}
            className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-5 backdrop-blur-xl shadow-xl"
          >
            <div className="flex items-center gap-2 text-[#C9A96E] pb-3 border-b border-white/10">
              <MessageSquare className="w-4 h-4" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                Submit Support or Feedback Ticket
              </h2>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#D5CEBF] mb-1.5">
                  Report Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:border-[#C9A96E] focus:outline-none"
                >
                  <option value="PAYMENT_ISSUE">Payment / Settlement Inquiry</option>
                  <option value="UI_BUG">UI Glitch / Layout Issue</option>
                  <option value="FEATURE_REQUEST">Feature Request / Advice</option>
                  <option value="GENERAL_FEEDBACK">General Feedback</option>
                  <option value="OTHER">Other Technical Question</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#D5CEBF] mb-1.5">
                  Related Order Reference (Optional)
                </label>
                <input
                  type="text"
                  value={orderReference}
                  onChange={(e) => setOrderReference(e.target.value)}
                  placeholder="e.g. ORD_... or INV-1042"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:border-[#C9A96E] focus:outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#D5CEBF] mb-1.5">
                Subject Line *
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief summary of the issue or feedback..."
                required
                className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:border-[#C9A96E] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#D5CEBF] mb-1.5">
                Detailed Description &amp; Reproduction Steps *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                placeholder="Provide detailed explanation, exact error message, or steps to reproduce..."
                required
                className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:border-[#C9A96E] focus:outline-none resize-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-4 rounded-xl bg-[#C9A96E] hover:bg-[#D6BA84] active:scale-98 text-black font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting Ticket...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Report to Platform Engineering</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
