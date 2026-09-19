/**
 * Universal Reserved Subdomains and Platform Brand Slugs.
 * 
 * Any slug matching these names CANNOT be registered by any merchant as a
 * brand name, company slug, or custom subdomain. This protects internal infrastructure,
 * platform routing, security boundaries, and corporate identity.
 */
export const RESERVED_SUBDOMAINS = new Set([
  // Core Platform & Corporate Identity
  "cimess",
  "cimessinvest",
  "aimuan",
  "root",
  "home",
  "platform",
  
  // Infrastructure, Network & Routing
  "www",
  "admin",
  "superadmin",
  "api",
  "app",
  "auth",
  "mail",
  "support",
  "billing",
  "static",
  "cdn",
  "assets",
  "media",
  "images",
  "img",
  "storage",
  "cloud",
  "ws",
  "wss",
  "webhook",
  "webhooks",
  "cron",
  "internal",

  // Core App Sections & Reserved Routes
  "dashboard",
  "portal",
  "login",
  "signup",
  "register",
  "checkout",
  "pay",
  "payment",
  "store",
  "shop",
  "landing",
  "help",
  "status",
  "health",
  "invite",
  "appeal",
  "dispute",
  "recovery",
  "settings",
  "analytics",
  "collections",
  "orders",
  "products",

  // Environments & Sandbox
  "dev",
  "development",
  "stage",
  "staging",
  "test",
  "testing",
  "demo",
  "preview",
  "sandbox",
]);

/**
 * Checks whether a given brand name, slug, or subdomain string is reserved.
 * Handles case-insensitivity, leading/trailing whitespace, and slug formatting.
 */
export function isReservedSubdomain(value: string | null | undefined): boolean {
  if (!value) return false;
  
  const normalized = value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  if (RESERVED_SUBDOMAINS.has(normalized)) {
    return true;
  }

  // Also check direct alphanumeric strip (e.g., "Cimess Invest" -> "cimessinvest")
  const stripped = value.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (RESERVED_SUBDOMAINS.has(stripped)) {
    return true;
  }

  return false;
}
