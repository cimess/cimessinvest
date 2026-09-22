import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/app/auth";
import { clearSessionCookies } from "@/app/lib/auth/sessionCookies";
import { RESERVED_SUBDOMAINS } from "@/app/lib/constants/subdomains";

// 1. Strict Matrix Permissions (Hierarchy Access Control for Pages and APIs)
const ROLE_PERMISSIONS: Record<string, string[]> = {
  SUPERADMIN: ["/superadmin", "/api/superadmin", "/dashboard", "/api/dashboard"],
  ADMIN: ["/dashboard", "/api/dashboard"],
  MANAGER: ["/dashboard", "/api/dashboard"],
  USER: ["/dashboard", "/api/dashboard"],
};

// Helper function to safely clear all session cookie variants from the response
function clearInvalidCookies(req: NextRequest, response: NextResponse) {
  clearSessionCookies(response);
}

function extractSubdomain(hostStr: string): string | null {
  if (!hostStr) return null;
  const hostname = hostStr.split(":")[0].toLowerCase().trim();

  // 1. Mobile & local development wildcard: [subdomain].[ipv4].sslip.io
  if (hostname.endsWith(".sslip.io")) {
    const parts = hostname.replace(/\.sslip\.io$/, "").split(".");
    // Expecting: [slug, ipPart1, ipPart2, ipPart3, ipPart4]
    if (parts.length === 5) {
      const slug = parts[0];
      if (slug && !RESERVED_SUBDOMAINS.has(slug)) {
        return slug;
      }
    }
    return null;
  }

  // 2. Production wildcard: [subdomain].cimessinvest.com
  if (hostname.endsWith(".cimessinvest.com")) {
    const parts = hostname.replace(/\.cimessinvest\.com$/, "").split(".");
    if (parts.length === 1) {
      const slug = parts[0];
      if (slug && !RESERVED_SUBDOMAINS.has(slug)) {
        return slug;
      }
    }
    return null;
  }

  // 3. Localhost wildcard: [subdomain].localhost
  if (hostname.endsWith(".localhost")) {
    const parts = hostname.replace(/\.localhost$/, "").split(".");
    if (parts.length === 1) {
      const slug = parts[0];
      if (slug && !RESERVED_SUBDOMAINS.has(slug)) {
        return slug;
      }
    }
    return null;
  }

  return null;
}

