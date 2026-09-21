"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
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
  ArrowUpRight,
  FileText,
  MessageCircle,
  Plus,
  Copy,
  Receipt,
  Share2,
  Loader2,
  ArrowRight,
  ShieldAlert,
  Clock,
  LifeBuoy,
  Edit3,
  Building2
} from "lucide-react";
import { api } from "@/app/lib/utils/apiClient";
import Link from "next/link";

export interface BankOption {
  code: string;
  name: string;
}

const POPULAR_NIGERIAN_BANKS: BankOption[] = [
  { code: "058", name: "Guaranty Trust Bank (GTBank)" },
  { code: "057", name: "Zenith Bank" },
  { code: "044", name: "Access Bank" },
  { code: "011", name: "First Bank of Nigeria" },
  { code: "033", name: "United Bank for Africa (UBA)" },
  { code: "50211", name: "Kuda Microfinance Bank" },
  { code: "50515", name: "Moniepoint MFB" },
  { code: "999992", name: "OPay / Paycom" },
  { code: "999991", name: "PalmPay" },
  { code: "232", name: "Sterling Bank" },
  { code: "070", name: "Fidelity Bank" },
  { code: "221", name: "Stanbic IBTC Bank" },
  { code: "035", name: "Wema Bank / ALAT" },
  { code: "214", name: "First City Monument Bank (FCMB)" },
  { code: "076", name: "Polaris Bank" },
  { code: "032", name: "Union Bank of Nigeria" },
  { code: "301", name: "Jaiz Bank" },
  { code: "302", name: "Taj Bank" },
];

export interface MergedTransaction {
  id: string;
  reference: string;
  amountFormatted: string;
  planSelected: string;
  status: string;
  createdAt: string;
  receiptUrl?: string;
}

export interface StoreOrder {
  id: string;
  reference: string;
  invoiceNumber: string | null;
  orderType: string;
  amountKobo: number;
  amountNaira: number;
  originalAmountNaira: number | null;
  discountNaira: number | null;
  status: string;
  customerName: string | null;
  customerPhone: string | null;
  customerEmail: string;
  notes: string | null;
  createdAt: string;
  checkoutUrl: string;
}

export interface UserSubscriptionDetails {
  id?: string;
  companyName?: string;
  email?: string;
  role?: "ADMIN" | "USER" | "MANAGER";
  paymentVerified?: boolean;
  planSelected?: "STARTER" | "PROFESSIONAL" | "ENTERPRISE" | "FREE_TRIAL";
  subscription_status?: string;
  storageUsed?: number;
  storageLimit?: number;
}

