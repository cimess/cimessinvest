"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Search,
  CheckCircle2,
  FileText,
  Lock,
  ArrowLeft,
  Store,
  Loader2,
  Send,
  HelpCircle,
} from "lucide-react";

interface OrderLookupResult {
  id: string;
  reference: string;
  invoiceNumber: string | null;
  amountNaira: number;
  status: string;
  settlementStatus: string;
  createdAt: string;
  customerName: string | null;
  customerEmail: string;
  customerPhone: string | null;
  itemsCount: number;
  items: Array<{ name: string; quantity: number }>;
  store: {
    name: string;
    slug?: string;
    whatsappNumber?: string | null;
  };
}

interface ProtectionInfo {
  isWithin24Hours: boolean;
  remainingHoursFormatted: string;
  isEligible: boolean;
  isAlreadyDisputed: boolean;
  isSettled: boolean;
  isRefunded: boolean;
  activeTicketNumber: string | null;
}

export default function DisputeClient({ initialQuery }: { initialQuery: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState<OrderLookupResult | null>(null);
  const [protectionInfo, setProtectionInfo] = useState<ProtectionInfo | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Form State
  const [category, setCategory] = useState<string>("UNFULFILLED_ORDER");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [resolvedTicket, setResolvedTicket] = useState<{
    ticketNumber: string;
    orderReference: string;
    message: string;
  } | null>(null);

  const handleLookup = useCallback(async (searchKey: string) => {
    if (!searchKey.trim()) return;
    setLoading(true);
    setSearchError(null);
    setOrderData(null);
    setProtectionInfo(null);
    setResolvedTicket(null);

    try {
      const res = await fetch(`/api/dispute?orderId=${encodeURIComponent(searchKey.trim())}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        setSearchError(data.error || "Order not found. Please check your reference or invoice code.");
      } else {
        setOrderData(data.order);
        setProtectionInfo(data.protectionWindow);
        setCustomerName(data.order.customerName || "");
        setCustomerEmail(data.order.customerEmail || "");
        setCustomerPhone(data.order.customerPhone || "");
        setSubject(`Unfulfilled Order #${data.order.invoiceNumber || data.order.reference}`);
      }
    } catch (err) {
      console.error("Lookup error:", err);
      setSearchError("Failed to connect to order verification service.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialQuery) {
      handleLookup(initialQuery);
    }
  }, [initialQuery, handleLookup]);

  const handleSubmitDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderData) return;
    if (!customerEmail.trim()) {
      alert("Please provide your email address for dispute tracking.");
      return;
    }
    if (!description.trim() || description.trim().length < 15) {
      alert("Please describe the delivery issue in at least 15 characters.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/dispute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderIdentifier: orderData.id,
          customerEmail,
          customerName,
          customerPhone,
          category,
          subject,
          description,
        }),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        setSubmitError(result.error || "Failed to submit dispute.");
      } else {
        setResolvedTicket({
          ticketNumber: result.ticketNumber,
          orderReference: result.orderReference,
          message: result.message,
        });
      }
    } catch (err) {
      console.error("Dispute submit error:", err);
      setSubmitError("Network error lodging dispute. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0E0E0E] text-[#F5F0EB] font-sans antialiased py-10 px-4 sm:px-6 selection:bg-[#C9A96E]/30">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#A0988A] hover:text-[#C9A96E] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-[#C9A96E]">
            <ShieldCheck className="w-4 h-4" />
            <span className="font-semibold uppercase tracking-wider text-[10px]">
              24-Hour Escrow Protection
            </span>
          </div>
        </div>

        {/* Hero Card */}
        <div className="bg-gradient-to-b from-white/10 to-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#C9A96E]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C9A96E]/10 border border-[#C9A96E]/30 text-[#C9A96E] text-xs font-medium">
              <Lock className="w-3.5 h-3.5" />
              <span>Consumer Escrow & Payout Safeguard</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-serif">
              Buyer Protection &amp; Order Dispute Desk
            </h1>
            <p className="text-xs sm:text-sm text-[#D5CEBF] leading-relaxed">
              Did you make a payment to a merchant but did not receive your package, clothing, or
              services? Submit your order details below within <strong>24 hours</strong> of payment to
              freeze the merchant&apos;s payout while our compliance team investigates.
            </p>
          </div>
        </div>

        {/* Search / Lookup Bar */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 shadow-lg">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLookup(query);
            }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#A0988A] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter Order Reference (e.g. ORD_...) or Invoice # (e.g. INV-1042)"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/50 border border-white/10 text-xs text-white placeholder:text-[#7A7468] focus:border-[#C9A96E] focus:outline-none transition-colors font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="py-3 px-6 rounded-xl bg-[#C9A96E] text-black font-bold text-xs hover:bg-[#D6BA84] active:scale-98 transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Lookup Order</span>
                </>
              )}
            </button>
          </form>

          {searchError && (
            <div className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{searchError}</span>
            </div>
          )}
        </div>

        {/* Resolved Ticket Screen */}
        {resolvedTicket && (
          <div className="bg-gradient-to-b from-emerald-950/40 to-black border border-emerald-500/40 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
              Dispute Registered &amp; Payout Frozen
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Ticket #{resolvedTicket.ticketNumber}
            </h2>
            <p className="text-xs sm:text-sm text-[#D5CEBF] leading-relaxed max-w-md mx-auto">
              {resolvedTicket.message}
            </p>
            <div className="p-4 rounded-xl bg-black/60 border border-white/10 text-xs text-left space-y-2 max-w-md mx-auto">
              <div className="flex justify-between text-[#A0988A]">
                <span>Order Reference:</span>
                <span className="font-mono text-white">{resolvedTicket.orderReference}</span>
              </div>
              <div className="flex justify-between text-[#A0988A]">
                <span>Escrow Status:</span>
                <span className="font-semibold text-amber-400">PAYOUT FROZEN</span>
              </div>
              <div className="flex justify-between text-[#A0988A]">
                <span>Customer Email:</span>
                <span className="text-white">{customerEmail}</span>
              </div>
            </div>
            <p className="text-[11px] text-[#A0988A]">
              An official investigation receipt has been dispatched to your email. We will reach out to both you and the merchant store.
            </p>
          </div>
        )}

        {/* Order Details & Dispute Submission Card */}
        {orderData && protectionInfo && !resolvedTicket && (
          <div className="space-y-5">
            {/* 1. Order Summary Card */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-white/10">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#A0988A]">
                    Verified Order Details
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-white font-mono">
                    {orderData.invoiceNumber || orderData.reference}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-[#A0988A] block">Payable Amount</span>
                  <span className="text-lg font-bold text-[#C9A96E]">
                    ₦{orderData.amountNaira.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Merchant Info */}
              <div className="flex items-center justify-between text-xs text-[#D5CEBF]">
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-[#C9A96E]" />
                  <span>Store: <strong>{orderData.store.name}</strong></span>
                </div>
                <span>
                  Date: {new Date(orderData.createdAt).toLocaleDateString("en-NG", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>

              {/* Items Snapshot */}
              {orderData.items.length > 0 && (
                <div className="bg-black/30 rounded-xl p-3 text-xs space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[#A0988A] block mb-1">
                    Items Snapshot:
                  </span>
                  {orderData.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-[#E0D5C9]">
                      <span>{item.name}</span>
                      <span className="font-mono text-[#A0988A]">Qty: {item.quantity}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* 24H Protection Status Banner */}
              <div
                className={`p-4 rounded-2xl border flex items-start gap-3 text-xs ${
                  protectionInfo.isAlreadyDisputed
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                    : protectionInfo.isWithin24Hours
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                    : "bg-red-500/10 border-red-500/30 text-red-300"
                }`}
              >
                {protectionInfo.isAlreadyDisputed ? (
                  <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400" />
                ) : protectionInfo.isWithin24Hours ? (
                  <Clock className="w-5 h-5 shrink-0 text-emerald-400" />
                ) : (
                  <ShieldAlert className="w-5 h-5 shrink-0 text-red-400" />
                )}
                <div>
                  <div className="font-bold uppercase tracking-wider text-[11px] mb-0.5">
                    {protectionInfo.isAlreadyDisputed
                      ? `Active Dispute (#${protectionInfo.activeTicketNumber || "DSP"})`
                      : protectionInfo.isWithin24Hours
                      ? `Protection Active — ${protectionInfo.remainingHoursFormatted} Hours Remaining`
                      : "24-Hour Protection Window Expired"}
                  </div>
                  <p className="text-[11px] leading-relaxed opacity-90">
                    {protectionInfo.isAlreadyDisputed
                      ? "A dispute has already been lodged for this order. Merchant payout is currently frozen in platform escrow."
                      : protectionInfo.isWithin24Hours
                      ? "You are within the 24-hour buyer protection window. Submitting this form will immediately halt merchant bank settlement."
                      : "More than 24 hours have passed since payment. Funds have automatically settled into the merchant's commercial Nigerian bank account and can no longer be frozen by the platform."}
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Dispute Filing Form */}
            {protectionInfo.isEligible && (
              <form
                onSubmit={handleSubmitDispute}
                className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl"
              >
                <div className="flex items-center gap-2 text-[#C9A96E] pb-2 border-b border-white/10">
                  <ShieldAlert className="w-4 h-4" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                    Submit Dispute &amp; Freeze Payout
                  </h3>
                </div>

                {submitError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                    {submitError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-[#D5CEBF] mb-1.5">
                    Issue Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:border-[#C9A96E] focus:outline-none"
                  >
                    <option value="UNFULFILLED_ORDER">Package Not Delivered / Merchant Unresponsive</option>
                    <option value="DEFECTIVE_PRODUCT">Severely Defective / Completely Wrong Item</option>
                    <option value="FRAUD_SUSPICION">Suspected Merchant Fraud</option>
                    <option value="PAYMENT_ISSUE">Charged Twice or Incorrect Billing</option>
                    <option value="OTHER">Other Compliance Issue</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#D5CEBF] mb-1.5">
                      Your Full Name
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Amaka Okafor"
                      className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:border-[#C9A96E] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#D5CEBF] mb-1.5">
                      Contact Email * (For Case Updates)
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="name@gmail.com"
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:border-[#C9A96E] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#D5CEBF] mb-1.5">
                    Phone / WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+234..."
                    className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:border-[#C9A96E] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#D5CEBF] mb-1.5">
                    Detailed Explanation of the Issue *
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    placeholder="Provide detailed information on what happened (e.g. paid 12 hours ago, tailor blocked on WhatsApp, no waybill provided)..."
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:border-[#C9A96E] focus:outline-none resize-none"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-[#C9A96E]/10 border border-[#C9A96E]/20 text-[11px] text-[#D5CEBF] leading-relaxed">
                  <strong className="text-[#C9A96E]">Dispute Acknowledgment:</strong> By clicking submit, you confirm that you have not received this order or have encountered a serious breach. A formal case will be opened and ₦{orderData.amountNaira.toLocaleString()} will be placed in frozen escrow.
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 active:scale-98 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Freezing Payout &amp; Lodging Case...</span>
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="w-4 h-4" />
                      <span>Submit Dispute &amp; Freeze Merchant Payout</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
