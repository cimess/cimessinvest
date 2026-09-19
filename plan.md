# Ti Stiches — Universal Social Commerce Platform Master Plan
## Mobile-First Link-in-Bio Storefront & React Native Native Engine

A modern, high-performance social commerce platform (modeled after Catlog, Bumpa, and Linkpop) designed for Instagram, TikTok, and WhatsApp merchants across all industries (fashion, food, jewelry, fitness, electronics, beauty, etc.).

A single universal, data-driven architecture powers both:
1. **Responsive Web Storefront** (`/store/[slug]` or `[slug].yourdomain.ng`)
2. **Single Native React Native Mobile Screen** (`StorefrontScreen.tsx` with native `FlatList`, sub-20MB binary, 60–120 FPS)

Merchants customize their store with **3 simple tokens**—no bloated template engines or dynamic AST trees required:
- **Brand Theme Color** (`themeColor` hex, e.g. Gold `#C9A96E`, Emerald `#10B981`, Sunset `#FF5722`)
- **Display Layout Mode** (`layoutMode`: `GRID_2X2` vs `LIST` single-column)
- **Catalog & Content** (Avatar/Logo, Bio, WhatsApp number, Categories, Products & Prices)

---

## 🏗️ Architectural Topology & Dynamic Ingress

```
                                  [Cloudflare Wildcard DNS]
                                       (*.yourdomain.ng)
                                              │
                                              ▼
                                 [Next.js Edge Middleware]
                                       (proxy.ts)
                    (Bypass: /_next, /api, /favicon.ico, static files)
                                              │
             ┌────────────────────────────────┼────────────────────────────────┐
             ▼                                ▼                                ▼
   [Root: yourdomain.ng]           [Admin: admin.yourdomain.ng]      [Tenant: [slug].yourdomain.ng]
   Marketing & Registration         Merchant Management Portal        Universal Link-in-Bio Storefront
   - Start 14-day Free Trial        - Product & Stock Management      - Route: /store/[slug]
   - Automatic Brand Slug Init      - Theme Color & Grid/List Toggle  - 4 Core Sections (Profile, Tabs,
   - Instant Store Onboarding       - Quick Invoice Generator (Flow B)  Feed, Slide-up Checkout)
                                    - AI Copywriter (Bio & Products)  - Mobile API: /api/v1/store/[slug]
```

---

## 📱 The Universal Storefront Contract (`GET /api/v1/store/[slug]`)

Both the Next.js Web Storefront and the React Native Mobile Screen consume the exact same lightweight JSON payload:

```json
{
  "storeName": "Ade Custom Native Wears",
  "avatar": "https://cdn.yourdomain.ng/ade-logo.webp",
  "bio": "Bespoke traditional menswear handcrafted in Lagos. Nationwide delivery.",
  "location": "Lekki Phase 1, Lagos",
  "whatsappNumber": "+2348012345678",
  "themeColor": "#C9A96E",
  "layoutMode": "GRID_2X2",
  "categories": ["All", "Senators", "Agbada", "Accessories"],
  "products": [
    {
      "id": "prod_1",
      "name": "Royal Blue Senator Suit",
      "price": 35000,
      "formattedPrice": "₦35,000",
      "image": "https://cdn.yourdomain.ng/senator-blue.webp",
      "category": "Senators",
      "available": true,
      "stock": 12
    }
  ]
}
```

### Mobile App Performance Guarantee
- **Zero Dynamic AST Bloat**: No recursive component tree parsers or WebViews.
- **Pure Native FlatList**:
  - If `layoutMode === "GRID_2X2"`, `FlatList` renders with `numColumns={2}`.
  - If `layoutMode === "LIST"`, `FlatList` renders with `numColumns={1}`.
  - Accent borders, badges, and checkout buttons automatically use `themeColor`.
- **Performance**: 60 to 120 FPS buttery-smooth scrolling. Mobile binary stays permanently under **20 MB**.

---

## 💳 Dual Social Commerce Transaction Flows

```
                                  [Shopper Discovers Store]
                               (Instagram / TikTok / WhatsApp)
                                              │
                                              ▼
                      ┌───────────────────────────────────────────────┐
                      │ Flow A: Direct Checkout                       │ Flow B: WhatsApp Negotiation
                      │ (Customer buys catalog item directly)         │ (Custom sizing, discount, bespoke)
                      ▼                                               ▼
         [Add to Cart & Slide-up Drawer]                [Click "Inquire on WhatsApp"]
                      │                                               │
                      ▼                                               ▼
         [Instant Paystack Modal]                       [Pre-filled WhatsApp Chat]
         (Split payment: Platform fee                   "Hi Ade, I want #PROD-102 with custom fit"
          deducted, balance to merchant)                              │
                      │                                               ▼
                      ▼                                 [Merchant Creates Quick Invoice]
         [Instant Receipt & Settlement]                 (From Admin: ₦30,000 negotiated price)
                                                                      │
                                                                      ▼
                                                        [Customer Opens /pay/INV-5082]
                                                        (Paystack split payment settlement)
```

---

## 🚀 Implementation Stages & Progress Tracking

