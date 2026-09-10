import { Session } from "next-auth";

/**
 * Checks if an email is registered in the SUPERADMIN_EMAILS environment variable.
 */
export function isSuperAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const allowed = (process.env.SUPERADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  return allowed.includes(email.trim().toLowerCase());
}

/**
 * Dual-verification: Verifies that the session user has the SUPERADMIN role
 * AND matches the authorized email whitelist in environment variables.
 */
export function isSuperAdmin(session: Session | null): boolean {
  if (!session?.user?.email) return false;
  const role = (session.user.role || "").toUpperCase();
  return role === "SUPERADMIN" && isSuperAdminEmail(session.user.email);
}
