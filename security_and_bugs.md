# 🛡️ Ti Stiches — Security Flaws & Bugs Audit Checklist

This checklist contains all identified security vulnerabilities, broken access controls, and functional bugs across the **Ti Stiches** application. Use this document as your step-by-step roadmap to review, fix, and ask questions as you work through each item.

---

## 📋 Quick Progress Tracker
- [x] **SEC-01**: Sensitive Admin Credentials & User Data Leakage in `GET /api/user/settings` (Resolved — Auth required & safe projections)
- [x] **SEC-02**: Unauthenticated Catalog Item Injection in `POST /api/collections` (Resolved — Auth & Admin role check)
- [x] **SEC-03**: Route Guard Proxy (`proxy.ts` verified as official Next.js 16 convention) (Resolved — Superadmin matrix & guards)
- [x] **SEC-04**: NextAuth Missing Secret / Removed Hardcoded Fallback (Resolved — Production environment validation)
- [x] **SEC-05**: Financial / Storage Quota Tampering in `/api/payment/initialize` (Resolved — Superadmin Deal Desk & Server-Authoritative Pricing)
- [x] **SEC-06**: Unauthenticated Payment History Disclosure in `/api/payment/history` (Resolved — Fallback removed & 401 enforced)
- [x] **SEC-07**: State-Mutating `GET` Request in `/api/payment/check-status` (Resolved — Session auth & transaction ownership check)
- [x] **SEC-08**: Insecure Pseudo-Random OTPs & Reset Token Rate-Limit Bypass (Resolved — `crypto.randomInt` & attempt lockout)
- [x] **SEC-09**: Unprotected Cron Route when `CRON_SECRET` is Unset (Resolved — Fail-closed authorization check)
- [x] **BUG-01**: HTTP Method Mismatch in Media Deletion (`DELETE` vs `POST`) (Resolved — `DELETE` handler exported & body/query parsing)
- [x] **BUG-02**: Empty String Pollution on Grid Image Deletion (Resolved — Array filtering removes deleted URLs cleanly)

---

