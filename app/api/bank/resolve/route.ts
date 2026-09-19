import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/app/lib/security/rateLimiter";

export async function POST(req: NextRequest) {
  try {
    // 0. Strict Rate limiting (max 10 resolves per 10 minutes per IP to prevent name-scraping)
    const rateLimit = await checkRateLimit(req, {
      keyPrefix: "bank-resolve",
      limit: 10,
      windowMs: 10 * 60 * 1000,
      customMessage: "Account verification rate limit reached (10 lookups per 10 mins). Please wait before trying again.",
    });
    if (!rateLimit.success && rateLimit.response) {
      return rateLimit.response;
    }

    const body = await req.json();
    const accountNumber = String(body.accountNumber || body.account_number || "").trim();
    const bankCode = String(body.bankCode || body.bank_code || "").trim();

    if (!accountNumber || !bankCode) {
      return NextResponse.json(
        { error: "Both accountNumber and bankCode are required." },
        { status: 400 }
      );
    }

    if (!/^\d{10}$/.test(accountNumber)) {
      return NextResponse.json(
        { error: "NUBAN account number must be exactly 10 digits." },
        { status: 400 }
      );
    }

    const paystackKey = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackKey) {
      // In development or when Paystack key is pending, provide a clean mock or error
      return NextResponse.json(
        {
          error: "Paystack secret key is not configured on the server.",
          success: false,
        },
        { status: 503 }
      );
    }

    const url = `https://api.paystack.co/bank/resolve?account_number=${encodeURIComponent(
      accountNumber
    )}&bank_code=${encodeURIComponent(bankCode)}`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${paystackKey.trim()}`,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    if (!res.ok || !data.status) {
      return NextResponse.json(
        {
          success: false,
          error: data.message || "Could not resolve account details. Please verify the account number and selected bank.",
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      accountNumber: data.data?.account_number || accountNumber,
      accountName: data.data?.account_name || "",
      bankId: data.data?.bank_id || null,
      bankCode,
    });
  } catch (error) {
    console.error("Bank Resolve API Error:", error);
    return NextResponse.json(
      { success: false, error: "An error occurred while resolving the bank account." },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const accountNumber = searchParams.get("account_number") || searchParams.get("accountNumber") || "";
    const bankCode = searchParams.get("bank_code") || searchParams.get("bankCode") || "";

    // Forward to internal handler using synthetic POST
    const syntheticReq = new NextRequest(req.url, {
      method: "POST",
      body: JSON.stringify({ accountNumber, bankCode }),
      headers: req.headers,
    });

    return POST(syntheticReq);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Invalid lookup query." },
      { status: 400 }
    );
  }
}
