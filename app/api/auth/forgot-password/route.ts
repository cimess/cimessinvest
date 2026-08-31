import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma/prisma";
import crypto from "crypto";
import { triggerForgotPasswordOTP } from "@/app/api/workers/emailWorker";

/**
 * POST /api/auth/forgot-password
 * Generates a 6-digit OTP code, stores it in DB with 15-min expiry, and emails the code to the user.
 */
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findFirst({
      where: { email: { equals: trimmedEmail, mode: "insensitive" } },
    });

    if (!user) {
      // Return success message even if email is not found to prevent user enumeration attacks
      return NextResponse.json({
        success: true,
        message: "If an account with that email exists, a password reset code has been sent.",
      });
    }

    // Rate limit check: Enforce 60-second cooldown per email on Vercel/DB
    if (user.resetTokenExpiry) {
      const msUntilExpiry = new Date(user.resetTokenExpiry).getTime() - new Date().getTime();
      // If code was requested less than 60 seconds ago (14 mins left out of 15 mins)
      if (msUntilExpiry > 14 * 60 * 1000) {
        return NextResponse.json(
          { error: "A password reset code was recently sent. Please wait 60 seconds before requesting another code." },
          { status: 429 }
        );
      }
    }

    // Generate 6-digit OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiryDate = new Date();
    expiryDate.setMinutes(expiryDate.getMinutes() + 15); // Valid for 15 minutes

    // Store in DB with attempt counter (0 failed attempts)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: `${otpCode}:0`,
        resetTokenExpiry: expiryDate,
      },
    });

    // Dispatch OTP via Email Worker
    await triggerForgotPasswordOTP({
      userId: user.id,
      toEmail: user.email,
      userName: user.companyName || user.email,
      otpCode,
      expiresInMinutes: 15,
    });

    return NextResponse.json({
      success: true,
      message: "A 6-digit password reset code has been sent to your email.",
    });
  } catch (error: unknown) {
    console.error("[ForgotPasswordAPI] Error:", error);
    const msg = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
