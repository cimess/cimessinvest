import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { canUserUpload } from "@/app/api/workers/storageWorker";
import { auth } from "@/app/auth";
import { prisma } from "@/app/lib/prisma/prisma";


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 80 * 1024 * 1024; // 80MB

export async function POST(req: Request) {


  try {
     const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "No session found" }, { status: 401 });
  }

    let userId = session.user?.id || "";
    let adminId = (session.user as any)?.adminId;

    if ((!userId || adminId === undefined) && session.user?.email) {
      const dbUser = await prisma.user.findFirst({
        where: { email: session.user.email },
        select: { id: true, adminId: true, role: true }
      });
      if (dbUser) {
        userId = dbUser.id;
        adminId = dbUser.adminId;
      }
    }

    const effectiveAdminId = adminId || userId;
    const { resourceType, fileSize } = await req.json();

    // Check if user (or their workspace admin) can upload the file
    const uploadCheck = await canUserUpload(effectiveAdminId, fileSize);
    if (!uploadCheck.allowed) {
      return NextResponse.json(
        { error: uploadCheck.message || "Storage quota exceeded or file too large" },
        { status: 400 }
      );
    }

    // 1. Validate File Size & Resource Type on the Backend
    if (resourceType === "image" && fileSize > MAX_IMAGE_SIZE) {
      return NextResponse.json({ error: "Image size exceeds 10MB limit" }, { status: 400 });
    }
    if (resourceType === "video" && fileSize > MAX_VIDEO_SIZE) {
      return NextResponse.json({ error: "Video size exceeds 80MB limit" }, { status: 400 });
    }

    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = effectiveAdminId ? `cimessinvest-catalog/tenants/${effectiveAdminId}` : "cimessinvest-catalog";

    // 2. Generate Cloudinary Signature
    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      process.env.CLOUDINARY_API_SECRET!
    );

    return NextResponse.json({
      signature,
      timestamp,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      folder,
      resourceType, // "image" or "video"
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate signature" }, { status: 500 });
  }
}
