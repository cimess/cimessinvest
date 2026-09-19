/**
 * Resolves any relative path or partial URL into a fully-qualified absolute URL
 * based on the current window origin.
 */
export function toAbsoluteUrl(url: string): string {
  if (!url) return "";
  if (typeof window !== "undefined") {
    try {
      return new URL(url, window.location.origin).href;
    } catch {
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        const base = window.location.origin.replace(/\/$/, "");
        const path = url.startsWith("/") ? url : `/${url}`;
        return `${base}${path}`;
      }
    }
  }
  return url;
}

/**
 * Robust copy-to-clipboard utility that works across desktop, mobile,
 * non-secure HTTP contexts (e.g. testing mobile on LAN IP http://192.168.x.x:3000),
 * and older browsers with execCommand fallback.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;

  // 1. Try modern navigator.clipboard if supported and available (requires secure context)
  if (
    typeof window !== "undefined" &&
    typeof navigator !== "undefined" &&
    navigator.clipboard &&
    typeof navigator.clipboard.writeText === "function"
  ) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn("navigator.clipboard.writeText failed, falling back to execCommand:", err);
    }
  }

  // 2. Fallback for non-secure contexts (e.g. mobile accessing local IP via HTTP) or unsupported browsers
  if (typeof document !== "undefined") {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;

      // Prevent scrolling and zooming on mobile
      textArea.style.fontSize = "16px";
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      textArea.style.top = "0";
      textArea.style.opacity = "0";
      textArea.setAttribute("readonly", "");

      document.body.appendChild(textArea);

      textArea.focus();
      textArea.select();
      textArea.setSelectionRange(0, text.length);

      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);
      return successful;
    } catch (fallbackErr) {
      console.error("Fallback clipboard copy failed:", fallbackErr);
      return false;
    }
  }

  return false;
}
