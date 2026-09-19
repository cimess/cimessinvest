import { redirect } from "next/navigation";

/**
 * Strict Multi-Tenant Storefront Isolation
 * Visiting /store without a tenant slug MUST NEVER guess or leak an arbitrary merchant's store.
 * Immediately redirects to the Cimessinvest platform marketing page.
 */
export default function DefaultStorePage() {
  redirect("/");
}
