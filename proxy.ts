import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/app/auth";

// 1. Strict Matrix Permissions (Hierarchy Access Control for Pages and APIs)
const ROLE_PERMISSIONS: Record<string, string[]> = {
  SUPERADMIN: ["/superadmin", "/api/superadmin", "/dashboard", "/api/dashboard"],
  ADMIN: ["/dashboard", "/api/dashboard"],
  MANAGER: ["/dashboard", "/api/dashboard"],
  USER: ["/dashboard", "/api/dashboard"],
};

// Helper function to safely clear all session cookie variants from the response
function clearInvalidCookies(req: NextRequest, response: NextResponse) {
  const cookieNames = [
    "__Secure-authjs.session-token",
    "authjs.session-token",
    "__Secure-next-auth.session-token",
    "next-auth.session-token",
  ];
  cookieNames.forEach((name) => {
    if (req.cookies.has(name)) {
      response.cookies.delete(name);
      response.cookies.delete({
        name,
        path: "/",
        secure: name.startsWith("__Secure-"),
      });
    }
  });
}

export async function proxy(req: NextRequest) {
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

  const path = req.nextUrl.pathname;

  // 3. PUBLIC & STATIC ALLOWLIST (Bypass checks for static assets, public storefront, collections, image preview)
  if (
    path === "/" || 
    path.startsWith("/collections") ||
    path.startsWith("/image") ||
    path === "/superadmin/login" ||
    path.startsWith("/api/superadmin/init") ||
    path.startsWith("/api/superadmin/recovery") ||
    path.startsWith("/api/brand") ||
    path.startsWith("/_next") ||
    path.startsWith("/bg-img") ||
    path.startsWith("/api/auth") ||
    path.startsWith("/api/registration") ||
    path.startsWith("/api/register") ||
    path.startsWith("/api/payment") ||
    path.startsWith("/api/verifyToken") ||
    path.startsWith("/api/image") ||
    path.startsWith("/api/collections") ||
    path.startsWith("/api/health") ||
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
        { error: "Unauthorized" },
        { status: 401 }
      );
      if (activeCookieName) {
        clearInvalidCookies(req, response);
      }
      return addSecurityHeaders(response);
    }

    // Direct unauthenticated superadmin access to dedicated superadmin login
    if (path.startsWith("/superadmin")) {
      const superadminLoginResponse = NextResponse.redirect(new URL("/superadmin/login", req.url));
      clearInvalidCookies(req, superadminLoginResponse);
      return addSecurityHeaders(superadminLoginResponse);
    }

    const sessionExpiredResponse = NextResponse.redirect(new URL("/", req.url));
    clearInvalidCookies(req, sessionExpiredResponse);
    return addSecurityHeaders(sessionExpiredResponse);
  }

  // 6. SUPERADMIN EXCLUSIVE ROUTE GUARD
  if (
    (path.startsWith("/superadmin") && path !== "/superadmin/login") ||
    (path.startsWith("/api/superadmin") && !path.startsWith("/api/superadmin/init") && !path.startsWith("/api/superadmin/recovery"))
  ) {
    const userRole = (token.role as string || "").toUpperCase();
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

  // 7. ROLE-BASED SEGREGATION GUARD FOR DASHBOARD & APIS
  if (path.startsWith("/dashboard") || path.startsWith("/api/dashboard")) {
    const userRole = (token.role as string) || "";
    const allowedPaths =
      ROLE_PERMISSIONS[userRole] || ROLE_PERMISSIONS[userRole.toUpperCase()] || [];
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

// 8. DASHBOARD ROUTER HELPER
function redirectToDashboard(role: string, req: NextRequest) {
  const r = (role || "").toUpperCase();
  if (r === "SUPERADMIN") {
    return NextResponse.redirect(new URL("/superadmin", req.url));
  }
  if (r === "MANAGER" || r === "ADMIN" || r === "USER") {
    return NextResponse.redirect(new URL("/dashboard/1/payment", req.url));
  }
  return NextResponse.redirect(new URL("/", req.url));
}

// 9. ADVANCED SECURITY HEADERS
function addSecurityHeaders(response: NextResponse) {
  const headers = response.headers;
  headers.set("X-Frame-Options", "DENY");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  headers.set("X-XSS-Protection", "1; mode=block");
  return response;
}

// 10. HIGH-PERFORMANCE MATCHER CONFIGURATION
export const config = {
  matcher: [
    "/",
    "/login",
    "/signup",
    "/dashboard/:path*",
    "/superadmin/:path*",
    "/api/:path*",
  ],
};
