import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma/prisma";

/**
 * POST /api/auth/verify-otp
 * Validates the 6-digit OTP code against DB record and checks expiration.
 */
export async function POST(req: NextRequest) {
  try {
    const { email, otpCode } = await req.json();

    if (!email || !otpCode) {
      return NextResponse.json({ error: "Email and OTP code are required." }, { status: 400 });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedOtp = otpCode.trim();

    const user = await prisma.user.findFirst({
      where: { email: { equals: trimmedEmail, mode: "insensitive" } },
    });

    if (!user || !user.resetToken || !user.resetTokenExpiry) {
      return NextResponse.json({ error: "Invalid or expired reset request." }, { status: 400 });
    }

    if (new Date() > new Date(user.resetTokenExpiry)) {
      return NextResponse.json({ error: "This OTP code has expired. Please request a new code." }, { status: 400 });
    }

    // Parse stored OTP and attempt count (formatted as "123456:attempts")
    const [storedCode, attemptsStr] = user.resetToken.split(":");
    const currentAttempts = parseInt(attemptsStr || "0", 10);

    if (storedCode !== trimmedOtp) {
      const nextAttempts = currentAttempts + 1;

      if (nextAttempts >= 5) {
        // Exceeded 5 failed guesses -> Invalidate token in DB immediately
        await prisma.user.update({
          where: { id: user.id },
          data: { resetToken: null, resetTokenExpiry: new Date() },
        });

        return NextResponse.json(
          { error: "Too many invalid OTP attempts (5/5). Your OTP has been invalidated for security. Please request a new code." },
          { status: 429 }
        );
      }

      // Record failed attempt in DB to persist state across Vercel lambdas
      await prisma.user.update({
        where: { id: user.id },
        data: { resetToken: `${storedCode}:${nextAttempts}` },
      });

      const remainingAttempts = 5 - nextAttempts;
      return NextResponse.json(
        { error: `Invalid 6-digit OTP code. ${remainingAttempts} ${remainingAttempts === 1 ? "attempt" : "attempts"} remaining.` },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "OTP code verified successfully. You may now reset your password.",
    });
  } catch (error: unknown) {
    console.error("[VerifyOTP] Error:", error);
    const msg = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
