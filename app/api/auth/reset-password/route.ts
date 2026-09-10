import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma/prisma";
import bcrypt from "bcrypt";

/**
 * POST /api/auth/reset-password
 * Verifies OTP code once more, hashes new password, updates DB, and clears reset token.
 */
export async function POST(req: NextRequest) {
  try {
    const { email, otpCode, newPassword } = await req.json();

    if (!email || !otpCode || !newPassword) {
      return NextResponse.json({ error: "Email, OTP code, and new password are required." }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long." }, { status: 400 });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedOtp = otpCode.trim();

    const user = await prisma.user.findFirst({
      where: { email: { equals: trimmedEmail, mode: "insensitive" } },
    });

    if (!user || !user.resetToken || !user.resetTokenExpiry) {
      return NextResponse.json({ error: "Invalid or expired password reset session." }, { status: 400 });
    }

    if (new Date() > new Date(user.resetTokenExpiry)) {
      return NextResponse.json({ error: "OTP code has expired. Please request a new code." }, { status: 400 });
    }

    const [storedCode, attemptsStr] = user.resetToken.split(":");
    const currentAttempts = parseInt(attemptsStr || "0", 10);

    if (storedCode !== trimmedOtp) {
      const nextAttempts = currentAttempts + 1;

      if (nextAttempts >= 5) {
        // Exceeded 5 failed attempts -> Invalidate token immediately
        await prisma.user.update({
          where: { id: user.id },
          data: { resetToken: null, resetTokenExpiry: new Date() },
        });

        return NextResponse.json(
          { error: "Too many invalid OTP attempts (5/5). Your OTP has been invalidated for security. Please request a new code." },
          { status: 429 }
        );
      }

      // Record failed attempt
      await prisma.user.update({
        where: { id: user.id },
        data: { resetToken: `${storedCode}:${nextAttempts}` },
      });

      const remainingAttempts = 5 - nextAttempts;
      return NextResponse.json(
        { error: `Invalid OTP code. ${remainingAttempts} ${remainingAttempts === 1 ? "attempt" : "attempts"} remaining.` },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset fields
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
      message: "Password reset successful! You can now log in with your new password.",
    });
  } catch (error: unknown) {
    console.error("[ResetPassword] Error:", error);
    const msg = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
