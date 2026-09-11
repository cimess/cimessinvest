"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { 
  ShieldCheck, 
  RefreshCw, 
  CheckCircle2, 
  ExternalLink,
  CreditCard,
  Check,
  AlertCircle,
  HardDrive,
  Lock,
  ArrowUpRight
} from "lucide-react";
import { api } from "@/app/lib/utils/apiClient";

export interface MergedTransaction {
  id: string;
  reference: string;
  amountFormatted: string;
  planSelected: string;
  status: string;
  createdAt: string;
  receiptUrl?: string;
}

export interface UserSubscriptionDetails {
  id?: string;
  companyName?: string;
  email?: string;
  role?: "ADMIN" | "USER";
  paymentVerified?: boolean;
  planSelected?: "STARTER" | "PROFESSIONAL" | "ENTERPRISE";
  subscription_status?: string;
  storageUsed?: number;
  storageLimit?: number;
}

export default function PaymentSubscriptionPage() {
  const { data: session } = useSession();
  const params = useParams();
  const [userInfo, setUserInfo] = useState<UserSubscriptionDetails | null>(null);
  const [transactions, setTransactions] = useState<MergedTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [initiating, setInitiating] = useState(false);
  const [showPlanSelection, setShowPlanSelection] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"STARTER" | "PROFESSIONAL" | "ENTERPRISE">("PROFESSIONAL");
  
  const [customAmountNGN, setCustomAmountNGN] = useState<number>(50000);
  const [customStorageMB, setCustomStorageMB] = useState<number>(10000);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptionData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [settingsRes, historyRes] = await Promise.all([
        api.get("/api/user/settings"),
        api.get("/api/payment/history").catch(() => null),
      ]);

      if (settingsRes.data?.user) {
        setUserInfo(settingsRes.data.user);
        if (settingsRes.data.user.planSelected) {
          setSelectedPlan(settingsRes.data.user.planSelected);
        }
      }

      if (historyRes?.data?.transactions) {
        setTransactions(historyRes.data.transactions);
      }
    } catch (err: unknown) {
      console.warn("Error fetching payment settings:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadSub=setTimeout(() => {
      fetchSubscriptionData();
    }, 0);
    return () => clearTimeout(loadSub);
  }, [fetchSubscriptionData]);

  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setInitiating(true);
    setError(null);

    try {
      const customAmountKobo = selectedPlan === "ENTERPRISE" ? customAmountNGN * 100 : undefined;
      const customStorage = selectedPlan === "ENTERPRISE" ? customStorageMB : undefined;

      const res = await api.post("/api/payment/initialize", {
        planSelected: selectedPlan,
        customAmountKobo,
        customStorageMB: customStorage,
        callbackUrl: `${window.location.origin}/dashboard/${params?.id || ""}/payment/callback`,
      });

      if (res.data?.success) {
        window.location.href = res.data.authorization_url;
      } else {
        throw new Error("Invalid payment authorization URL returned.");
      }
    } catch (err: unknown) {
    const msg =
  (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
  (err instanceof Error ? err.message : "Payment initialization failed.");
setError(msg);
    } finally {
      setInitiating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center text-[#C9A96E]">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
        <span className="text-xs uppercase tracking-widest">Loading Subscription Status...</span>
      </div>
    );
  }

  // Non-Admin Restricted Access State
  if (userInfo?.role === "USER") {
    return (
      <div className="min-h-screen bg-[#1A1A1A] p-8 text-[#F5F0EB] flex items-center justify-center">
        <div className="max-w-md w-full bg-black/40 border border-red-500/30 p-8 rounded-lg text-center space-y-4">
          <div className="w-12 h-12 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mx-auto text-red-400">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-heading text-[#F5F0EB]">Access Restricted</h2>
          <p className="text-xs text-[#E0D5C9]/70 leading-relaxed">
            Only workspace administrators (ADMIN) have permission to view billing history and manage subscription plans.
          </p>
        </div>
      </div>
    );
  }

  const isActive = userInfo?.subscription_status === "ACTIVE" && userInfo?.paymentVerified;

  return (
    <div className="min-h-screen bg-[#1A1A1A] p-6 lg:p-12 text-[#F5F0EB] space-y-8">
      <div>
        <h1 className="text-3xl font-heading text-[#F5F0EB]">Billing & Subscriptions</h1>
        <p className="text-xs text-[#E0D5C9]/70 mt-1">Manage your active workspace plan and billing receipts.</p>
      </div>

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-500/40 text-red-300 text-xs rounded-sm">
          {error}
        </div>
      )}

      {/* Active Subscription Overview Card */}
      {isActive && (
        <div className="bg-black/40 border border-[#C9A96E]/40 p-6 rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#C9A96E] bg-[#C9A96E]/10 px-3 py-1 border border-[#C9A96E]/30 rounded">
                Current Plan: {userInfo?.planSelected}
              </span>
              <span className="text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2.5 py-0.5 rounded font-bold uppercase">
                Active
              </span>
            </div>
            <p className="text-sm text-[#E0D5C9]">
              Storage Limit: <strong>{userInfo?.storageLimit || 500} MB</strong> (Used: {userInfo?.storageUsed || 0} MB)
            </p>
          </div>

          <button
            onClick={() => setShowPlanSelection(!showPlanSelection)}
            className="px-5 py-3 bg-[#C9A96E] text-[#1A1A1A] text-xs font-bold uppercase tracking-widest hover:bg-[#F5F0EB] transition-colors flex items-center gap-2 cursor-pointer"
          >
            <span>{showPlanSelection ? "Hide Upgrade Plans" : "Upgrade Plan"}</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Plan Selection Cards (Shown if subscription INACTIVE or "Upgrade Plan" clicked) */}
      {(!isActive || showPlanSelection) && (
        <div className="space-y-6">
          <h2 className="text-xl font-heading text-[#C9A96E]">
            {isActive ? "Select Plan to Upgrade" : "Choose a Subscription Plan"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Starter Plan */}
            <div
              onClick={() => setSelectedPlan("STARTER")}
              className={`p-6 bg-black/40 border rounded-lg cursor-pointer transition-all ${
                selectedPlan === "STARTER" ? "border-[#C9A96E] ring-1 ring-[#C9A96E]" : "border-white/10"
              }`}
            >
              <h3 className="text-lg font-heading text-[#F5F0EB]">Starter</h3>
              <p className="text-2xl font-bold text-[#C9A96E] mt-2">₦2,000 <span className="text-xs text-[#E0D5C9]/60 font-normal">/mo</span></p>
              <ul className="text-xs space-y-2 text-[#E0D5C9]/80 mt-4">
                <li>• 1 User Seat (Admin Only)</li>
                <li>• 500 MB Storage Limit</li>
                <li>• Standard Inquiry Form</li>
              </ul>
            </div>

            {/* Professional Plan */}
            <div
              onClick={() => setSelectedPlan("PROFESSIONAL")}
              className={`p-6 bg-black/40 border rounded-lg cursor-pointer transition-all ${
                selectedPlan === "PROFESSIONAL" ? "border-[#C9A96E] ring-1 ring-[#C9A96E]" : "border-white/10"
              }`}
            >
              <h3 className="text-lg font-heading text-[#F5F0EB]">Professional</h3>
              <p className="text-2xl font-bold text-[#C9A96E] mt-2">₦10,000 <span className="text-xs text-[#E0D5C9]/60 font-normal">/mo</span></p>
              <ul className="text-xs space-y-2 text-[#E0D5C9]/80 mt-4">
                <li>• Up to 5 Team Members</li>
                <li>• 2 GB Storage Limit</li>
                <li>• Payment Processing & POS Analytics</li>
                <li>• Max 3 Custom UI Pages</li>
              </ul>
            </div>

            {/* Enterprise Plan */}
            <div
              onClick={() => setSelectedPlan("ENTERPRISE")}
              className={`p-6 bg-black/40 border rounded-lg cursor-pointer transition-all ${
                selectedPlan === "ENTERPRISE" ? "border-[#C9A96E] ring-1 ring-[#C9A96E]" : "border-white/10"
              }`}
            >
              <h3 className="text-lg font-heading text-[#F5F0EB]">Enterprise</h3>
              <p className="text-2xl font-bold text-[#C9A96E] mt-2">Custom Pricing</p>
              <ul className="text-xs space-y-2 text-[#E0D5C9]/80 mt-4">
                <li>• Unlimited Team Members</li>
                <li>• Custom Storage Quotas</li>
                <li>• Dedicated Support & API Integrations</li>
              </ul>
            </div>
          </div>

          <button
            onClick={handleProceedToPayment}
            disabled={initiating}
            className="w-full lg:w-auto px-8 py-4 bg-[#C9A96E] text-[#1A1A1A] text-xs font-bold uppercase tracking-[0.25em] hover:bg-[#F5F0EB] transition-colors disabled:opacity-50 cursor-pointer"
          >
            {initiating ? "Redirecting to Paystack..." : `Proceed with ${selectedPlan} Plan`}
          </button>
        </div>
      )}

      {/* Merged Payment History & Receipts Table */}
      <div className="space-y-4 pt-6 border-t border-white/10">
        <h2 className="text-xl font-heading text-[#F5F0EB]">Transaction History</h2>
        {transactions.length === 0 ? (
          <p className="text-xs text-[#E0D5C9]/60">No transaction receipts found.</p>
        ) : (
          <div className="overflow-x-auto border border-white/10 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/60 text-[#C9A96E] uppercase tracking-wider border-b border-white/10">
                <tr>
                  <th className="p-4">Reference</th>
                  <th className="p-4">Plan</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-mono text-[#E0D5C9]">{tx.reference}</td>
                    <td className="p-4 uppercase font-semibold">{tx.planSelected}</td>
                    <td className="p-4 font-bold text-[#C9A96E]">{tx.amountFormatted}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                        tx.status === "COMPLETED" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="p-4 text-[#E0D5C9]/70">{new Date(tx.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      {tx.receiptUrl ? (
                        <a href={tx.receiptUrl} target="_blank" rel="noreferrer" className="text-[#C9A96E] hover:underline flex items-center gap-1">
                          <span>View</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-[#E0D5C9]/40">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
