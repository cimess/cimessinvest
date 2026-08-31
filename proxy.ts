import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/app/auth";

// 1. Strict Matrix Permissions (Hierarchy Access Control for Pages and APIs)
const ROLE_PERMISSIONS: Record<string, string[]> = {
  ADMIN: ["/dashboard", "/api/dashboard"],
  MANAGER: ["/dashboard", "/api/dashboard"],
  manager: ["/dashboard", "/api/dashboard"],
  admin: ["/dashboard", "/api/dashboard"],
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

  // 3. PUBLIC & STATIC ALLOWLIST (Bypass checks for static assets, NextAuth, etc.)
  if (
    path==="/"|| 
    path.startsWith("/api/brand") ||
    path.startsWith("/_next") ||
    path.startsWith("/bg-img") ||
    path.startsWith("/api/auth") ||
    path.startsWith("/api/registration") ||
    path.startsWith("/api/register") ||
    path.startsWith("/api/payment") ||
    path.startsWith("/api/verifyToken") ||
    path.startsWith("/api/image") ||
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

  // 4. LOGIN / SIGNUP ACCESSIBILITY (If authenticated, redirect to dashboard)
  if (path === "/login" || path === "/signup") {
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

    const sessionExpiredResponse = NextResponse.redirect(new URL("/", req.url));
    clearInvalidCookies(req, sessionExpiredResponse);
    return addSecurityHeaders(sessionExpiredResponse);
  }

  // 6. ROLE-BASED SEGREGATION GUARD FOR DASHBOARD & APIS
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

// 7. DASHBOARD ROUTER HELPER
function redirectToDashboard(role: string, req: NextRequest) {
  const r = (role || "").toLowerCase();
  if (r === "manager" || r === "admin") {
    return NextResponse.redirect(new URL("/dashboard/1/payment", req.url));
  }
  return NextResponse.redirect(new URL("/", req.url));
}

// 8. ADVANCED SECURITY HEADERS
function addSecurityHeaders(response: NextResponse) {
  const headers = response.headers;
  headers.set("X-Frame-Options", "DENY");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  headers.set("X-XSS-Protection", "1; mode=block");
  return response;
}

// 9. HIGH-PERFORMANCE MATCHER CONFIGURATION
export const config = {
  matcher: ["/", "/login", "/signup", "/dashboard/:path*", "/api/:path*"],
};
