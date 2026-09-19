import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/app/lib/security/rateLimiter";

export interface BankItem {
  id: string | number;
  name: string;
  slug: string;
  code: string;
  longcode?: string;
  gateway?: string;
  pay_with_bank?: boolean;
  active?: boolean;
  is_deleted?: boolean;
  country?: string;
  currency?: string;
  type?: string;
}

// Built-in instant seed of popular Nigerian commercial banks & fintechs
const POPULAR_NIGERIAN_BANKS: BankItem[] = [
  { id: "opay", name: "OPay / Paycom", slug: "paycom", code: "999992" },
  { id: "palmpay", name: "PalmPay", slug: "palmpay", code: "999991" },
  { id: "moniepoint", name: "Moniepoint MFB", slug: "moniepoint-mfb-ng", code: "50515" },
  { id: "kuda", name: "Kuda Microfinance Bank", slug: "kuda-bank", code: "50211" },
  { id: "gtb", name: "Guaranty Trust Bank (GTBank)", slug: "guaranty-trust-bank", code: "058" },
  { id: "zenith", name: "Zenith Bank", slug: "zenith-bank", code: "057" },
  { id: "access", name: "Access Bank", slug: "access-bank", code: "044" },
  { id: "firstbank", name: "First Bank of Nigeria", slug: "first-bank-of-nigeria", code: "011" },
  { id: "uba", name: "United Bank for Africa (UBA)", slug: "united-bank-for-africa", code: "033" },
  { id: "sterling", name: "Sterling Bank", slug: "sterling-bank", code: "232" },
  { id: "fidelity", name: "Fidelity Bank", slug: "fidelity-bank", code: "070" },
  { id: "stanbic", name: "Stanbic IBTC Bank", slug: "stanbic-ibtc-bank", code: "221" },
  { id: "wema", name: "Wema Bank / ALAT", slug: "wema-bank", code: "035" },
  { id: "polaris", name: "Polaris Bank", slug: "polaris-bank", code: "076" },
  { id: "union", name: "Union Bank of Nigeria", slug: "union-bank-of-nigeria", code: "032" },
  { id: "fcmb", name: "First City Monument Bank (FCMB)", slug: "first-city-monument-bank", code: "214" },
  { id: "jaiz", name: "Jaiz Bank", slug: "jaiz-bank", code: "301" },
  { id: "taj", name: "Taj Bank", slug: "taj-bank", code: "302" },
];

let cachedBanks: BankItem[] | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function GET(req: NextRequest) {
  try {
    // 0. Rate limiting (max 60 requests per minute per IP)
    const rateLimit = await checkRateLimit(req, {
      keyPrefix: "bank-list",
      limit: 60,
      windowMs: 60 * 1000,
    });
    if (!rateLimit.success && rateLimit.response) {
      return rateLimit.response;
    }

    const forceRefresh = req.nextUrl.searchParams.get("fresh") === "true";
    const now = Date.now();
    if (!forceRefresh && cachedBanks && now - lastFetchTime < CACHE_TTL_MS) {
      return NextResponse.json({
        success: true,
        source: "cache",
        banks: cachedBanks,
      });
    }

    const paystackKey = process.env.PAYSTACK_SECRET_KEY;
    if (paystackKey) {
      try {
        const res = await fetch("https://api.paystack.co/bank?country=nigeria&perPage=100", {
          headers: {
            Authorization: `Bearer ${paystackKey.trim()}`,
          },
          next: { revalidate: 86400 },
        });

        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data?.data) && data.data.length > 0) {
            const fetchedList: BankItem[] = data.data.map((b: any) => ({
              id: b.id || b.code,
              name: b.name,
              slug: b.slug || b.name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
              code: b.code,
            }));

            // Deduplicate by bank code to ensure clean UI dropdowns and unique keys
            const seenCodes = new Set<string>();
            const deduplicatedList: BankItem[] = [];

            for (const bank of fetchedList) {
              if (bank.code && !seenCodes.has(bank.code)) {
                seenCodes.add(bank.code);
                deduplicatedList.push(bank);
              }
            }

            cachedBanks = deduplicatedList;
            lastFetchTime = now;

            return NextResponse.json({
              success: true,
              source: "live",
              banks: cachedBanks,
            });
          }
        }
      } catch (fetchErr) {
        console.warn("Paystack bank list fetch error, falling back to seed list:", fetchErr);
      }
    }

    // Fallback to built-in seed list
    cachedBanks = POPULAR_NIGERIAN_BANKS;
    lastFetchTime = now;

    return NextResponse.json({
      success: true,
      source: "fallback",
      banks: cachedBanks,
    });
  } catch (error) {
    console.error("Bank List API Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve bank directory", banks: POPULAR_NIGERIAN_BANKS },
      { status: 500 }
    );
  }
}
