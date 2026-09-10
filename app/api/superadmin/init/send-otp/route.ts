import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma/prisma";
import { triggerSuperadminSecurityOTP } from "@/app/api/workers/emailWorker";
import crypto from "crypto";

export const dynamic = "force-dynamic";

/**
 * POST /api/superadmin/init/send-otp
 * Dispatches a single-use 6-digit security OTP to the email defined in SUPERADMIN_INIT_EMAIL.
 */
export async function POST() {
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

    // 2. Validate environment configuration
    const initEmail = process.env.SUPERADMIN_INIT_EMAIL?.trim().toLowerCase();
    if (!initEmail) {
      return NextResponse.json(
        { error: "SUPERADMIN_INIT_EMAIL is not defined in server environment variables." },
        { status: 500 }
      );
    }

    // 3. Generate 6-digit cryptographically secure OTP
    const otpCode = crypto.randomInt(100000, 1000000).toString();
    const expiryDate = new Date();
    expiryDate.setMinutes(expiryDate.getMinutes() + 10); // Valid for 10 minutes

    // 4. Persist OTP on user record (or bootstrap placeholder user if not created yet)
    let user = await prisma.user.findFirst({
      where: { email: { equals: initEmail, mode: "insensitive" } },
    });

    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken: otpCode,
          resetTokenExpiry: expiryDate,
        },
      });
    } else {
      user = await prisma.user.create({
        data: {
          email: initEmail,
          companyName: "cimessinvest Superadmin",
          phone: "000-000-0000",
          password: "PENDING_INITIALIZATION",
          authorizationKey: `AUTH_${crypto.randomBytes(8).toString("hex").toUpperCase()}`,
          role: "ADMIN",
          resetToken: otpCode,
          resetTokenExpiry: expiryDate,
          paymentVerified: true,
        },
      });
    }

    // 5. Dispatch OTP via Resend email worker
    await triggerSuperadminSecurityOTP({
      toEmail: initEmail,
      otpCode,
      purpose: "INITIALIZATION",
      expiresInMinutes: 10,
    });

    return NextResponse.json({
      success: true,
      message: `Verification code successfully dispatched to ${initEmail}.`,
    });
  } catch (error: unknown) {
    console.error("[Superadmin Init Send-OTP Error]:", error);
    const msg = error instanceof Error ? error.message : "Failed sending initialization OTP";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