export async function proxy(req: NextRequest) {
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || req.nextUrl.host || "";
  const path = req.nextUrl.pathname;
  const merchantSubdomain = extractSubdomain(host);

  // 0. SUBDOMAIN EDGE INGRESS REWRITES
  if (merchantSubdomain) {
    // Let static assets and APIs pass through directly
    if (
      path.startsWith("/_next") ||
      path.startsWith("/api") ||
      path.startsWith("/bg-img") ||
      path.startsWith("/templates") ||
      path === "/favicon.ico"
    ) {
      return addSecurityHeaders(NextResponse.next());
    }

    // Root of merchant subdomain (e.g. adeleke.192.168.0.197.sslip.io:3000/ or adeleke.localhost:3000/)
    // Rewrites destination to the merchant's dedicated template landing page
    if (path === "/" || path === "") {
      const rewriteUrl = req.nextUrl.clone();
      rewriteUrl.pathname = `/landing/${merchantSubdomain}`;
      return addSecurityHeaders(NextResponse.rewrite(rewriteUrl));
    }

    // If visitor hits /store or /store/ on merchant subdomain, rewrite to /store/[merchantSubdomain]
    if (path === "/store" || path === "/store/") {
      const rewriteUrl = req.nextUrl.clone();
      rewriteUrl.pathname = `/store/${merchantSubdomain}`;
      return addSecurityHeaders(NextResponse.rewrite(rewriteUrl));
    }

    // Direct checkout or individual store/landing assets under the merchant subdomain
    if (path.startsWith("/checkout") || path.startsWith("/store/") || path.startsWith("/landing/")) {
      return addSecurityHeaders(NextResponse.next());
    }
  }

  // 0B. STRICT ORPHANED /store GUARD ON ROOT PLATFORM
  // If someone navigates to domain.com/store with no merchant specified, NEVER leak an arbitrary merchant!
  if (!merchantSubdomain && (path === "/store" || path === "/store/")) {
    return addSecurityHeaders(NextResponse.redirect(new URL("/", req.url)));
  }

  // 1. Dynamic cookie name detection (handles Secure/Dev & Authjs/NextAuth variations)
  const cookieNames = [
    "__Secure-authjs.session-token",
    "authjs.session-token",
    "__Secure-next-auth.session-token",
    "next-auth.session-token",
  ];
  const activeCookieName = cookieNames.find((name) => req.cookies.has(name));

  // 2. Fetch and decrypt token using detected cookie name
  const session = await auth();
  const token = session?.user;

  // 3. PUBLIC & STATIC ALLOWLIST (Bypass checks for static assets, public storefront, collections, image preview)
  if (
    path === "/" || 
    path.startsWith("/landing") ||
    path.startsWith("/privacy") ||
    path.startsWith("/terms") ||
    path.startsWith("/store") ||
    path.startsWith("/checkout") ||
    path.startsWith("/docs") ||
    path.startsWith("/pay") ||
    path.startsWith("/appeal") ||
    path.startsWith("/api/appeal") ||
    path.startsWith("/api/v1/store") ||
    path.startsWith("/api/checkout") ||
    path.startsWith("/sitemap") ||
    path.startsWith("/robots") ||
    path.startsWith("/invite") ||
    path.startsWith("/api/team/join") ||
    path === "/superadmin/login" ||
    path.startsWith("/api/superadmin/init") ||
    path.startsWith("/api/superadmin/recovery") ||
    path.startsWith("/api/brand") ||
    path.startsWith("/_next") ||
    path.startsWith("/bg-img") ||
    path.startsWith("/templates") ||
    path.startsWith("/api/auth") ||
    path.startsWith("/api/bank") ||
    path.startsWith("/api/registration") ||
    path.startsWith("/api/payment/webhook") ||
    path.startsWith("/api/payment/initialize") ||
    path.startsWith("/api/payment/check-status") ||
    path.startsWith("/api/verifyToken") ||
    path.startsWith("/api/image") ||
    path.startsWith("/api/collections") ||
    path.startsWith("/api/health") ||
    path.startsWith("/api/workers") ||
    path.startsWith("/api/cron") ||
    path === "/favicon.ico" ||
    path === "/unauthorized"
  ) {
    const response = NextResponse.next();
    if (!token && activeCookieName) {
      clearInvalidCookies(req, response);
    }
    return addSecurityHeaders(response);
  }

  // 4. LOGIN / SIGNUP / RECOVERY ACCESSIBILITY (If authenticated, redirect to dashboard)
  if (
    path === "/login" || 
    path === "/signup" || 
    path === "/register" ||
    path === "/forgot-password" ||
    path === "/reset-password" ||
    path === "/superadmin/login"
  ) {
    if (token) return redirectToDashboard(token.role as string, req);
    const response = NextResponse.next();
    if (!token && activeCookieName) {
      clearInvalidCookies(req, response);
    }
    return addSecurityHeaders(response);
  }

  // 5. AUTOMATED EXPULSION / EXPIRED TOKEN GUARD
  if (!token) {
    if (path.startsWith("/api/")) {
      const response = NextResponse.json(
        { error: "Unauthorized: Session expired ", code: "SESSION_EXPIRED" },
        { status: 401 }
      );
      clearSessionCookies(response);
      return addSecurityHeaders(response);
    }

    // Direct unauthenticated superadmin access to dedicated superadmin login
    if (path.startsWith("/superadmin")) {
      const superadminLoginResponse = NextResponse.redirect(new URL("/superadmin/login", req.url));
      clearSessionCookies(superadminLoginResponse);
      return addSecurityHeaders(superadminLoginResponse);
    }

    const redirectTarget = activeCookieName ? "/login?expired=true" : "/login";
    const sessionExpiredResponse = NextResponse.redirect(new URL(redirectTarget, req.url));
    clearSessionCookies(sessionExpiredResponse);
    return addSecurityHeaders(sessionExpiredResponse);
  }

  const userRole = (token.role as string || "").toUpperCase();

  // 6. MANAGER PRIVACY GUARD: Strictly forbid managers from billing/payment routes & APIs
  if (userRole === "MANAGER") {
    if (path.includes("/payment") || path.startsWith("/api/payment")) {
      if (path.startsWith("/api/")) {
        return addSecurityHeaders(
          NextResponse.json(
            { error: "Forbidden: Store managers are not authorized to access payment billing." },
            { status: 403 }
          )
        );
      }
      return addSecurityHeaders(NextResponse.redirect(new URL("/dashboard/1", req.url)));
    }
  }

  // 7. SUPERADMIN EXCLUSIVE ROUTE GUARD
  if (
    (path.startsWith("/superadmin") && path !== "/superadmin/login") ||
    (path.startsWith("/api/superadmin") && !path.startsWith("/api/superadmin/init") && !path.startsWith("/api/superadmin/recovery"))
  ) {
    if (userRole !== "SUPERADMIN") {
      if (path.startsWith("/api/")) {
        return addSecurityHeaders(
          NextResponse.json(
            { error: "Forbidden: Superadmin credentials required" },
            { status: 403 }
          )
        );
      }
      return addSecurityHeaders(NextResponse.redirect(new URL("/unauthorized", req.url)));
    }
  }

  // 8. ROLE-BASED SEGREGATION GUARD FOR DASHBOARD & APIS
  if (path.startsWith("/dashboard") || path.startsWith("/api/dashboard")) {
    const allowedPaths =
      ROLE_PERMISSIONS[userRole] || [];
    const hasPermission = allowedPaths.some((allowedPath) => path.startsWith(allowedPath));

    if (!hasPermission) {
      if (path.startsWith("/api/")) {
        return addSecurityHeaders(
          NextResponse.json(
            { error: "Forbidden: You do not have permission to access this resource" },
            { status: 403 }
          )
        );
      }
      return addSecurityHeaders(NextResponse.redirect(new URL("/unauthorized", req.url)));
    }
  }

  return addSecurityHeaders(NextResponse.next());
}

// 9. DASHBOARD ROUTER HELPER
function redirectToDashboard(role: string, req: NextRequest) {
  const r = (role || "").toUpperCase();
  if (r === "SUPERADMIN") {
    return NextResponse.redirect(new URL("/superadmin", req.url));
  }
  if (r === "MANAGER") {
    return NextResponse.redirect(new URL("/dashboard/1", req.url));
  }
  if (r === "ADMIN" || r === "USER") {
    return NextResponse.redirect(new URL("/dashboard/1/payment", req.url));
  }
  return NextResponse.redirect(new URL("/", req.url));
}

// 10. ADVANCED SECURITY HEADERS
function addSecurityHeaders(response: NextResponse) {
  const headers = response.headers;
  headers.set("X-Frame-Options", "DENY");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  headers.set("X-XSS-Protection", "1; mode=block");
  return response;
}

// 11. HIGH-PERFORMANCE MATCHER CONFIGURATION
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public asset extensions (.svg, .png, .jpg, .jpeg, .gif, .webp, .woff, .woff2, .mp4, .webm, .ogg)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff|woff2|mp4|webm|ogg)$).*)",
  ],
};
