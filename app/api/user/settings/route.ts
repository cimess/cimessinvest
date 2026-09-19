import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { prisma } from "@/app/lib/prisma/prisma";
import { auth } from "@/app/auth";
import { checkCompanyStorage, checkUserStorage } from "@/app/api/workers/storageWorker";
import { checkCompanyTrafficQuota } from "@/app/api/workers/trafficWorker";
import { revalidateBrandCache } from "@/app/lib/cache/brandCache";
import { SAFE_USER_SELECT, SAFE_SITE_SETTING_SELECT } from "@/app/lib/prisma/projections";
import { getPlatformFeePercent } from "@/app/lib/platformConfig";
import { validateHeroMediaUrl } from "@/app/lib/utils/media";
import { clearSessionCookies } from "@/app/lib/auth/sessionCookies";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // 1. Fetch authenticated user with memberships
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        ...SAFE_USER_SELECT,
        memberships: {
          where: { status: "ACTIVE" },
          include: {
            company: {
              include: {
                siteSetting: { select: SAFE_SITE_SETTING_SELECT },
              },
            },
          },
        },
      },
    });

    if (!user) {
      const response = NextResponse.json(
        { error: "User not found", code: "USER_NOT_FOUND" },
        { status: 401 }
      );
      clearSessionCookies(response);
      return response;
    }

    // 2. Resolve active company context
    const targetCompanyId =
      session.user.activeCompanyId ||
      session.user.companyId ||
      user.memberships?.[0]?.company?.id ||
      null;

    const activeMembership = user.memberships?.find((m) => m.company?.id === targetCompanyId) || user.memberships?.[0] || null;
    const company = activeMembership?.company || null;

    let storageStats = null;
    let trafficStats = null;
    let siteSetting = company?.siteSetting || null;

    if (company) {
      storageStats = await checkCompanyStorage(company.id, true).catch(() => null);
      trafficStats = await checkCompanyTrafficQuota(company.id).catch(() => null);

      if (!siteSetting) {
        siteSetting = await prisma.siteSetting.findUnique({
          where: { companyId: company.id },
          select: SAFE_SITE_SETTING_SELECT,
        });
      }
    } else {
      // Legacy fallback if no company attached
      storageStats = await checkUserStorage(user.id, true).catch(() => null);
      siteSetting = await prisma.siteSetting.findFirst({
        select: SAFE_SITE_SETTING_SELECT,
      });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        companyName: company?.name || user.companyName,
        phone: user.phone,
        role: user.role,
        memberRole: activeMembership?.role || "OWNER",
        planSelected: company?.planSelected || user.planSelected,
        paymentVerified: user.paymentVerified,
        storageUsed: storageStats?.storageUsedMB ?? user.storageUsed ?? 0,
        storageLimit: storageStats?.storageLimitMB ?? user.storageLimit ?? 1024,
        monthlyVisits: trafficStats?.monthlyVisits ?? company?.monthlyVisits ?? user.monthlyVisits ?? 0,
        trafficLimit: trafficStats?.trafficLimit ?? company?.trafficLimit ?? user.trafficLimit ?? 2000,
      },
      company: company
        ? {
            id: company.id,
            name: company.name,
            slug: company.slug,
            industry: company.industry,
            status: company.status,
            planSelected: company.planSelected,
            brandBio: company.brandBio,
            brandTone: company.brandTone,
            aiCreditsRemaining: company.aiCreditsRemaining,
            storageUsedMB: storageStats?.storageUsedMB ?? company.storageUsed,
            storageLimitMB: storageStats?.storageLimitMB ?? company.storageLimit,
            monthlyVisits: trafficStats?.monthlyVisits ?? company.monthlyVisits,
            trafficLimit: trafficStats?.trafficLimit ?? company.trafficLimit,
            paystackSubaccountCode: company.paystackSubaccountCode,
            bankInfo: company.bankInfo,
          }
        : null,
      platformFeePercent: await getPlatformFeePercent(),
      storage: storageStats || {
        storageUsedMB: user.storageUsed || 0,
        storageLimitMB: user.storageLimit || 1024,
        remainingStorageMB: (user.storageLimit || 1024) - (user.storageUsed || 0),
        usedPercentage: Math.round(((user.storageUsed || 0) / (user.storageLimit || 1024)) * 100),
        formatted: {
          used: `${user.storageUsed || 0} MB`,
          limit: `${user.storageLimit || 1024} MB`,
          remaining: `${(user.storageLimit || 1024) - (user.storageUsed || 0)} MB`,
          percentage: `${Math.round(((user.storageUsed || 0) / (user.storageLimit || 1024)) * 100)}%`,
        },
      },
      siteSetting: siteSetting || {
        id: "",
        showDefaultImages: true,
        appendDefaults: false,
        removeAllDefaults: false,
        primaryColor: "#1A1A1A",
        accentColor: "#C9A96E",
        backgroundColor: "#F5F0EB",
        whatsappNumber: null,
        companyName: null,
        heroVideoUrl: null,
        tailorBioText: null,
        tailorBioImage: null,
        heroGridImages: [],
        rawMaterialImages: [],
      },
    });

  } catch (error) {
    console.error("User Settings GET Error:", error);
    return NextResponse.json({ error: "Failed to retrieve user settings" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const {
      companyName,
      phone,
      whatsappNumber,
      brandBio,
      brandTone,
      themeColor,
      layoutMode,
      primaryColor,
      accentColor,
      backgroundColor,
      showDefaultImages,
      appendDefaults,
      removeAllDefaults,
      heroVideoUrl,
      tailorBioText,
      tailorBioImage,
      heroGridImages,
      rawMaterialImages,
      physicalAddress,
      city,
      state,
      country,
      openingHours,
    } = body;

    // Reject any attempt to set an image URL as hero video background
    if (
      heroVideoUrl !== undefined &&
      heroVideoUrl !== null &&
      typeof heroVideoUrl === "string" &&
      heroVideoUrl.trim() !== ""
    ) {
      const heroValidation = validateHeroMediaUrl(heroVideoUrl);
      if (!heroValidation.valid) {
        return NextResponse.json(
          { error: heroValidation.error || "Hero background must strictly be a video (MP4, WebM)." },
          { status: 400 }
        );
      }
    }

    // 1. Fetch user to identify active company
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        memberships: {
          where: { status: "ACTIVE" },
          take: 1,
        },
      },
    });

    if (!user) {
      const response = NextResponse.json(
        { error: "User not found", code: "USER_NOT_FOUND" },
        { status: 401 }
      );
      clearSessionCookies(response);
      return response;
    }

    const targetCompanyId =
      session.user.activeCompanyId ||
      session.user.companyId ||
      user.memberships?.[0]?.companyId ||
      null;

    // 2. Update User profile fields
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        ...(companyName && { companyName: companyName.trim() }),
        ...(phone && { phone: phone.trim() }),
      },
      select: SAFE_USER_SELECT,
    });

    // 3. Update Company Tenant Record if present
    let updatedCompany = null;
    if (targetCompanyId) {
      updatedCompany = await prisma.company.update({
        where: { id: targetCompanyId },
        data: {
          ...(companyName && { name: companyName.trim() }),
          ...(brandBio !== undefined && { brandBio: brandBio?.trim() || null }),
          ...(brandTone !== undefined && { brandTone: brandTone?.trim() || null }),
        },
        select: {
          id: true,
          name: true,
          slug: true,
          brandBio: true,
          brandTone: true,
        },
      });
    }

    // 4. Upsert SiteSetting Record
    const siteSettingData: Record<string, string | boolean | string[] | null> = {
      ...(companyName && { companyName: companyName.trim() }),
      ...(whatsappNumber && { whatsappNumber: whatsappNumber.trim() }),
      ...(themeColor && { themeColor, accentColor: themeColor }),
      ...(layoutMode && { layoutMode }),
      ...(primaryColor && { primaryColor }),
      ...(accentColor && { accentColor }),
      ...(backgroundColor && { backgroundColor }),
      showDefaultImages: Boolean(showDefaultImages),
      appendDefaults: Boolean(appendDefaults),
      removeAllDefaults: Boolean(removeAllDefaults),
      ...(heroVideoUrl !== undefined && { heroVideoUrl }),
      ...(tailorBioText !== undefined && { tailorBioText }),
      ...(tailorBioImage !== undefined && { tailorBioImage }),
      ...(Array.isArray(heroGridImages) && { heroGridImages }),
      ...(Array.isArray(rawMaterialImages) && { rawMaterialImages }),
      ...(physicalAddress !== undefined && { physicalAddress: physicalAddress?.trim() || null }),
      ...(city !== undefined && { city: city?.trim() || null }),
      ...(state !== undefined && { state: state?.trim() || null }),
      ...(country !== undefined && { country: country?.trim() || null }),
      ...(openingHours !== undefined && { openingHours: openingHours?.trim() || null }),
    };

    let updatedSetting;
    if (targetCompanyId) {
      updatedSetting = await prisma.siteSetting.upsert({
        where: { companyId: targetCompanyId },
        update: siteSettingData,
        create: {
          companyId: targetCompanyId,
          ...siteSettingData,
        },
        select: SAFE_SITE_SETTING_SELECT,
      });
    } else {
      const existingSetting = await prisma.siteSetting.findFirst();
      if (existingSetting) {
        updatedSetting = await prisma.siteSetting.update({
          where: { id: existingSetting.id },
          data: siteSettingData,
          select: SAFE_SITE_SETTING_SELECT,
        });
      } else {
        updatedSetting = await prisma.siteSetting.create({
          data: siteSettingData,
          select: SAFE_SITE_SETTING_SELECT,
        });
      }
    }

    // Cleanly revalidate cached brand config across pages & API endpoints
    await revalidateBrandCache();

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
      user: updatedUser,
      company: updatedCompany,
      siteSetting: updatedSetting,
    });
  } catch (error) {
    console.error("User Settings PUT Error:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}