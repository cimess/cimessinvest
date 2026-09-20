import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { checkRateLimit } from "@/app/lib/security/rateLimiter";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    // 1. IP-based rate limiting (max 15 uploads per hour per IP)
    const rateLimit = await checkRateLimit(req, {
      keyPrefix: "registration_upload",
      limit: 15,
      windowMs: 60 * 60 * 1000,
      customMessage: "Too many image upload attempts. Please try again later.",
    });
    if (!rateLimit.success && rateLimit.response) {
      return rateLimit.response;
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No image file provided." }, { status: 400 });
    }

    // 2. Validate MIME type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
    if (!validTypes.includes(file.type.toLowerCase())) {
      return NextResponse.json(
        { error: "Invalid image format. Supported formats: JPG, PNG, WEBP, GIF, SVG." },
        { status: 400 }
      );
    }

    // 3. Validate file size (max 5MB for profile avatar/logo)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds the 5MB limit." },
        { status: 400 }
      );
    }

    // 4. Convert File to Buffer and upload to Cloudinary
    const buffer = Buffer.from(await file.arrayBuffer());

    // If Cloudinary credentials are not configured in local environment, return safe base64 data URI
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
      const base64 = buffer.toString("base64");
      const dataUri = `data:${file.type};base64,${base64}`;
      return NextResponse.json({
        success: true,
        url: dataUri,
      });
    }

    const uploadResult = await new Promise<{ secure_url: string; public_id: string }>(
      (resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "merchants/profiles",
            resource_type: "image",
            transformation: [
              { width: 500, height: 500, crop: "limit", quality: "auto" },
            ],
          },
          (error, result) => {
            if (error || !result) {
              return reject(error || new Error("Cloudinary upload failed"));
            }
            resolve({ secure_url: result.secure_url, public_id: result.public_id });
          }
        );
        uploadStream.end(buffer);
      }
    );

    return NextResponse.json({
      success: true,
      url: uploadResult.secure_url,
    });
  } catch (error) {
    console.error("[RegistrationUpload] Error:", error);
    return NextResponse.json(
      { error: "Failed to upload image. Please try again." },
      { status: 500 }
    );
  }
}
