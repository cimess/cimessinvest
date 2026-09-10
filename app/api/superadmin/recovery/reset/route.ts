import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma/prisma";
import bcrypt from "bcrypt";
import crypto from "crypto";

export const dynamic = "force-dynamic";

/**
 * POST /api/superadmin/recovery/reset
 * Validates the emergency recovery OTP and resets the Superadmin password.
 */
export async function POST(req: NextRequest) {
  try {
    const { email, otp, newPassword } = await req.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { error: "Email, emergency recovery OTP, and new password are all required." },
        { status: 400 }
      );
    }

    if (typeof newPassword !== "string" || newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    const trimmedEmail = (email as string).trim().toLowerCase();

    // 1. Fetch user and verify role
    const user = await prisma.user.findFirst({
      where: {
        email: { equals: trimmedEmail, mode: "insensitive" },
        role: "SUPERADMIN",
      },
    });

    if (!user || !user.resetToken) {
      return NextResponse.json(
        { error: "No active recovery request found for this account." },
        { status: 400 }
      );
    }

    // 2. Verify expiry
    if (!user.resetTokenExpiry || new Date() > new Date(user.resetTokenExpiry)) {
      return NextResponse.json(
        { error: "Recovery code has expired. Please initiate a new recovery request." },
        { status: 400 }
      );
    }

    // 3. Timing-safe OTP comparison
    const providedOtpBuffer = Buffer.from((otp as string).trim());
    const storedOtpBuffer = Buffer.from(user.resetToken.trim());

    if (
      providedOtpBuffer.length !== storedOtpBuffer.length ||
      !crypto.timingSafeEqual(providedOtpBuffer, storedOtpBuffer)
    ) {
      return NextResponse.json(
        { error: "Invalid emergency recovery code. Please check your email and try again." },
        { status: 401 }
      );
    }

    // 4. Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 5. Update password & clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Superadmin password successfully updated. You may now log in with your new credentials.",
    });
  } catch (error: unknown) {
    console.error("[Superadmin Recovery Reset Error]:", error);
    const msg = error instanceof Error ? error.message : "Failed resetting superadmin password";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
