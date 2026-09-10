import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma/prisma";
import { auth } from "@/app/auth";
import { checkUserStorage } from "@/app/api/workers/storageWorker";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function getPublicIdFromUrl(url: string): string {
  const parts = url.split("/upload/");
  if (parts.length < 2) return "";
  const pathWithoutVersion = parts[1].replace(/^v\d+\//, "");
  return pathWithoutVersion.substring(0, pathWithoutVersion.lastIndexOf("."));
}

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate Session
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    let bodyId: string | undefined;
    let bodyUrl: string | undefined;
    let resourceType = "image";

    try {
      const body = await req.json();
      bodyId = body?.id;
      bodyUrl = body?.url;
      resourceType = body?.resourceType || "image";
    } catch {
      // Request might have no body if sent with query params
    }

    const { searchParams } = new URL(req.url);
    const id = bodyId || searchParams.get("id");
    const url = bodyUrl || searchParams.get("url");

    if (!id && !url) {
      return NextResponse.json(
        { error: "At least one parameter ('id' or 'url') is required." },
        { status: 400 }
      );
    }

    let targetUrl = url || "";
    let imageRecord = null;

    // 2. Query DB to check if the record exists in the Image catalog table
    if (id) {
      imageRecord = await prisma.image.findUnique({ where: { id } });
      if (imageRecord && !targetUrl) {
        targetUrl = imageRecord.url;
      }
    } else if (url) {
      imageRecord = await prisma.image.findFirst({ where: { url } });
    }

    // Check if the URL is referenced in SiteSettings
    const siteSettingRecord = await prisma.siteSetting.findFirst();
    const isUrlInSiteSetting =
      siteSettingRecord &&
      (siteSettingRecord.heroVideoUrl === targetUrl ||
        siteSettingRecord.tailorBioImage === targetUrl ||
        (Array.isArray(siteSettingRecord.heroGridImages) &&
          siteSettingRecord.heroGridImages.includes(targetUrl)) ||
        (Array.isArray(siteSettingRecord.rawMaterialImages) &&
          siteSettingRecord.rawMaterialImages.includes(targetUrl)));

    if (!imageRecord && !isUrlInSiteSetting) {
      return NextResponse.json(
        { error: "Asset not found in database." },
        { status: 404 }
      );
    }

    // 3. Perform Cloudinary Deletion
    const publicId = getPublicIdFromUrl(targetUrl);
    if (publicId && targetUrl.includes("cloudinary.com")) {
      const isVideo = resourceType === "video" || targetUrl.match(/\.(mp4|webm|mov|mkv)$/i);

      const cloudResult = await cloudinary.uploader.destroy(publicId, {
        resource_type: isVideo ? "video" : "image",
        invalidate: true,
      });

      // 4. Verify Cloudinary deletion success BEFORE deleting from DB
      if (cloudResult.result !== "ok" && cloudResult.result !== "not found") {
        return NextResponse.json(
          {
            error: "Cloudinary deletion failed. Database record preserved.",
            cloudResult,
          },
          { status: 500 }
        );
      }
    }

    // 5. Cloud deletion verified -> Safe to delete from DB
    if (imageRecord) {
      await prisma.image.delete({
        where: { id: imageRecord.id },
      });

      // Recalculate user storage quota directly via worker to eliminate rounding drift
      const user = await prisma.user.findFirst({ where: { email: session.user.email } });
      if (user) {
        await checkUserStorage(user.id, true).catch((err) =>
          console.error("Storage sync after deletion error:", err)
        );
      }
    }

    // Clean up reference in SiteSetting if present (BUG-02 fix: filter out deleted URL completely)
    if (siteSettingRecord && isUrlInSiteSetting) {
      const updatedHeroGrid = Array.isArray(siteSettingRecord.heroGridImages)
        ? siteSettingRecord.heroGridImages.filter((img) => typeof img === "string" && img.length > 0 && img !== targetUrl)
        : [];
      const updatedRawMaterial = Array.isArray(siteSettingRecord.rawMaterialImages)
        ? siteSettingRecord.rawMaterialImages.filter((img) => typeof img === "string" && img.length > 0 && img !== targetUrl)
        : [];

      await prisma.siteSetting.update({
        where: { id: siteSettingRecord.id },
        data: {
          ...(siteSettingRecord.heroVideoUrl === targetUrl && { heroVideoUrl: null }),
          ...(siteSettingRecord.tailorBioImage === targetUrl && { tailorBioImage: null }),
          heroGridImages: updatedHeroGrid,
          rawMaterialImages: updatedRawMaterial,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Asset successfully deleted from Cloud storage and database.",
      deletedAsset: {
        id: imageRecord?.id || null,
        url: targetUrl,
        publicId,
      },
    });
  } catch (error: unknown) {
    console.error("Single asset delete route error:", error);
    const msg = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// BUG-01 fix: Export DELETE handler to match frontend api.delete calls
export async function DELETE(req: NextRequest) {
  return POST(req);
}
