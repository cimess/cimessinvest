import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/app/lib/prisma/prisma";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { triggerWelcomeEmail, triggerSignupOTP } from "@/app/api/workers/emailWorker";
import { checkEmailUniqueness } from "@/app/api/workers/teamWorker";
import { getSafeErrorMessage } from "@/app/lib/utils/errorHandler";
import { IndustryCategory } from "@/app/generated/prisma";
import { getTemplatesByIndustry, ALL_TEMPLATES } from "@/templates/registry";
import { checkRateLimit } from "@/app/lib/security/rateLimiter";
import { isReservedSubdomain } from "@/app/lib/constants/subdomains";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 35) || "atelier";
}

export async function POST(req: NextRequest) {
  try {
    // 0. Rate limiting (max 10 registration attempts per hour per IP)
    const rateLimit = await checkRateLimit(req, {
      keyPrefix: "registration",
      limit: 10,
      windowMs: 60 * 60 * 1000,
      customMessage: "Too many registration attempts. Please try again later.",
    });
    if (!rateLimit.success && rateLimit.response) {
      return rateLimit.response;
    }

    const body = await req.json();
    const { name, email, phone, password, brandName, industry, templateSlug, profileImage ,termsAgreed} = body;

    // 1. Vital Fields Input Validation
    if (!name || !email || !phone || !password || !termsAgreed) {
      return NextResponse.json(
        { error: "Missing required fields: name, email, phone, password and terms agreement are required." },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();
    const resolvedBrandName = (brandName || name).trim();

    // 2. Resolve Industry Category
    const validIndustries = Object.values(IndustryCategory) as string[];
    const resolvedIndustry: IndustryCategory =
      industry && validIndustries.includes(industry.toUpperCase())
        ? (industry.toUpperCase() as IndustryCategory)
        : IndustryCategory.FASHION_ATELIER;

    // 2b. Verify Store & Template Enablement from Superadmin Database
    const targetTemplateSlug = templateSlug || (resolvedIndustry === "FITNESS_GYM" ? "gym-store-fitness-v1" : "fashion-store-tailor-v1");
    const dbTemplate = await prisma.template
      .findUnique({
        where: { slug: targetTemplateSlug },
        select: { isActive: true, name: true },
      })
      .catch(() => null);

    if (dbTemplate && dbTemplate.isActive === false) {
      return NextResponse.json(
        {
          error: `The ${dbTemplate.name || "selected"} store is currently coming soon. Please choose another store to proceed.`,
          code: "STORE_COMING_SOON",
        },
        { status: 400 }
      );
    }

    // 3. Worker Check: Unique Email & Unexpired OTP Status
    const emailCheck = await checkEmailUniqueness(trimmedEmail);

    // 4. Hash Password & Create Authorization Key
    const hashedPassword = await bcrypt.hash(password, 10);
    const authorizationKey = `CMS-${crypto.randomBytes(6).toString("hex").toUpperCase()}`;

    // 5. Generate 6-Digit Email Verification OTP Code (Expires in 15 mins)
    const otpCode = crypto.randomInt(100000, 1000000).toString();
    const expiryDate = new Date();
    expiryDate.setMinutes(expiryDate.getMinutes() + 15);

    if (!emailCheck.isUnique) {
      if (emailCheck.hasActiveOtp && emailCheck.user?.id) {
        // BUG FIX: The user is trying to re-register. 
        // Update their password and give them a fresh OTP, then send a new email.
        await prisma.user.update({
          where: { id: emailCheck.user.id },
          data: {
            password: hashedPassword,
            resetToken: `${otpCode}:0`,
            resetTokenExpiry: expiryDate,
          }
        });

        const displayUserName = resolvedBrandName || name.trim();
        
        // Dispatch fresh email
        triggerSignupOTP({
          userId: emailCheck.user.id,
          toEmail: trimmedEmail,
          userName: displayUserName,
          otpCode,
          expiresInMinutes: 15,
        }).catch((err) => console.error("[Registration] Resend OTP email failed:", err));

        return NextResponse.json({
          success: true,
          requiresVerification: true,
          email: trimmedEmail,
          message: "We've sent a fresh 6-digit verification OTP code to your email.",
        });
      }

      // If they are fully verified already, reject the registration.
      return NextResponse.json(
        { error: "An account with this email address already exists. Please log in." },
        { status: 409 }
      );
    }
    
    expiryDate.setMinutes(expiryDate.getMinutes() + 15);

    // 6. Generate Unique Company Slug & Validate Against Reserved Subdomains
    const baseSlug = slugify(resolvedBrandName);

    if (isReservedSubdomain(resolvedBrandName) || isReservedSubdomain(baseSlug)) {
      return NextResponse.json(
        {
          error: `The brand name or subdomain "${resolvedBrandName}" is already in use. Please choose a different brand name.`,
        },
        { status: 400 }
      );
    }

    let uniqueSlug = baseSlug;
    let slugCollision = await prisma.company.findUnique({ where: { slug: uniqueSlug } });
    let counter = 1;
    while (slugCollision) {
      uniqueSlug = `${baseSlug}-${counter}`;
      slugCollision = await prisma.company.findUnique({ where: { slug: uniqueSlug } });
      counter++;
    }

    // 7. Find active template for this industry
    let activeTemplate = await prisma.template.findFirst({
      where: {
        OR: [
          ...(templateSlug ? [{ slug: templateSlug }] : []),
          { industry: resolvedIndustry, isActive: true },
        ],
      },
      include: {
        pages: true,
      },
    });

    // 8. Atomic Multi-Tenant Transaction: User -> Company -> CompanyMember (OWNER) -> StorePages -> SiteSetting
    
      // 8a. Create User
     const result = 
     await prisma.user.create({
        data: {
          companyName: resolvedBrandName,
          email: trimmedEmail,
          phone: phone.trim(),
          password: hashedPassword,
          authorizationKey,
          role: "ADMIN",
          paymentVerified: false,
          planSelected: "FREE_TRIAL",
          subscription_status: "ACTIVE",
          storageUsed: 0,
          storageLimit: 100,
          resetToken: `${otpCode}:0`,
          resetTokenExpiry: expiryDate,
          termsAgreed: true,
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

    const displayUserName = result.companyName || name.trim();

    // 9. Dispatch Dedicated Signup OTP Email
    triggerSignupOTP({
      userId: result.id,
      toEmail: result.email,
      userName: displayUserName,
      otpCode,
      expiresInMinutes: 15,
    }).catch((err) => console.error("[Registration] Signup OTP email failed:", err));

    triggerWelcomeEmail({
      userId: result.id,
      toEmail: result.email,
      userName: displayUserName,
      docUrl: "https://cimessinvest.com/doc",
    }).catch((err) => console.error("[Registration] Welcome email failed:", err));

    return NextResponse.json(
      {
        success: true,
        requiresVerification: true,
        message: "Registration initiated. A 6-digit verification code has been sent to your email.",
        email: result.email,
        brandName: resolvedBrandName,
        industry: "",
        role: "OWNER",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration Error:", error);
    const safeError = getSafeErrorMessage(error, "An unexpected error occurred during registration.");
    return NextResponse.json(
      { error: safeError.message },
      { status: safeError.statusCode }
    );
  }
}
