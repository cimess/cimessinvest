import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { prisma } from "@/app/lib/prisma/prisma";
import { auth } from "@/app/auth";
import { checkUserStorage } from "@/app/api/workers/storageWorker";

import { revalidateBrandCache } from "@/app/lib/cache/brandCache";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    // Fetch user
    const user = session?.user?.email
      ? await prisma.user.findFirst({ where: { email: session.user.email } })
      : await prisma.user.findFirst();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const siteSetting = await prisma.siteSetting.findFirst();
    const storageStats = await checkUserStorage(user.id, true).catch(() => null);

    return NextResponse.json({
      success: true,
      user,
      storage: storageStats || {
        storageUsedMB: user.storageUsed || 0,
        storageLimitMB: user.storageLimit || 500,
        remainingStorageMB: (user.storageLimit || 500) - (user.storageUsed || 0),
        usedPercentage: Math.round(((user.storageUsed || 0) / (user.storageLimit || 500)) * 100),
        formatted: {
          used: `${user.storageUsed || 0} MB`,
          limit: `${user.storageLimit || 500} MB`,
          remaining: `${(user.storageLimit || 500) - (user.storageUsed || 0)} MB`,
          percentage: `${Math.round(((user.storageUsed || 0) / (user.storageLimit || 500)) * 100)}%`,
        },
      },
      siteSetting: siteSetting || {
        showDefaultImages: true,
        appendDefaults: false,
        removeAllDefaults: false,
        primaryColor: "#1A1A1A",
        accentColor: "#C9A96E",
        backgroundColor: "#F5F0EB",
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
    } = body;

    // 1. Update User Record
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        ...(companyName && { companyName: companyName.trim() }),
        ...(phone && { phone: phone.trim() }),
      },
    });

    // 2. Upsert SiteSetting Record
    const existingSetting = await prisma.siteSetting.findFirst();
    const siteSettingData: Record<string, string | boolean | string[] | null> = {
      ...(companyName && { companyName: companyName.trim() }),
      ...(whatsappNumber && { whatsappNumber: whatsappNumber.trim() }),
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
    };

    let updatedSetting;
    if (existingSetting) {
      updatedSetting = await prisma.siteSetting.update({
        where: { id: existingSetting.id },
        data: siteSettingData,
      });
    } else {
      updatedSetting = await prisma.siteSetting.create({
        data: siteSettingData,
      });
    }

    // Cleanly revalidate cached brand config across pages & API endpoints
    await revalidateBrandCache();

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
      user: updatedUser,
      siteSetting: updatedSetting,
    });
  } catch (error) {
    console.error("User Settings PUT Error:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}