import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma/prisma";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { triggerWelcomeEmail, triggerSignupOTP } from "@/app/api/workers/emailWorker";
import { checkEmailUniqueness, checkTeamMemberLimitAndRole } from "@/app/api/workers/teamWorker";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, password } = body;

    // 1. Input Validation
    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        { error: "Missing required fields: name, email, phone, and password are required." },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();

    // 2. Worker Check: Unique Email & Unexpired OTP Status
    const emailCheck = await checkEmailUniqueness(trimmedEmail);

    if (!emailCheck.isUnique) {
      if (emailCheck.hasActiveOtp) {
        return NextResponse.json({
          success: true,
          requiresVerification: true,
          pendingVerification: true,
          email: emailCheck.user?.email || trimmedEmail,
          message: "Continue your registration: Please enter the 6-digit verification OTP code sent to your email.",
        });
      }

      return NextResponse.json(
        { error: "An account with this email address already exists. Please log in." },
        { status: 409 }
      );
    }

    // 3. Worker Check: Role Assignment (ADMIN vs USER) & Plan Seat Limits
    const teamCheck = await checkTeamMemberLimitAndRole();
    if (!teamCheck.allowed) {
      return NextResponse.json(
        { error: teamCheck.message || "Team user limit reached for current workspace plan." },
        { status: 403 }
      );
    }

    // 4. Hash Password & Create Authorization Key
    const hashedPassword = await bcrypt.hash(password, 10);
    const authorizationKey = `CMS-${crypto.randomBytes(6).toString("hex").toUpperCase()}`;

    // 5. Generate 6-Digit Email Verification OTP Code (Expires in 15 mins)
    const otpCode = crypto.randomInt(100000, 1000000).toString();
    const expiryDate = new Date();
    expiryDate.setMinutes(expiryDate.getMinutes() + 15);

    // 6. Create New User with Assigned Role
    const user = await prisma.user.create({
      data: {
        companyName: name.trim(),
        email: trimmedEmail,
        phone: phone.trim(),
        password: hashedPassword,
        authorizationKey,
        role: teamCheck.assignedRole,
        paymentVerified: false,
        planSelected: "STARTER",
        subscription_status: "INACTIVE",
        storageUsed: 0,
        storageLimit: 500,
        resetToken: `${otpCode}:0`,
        resetTokenExpiry: expiryDate,
      },
      select: {
        id: true,
        companyName: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    // 7. Dispatch Dedicated Signup OTP Email
    triggerSignupOTP({
      userId: user.id,
      toEmail: user.email,
      userName: user.companyName,
      otpCode,
      expiresInMinutes: 15,
    }).catch((err) => console.error("[Registration] Signup OTP email failed:", err));

    triggerWelcomeEmail({
      userId: user.id,
      toEmail: user.email,
      userName: user.companyName,
      docUrl: "https://cimessinvest.com/doc",
    }).catch((err) => console.error("[Registration] Welcome email failed:", err));

    return NextResponse.json(
      {
        success: true,
        requiresVerification: true,
        message: "Registration initiated. A 6-digit verification code has been sent to your email.",
        email: user.email,
        role: user.role,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json(
      { error: "An unexpected server error occurred during registration." },
      { status: 500 }
    );
  }
}