### Stage 1: Multi-Tenant Schema & Brand Data Foundations
- [x] **1.1 Multi-Tenant Core Schema (`prisma/schema.prisma`)**:
  - `Company`: `id`, `name`, `slug` (@unique), `status` (`ACTIVE`, `TRIAL_EXPIRED`, `SUSPENDED`, `ARCHIVED`), `planSelected`, `trialEndsAt`, `brandBio`, `brandTone`, `aiCreditsRemaining` (Int @default(10)), `trafficLimit`, `monthlyVisits`, `storageLimit`, `storageUsed`, `paystackSubaccountCode`, `bankInfo`.
  - `SiteSetting`: `companyId`, `themeColor` (hex @default("#C9A96E")), `layoutMode` (`GRID_2X2` / `LIST`), `whatsappNumber`, `physicalAddress`, `city`, `state`, `openingHours`.
  - `Product`: `id`, `companyId`, `title`, `priceKobo`, `images` (String[]), `category`, `stock`, `isAvailable`, `description`.
  - `CompanyMember`: `companyId`, `userId`, `role` (`OWNER`, `MANAGER`, `STAFF`), `status` (`ACTIVE`, `SUSPENDED`).
  - `Order` & `SubscriptionTransaction`: Immutable financial ledgers with `onDelete: Restrict`.
- [x] **1.2 Database Seed & Migration**:
  - Verified `prisma generate` and verified relations.

---

### Stage 2: Tenant Auth, RBAC & Multi-Tenant Onboarding
- [x] **2.1 Self-Service Registration (`/api/registration`)**:
  - Automatic unique brand slug generation and collision handling.
  - 14-day `FREE_TRIAL` init with 10 free AI copywriting credits.
  - Creator assigned as `CompanyMember` with `role: OWNER`.
  - Default `SiteSetting` created with `#C9A96E` theme and `GRID_2X2` layout.
- [x] **2.2 Session Context & Multi-Tenant RBAC (`app/auth.ts`, `app/lib/auth/rbac.ts`)**:
  - Session carries `activeCompanyId`, `companySlug`, `memberRole`, and `platformRole`.
  - Direct DB validation on `CompanyMember.status === "ACTIVE"` to prevent stale 24-hour token exploits.
  - Company switcher API (`POST /api/user/switch-company`).
- [x] **2.3 Team Management & Quotas**:
  - Plan-based seat quotas enforced in `app/api/team/invite/route.ts`.
  - Storage & traffic workers (`storageWorker.ts`, `trafficWorker.ts`) migrated to company-level scopes.

---

### Stage 3: Universal Store API & Edge Routing
- [x] **3.1 Edge Routing & Security Guards (`proxy.ts`)**:
  - Route `yourdomain.ng/store/[slug]` and `/checkout` in public bypass allowlist.
  - Strict static bypass: `_next`, `api`, `favicon.ico`, static extensions.
  - Reserved slug blacklist: `api`, `admin`, `login`, `register`, `pay`, `superadmin`, `dashboard`.
  - Tenant Lifecycle Guard: Display clean branded notice if `Company.status !== "ACTIVE"`.
- [x] **3.2 Universal Storefront API (`GET /api/v1/store/[slug]`)**:
  - High-performance, edge-cacheable API serving both Web and Native React Native Mobile.
  - Query `Company`, `SiteSetting`, and `Product`s where `isAvailable = true`.
  - Return standardized JSON: `{ storeName, avatar, bio, location, whatsappNumber, themeColor, layoutMode, categories, products }`.
  - 60s ISR / Cache-Control headers with revalidation hook on product edits.

---

### Stage 4: Universal Web Storefront & React Native Contract
- [x] **4.1 Universal 4-Section Web Storefront (`app/store/[slug]/page.tsx` & `StorefrontClient.tsx`)**:
  - **Section 1 (Header)**: Avatar/logo, store title, verified badge, bio, location, and prominent "Chat with Merchant on WhatsApp" CTA.
  - **Section 2 (Category Tabs)**: Horizontal scrolling pill bar with dynamic counts (All, Category 1, Category 2).
  - **Section 3 (Product Feed)**: Dynamic responsive feed switching between 2x2 Grid and 1-Column List cards based on merchant's `layoutMode`, styled with `themeColor`, dynamic `attributes` badges, and direct "Inquire on WhatsApp" action.
  - **Section 4 (Slide-up Checkout Drawer)**: Modern bottom-sheet drawer with cart item summary, quantity stepper, custom measurements textarea, WhatsApp order negotiation trigger, and direct Paystack checkout trigger.
- [x] **4.2 React Native Native Screen Contract (`docs/mobile/StorefrontScreen.tsx`)**:
  - Provided complete, verified React Native component specification using native `FlatList`, `numColumns={2}`, and `themeColor` styling tokens for mobile engineering team.
- [x] **4.3 Negotiated Discount Checkout Preview Page (`app/checkout/[id]/page.tsx` & `CheckoutClient.tsx`)**:
  - Dedicated preview page for negotiated WhatsApp invoices (`INV-...`) and catalog orders.
  - Full itemized product specs, crossed-out original price, highlighted discount pill, merchant notes callout, customer details, and Paystack trigger.
