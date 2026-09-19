import { NextResponse } from "next/server";

export const SESSION_COOKIE_NAMES = [
  "__Secure-authjs.session-token",
  "authjs.session-token",
  "__Secure-next-auth.session-token",
  "next-auth.session-token",
  "authjs.csrf-token",
  "__Host-authjs.csrf-token",
  "next-auth.csrf-token",
  "__Host-next-auth.csrf-token",
  "authjs.callback-url",
  "next-auth.callback-url",
];

/**
 * Safely clears all auth session and CSRF cookies on a NextResponse.
 * Deletes both by name and sets maxAge: 0 with an expired date to ensure
 * all browser engines immediately drop stale or invalidated credentials.
 */
export function clearSessionCookies(response: NextResponse): NextResponse {
  SESSION_COOKIE_NAMES.forEach((name) => {
    response.cookies.delete(name);
    response.cookies.set({
      name,
      value: "",
      path: "/",
      maxAge: 0,
      expires: new Date(0),
      secure: name.startsWith("__Secure-") || name.startsWith("__Host-"),
    });
  });
  return response;
}
