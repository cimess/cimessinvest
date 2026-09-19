# Ti Stiches — Frontend Architecture Plan (v3 - Dynamic Everything)

## Core Concept

A **white-label luxury fashion storytelling platform**. The frontend ships with rich static defaults (images, copy, colors, fonts, WhatsApp number) from `/public/` and static configurations. When a backend API becomes available, it can **replace**, **add to**, or **reconfigure** any piece of content or styling — including colors, images, text, and **fonts** — without touching a single line of code.

---

## 1. Dynamic Font System Architecture

To make fonts fully dynamic (changeable via backend config or owner settings), we use a CSS custom property + Google Font registry strategy.

```
┌─────────────────────────────────────────────────────────────┐
│                    Backend Config                           │
│   { brandFont: "Bodoni Moda", bodyFont: "Playfair Display" }│
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Font Service / Provider                     │
│  - Loads Google Fonts link/stylesheet for selected fonts    │
│  - Sets CSS variables on <html> or :root                    │
│    --font-brand: 'Bodoni Moda', serif;                      │
│    --font-heading: 'Cormorant Garamond', serif;             │
│    --font-body: 'Playfair Display', serif;                  │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Tailwind / Component CSS                    │
│  - font-brand  -> var(--font-brand)                         │
│  - font-heading-> var(--font-heading)                       │
│  - font-body   -> var(--font-body)                          │
└─────────────────────────────────────────────────────────────┘
```

### Supported Dynamic Font Registry (Google Fonts)
- **Brand / Display Fonts**: `Bodoni Moda`, `Cinzel`, `Cormorant Garamond`, `Playfair Display`, `Prata`
- **Heading Fonts**: `Cormorant Garamond`, `Playfair Display`, `Bodoni Moda`, `DM Serif Display`
- **Body Fonts**: `Jost`, `Inter`, `Playfair Display`, `DM Sans`, `Work Sans`, `Raleway`

### Static Default Font Configuration:
- `brandFont`: `"Bodoni Moda"` (All-caps, large letter-spacing for logo look)
- `headingFont`: `"Cormorant Garamond"` (Editorial serif headings)
- `bodyFont`: `"Jost"` (Clean geometric sans-serif)

---

## 2. Dynamic Content & Styling Data Models

All dynamic behavior is typed cleanly in TypeScript (`lib/content/types.ts`).

```typescript
export interface FontConfig {
  brandFont: string;    // Default: "Bodoni Moda"
  headingFont: string;  // Default: "Cormorant Garamond"
  bodyFont: string;     // Default: "Jost"
}

export interface ColorConfig {
  primary: string;         // Default: "#1A1A1A" (rich black)
  accent: string;          // Default: "#C9A96E" (muted gold)
  background: string;      // Default: "#F5F0EB" (warm cream)
  surface: string;         // Default: "#FFFFFF"
  textPrimary: string;     // Default: "#1A1A1A"
  textSecondary: string;   // Default: "#6B5E54"
}

export interface SiteConfig {
  brandName: string;         // Default: "Ti Stiches" (or fallback "cimessinvest")
  whatsappNumber: string;    // Default: "0000000"
  whatsappMessage: string;   // Default: "Hello, I'd like to book a fitting"
  ctaLabel: string;          // Default: "Book Your Fitting"
  fonts: FontConfig;
  colors: ColorConfig;
}

export interface SectionContent<T> {
  mode: "replace" | "add" | "hidden";
  data: T;
}
```

---

## 3. Page Structure & Flow

### Routes:
- `/` — **Landing Page (The Story)**: Multi-section cinematic scroll powered by GSAP.
- `/collections` — **Collections Archive**: Grid view of all collections with category filtering.
- `/collections/[slug]` — **Collection Lookbook**: Detailed image gallery and story per collection.
- `/login` — **Owner Login**: Clean authentication UI.
- `/register` — **Owner Registration**: Includes `Full Name`, `Phone Number`, `Email`, `Password`, `Company Name`, and `Brand Logo Name`.

---

## 4. Landing Page Scroll Sequence

```
┌─────────────────────────────────────────────────────────────┐
│ 1. NAVBAR                                                   │
│    Brand name rendered in dynamic --font-brand (fixed size) │
├─────────────────────────────────────────────────────────────┤
│ 2. HERO SECTION                                             │
│    Full-viewport hero video/image + animated text overlay  │
├─────────────────────────────────────────────────────────────┤
│ 3. BRAND STATEMENT                                          │
│    High-impact statement rendered in dynamic --font-heading │
├─────────────────────────────────────────────────────────────┤
│ 4. DESIGNER STORY                                           │
│    Split layout: image reveal + origin story text           │
├─────────────────────────────────────────────────────────────┤
│ 5. FEATURED COLLECTIONS (Bento Grid)                        │
│    GSAP ScrollTrigger animated editorial grid               │
├─────────────────────────────────────────────────────────────┤
│ 6. THE PROCESS / ATELIER                                    │
│    Behind-the-scenes horizontal scroll panel                │
├─────────────────────────────────────────────────────────────┤
│ 7. TESTIMONIALS / PRESS                                     │
│    Continuous marquee animation                             │
├─────────────────────────────────────────────────────────────┤
│ 8. CTA SECTION — "Book Your Fitting"                        │
│    Closing invitation -> redirects to manager's WhatsApp    │
├─────────────────────────────────────────────────────────────┤
│ 9. FOOTER                                                   │
│    Brand logo, quick links, socials, copyright              │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Build Roadmap

1. **Phase 1: Project Cleanup & Styling Setup**
   - Delete `tailwind.config.js` (using Tailwind CSS v4 in `app/globals.css`).
   - Setup global CSS variables for dynamic fonts (`--font-brand`, `--font-heading`, `--font-body`) and colors.
   - Clean up outdated components and merge CSS files.

2. **Phase 2: Dynamic Content & Font Service Layer**
   - Create `lib/content/types.ts`, `lib/content/defaults.ts`, `lib/content/service.ts`, and `lib/content/font-loader.ts`.
   - Setup resolution logic: Try API -> Fallback to static defaults (Brand name fallback: "Ti Stiches" -> "cimessinvest", WhatsApp fallback: "0000000").

3. **Phase 3: Core Layout & Navigation**
   - Build `BrandLogo` component using fixed-size decorative brand font.
   - Build `Navbar` and `Footer` responding to dynamic `SiteConfig`.

4. **Phase 4: Landing Page Sections**
   - Implement `HeroSection`, `BrandStatement`, `DesignerStory`, `FeaturedGrid`, `ProcessReel`, `Testimonials`, and `CTAButton`.

5. **Phase 5: GSAP ScrollTrigger Integration**
   - Attach smooth scroll-driven animations, text reveals, and bento grid parallax.

6. **Phase 6: Collections & Detail Pages**
   - Build `/collections` and `/collections/[slug]` routes.

7. **Phase 7: Auth Flow (Login & Register)**
   - Build `/login` and `/register` with inputs (`Name`, `Phone`, `Email`, `Company Name`, `Brand Logo Name`).

8. **Phase 8: Polish & Verification**
   - Verify zero-backend fallback, dynamic font switching, and responsive design.


   
