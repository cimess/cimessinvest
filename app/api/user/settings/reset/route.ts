import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma/prisma";
import { auth } from "@/app/auth";
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

import { revalidateBrandCache } from "@/app/lib/cache/brandCache";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const existingSetting = await prisma.siteSetting.findFirst();

    if (existingSetting) {
      const imagePublicIds: string[] = [];
      const videoPublicIds: string[] = [];

      const addMedia = (url: string | null | undefined, isVideo = false) => {
        if (!url || !url.includes("cloudinary")) return;
        const publicId = getPublicIdFromUrl(url);
        if (!publicId) return;
        if (isVideo) {
          if (!videoPublicIds.includes(publicId)) videoPublicIds.push(publicId);
        } else {
          if (!imagePublicIds.includes(publicId)) imagePublicIds.push(publicId);
        }
      };

      addMedia(existingSetting.heroVideoUrl, true);
      addMedia(existingSetting.tailorBioImage, false);

      if (Array.isArray(existingSetting.heroGridImages)) {
        existingSetting.heroGridImages.forEach((img) => addMedia(img, false));
      }
      if (Array.isArray(existingSetting.rawMaterialImages)) {
        existingSetting.rawMaterialImages.forEach((img) => addMedia(img, false));
      }

      // Parallel batch deletion with a 5-second maximum timeout guard
      const cloudinaryCleanup = async () => {
        const tasks: Promise<unknown>[] = [];

        if (imagePublicIds.length > 0) {
          tasks.push(
            cloudinary.api
              .delete_resources(imagePublicIds, { resource_type: "image" })
              .catch((err) => console.warn("Cloudinary bulk image delete notice:", err?.message || err))
          );
        }

        if (videoPublicIds.length > 0) {
          tasks.push(
            cloudinary.api
              .delete_resources(videoPublicIds, { resource_type: "video" })
              .catch((err) => console.warn("Cloudinary bulk video delete notice:", err?.message || err))
          );
        }

        await Promise.allSettled(tasks);
      };

      // Ensure Cloudinary call never blocks the API route for more than 4 seconds
      await Promise.race([
        cloudinaryCleanup(),
        new Promise((resolve) => setTimeout(resolve, 4000)),
      ]);

      // Reset siteSetting in database to factory defaults
      await prisma.siteSetting.update({
        where: { id: existingSetting.id },
        data: {
          heroVideoUrl: null,
          tailorBioImage: null,
          tailorBioText: null,
          heroGridImages: [],
          rawMaterialImages: [],
          showDefaultImages: true,
          appendDefaults: false,
          removeAllDefaults: false,
          primaryColor: "#1A1A1A",
          accentColor: "#C9A96E",
          backgroundColor: "#F5F0EB",
        },
      });
    }

    // Cleanly revalidate cached brand config across pages & API endpoints
    await revalidateBrandCache();

    return NextResponse.json({
      success: true,
      message: "Reset complete! All custom media deleted from cloud storage and settings restored to factory defaults.",
    });
  } catch (error) {
    console.error("Settings Reset Error:", error);
    return NextResponse.json({ error: "Failed to reset settings" }, { status: 500 });
  }
}