### [SEC-01] Sensitive Admin Credentials & User Data Leakage
- **Location**: [`app/api/user/settings/route.ts:L14-L27`](file:///home/cimess/Dev/brands/fashion%20websites/tistiches/app/api/user/settings/route.ts#L14-L27)
- **Classification**: OWASP A01 (Broken Access Control) & OWASP A02 (Cryptographic Failures) — **Severity: Critical**
- **The Issue**:
  When a request has no active session, the route falls back to querying:
  ```typescript
  const user = session?.user?.email
    ? await prisma.user.findFirst({ where: { email: session.user.email } })
    : await prisma.user.findFirst();
  ```
  It then returns `user` directly in the JSON response.
- **The Risk**:
  Any unauthenticated attacker or web scraper can send `GET /api/user/settings` and receive the administrator's **hashed password**, **`authorizationKey`**, **`phone`**, and **`resetToken`**.
- **How to Fix**:
  1. Require a valid session before proceeding; return `401 Unauthorized` if missing.
  2. Use Prisma's `select` projection so sensitive columns are never queried or transmitted over the wire:
  ```typescript
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  const user = await prisma.user.findFirst({
    where: { email: session.user.email },
    select: {
      id: true,
      companyName: true,
      email: true,
      phone: true,
      planSelected: true,
      subscription_status: true,
      storageUsed: true,
      storageLimit: true,
      role: true,
    },
  });
  ```
- **Discussion / Concept to Explore**:
  *Why should API responses use explicit property whitelisting (DTP / Projection pattern) rather than returning raw database model instances?*

---

### [SEC-02] Unauthenticated Catalog Item Injection
- **Location**: [`app/api/collections/route.ts:L46-L66`](file:///home/cimess/Dev/brands/fashion%20websites/tistiches/app/api/collections/route.ts#L46-L66)
- **Classification**: OWASP A01 (Broken Access Control) — **Severity: Critical**
- **The Issue**:
  The `POST` route takes JSON parameters (`url`, `title`, `category`, etc.) and directly calls `prisma.image.create(...)` without checking if the requester is authenticated or an authorized manager.
- **The Risk**:
  Anyone can send curl/fetch POST requests to insert arbitrary images, defacement media, or phishing links directly into your public fashion catalog.
- **How to Fix**:
  1. Authenticate with `await auth()`.
  2. Validate that incoming fields conform to expected formats (e.g. valid Cloudinary URL, non-empty title):
  ```typescript
  export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { url, title, category, size, type, group, placement } = body;

    if (!url || typeof url !== "string" || !url.startsWith("https://res.cloudinary.com/")) {
      return NextResponse.json({ error: "Invalid image URL" }, { status: 400 });
    }

    const newItem = await prisma.image.create({
      data: {
        url,
        title: title?.trim() || "Bespoke Design",
        category: category || "Agbada",
        group: group || "Native",
        placement: placement || "both",
        size: size ? Number(size) : null,
        type: type || "image",
      },
    });

    return NextResponse.json(newItem, { status: 201 });
  }
  ```

---

### [SEC-03] Inactive Route Guard Middleware
- **Location**: [`proxy.ts:L32`](file:///home/cimess/Dev/brands/fashion%20websites/tistiches/proxy.ts#L32)
- **Classification**: Security Architecture / Broken Access Control — **Severity: High**
- **The Issue**:
  Next.js App Router specifically expects a file named `middleware.ts` (or `middleware.js`) in the root or `src/` directory. The file currently named `proxy.ts` is not imported anywhere and is completely ignored by Next.js.
- **The Risk**:
  None of your route protection rules, session token expiration checks, or role-based restrictions on `/dashboard` or `/api/*` are active at the edge/network boundary.
- **How to Fix**:
  1. Rename [`proxy.ts`](file:///home/cimess/Dev/brands/fashion%20websites/tistiches/proxy.ts) to `middleware.ts`.
  2. Change the exported function name from `proxy` to `middleware`:
  ```typescript
  // middleware.ts
  export async function middleware(req: NextRequest) {
    // ... your authorization & header logic
  }

  export const config = {
    matcher: ["/login", "/signup", "/dashboard/:path*", "/api/dashboard/:path*"],
  };
  ```

---

### [SEC-04] NextAuth Production Secret Enforcement
- **Location**: [`app/auth.ts:L84-L88`](file:///home/cimess/Dev/brands/fashion%20websites/tistiches/app/auth.ts#L84-L88)
- **Classification**: OWASP A02 (Cryptographic Failures) — **Severity: High**
- **The Issue**:
  You recently removed the hardcoded string fallback. If `AUTH_SECRET` or `NEXTAUTH_SECRET` is missing in production, NextAuth will throw runtime errors or fail session signing.
- **The Solution / Best Practice**:
  Enforce a hard check during application bootstrap so misconfigured deployments fail loudly rather than behaving unpredictably:
  ```typescript
  const authSecret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!authSecret && process.env.NODE_ENV === "production") {
    throw new Error("[Auth] Fatal: AUTH_SECRET must be set in production environment variables.");
  }

  export const { handlers, auth, signIn, signOut } = NextAuth({
    secret: authSecret,
    // ... providers and callbacks
  });
  ```

---

### [SEC-05] Financial & Storage Quota Tampering
- **Location**: [`app/api/payment/initialize/route.ts:L13-L27`](file:///home/cimess/Dev/brands/fashion%20websites/tistiches/app/api/payment/initialize/route.ts#L13-L27) & [`app/dashboard/[id]/payment/page.tsx:L95-L100`](file:///home/cimess/Dev/brands/fashion%20websites/tistiches/app/dashboard/%5Bid%5D/payment/page.tsx#L95-L100)
- **Classification**: OWASP A04 (Insecure Design / Business Logic Flaw) — **Severity: High**
- **The Issue**:
  The client sends `customAmountKobo` and `customStorageMB` in the request body, which the backend trusts blindly for the `ENTERPRISE` plan.
- **The Risk**:
  A user can intercept the request and set `customAmountKobo: 100` (₦1) and `customStorageMB: 1000000` (1 TB), gaining enterprise capacity for virtually free.
- **How to Fix**:
  1. Enforce strict minimums on the server:
  ```typescript
  // app/api/payment/initialize/route.ts
  const MIN_ENTERPRISE_AMOUNT_KOBO = 5000000; // ₦50,000 minimum
  const MAX_ENTERPRISE_DEFAULT_STORAGE_MB = 10000; // 10 GB

  let finalAmount = PLAN_PRICES_KOBO[plan];
  let finalStorage = PLAN_STORAGE_LIMITS[plan];

  if (plan === "ENTERPRISE") {
    if (customAmountKobo && customAmountKobo >= MIN_ENTERPRISE_AMOUNT_KOBO) {
      finalAmount = customAmountKobo;
    }
    if (customStorageMB && customStorageMB > 0 && customStorageMB <= 50000) {
      finalStorage = customStorageMB;
    }
  }
  ```
  2. For true custom enterprise contracts, store pre-approved quotes in the database rather than letting the client pass prices.

---

### [SEC-06] Unauthenticated Payment History Disclosure
- **Location**: [`app/api/payment/history/route.ts:L16-L19`](file:///home/cimess/Dev/brands/fashion%20websites/tistiches/app/api/payment/history/route.ts#L16-L19)
- **Classification**: OWASP A01 (Broken Access Control) — **Severity: High**
- **Status**: **RESOLVED**
- **The Issue**:
  If the requester had no session, the code fell back to querying `prisma.user.findFirst()`, exposing the platform's financial history to anonymous visitors.
- **The Fix**:
  Removed the fallback query. The endpoint now immediately returns `401 Unauthorized` if no authenticated session is present.

---

### [SEC-07] State Mutation on `GET` in Payment Check Status
- **Location**: [`app/api/payment/check-status/route.ts:L26-L30`](file:///home/cimess/Dev/brands/fashion%20websites/tistiches/app/api/payment/check-status/route.ts#L26-L30)
- **Classification**: OWASP A04 & HTTP Semantics Violation — **Severity: Medium**
- **Status**: **RESOLVED**
- **The Issue**:
  `GET /api/payment/check-status?reference=...` permitted unauthenticated probing and state activation on any transaction reference.
- **The Fix**:
  Enforced session authentication, verified transaction ownership (`transaction.userId === session.user.id || isSuperAdmin`), and added support for explicit `POST` invocations.

---

### [SEC-08] Insecure Pseudo-Random OTPs & Rate Limit Bypass
- **Location**:
  - [`app/api/registration/route.ts:L57`](file:///home/cimess/Dev/brands/fashion%20websites/tistiches/app/api/registration/route.ts#L57)
  - [`app/api/auth/forgot-password/route.ts:L44`](file:///home/cimess/Dev/brands/fashion%20websites/tistiches/app/api/auth/forgot-password/route.ts#L44)
  - [`app/api/auth/reset-password/route.ts:L34`](file:///home/cimess/Dev/brands/fashion%20websites/tistiches/app/api/auth/reset-password/route.ts#L34)
- **Classification**: OWASP A07 (Identification and Authentication Failures) — **Severity: Medium**
- **Status**: **RESOLVED**
- **The Issue**:
  1. OTP generation used `Math.random()`, which is a predictable pseudo-random generator.
  2. Direct POST requests to `/api/auth/reset-password` did not increment the attempt counter, leaving OTP verification open to brute-force attacks.
- **The Fix**:
  1. Replaced `Math.random()` with CSPRNG `crypto.randomInt(100000, 1000000).toString()`.
  2. Enforced the 5-attempt limit with automatic token invalidation in `/api/auth/reset-password`.

---

### [SEC-09] Unprotected Cron Route when `CRON_SECRET` is Unset
- **Location**: [`app/api/cron/subscriptions/route.ts:L15`](file:///home/cimess/Dev/brands/fashion%20websites/tistiches/app/api/cron/subscriptions/route.ts#L15)
- **Classification**: OWASP A01 (Broken Access Control) — **Severity: Medium**
- **Status**: **RESOLVED**
- **The Issue**:
  If `process.env.CRON_SECRET` was undefined, `if (cronSecret && authHeader !== ...)` evaluated to `false`, allowing anyone on the internet to trigger cron jobs and mass deactivations.
- **The Fix**:
  Enforced fail-closed behavior: `if (!cronSecret || authHeader !== 'Bearer ${cronSecret}') return 401`.

---

### [BUG-01] HTTP Method Mismatch in Media Deletion
- **Location**: [`app/dashboard/[id]/collections/page.tsx:L329`](file:///home/cimess/Dev/brands/fashion%20websites/tistiches/app/dashboard/%5Bid%5D/collections/page.tsx#L329) vs [`app/api/media/delete/route.ts:L20`](file:///home/cimess/Dev/brands/fashion%20websites/tistiches/app/api/media/delete/route.ts#L20)
- **Classification**: Functional Defect
- **Status**: **RESOLVED**
- **The Issue**:
  The collections page used `api.delete("/api/media/delete")`, but the endpoint only exported `POST`, throwing `405 Method Not Allowed`.
- **The Fix**:
  Exported both `POST` and `DELETE` handlers and enabled parsing of IDs/URLs from both JSON body and search parameters.

---

### [BUG-02] Empty String Pollution on Grid Image Deletion
- **Location**: [`app/api/media/delete/route.ts:L108-L112`](file:///home/cimess/Dev/brands/fashion%20websites/tistiches/app/api/media/delete/route.ts#L108-L112)
- **Classification**: Data Integrity Bug
- **Status**: **RESOLVED**
- **The Issue**:
  Deleting a hero grid image mapped the entry to `""`, leaving empty strings in `heroGridImages` and `rawMaterialImages` arrays that broke UI rendering.
- **The Fix**:
  Updated array processing to filter out the deleted image URL completely (`.filter(img => Boolean(img) && img !== targetUrl)`).

---
---

# 🛡️ Full-System Security Audit — Round 2 (Post-Remediation Verification)

**Audit Date**: September 10, 2026  
**Auditor**: On-Demand Security Specialist & Antigravity IDE  
**Scope**: All API routes (`/api/*`), proxy guards (`proxy.ts`), authentication flows (`app/auth.ts`), worker processes, and database access controls.

---

## 📋 Round 2 Verification Matrix

| Vulnerability ID | Description | Historical Status | Round 2 Verification | Current Security Posture |
| :--- | :--- | :--- | :--- | :--- |
| **SEC-01** | Admin credentials & reset token leakage in `/api/user/settings` | Critical | **PASS** | `SAFE_USER_SELECT` whitelist enforced; anonymous calls receive `401 Unauthorized`. |
| **SEC-02** | Unauthenticated catalog injection in `POST /api/collections` | Critical | **PASS** | Session authentication & `ADMIN`/`SUPERADMIN`/`MANAGER` role guard verified. |
| **SEC-03** | Route guard enforcement via Next.js 16 `proxy.ts` | High | **PASS** | Next.js 16 official `proxy.ts` actively intercepting routes with strict security response headers. |
| **SEC-04** | NextAuth fallback secret in production | High | **PASS** | Hardcoded secret completely removed; production requires explicit environment variable. |
| **SEC-05** | Quota & pricing tampering in `/api/payment/initialize` | High | **PASS** | Client amounts discarded; backend matches against Superadmin-approved `CustomPlanQuote`. |
| **SEC-06** | Payment history leak via unauthenticated `findFirst()` | High | **PASS** | Fallback removed; strict 401 gate active on `/api/payment/history`. |
| **SEC-07** | State mutation on `GET /api/payment/check-status` | Medium | **PASS** | Requester ownership enforced (`session.user.id === transaction.userId`); `POST` handler exported. |
| **SEC-08** | Insecure PRNG OTP & reset token rate-limit bypass | Medium | **PASS** | `crypto.randomInt` enforced; 5-attempt threshold locks out token in `/api/auth/reset-password`. |
| **SEC-09** | Unprotected subscription cron when `CRON_SECRET` is unset | Medium | **PASS** | Fail-closed check active: requests without matching Bearer secret are rejected with 401. |
| **BUG-01** | Method mismatch on media deletion (`405 Method Not Allowed`) | Functional | **PASS** | Both `DELETE` and `POST` handlers exported; body and query params parsed cleanly. |
| **BUG-02** | Empty string `""` array pollution on hero grid deletions | Functional | **PASS** | Non-empty filtering (`.filter(img => Boolean(img) && img !== targetUrl)`) verified. |

---

## 🔍 Round 2 New In-Depth Discoveries & Hardening Advice

### [SEC-10] Paystack Webhook Cryptographic Timing Attack & Sandbox Bypass
- **Location**: [`app/api/service/payment.service.ts:L141-L148`](file:///home/cimess/Dev/brands/fashion%20websites/tistiches/app/api/service/payment.service.ts#L141-L148)
- **Classification**: OWASP A02 (Cryptographic Failures) — **Severity: Medium**
- **The Issue**:
  ```typescript
  export function verifyPaystackSignature(rawBody: string, signature: string | null): boolean {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) return true; // Sandbox bypass
    if (!signature) return false;

    const hash = crypto.createHmac("sha512", secretKey).update(rawBody).digest("hex");
    return hash === signature;
  }
  ```
  1. `hash === signature` is a standard JavaScript string comparison that terminates early on the first byte mismatch, making it theoretically vulnerable to timing side-channel attacks.
  2. `if (!secretKey) return true` fails open if `PAYSTACK_SECRET_KEY` is accidentally omitted in production.
- **Recommended Hardening**:
  Use `crypto.timingSafeEqual` and enforce fail-closed in production:
  ```typescript
  export function verifyPaystackSignature(rawBody: string, signature: string | null): boolean {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      return process.env.NODE_ENV !== "production"; // Only bypass in local development
    }
    if (!signature) return false;

    const hash = crypto.createHmac("sha512", secretKey).update(rawBody).digest("hex");
    if (hash.length !== signature.length) return false;
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
  }
  ```

---

### [SEC-11] Global User Count Scope in Multi-Tenant Registration
- **Location**: [`app/api/workers/teamWorker.ts:L73-L98`](file:///home/cimess/Dev/brands/fashion%20websites/tistiches/app/api/workers/teamWorker.ts#L73-L98)
- **Classification**: Multi-Tenancy Architecture & Business Logic — **Severity: Medium**
- **The Issue**:
  `checkTeamMemberLimitAndRole()` executes:
  ```typescript
  const adminUser = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  const totalUsersCount = await prisma.user.count();
  ```
- **The Impact**:
  If this platform hosts multiple independent ateliers on the same database, `totalUsersCount` counts all users globally. If Atelier A has 5 staff members, Atelier B will be blocked from registering because `totalUsersCount >= maxLimit`.
- **Recommended Hardening**:
  Introduce a `workspaceId` or `tenantId` field to scope team members to specific ateliers, or register each atelier owner as an independent root tenant.

---

### [SEC-12] JWT Role Staleness on Dynamic Privilege Escalation
- **Location**: [`app/auth.ts:L71-L90`](file:///home/cimess/Dev/brands/fashion%20websites/tistiches/app/auth.ts#L71-L90)
- **Classification**: Identity & Session Management — **Severity: Low**
- **The Issue**:
  NextAuth JWT tokens cache `token.role` upon sign-in. If you upgrade an atelier manager's role directly in PostgreSQL, their active JWT cookie will continue reporting their previous role until they sign out and sign back in.
- **Recommended Hardening**:
  For high-security operations (e.g. accessing `/superadmin`), [`proxy.ts`](file:///home/cimess/Dev/brands/fashion%20websites/tistiches/proxy.ts) and API routes correctly perform live database or whitelist checks to prevent stale token exploitation.