export default function PaymentSubscriptionPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<UserSubscriptionDetails | null>(null);

  useEffect(() => {
    if ((session?.user as any)?.role === "MANAGER") {
      router.replace("/dashboard/1");
    }
  }, [session, router]);

  const [activeTab, setActiveTab] = useState<"INVOICES" | "SUBSCRIPTIONS">("INVOICES");

  // SaaS Subscription State
  const [transactions, setTransactions] = useState<MergedTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [initiating, setInitiating] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"STARTER" | "PROFESSIONAL" | "ENTERPRISE" | "FREE_TRIAL">("STARTER");
  const [customAmountNGN, setCustomAmountNGN] = useState<number>(50000);
  const [customStorageMB, setCustomStorageMB] = useState<number>(10000);
  const [error, setError] = useState<string | null>(null);

  // Quick Invoices & Store Orders State
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [ordersNextCursor, setOrdersNextCursor] = useState<string | null>(null);
  const [ordersHasMore, setOrdersHasMore] = useState<boolean>(false);
  const [loadingMoreOrders, setLoadingMoreOrders] = useState<boolean>(false);
  const [creatingInvoice, setCreatingInvoice] = useState(false);
  const [invCustomerName, setInvCustomerName] = useState("");
  const [invCustomerPhone, setInvCustomerPhone] = useState("");
  const [invCustomerEmail, setInvCustomerEmail] = useState("");
  const [invItemName, setInvItemName] = useState("");
  const [invOriginalPrice, setInvOriginalPrice] = useState("");
  const [invNegotiatedPrice, setInvNegotiatedPrice] = useState("");
  const [invNotes, setInvNotes] = useState("");
  const [generatedInvoice, setGeneratedInvoice] = useState<{
    invoiceNumber: string;
    checkoutUrl: string;
    whatsappShareText: string;
    phone: string;
  } | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Real-Time Paystack Subaccount & Database Ledger Balances
  const [balanceData, setBalanceData] = useState<{
    todaySalesNaira: number;
    pendingSettlementNaira: number;
    settledBankNaira: number;
    disputedNaira: number;
    pendingCount: number;
    disputedCount: number;
    autoSettledTodayNaira?: number;
  } | null>(null);

  const [subaccountData, setSubaccountData] = useState<{
    code: string | null;
    bankName: string | null;
    accountNumber: string | null;
    businessName: string | null;
    percentageCharge: number;
    isActive: boolean;
    isLive: boolean;
  } | null>(null);

  // Bank Account & Paystack Split Settlement State
  const [bankCode, setBankCode] = useState("058");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankBusinessName, setBankBusinessName] = useState("");
  const [bankSaving, setBankSaving] = useState(false);
  const [bankSuccessMsg, setBankSuccessMsg] = useState<string | null>(null);
  const [bankErrorMsg, setBankErrorMsg] = useState<string | null>(null);
  const [isEditingBank, setIsEditingBank] = useState(false);
  const [availableBanks, setAvailableBanks] = useState<BankOption[]>(POPULAR_NIGERIAN_BANKS);

  // Fetch updated bank directory if available
  useEffect(() => {
    api.get<{ success: boolean; banks: { code: string; name: string }[] }>("/api/bank/list")
      .then((res) => {
        if (res.data?.banks && Array.isArray(res.data.banks) && res.data.banks.length > 0) {
          const formatted = res.data.banks.map((b) => ({
            code: String(b.code),
            name: b.name,
          }));
          setAvailableBanks(formatted);
        }
      })
      .catch(() => {
        // Fallback already pre-seeded with popular banks
      });
  }, []);

  const fetchSubscriptionData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [settingsRes, historyRes, ordersRes, balanceRes] = await Promise.all([
        api.get("/api/user/settings"),
        api.get("/api/payment/history").catch(() => null),
        api.get<{
          success: boolean;
          orders: StoreOrder[];
          nextCursor?: string | null;
          hasMore?: boolean;
        }>("/api/invoice/list?limit=20").catch(() => null),
        api.get<{
          success: boolean;
          balances: any;
          subaccount: any;
        }>("/api/merchant/balance").catch(() => null),
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

      if (ordersRes?.data?.orders) {
        setOrders(ordersRes.data.orders);
        setOrdersNextCursor(ordersRes.data.nextCursor || null);
        setOrdersHasMore(Boolean(ordersRes.data.hasMore));
      }

      if (balanceRes?.data?.balances) {
        setBalanceData(balanceRes.data.balances);
      }
      if (balanceRes?.data?.subaccount) {
        const sub = balanceRes.data.subaccount;
        setSubaccountData(sub);
        if (sub.accountNumber) {
          setAccountNumber(sub.accountNumber);
        }
        if (sub.businessName) {
          setBankBusinessName(sub.businessName);
        }
        if (sub.bankName) {
          const matched = POPULAR_NIGERIAN_BANKS.find(
            (b) => b.name.toLowerCase() === sub.bankName?.toLowerCase() || b.code === sub.bankName
          );
          if (matched) {
            setBankCode(matched.code);
          }
        }
      }
    } catch (err: unknown) {
      console.warn("Error fetching payment settings:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSaveBank = async (e: React.FormEvent) => {
    e.preventDefault();
    setBankSaving(true);
    setBankSuccessMsg(null);
    setBankErrorMsg(null);

    const cleanAccount = accountNumber.trim();
    if (!cleanAccount || cleanAccount.length !== 10 || !/^\d{10}$/.test(cleanAccount)) {
      setBankErrorMsg("Please enter a valid 10-digit Nigerian NUBAN account number.");
      setBankSaving(false);
      return;
    }

    try {
      const res = await api.post<{
        success: boolean;
        message: string;
        subaccountCode: string;
        platformFeePercent: number;
      }>("/api/merchant/subaccount", {
        settlement_bank: bankCode,
        account_number: cleanAccount,
        business_name: bankBusinessName.trim() || userInfo?.companyName || "Merchant Store",
      });

      if (res.data?.success) {
        setBankSuccessMsg(res.data.message || "Settlement bank account configured successfully.");
        setIsEditingBank(false);
        await fetchSubscriptionData();
      } else {
        setBankErrorMsg((res.data as any)?.error || "Failed to configure settlement account.");
      }
    } catch (err: any) {
      setBankErrorMsg(err?.response?.data?.error || err.message || "Failed to configure settlement account.");
    } finally {
      setBankSaving(false);
    }
  };

  const handleLoadMoreOrders = async () => {
    if (!ordersNextCursor || loadingMoreOrders) return;
    setLoadingMoreOrders(true);
    try {
      const res = await api.get<{
        success: boolean;
        orders: StoreOrder[];
        nextCursor?: string | null;
        hasMore?: boolean;
      }>(`/api/invoice/list?limit=20&cursor=${ordersNextCursor}`);
      if (res?.data?.orders) {
        setOrders((prev) => [...prev, ...res.data.orders]);
        setOrdersNextCursor(res.data.nextCursor || null);
        setOrdersHasMore(Boolean(res.data.hasMore));
      }
    } catch (err: unknown) {
      console.warn("Error loading more orders:", err);
    } finally {
      setLoadingMoreOrders(false);
    }
  };

  useEffect(() => {
    const loadSub = setTimeout(() => {
      fetchSubscriptionData();
    }, 0);
    return () => clearTimeout(loadSub);
  }, [fetchSubscriptionData]);

  // Handle Quick Invoice Creation
  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invItemName || !invNegotiatedPrice) {
      setError("Please specify item title and negotiated price.");
      return;
    }

    setCreatingInvoice(true);
    setError(null);
    try {
      const finalNaira = parseFloat(invNegotiatedPrice);
      const originalNaira = invOriginalPrice ? parseFloat(invOriginalPrice) : finalNaira;
      const discountNaira = Math.max(0, originalNaira - finalNaira);

      const res = await api.post("/api/invoice/create", {
        customerName: invCustomerName || "Valued Customer",
        customerPhone: invCustomerPhone,
        customerEmail: invCustomerEmail || "customer@inquiry.local",
        amountKobo: Math.round(finalNaira * 100),
        originalAmountKobo: Math.round(originalNaira * 100),
        discountKobo: Math.round(discountNaira * 100),
        notes: invNotes,
        items: [
          {
            id: `custom_${Date.now()}`,
            name: invItemName,
            price: finalNaira,
            quantity: 1,
          },
        ],
      });

      if (res.data?.success) {
        const fullCheckoutUrl = `${window.location.origin}/checkout/${res.data.orderId}`;
        setGeneratedInvoice({
          invoiceNumber: res.data.invoiceNumber,
          checkoutUrl: fullCheckoutUrl,
          whatsappShareText: res.data.whatsappShareText,
          phone: invCustomerPhone,
        });

        // Reset inputs
        setInvCustomerName("");
        setInvCustomerPhone("");
        setInvCustomerEmail("");
        setInvItemName("");
        setInvOriginalPrice("");
        setInvNegotiatedPrice("");
        setInvNotes("");

        // Refresh orders list
        fetchSubscriptionData();
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to create invoice.");
    } finally {
      setCreatingInvoice(false);
    }
  };

  const handleCopyLink = () => {
    if (generatedInvoice?.checkoutUrl) {
      navigator.clipboard.writeText(generatedInvoice.checkoutUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 3000);
    }
  };

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
        <span className="text-xs uppercase tracking-widest">Loading Payment & Invoices...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-[#F5F0EB] p-4 sm:p-6 lg:p-8 space-y-8 font-body max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#C9A96E]/20 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-brand font-bold text-[#F5F0EB] tracking-wide">
            Fintech & Payments Hub
          </h1>
          <p className="text-xs text-[#E0D5C9]/70 mt-1">
            Manage WhatsApp negotiated invoices, storefront transactions, and SaaS platform subscription.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-black/40 border border-white/10 p-1">
          <button
            onClick={() => setActiveTab("INVOICES")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "INVOICES"
                ? "bg-[#C9A96E] text-black shadow-md font-bold"
                : "text-[#E0D5C9]/70 hover:text-white"
            }`}
          >
            WhatsApp Invoices & Sales
          </button>
          <button
            onClick={() => setActiveTab("SUBSCRIPTIONS")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "SUBSCRIPTIONS"
                ? "bg-[#C9A96E] text-black shadow-md font-bold"
                : "text-[#E0D5C9]/70 hover:text-white"
            }`}
          >
            Platform Plan & Billing
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* REAL-TIME FINANCIAL BALANCES (DB LEDGER & PAYSTACK SUBACCOUNT) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[#C9A96E]">
            <CreditCard className="w-4 h-4" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-white">
              Live Store Balances &amp; Paystack Split Ledger
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/dashboard/${params?.id || ""}/support`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-[#E0D5C9] font-medium transition-colors"
            >
              <LifeBuoy className="w-3.5 h-3.5 text-[#C9A96E]" />
              <span>Report Issue / Support</span>
            </Link>
          </div>
        </div>

        {/* 4 Financial Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Today's Sales */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 relative overflow-hidden backdrop-blur-sm">
            <div className="flex items-center justify-between text-xs text-[#A0988A] mb-2">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Today&apos;s Sales</span>
              <span className="px-2 py-0.5 rounded-full bg-[#C9A96E]/20 text-[#C9A96E] font-bold text-[10px]">
                Credited Live
              </span>
            </div>
            <div className="text-2xl font-bold font-brand text-white">
              ₦{(balanceData?.todaySalesNaira || 0).toLocaleString()}
            </div>
            <p className="text-[11px] text-[#A0988A] mt-2 leading-tight">
              Increases immediately when customers pay via Paystack checkout.
            </p>
          </div>

          {/* Card 2: Pending Bank Settlement (< 24h) */}
          <div className="bg-white/5 border border-amber-500/20 rounded-2xl p-5 relative overflow-hidden backdrop-blur-sm">
            <div className="flex items-center justify-between text-xs text-[#A0988A] mb-2">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Pending Settlement (&lt; 24h)</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px] flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{balanceData?.pendingCount || 0} order(s)</span>
              </span>
            </div>
            <div className="text-2xl font-bold font-brand text-amber-300">
              ₦{(balanceData?.pendingSettlementNaira || 0).toLocaleString()}
            </div>
            <p className="text-[11px] text-[#A0988A] mt-2 leading-tight">
              Under 24h buyer protection. Reduces and auto-sweeps to your bank after 24 hrs.
            </p>
          </div>

          {/* Card 3: Settled to Bank */}
          <div className="bg-white/5 border border-emerald-500/20 rounded-2xl p-5 relative overflow-hidden backdrop-blur-sm">
            <div className="flex items-center justify-between text-xs text-[#A0988A] mb-2">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Settled to Bank</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Cleared</span>
              </span>
            </div>
            <div className="text-2xl font-bold font-brand text-emerald-300">
              ₦{(balanceData?.settledBankNaira || 0).toLocaleString()}
            </div>
            <p className="text-[11px] text-[#A0988A] mt-2 leading-tight">
              Total funds successfully cleared and transferred to your commercial bank.
            </p>
          </div>

          {/* Card 4: Disputed / Frozen */}
          <div className={`border rounded-2xl p-5 relative overflow-hidden backdrop-blur-sm ${
            (balanceData?.disputedNaira || 0) > 0 
              ? "bg-red-950/30 border-red-500/40" 
              : "bg-white/5 border-white/10"
          }`}>
            <div className="flex items-center justify-between text-xs text-[#A0988A] mb-2">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Held in Dispute</span>
              <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                (balanceData?.disputedNaira || 0) > 0 
                  ? "bg-red-500/20 text-red-300" 
                  : "bg-white/10 text-[#A0988A]"
              }`}>
                {balanceData?.disputedCount || 0} active
              </span>
            </div>
            <div className={`text-2xl font-bold font-brand ${
              (balanceData?.disputedNaira || 0) > 0 ? "text-red-400" : "text-[#A0988A]"
            }`}>
              ₦{(balanceData?.disputedNaira || 0).toLocaleString()}
            </div>
            <p className="text-[11px] text-[#A0988A] mt-2 leading-tight">
              {(balanceData?.disputedNaira || 0) > 0
                ? "Customer dispute active within 24h window. Payout frozen pending review."
                : "No customer disputes on hold. Your account is in good standing."}
            </p>
          </div>
        </div>

        {/* Bank Account & Settlement Hub */}
        <div className="bg-black/40 border border-[#C9A96E]/20 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#C9A96E]/10 border border-[#C9A96E]/30 text-[#C9A96E]">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-heading text-sm font-bold text-[#F5F0EB] uppercase tracking-wider">
                    Bank Account & Settlement Hub
                  </h3>
                  {subaccountData?.isActive && subaccountData?.accountNumber ? (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold text-[10px] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Active Split Gateway</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/30 font-semibold text-[10px] flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>Setup Required</span>
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#A0988A]">
                  Direct NUBAN settlement via Paystack Split Payments. Customer order funds automatically route to your bank account.
                </p>
              </div>
            </div>

            {subaccountData?.accountNumber && !isEditingBank && (
              <button
                type="button"
                onClick={() => {
                  setIsEditingBank(true);
                  setBankSuccessMsg(null);
                  setBankErrorMsg(null);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white transition-colors shrink-0 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#C9A96E]" />
                <span>Update Bank</span>
              </button>
            )}
          </div>

          {bankSuccessMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{bankSuccessMsg}</span>
            </div>
          )}

          {bankErrorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{bankErrorMsg}</span>
            </div>
          )}

          {/* Configured Summary View */}
          {subaccountData?.accountNumber && !isEditingBank ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="bg-white/5 border border-white/5 rounded-xl p-3 space-y-1">
                <span className="text-[10px] uppercase font-mono text-[#A0988A] tracking-wider block">Settlement Bank</span>
                <span className="font-semibold text-white text-sm block truncate">{subaccountData.bankName || "Commercial Bank"}</span>
              </div>

              <div className="bg-white/5 border border-white/5 rounded-xl p-3 space-y-1">
                <span className="text-[10px] uppercase font-mono text-[#A0988A] tracking-wider block">NUBAN Account Number</span>
                <span className="font-mono font-bold text-[#F5F0EB] text-sm tracking-widest block">{subaccountData.accountNumber}</span>
              </div>

              <div className="bg-white/5 border border-white/5 rounded-xl p-3 space-y-1">
                <span className="text-[10px] uppercase font-mono text-[#A0988A] tracking-wider block">Account / Business Name</span>
                <span className="font-semibold text-white text-sm block truncate">{subaccountData.businessName || userInfo?.companyName || "Store Owner"}</span>
              </div>

              <div className="bg-white/5 border border-white/5 rounded-xl p-3 space-y-1">
                <span className="text-[10px] uppercase font-mono text-[#A0988A] tracking-wider block">Split Revenue Ratio</span>
                <span className="font-semibold text-[#C9A96E] text-sm block">
                  {Number((100 - (subaccountData.percentageCharge || 5)).toFixed(2))}% You / {subaccountData.percentageCharge || 5}% Fee
                </span>
                {subaccountData.code && (
                  <span className="text-[10px] text-[#A0988A] font-mono block">Subaccount: {subaccountData.code}</span>
                )}
              </div>
            </div>
          ) : (
            /* Interactive Bank Form */
            <form onSubmit={handleSaveBank} className="space-y-4 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#E0D5C9]">
                    Select Settlement Bank <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={bankCode}
                    onChange={(e) => setBankCode(e.target.value)}
                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#C9A96E] transition-colors"
                  >
                    {availableBanks.map((b) => (
                      <option key={b.code} value={b.code}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#E0D5C9]">
                    10-Digit Account Number (NUBAN) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    inputMode="numeric"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
                    placeholder="0123456789"
                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white font-mono placeholder:text-white/20 focus:outline-none focus:border-[#C9A96E] transition-colors tracking-wider"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#E0D5C9]">
                    Registered Business / Account Name
                  </label>
                  <input
                    type="text"
                    value={bankBusinessName}
                    onChange={(e) => setBankBusinessName(e.target.value)}
                    placeholder={userInfo?.companyName || "Your Atelier or Legal Name"}
                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-[#C9A96E] transition-colors"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <p className="text-[11px] text-[#A0988A]">
                  Connected for Paystack Split Payments. Settlement sweeps automatically reconcile and credit your account.
                </p>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {subaccountData?.accountNumber && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingBank(false);
                        setBankErrorMsg(null);
                      }}
                      className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white/70 hover:text-white transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={bankSaving || !accountNumber || accountNumber.length !== 10}
                    className="px-5 py-2 rounded-xl bg-[#C9A96E] hover:bg-[#B8985D] text-[#121212] text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-lg shadow-[#C9A96E]/10 cursor-pointer"
                  >
                    {bankSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{bankSaving ? "Verifying & Saving..." : "Save Settlement Account"}</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* TAB 1: WHATSAPP INVOICES & STOREFRONT SALES */}

      {activeTab === "INVOICES" && (
        <div className="space-y-8">
          {/* FLOW B: QUICK INVOICE GENERATOR */}
          <div className="bg-white/5 border border-[#C9A96E]/20 rounded-2xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
              <div className="flex items-center gap-2 text-[#C9A96E]">
                <MessageCircle className="w-5 h-5" />
                <h2 className="text-base font-bold uppercase tracking-wider text-[#F5F0EB]">
                  Flow B: Quick WhatsApp Negotiated Invoice Generator
                </h2>
              </div>
              <span className="text-[11px] text-emerald-400 font-mono bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                10-Second Instant Checkout Link
              </span>
            </div>
            <p className="text-xs text-[#E0D5C9]/70 leading-relaxed">
              Agreed on a discount or custom sizing with a customer on WhatsApp? 
              Generate an itemized invoice link with negotiated pricing and bespoke measurement notes.
            </p>

            {/* Generated Invoice Success Banner */}
            {generatedInvoice && (
              <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-bold text-sm">
                      Invoice #{generatedInvoice.invoiceNumber} Ready to Share!
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-300">Live & Payable</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <input
                    readOnly
                    value={generatedInvoice.checkoutUrl}
                    className="flex-1 px-3 py-2 rounded-xl bg-black/50 border border-emerald-500/30 text-xs font-mono text-[#F5F0EB]"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedUrl ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedUrl ? "Copied!" : "Copy Link"}</span>
                  </button>
                  <a
                    href={`https://wa.me/${(generatedInvoice.phone || "").replace(/\D/g, "")}?text=${encodeURIComponent(
                      generatedInvoice.whatsappShareText
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Share on WhatsApp</span>
                  </a>
                </div>
              </div>
            )}

            {/* Invoice Creation Form */}
            <form onSubmit={handleCreateInvoice} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#E0D5C9] mb-1.5">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={invCustomerName}
                    onChange={(e) => setInvCustomerName(e.target.value)}
                    placeholder="e.g. Chief Adeleke"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-[#F5F0EB] focus:border-[#C9A96E] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#E0D5C9] mb-1.5">
                    WhatsApp Phone Number
                  </label>
                  <input
                    type="text"
                    value={invCustomerPhone}
                    onChange={(e) => setInvCustomerPhone(e.target.value)}
                    placeholder="e.g. +2348012345678"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-[#F5F0EB] focus:border-[#C9A96E] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#E0D5C9] mb-1.5">
                    Customer Email (For Receipt)
                  </label>
                  <input
                    type="email"
                    value={invCustomerEmail}
                    onChange={(e) => setInvCustomerEmail(e.target.value)}
                    placeholder="e.g. customer@gmail.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-[#F5F0EB] focus:border-[#C9A96E] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#E0D5C9] mb-1.5">
                    Item / Garment Title
                  </label>
                  <input
                    type="text"
                    value={invItemName}
                    onChange={(e) => setInvItemName(e.target.value)}
                    placeholder="e.g. Royal Blue 3-Piece Senator"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-[#F5F0EB] focus:border-[#C9A96E] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#E0D5C9] mb-1.5">
                    Catalog Price (₦)
                  </label>
                  <input
                    type="number"
                    value={invOriginalPrice}
                    onChange={(e) => setInvOriginalPrice(e.target.value)}
                    placeholder="e.g. 45000"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-[#F5F0EB] focus:border-[#C9A96E] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#E0D5C9] mb-1.5">
                    Negotiated Final Price (₦)
                  </label>
                  <input
                    type="number"
                    value={invNegotiatedPrice}
                    onChange={(e) => setInvNegotiatedPrice(e.target.value)}
                    placeholder="e.g. 40000"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-[#C9A96E]/50 text-xs font-mono font-bold text-[#C9A96E] focus:border-[#C9A96E] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#E0D5C9] mb-1.5">
                  Bespoke Sizing & Agreement Notes
                </label>
                <textarea
                  rows={2}
                  value={invNotes}
                  onChange={(e) => setInvNotes(e.target.value)}
                  placeholder="e.g. Chest 42, Shoulder 18.5, White Italian Cashmere fabric, Delivered by Friday"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-[#F5F0EB] focus:border-[#C9A96E] focus:outline-none leading-relaxed"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={creatingInvoice}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#C9A96E] text-black font-bold text-xs uppercase tracking-wider hover:bg-[#D4B87D] transition-all cursor-pointer shadow-lg disabled:opacity-50"
                >
                  {creatingInvoice ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Generating Invoice...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Generate Quick Invoice</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* STOREFRONT ORDERS & INVOICES TABLE */}
          <div className="space-y-4">
            <h2 className="text-xl font-heading text-[#F5F0EB]">Storefront Customer Orders & Invoices</h2>
            {orders.length === 0 ? (
              <div className="p-8 rounded-2xl bg-white/5 border border-white/10 text-center text-[#E0D5C9]/60 text-xs">
                No orders or negotiated invoices created yet.
              </div>
            ) : (
              <div className="overflow-x-auto border border-white/10 rounded-2xl bg-white/5">
                <table className="w-full text-left text-xs">
                  <thead className="bg-black/60 text-[#C9A96E] uppercase tracking-wider border-b border-white/10">
                    <tr>
                      <th className="p-4">Ref / Invoice</th>
                      <th className="p-4">Type</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {orders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 font-mono font-bold text-[#E0D5C9]">
                          {ord.invoiceNumber || ord.reference}
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-white/10 text-white">
                            {ord.orderType}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="font-semibold text-white">{ord.customerName || "Customer"}</div>
                          <div className="text-[11px] text-[#E0D5C9]/60 font-mono">{ord.customerPhone || ord.customerEmail}</div>
                        </td>
                        <td className="p-4 font-bold text-[#C9A96E]">
                          ₦{ord.amountNaira.toLocaleString()}
                          {ord.discountNaira && ord.discountNaira > 0 ? (
                            <span className="text-[10px] text-emerald-400 block font-normal">
                              -₦{ord.discountNaira.toLocaleString()} disc
                            </span>
                          ) : null}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              ord.status === "COMPLETED"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                            }`}
                          >
                            {ord.status}
                          </span>
                        </td>
                        <td className="p-4 text-[#E0D5C9]/70">
                          {new Date(ord.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          <Link
                            href={ord.checkoutUrl}
                            target="_blank"
                            className="inline-flex items-center gap-1 text-[#C9A96E] hover:underline"
                          >
                            <span>Preview</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {/* Pagination Controls */}
                <div className="p-4 border-t border-white/10 bg-black/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="text-[#E0D5C9]/60">
                    Showing <span className="text-white font-semibold">{orders.length}</span> recorded orders / invoices
                  </div>
                  <div>
                    {ordersHasMore ? (
                      <button
                        type="button"
                        onClick={handleLoadMoreOrders}
                        disabled={loadingMoreOrders}
                        className="px-4 py-2 rounded-xl font-bold bg-[#C9A96E] text-black hover:bg-[#D4AF37] transition-all disabled:opacity-50 flex items-center gap-2 shadow-sm active:scale-95 cursor-pointer"
                      >
                        {loadingMoreOrders ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Fetching Next Batch...</span>
                          </>
                        ) : (
                          <>
                            <span>Next Batch</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    ) : orders.length > 0 ? (
                      <span className="text-[11px] text-[#E0D5C9]/40 italic">
                        ✓ All order history loaded
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: PLATFORM SAAS SUBSCRIPTIONS & STORAGE */}
      {activeTab === "SUBSCRIPTIONS" && (
        <div className="space-y-8">
          {/* Storage & Plan Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-white/5 border border-[#C9A96E]/20 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 text-[#C9A96E]">
                <CreditCard className="w-5 h-5" />
                <h3 className="font-heading text-lg font-bold text-[#F5F0EB]">Active Platform Tier</h3>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-brand font-bold text-[#C9A96E]">
                  {userInfo?.planSelected || "STARTER"}
                </span>
                <span className="text-xs uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                  {userInfo?.subscription_status || "ACTIVE"}
                </span>
              </div>
              <p className="text-xs text-[#E0D5C9]/70">
                14-day trial with 100 MB media storage & standard social commerce features included.
              </p>
            </div>

            <div className="p-6 bg-white/5 border border-[#C9A96E]/20 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 text-[#C9A96E]">
                <HardDrive className="w-5 h-5" />
                <h3 className="font-heading text-lg font-bold text-[#F5F0EB]">Storage Allocation</h3>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-brand font-bold text-[#F5F0EB]">
                  {userInfo?.storageUsed || 0} MB
                </span>
                <span className="text-xs text-[#E0D5C9]/60">
                  / {userInfo?.storageLimit || (userInfo?.planSelected === "FREE_TRIAL" ? 100 :userInfo?.planSelected === "PROFESSIONAL" ? 2000 :userInfo?.planSelected === "ENTERPRISE" ? 10000: 500)} MB Limit
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-black/50 overflow-hidden">
                <div
                  className="h-full bg-[#C9A96E]"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round(
                        ((userInfo?.storageUsed || 0) /
                          (userInfo?.storageLimit || (userInfo?.planSelected === "FREE_TRIAL" ? 100 : 500))) *
                          100
                      )
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Plan Selection Cards */}
          <div className="space-y-4">
            <h2 className="text-xl font-heading text-[#F5F0EB]">Upgrade Plan</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Starter */}
              <div
                onClick={() => setSelectedPlan("STARTER")}
                className={`p-6 bg-black/40 border rounded-2xl cursor-pointer transition-all ${
                  selectedPlan === "STARTER" ? "border-[#C9A96E] ring-1 ring-[#C9A96E]" : "border-white/10"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-heading text-[#F5F0EB]">Starter</h3>
                  {selectedPlan === "STARTER" && (
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#C9A96E]/20 text-[#C9A96E] border border-[#C9A96E]/40">Selected</span>
                  )}
                </div>
                <p className="text-2xl font-bold text-[#C9A96E] mt-2">₦2,000 <span className="text-xs text-[#E0D5C9]/60 font-normal">/mo</span></p>
                <ul className="text-xs space-y-2 text-[#E0D5C9]/80 mt-4">
                  <li>• 1 User Seat (Admin Only)</li>
                  <li>• 500 MB Storage Limit</li>
                  <li>• Unlimited WhatsApp Direct Checkout</li>
                  <li>• Standard Traffic Quota (2,000 visits/mo)</li>
                </ul>
              </div>

              {/* Professional */}
              <div
                onClick={() => setSelectedPlan("PROFESSIONAL")}
                className={`p-6 bg-black/40 border rounded-2xl cursor-pointer transition-all ${
                  selectedPlan === "PROFESSIONAL" ? "border-[#C9A96E] ring-1 ring-[#C9A96E]" : "border-white/10"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-heading text-[#F5F0EB]">Professional</h3>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">Most Popular</span>
                </div>
                <p className="text-2xl font-bold text-[#C9A96E] mt-2">₦10,000 <span className="text-xs text-[#E0D5C9]/60 font-normal">/mo</span></p>
                <ul className="text-xs space-y-2 text-[#E0D5C9]/80 mt-4">
                  <li>• Up to 5 Team Members (1 Admin + 4 Store Managers)</li>
                  <li>• 2 GB High-Speed Storage Limit</li>
                  <li>• AI Copywriter Access (10 Credits)</li>
                  <li>• Split Payment Settlement Directly to Bank</li>
                  <li>• 15,000 Monthly Storefront Visits</li>
                </ul>
              </div>
            </div>

            {/* Note regarding Custom Enterprise Plan */}
            <div className="p-4 bg-zinc-900/60 rounded-xl border border-zinc-800 text-xs text-zinc-400 flex items-center justify-between">
              <span>Need custom storage, dedicated account manager, or tailored enterprise quotas? Custom enterprise plans require admin review and bespoke quote details.</span>
              <Link href={`/dashboard/${params?.id || '1'}/support`} className="text-[#C9A96E] font-semibold hover:underline shrink-0 ml-4">
                Request Custom Quote →
              </Link>
            </div>

            <button
              onClick={handleProceedToPayment}
              disabled={initiating||selectedPlan==="FREE_TRIAL"}
              className="w-full lg:w-auto px-8 py-4 bg-[#C9A96E] text-[#1A1A1A] text-xs font-bold uppercase tracking-[0.25em] hover:bg-[#F5F0EB] transition-colors disabled:opacity-50 cursor-pointer rounded-xl flex items-center justify-center gap-2"
            >
              {initiating ? "Redirecting to Paystack..." : ` ${selectedPlan==="FREE_TRIAL"?"Select Plan":selectedPlan==="STARTER" ? "Proceed with STARTER" : "Proceed with PROFESSIONAL " }`}
            </button>
          </div>

          {/* Merged Payment History Table */}
          <div className="space-y-4 pt-6 border-t border-white/10">
            <h2 className="text-xl font-heading text-[#F5F0EB]">SaaS Billing History</h2>
            {transactions.length === 0 ? (
              <p className="text-xs text-[#E0D5C9]/60">No transaction receipts found.</p>
            ) : (
              <div className="overflow-x-auto border border-white/10 rounded-2xl bg-white/5">
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
      )}
    </div>
  );
}
