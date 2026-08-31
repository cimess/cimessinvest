import { NextResponse } from "next/server";
import { getCachedBrandConfig } from "@/app/lib/cache/brandCache";

// Public Endpoint: Fetches cached brand details for public catalog & social previews
export async function GET() {
  try {
    const cachedConfig = await getCachedBrandConfig();

    return NextResponse.json({
      success: true,
      brandName: cachedConfig.brandName,
      whatsappNumber: cachedConfig.whatsappNumber,
      companyName: cachedConfig.companyName,
      primaryColor: cachedConfig.primaryColor,
      accentColor: cachedConfig.accentColor,
      backgroundColor: cachedConfig.backgroundColor,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch brand details",
      },
      { status: 500 }
    );
  }
}

