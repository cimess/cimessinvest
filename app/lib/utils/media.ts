/**
 * Media validation and classification utility.
 * Enforces strict distinction between video and image assets across the platform.
 */

export const IMAGE_EXTENSIONS_REGEX =
  /\.(jpe?g|png|webp|gif|svg|avif|bmp|tiff|ico|heic)(\?.*)?$/i;

export const VIDEO_EXTENSIONS_REGEX =
  /\.(mp4|webm|ogg|mov|m4v|mkv)(\?.*)?$/i;

/**
 * Determines whether a URL or file path points to an image.
 * Recognizes Cloudinary image transformation URLs, data URLs, and standard image extensions.
 */
export function isImageUrl(url?: string | null): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim().toLowerCase();

  // Cloudinary image delivery URL pattern: /image/upload/
  if (trimmed.includes("/image/upload/") || trimmed.includes("/image/authenticated/")) {
    return true;
  }

  // Base64 data image URL
  if (trimmed.startsWith("data:image/")) {
    return true;
  }

  // Standard image extensions
  return IMAGE_EXTENSIONS_REGEX.test(trimmed);
}

/**
 * Determines whether a URL or file path points to a video.
 * Recognizes Cloudinary video transformation URLs and standard video extensions.
 */
export function isVideoUrl(url?: string | null): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim().toLowerCase();

  // Cloudinary video delivery URL pattern: /video/upload/
  if (trimmed.includes("/video/upload/") || trimmed.includes("/video/authenticated/")) {
    return true;
  }

  // Base64 data video URL
  if (trimmed.startsWith("data:video/")) {
    return true;
  }

  // Standard video extensions
  return VIDEO_EXTENSIONS_REGEX.test(trimmed);
}

/**
 * Validates that a file or MIME type is strictly a video format.
 */
export function isVideoMime(mimeType?: string | null): boolean {
  if (!mimeType || typeof mimeType !== "string") return false;
  const trimmed = mimeType.trim().toLowerCase();
  return (
    trimmed.startsWith("video/") ||
    trimmed === "application/x-mpegurl" ||
    trimmed === "application/vnd.apple.mpegurl"
  );
}

/**
 * Validates that a file or MIME type is an image format.
 */
export function isImageMime(mimeType?: string | null): boolean {
  if (!mimeType || typeof mimeType !== "string") return false;
  const trimmed = mimeType.trim().toLowerCase();
  return trimmed.startsWith("image/");
}

/**
 * Comprehensive validator for Hero video inputs.
 * Returns { valid: true } or { valid: false, error: string }.
 */
export function validateHeroMediaUrl(url?: string | null): { valid: boolean; error?: string } {
  if (!url || url.trim() === "") {
    return { valid: true }; // Empty/cleared is acceptable (falls back to template master video)
  }

  const trimmed = url.trim();

  // 1. Explicitly reject image URLs
  if (isImageUrl(trimmed)) {
    return {
      valid: false,
      error: "Hero background must strictly be a video (MP4, WebM). Images are strictly prohibited as hero background.",
    };
  }

  // 2. If it is a Cloudinary video or has a video extension, it is valid
  if (isVideoUrl(trimmed)) {
    return { valid: true };
  }

  // 3. For any other arbitrary URL, if it ends with non-video formats or doesn't look like video
  // Check if it's a valid URL format
  try {
    const parsed = new URL(trimmed.startsWith("/") ? `http://localhost${trimmed}` : trimmed);
    const pathname = parsed.pathname.toLowerCase();
    if (IMAGE_EXTENSIONS_REGEX.test(pathname)) {
      return {
        valid: false,
        error: "Hero background must strictly be a video (MP4, WebM). Images are strictly prohibited as hero background.",
      };
    }
  } catch {
    return {
      valid: false,
      error: "Invalid hero video URL format provided.",
    };
  }

  return { valid: true };
}
