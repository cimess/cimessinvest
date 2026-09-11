"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Loader2, AlertCircle, ArrowRight, ShieldAlert, RefreshCw } from "lucide-react";
import { api } from "@/app/lib/utils/apiClient";

interface TransactionCheckResponse {
  success?: boolean;
  message?: string;
  plan?: {
    selected?: string;
    status?: string;
  };
  storage?: {
    limitMB?: number;
    usedMB?: number;
    formatted?: {
      limit?: string;
      used?: string;
    };
  };
}

const RETRY_INTERVAL_SECONDS = 5;
const MAX_ATTEMPTS = 5;

function CallbackContent() {
  const searchParams = useSearchParams();
  const params = useParams();
  const userId = (params?.id as string) || "";
  const reference = searchParams?.get("reference");

  const [status, setStatus] = useState<"VERIFYING" | "PENDING_RETRY" | "SUCCESS" | "FAILED">("VERIFYING");
  const [message, setMessage] = useState("Verifying payment with Paystack gateway...");
  const [details, setDetails] = useState<TransactionCheckResponse | null>(null);
  const [attempt, setAttempt] = useState(1);
  const [countdown, setCountdown] = useState(RETRY_INTERVAL_SECONDS);

  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const dashboardPath = userId ? `/dashboard/${userId}` : "/dashboard";

  useEffect(() => {
    let isMounted = true;
    let currentAttempt = 1;

    const startCountdownAndRetry = () => {
      if (!isMounted) return;
      setStatus("PENDING_RETRY");
      setMessage("Payment authorization pending from Paystack. Please do not close this window.");
      setCountdown(RETRY_INTERVAL_SECONDS);

      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);

      let timeLeft = RETRY_INTERVAL_SECONDS;
      countdownTimerRef.current = setInterval(() => {
        timeLeft -= 1;
        if (!isMounted) return;

        if (timeLeft > 0) {
          setCountdown(timeLeft);
        } else {
          if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
          if (currentAttempt < MAX_ATTEMPTS) {
            currentAttempt += 1;
            setAttempt(currentAttempt);
            runVerification();
          } else {
            setStatus("FAILED");
            setMessage("Payment verification taking longer than expected. If your account was debited, your plan will activate automatically within a few minutes via webhook.");
          }
        }
      }, 1000);
    };

    const runVerification = async () => {
      if (!isMounted) return;
      setStatus("VERIFYING");
      setMessage(`Verifying transaction status with Paystack (Attempt ${currentAttempt} of ${MAX_ATTEMPTS})...`);

      try {
        const refStr = reference || "";
        const res = await api.get(`/api/payment/check-status?reference=${encodeURIComponent(refStr)}`);
        if (!isMounted) return;

        if (res.data && res.data.success) {
          setStatus("SUCCESS");
          setMessage("Payment verified successfully! Your subscription and storage capacity are active.");
          setDetails(res.data as TransactionCheckResponse);
        } else if (res.data && res.data.status === "FAILED") {
          setStatus("FAILED");
          setMessage(res.data.message || "Payment transaction was declined, cancelled, or failed.");
        } else {
          if (currentAttempt < MAX_ATTEMPTS) {
            startCountdownAndRetry();
          } else {
            setStatus("FAILED");
            setMessage("Payment verification taking longer than expected. If your account was debited, your subscription will update shortly via background webhook.");
          }
        }
      } catch (err: unknown) {
        if (!isMounted) return;
        if (currentAttempt < MAX_ATTEMPTS) {
          startCountdownAndRetry();
        } else {
          setStatus("FAILED");
          setMessage("Could not confirm transaction status. Please check your dashboard or contact concierge support.");
        }
      }
    };

    const initTimer = setTimeout(() => {
      if (!reference) {
        if (isMounted) {
          setStatus("FAILED");
          setMessage("Invalid callback parameters. Missing transaction reference.");
        }
        return;
      }
      runVerification();
    }, 0);

    return () => {
      isMounted = false;
      clearTimeout(initTimer);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, [reference]);

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-[#F5F0EB] flex items-center justify-center p-6 font-body">
      <div className="max-w-md w-full p-8 bg-black/60 border border-[#C9A96E]/30 rounded-xl space-y-6 text-center shadow-2xl">
        {/* State 1: Active Initial Verification */}
        {status === "VERIFYING" && (
          <div className="space-y-4">
            <Loader2 className="w-12 h-12 text-[#C9A96E] animate-spin mx-auto" />
            <h2 className="text-xl font-bold font-heading">Verifying Transaction</h2>
            <p className="text-xs text-[#E0D5C9]/70">{message}</p>
            <div className="text-[10px] font-mono text-[#C9A96E]/80 uppercase tracking-widest bg-white/5 py-1 px-3 rounded inline-block">
              Checking Paystack Server...
            </div>
          </div>
        )}

        {/* State 2: Pending with Countdown Timer */}
        {status === "PENDING_RETRY" && (
          <div className="space-y-5">
            <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-[#C9A96E]/20 animate-ping" />
              <div className="w-14 h-14 rounded-full border-2 border-[#C9A96E] flex items-center justify-center font-mono font-bold text-xl text-[#C9A96E] bg-black/80">
                {countdown}s
              </div>
            </div>

            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                <ShieldAlert className="w-3 h-3" />
                Payment Pending Authorization
              </span>
              <h2 className="text-xl font-bold font-heading text-[#F5F0EB] pt-1">Please Do Not Close Page</h2>
              <p className="text-xs text-[#E0D5C9]/80 px-2">{message}</p>
            </div>

            <div className="p-3 bg-white/5 border border-white/10 rounded-lg text-xs space-y-1 font-mono text-[#E0D5C9]/70">
              <div className="flex justify-between items-center text-[11px]">
                <span>Re-verification Attempt:</span>
                <span className="text-[#C9A96E] font-bold">{attempt} of {MAX_ATTEMPTS}</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span>Next check in:</span>
                <span className="text-white font-bold">{countdown} seconds</span>
              </div>
            </div>
          </div>
        )}

        {/* State 3: Successful Verification */}
        {status === "SUCCESS" && (
          <div className="space-y-4">
            <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto" />
            <h2 className="text-2xl font-bold font-heading text-[#F5F0EB]">Payment Verified!</h2>
            <p className="text-xs text-[#E0D5C9]/80">{message}</p>

            {details?.storage && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded text-left text-xs space-y-1 text-emerald-300 font-mono">
                <div>Plan: <strong className="text-white">{details.plan?.selected}</strong></div>
                <div>Storage Limit: <strong className="text-white">{details.storage?.formatted?.limit}</strong></div>
                <div>Storage Used: <strong className="text-white">{details.storage?.formatted?.used}</strong></div>
              </div>
            )}

            <Link
              href={dashboardPath}
              className="mt-4 inline-flex items-center space-x-2 px-6 py-3 bg-[#C9A96E] text-[#1A1A1A] font-bold text-xs uppercase tracking-wider rounded hover:bg-[#F5F0EB] transition-colors"
            >
              <span>Return to Atelier Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* State 4: Retry Exhausted or Failed */}
        {status === "FAILED" && (
          <div className="space-y-4">
            <AlertCircle className="w-14 h-14 text-amber-400 mx-auto" />
            <h2 className="text-xl font-bold font-heading">Verification Pending</h2>
            <p className="text-xs text-[#E0D5C9]/70">{message}</p>

            <Link
              href={dashboardPath}
              className="mt-4 inline-flex items-center space-x-2 px-6 py-3 bg-white/10 text-white font-bold text-xs uppercase tracking-wider rounded hover:bg-white/20 transition-colors"
            >
              <span>Go to Dashboard</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#1A1A1A] text-white flex items-center justify-center">Loading...</div>}>
      <CallbackContent />
    </Suspense>
  );
}