- [x] **4.4 Merchant Storefront Settings (`app/dashboard/[id]/storefront/page.tsx` & `/api/user/settings`)**:
  - Visual color picker for `themeColor` (Gold `#C9A96E`, Emerald `#10B981`, Sunset `#FF5722`, Royal Blue `#2563EB`, Violet `#8B5CF6`, Rose `#F43F5E`, Charcoal `#1E293B`, etc. + custom hex).
  - Toggle switch for `layoutMode` (`GRID_2X2` vs `LIST`).
  - WhatsApp phone number input and store profile editor (`companyName`, `brandBio`, `brandTone`, `physicalAddress`, `city`, `state`).
  - Direct live preview link (`/store/[slug]`).
- [x] **4.5 AI Brand Copywriter (`POST /api/ai/generate-store-copy`)**:
  - Leverages Google Gemini API to generate/polish brand bio, slogan, and product descriptions based on merchant inputs.
  - Deducts from `Company.aiCreditsRemaining`.
  - Integrated 1-click "Generate Bio with AI" action in merchant dashboard storefront settings.

---

### Stage 5: Dual Fintech Engine (Paystack Split & Quick Invoices)
- [x] **5.1 Paystack Subaccount Onboarding (`POST /api/merchant/subaccount`)**:
  - Merchant enters bank account details $\rightarrow$ calls Paystack API $\rightarrow$ saves `paystackSubaccountCode` on `Company`.
  - Configured settlement bank and NUBAN account input in `/dashboard/[id]/storefront`.
  - `OWNER`-only permission enforced.
- [x] **5.2 Flow A: Instant Catalog Split Checkout (`POST /api/checkout/create` & `POST /api/checkout/initialize`)**:
  - Initialize Paystack split transaction (`ORD_` prefix).
  - Platform fee deducted automatically (5%); remaining funds routed directly to merchant subaccount (95%).
- [x] **5.3 Flow B: WhatsApp Negotiation $\rightarrow$ Quick Invoice Engine**:
  - Custom invoice generator in `app/dashboard/[id]/payment/page.tsx` and `app/api/invoice/create/route.ts`.
  - Generates custom link (`/checkout/[orderId]` or `/pay/[invoiceId]`) with itemized specs, crossed-out original price, discount badges, and bespoke measurement notes.
  - 1-click "Share via WhatsApp" button with pre-filled buyer message and live orders ledger (`/api/invoice/list`).
- [x] **5.4 SaaS Subscription Billing (`SUB_` prefix & `app/dashboard/[id]/payment/page.tsx`)**:
  - Monthly plan upgrades/renewals for Starter, Professional, Enterprise tiers with Paystack transaction initialization.
- [x] **5.5 Idempotent Webhook Handler (`app/api/payment/webhook/route.ts`)**:
  - Verifies HMAC-SHA512 cryptographic signature.
  - Handles `ORD_` (catalog order), `INV_` (quick invoice), and `SUB_` (SaaS subscription) with atomic inventory updates and settlement splits.

---

### Stage 6: Batched Analytics, Upload Compression & Quotas
- [x] **6.1 Batched Traffic Analytics (`app/api/workers/trafficWorker.ts` & `/api/workers/traffic`)**:
  - In-memory visit buffer (`bufferCompanyVisit`) to eliminate DB write lock contention.
  - Connected to both `/store/[slug]` and root `/store` pages.
  - Flushes batched aggregates into `Company.monthlyVisits` and daily `AnalyticsMetrics`.
- [x] **6.2 Upload Limits & Image Compression (`storageWorker.ts` & `app/api/cloudinary/sign/route.ts`)**:
  - Server-side hard limits: Max 10MB per image, 80MB per video.
  - Automated Cloudinary pipeline with tenant quota validation (`canUserUpload` / `checkCompanyStorage`).
  - Strict storage tracking against tier limits.
- [x] **6.3 Quota Notifications**:
  - Automated notification triggers when storage or traffic hits 80% and 100% (`trafficNotified80`, `trafficNotified100`).

---

### Stage 7: SuperAdmin Platform Governance & Anti-Abuse
- [x] **7.1 SuperAdmin Dashboard (`/superadmin` & `app/api/superadmin/telemetry/route.ts`)**:
  - Merchant directory with live quota meters and order counts.
  - Platform GMV KPI card (completed store sales), SaaS subscription revenue, active accounts, and cloud storage usage.
- [x] **7.2 Anti-Abuse Flagging System (`POST /api/superadmin/company/status`)**:
  - Superadmin 1-click Suspend / Reactivate action buttons in merchant directory table.
  - Storefront automatically renders dedicated suspension notice with an appeal link when `Company.status === "SUSPENDED"`.
- [x] **7.3 Public Appeal Workflow (`app/appeal/page.tsx`, `POST /api/appeal/route.ts`, & `POST /api/superadmin/appeals`)**:
  - Public appeal submission form (`/appeal?store=[slug]`) creating `AppealRequest` tickets.
  - SuperAdmin compliance review portal with 1-click "Approve & Reactivate Store" or "Reject" actions.
  - Route allowlisted in `proxy.ts`.