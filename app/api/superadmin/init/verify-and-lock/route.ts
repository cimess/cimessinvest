import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma/prisma";
import bcrypt from "bcrypt";
import crypto from "crypto";

export const dynamic = "force-dynamic";

/**
 * POST /api/superadmin/init/verify-and-lock
 * Verifies the 6-digit OTP, compares the provided secret against SUPERADMIN_INIT_PASSWORD,
 * hashes the password with bcrypt, elevates the user to SUPERADMIN role, and locks initialization.
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Guard: Check if Superadmin is already bootstrapped & locked
    const existingSuperadmin = await prisma.user.findFirst({
      where: { role: "SUPERADMIN" },
      select: { id: true, email: true },
    });

    if (existingSuperadmin) {
      return NextResponse.json(
        { error: "Superadmin authority is already initialized and permanently locked." },
        { status: 400 }
      );
    }

    const { otp, secret } = await req.json();

    if (!otp || typeof otp !== "string" || !secret || typeof secret !== "string") {
      return NextResponse.json(
        { error: "Both the 6-digit OTP and the environment secret password are required." },
        { status: 400 }
      );
    }

    const initEmail = process.env.SUPERADMIN_INIT_EMAIL?.trim().toLowerCase();
    const initPassword = process.env.SUPERADMIN_INIT_PASSWORD;

    if (!initEmail || !initPassword) {
      return NextResponse.json(
        { error: "SUPERADMIN_INIT_EMAIL or SUPERADMIN_INIT_PASSWORD is not configured." },
        { status: 500 }
      );
    }

    // 2. Fetch pending user record and verify OTP
    const user = await prisma.user.findFirst({
      where: { email: { equals: initEmail, mode: "insensitive" } },
    });

    if (!user || !user.resetToken) {
      return NextResponse.json(
        { error: "No pending verification code found. Please request a new code first." },
        { status: 400 }
      );
    }

    // Check expiry
    if (!user.resetTokenExpiry || new Date() > new Date(user.resetTokenExpiry)) {
      return NextResponse.json(
        { error: "Verification code has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Timing-safe OTP comparison
    const providedOtpBuffer = Buffer.from(otp.trim());
    const storedOtpBuffer = Buffer.from(user.resetToken.trim());

    if (
      providedOtpBuffer.length !== storedOtpBuffer.length ||
      !crypto.timingSafeEqual(providedOtpBuffer, storedOtpBuffer)
    ) {
      return NextResponse.json(
        { error: "Invalid verification code. Please check your email and try again." },
        { status: 401 }
      );
    }

    // 3. Compare provided secret with SUPERADMIN_INIT_PASSWORD using timingSafeEqual
    const providedSecretBuffer = Buffer.from(secret);
    const expectedSecretBuffer = Buffer.from(initPassword);

    if (
      providedSecretBuffer.length !== expectedSecretBuffer.length ||
      !crypto.timingSafeEqual(providedSecretBuffer, expectedSecretBuffer)
    ) {
      return NextResponse.json(
        { error: "The provided secret does not match." },
        { status: 403 }
      );
    }

    // 4. Hash secret with bcrypt (10 rounds)
    const hashedPassword = await bcrypt.hash(secret, 10);

    // 5. Elevate user to SUPERADMIN and lock initialization
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        role: "SUPERADMIN",
        resetToken: null,
        resetTokenExpiry: null,
        paymentVerified: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Root Superadmin credentials verified, hashed to database, and permanently locked. You may now log in.",
    });
  } catch (error: unknown) {
    console.error("[Superadmin Init Verify Error]:", error);
    const msg = error instanceof Error ? error.message : "Failed finalizing superadmin initialization";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
