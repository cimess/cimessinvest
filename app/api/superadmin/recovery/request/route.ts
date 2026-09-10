import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma/prisma";
import { triggerSuperadminSecurityOTP } from "@/app/api/workers/emailWorker";
import crypto from "crypto";

export const dynamic = "force-dynamic";

/**
 * POST /api/superadmin/recovery/request
 * Validates the emergency security question answer ("favorite dog") against SUPERADMIN_RECOVERY_ANSWER.
 * If valid, generates and emails a 6-digit recovery OTP to the superadmin.
 */
export async function POST(req: NextRequest) {
  try {
    const { email, securityAnswer } = await req.json();

    if (!email || typeof email !== "string" || !securityAnswer || typeof securityAnswer !== "string") {
      return NextResponse.json(
        { error: "Both superadmin email and security question answer are required." },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();
    const providedAnswer = securityAnswer.trim().toLowerCase();
    const configuredAnswer = (process.env.SUPERADMIN_RECOVERY_ANSWER || "").trim().toLowerCase();

    if (!configuredAnswer) {
      return NextResponse.json(
        { error: "Emergency recovery is not configured on this platform (SUPERADMIN_RECOVERY_ANSWER missing)." },
        { status: 500 }
      );
    }

    // 1. Fetch user and verify SUPERADMIN role
    const user = await prisma.user.findFirst({
      where: {
        email: { equals: trimmedEmail, mode: "insensitive" },
        role: "SUPERADMIN",
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials or unauthorized superadmin email." },
        { status: 401 }
      );
    }

    // 2. Timing-safe comparison of security answer
    const providedBuffer = Buffer.from(providedAnswer);
    const configuredBuffer = Buffer.from(configuredAnswer);

    if (
      providedBuffer.length !== configuredBuffer.length ||
      !crypto.timingSafeEqual(providedBuffer, configuredBuffer)
    ) {
      return NextResponse.json(
        { error: "Security question verification failed. The provided answer does not match." },
        { status: 401 }
      );
    }

    // 3. Generate 6-digit emergency OTP code
    const otpCode = crypto.randomInt(100000, 1000000).toString();
    const expiryDate = new Date();
    expiryDate.setMinutes(expiryDate.getMinutes() + 10); // 10 minutes

    // 4. Save to DB
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: otpCode,
        resetTokenExpiry: expiryDate,
      },
    });

    // 5. Dispatch emergency recovery email
    await triggerSuperadminSecurityOTP({
      toEmail: user.email,
      otpCode,
      purpose: "RECOVERY",
      expiresInMinutes: 10,
    });

    return NextResponse.json({
      success: true,
      message: `Security question verified. Emergency recovery OTP has been sent to ${user.email}.`,
    });
  } catch (error: unknown) {
    console.error("[Superadmin Recovery Request Error]:", error);
    const msg = error instanceof Error ? error.message : "Emergency recovery request failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
