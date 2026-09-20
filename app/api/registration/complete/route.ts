import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma/prisma";
import { getDefaultTemplateForIndustry } from "@/templates/resolver";
import { getTemplateBySlug } from "@/templates/registry";
import { IndustryType } from "@/templates/types";
import { isReservedSubdomain } from "@/app/lib/constants/subdomains";

/**
 * Helper to generate a URL-safe slug from a string.
 */
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^a-z0-9-]/g, "") // Remove all non-alphanumeric chars except -
    .replace(/--+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start
    .replace(/-+$/, ""); // Trim - from end
}

/**
 * POST /api/registration/complete
 * Finalizes merchant onboarding:
 * 1. Creates Company record with 14-day FREE_TRIAL and selected/default template.
 * 2. Links User to Company as OWNER via CompanyMember.
 * 3. Initializes company SiteSetting.
 * 4. Seeds default StorePage records from template defaults.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, brandName, slug, industry, templateSlug, bankInfo, planSelected, profileImage } = body;

    const resolvedPlan =
      planSelected === "PROFESSIONAL"
        ? "PROFESSIONAL"
        : planSelected === "FREE_TRIAL"
        ? "FREE_TRIAL"
        : "STARTER";
    const resolvedStorage =
      resolvedPlan === "PROFESSIONAL"
        ? 2000
        : resolvedPlan === "FREE_TRIAL"
        ? 100
        : 500;
    const resolvedTraffic = resolvedPlan === "PROFESSIONAL" ? 15000 : 2000;

    if (!email || !brandName) {
      return NextResponse.json(
        { error: "Email and Brand Name are required to complete onboarding." },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();

    // 1. Fetch User (using strict select to prevent querying unmigrated fields)
    const user = await prisma.user.findFirst({
      where: { email: { equals: trimmedEmail, mode: "insensitive" } },
      select: {
        id: true,
        email: true,
        phone: true,
        companyName: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User account not found." }, { status: 404 });
    }

    // 2. Determine Subdomain Slug & Ensure Uniqueness
    let candidateSlug = slugify(slug || brandName);

    if (isReservedSubdomain(brandName) || isReservedSubdomain(candidateSlug)) {
      return NextResponse.json(
        {
          error: `The brand name or subdomain "${brandName}" is already in use. Please choose a different brand name.`,
        },
        { status: 400 }
      );
    }

    if (!candidateSlug || candidateSlug.length < 2) {
      candidateSlug = `shop-${Math.random().toString(36).substring(2, 7)}`;
    }

    let uniqueSlug = candidateSlug;
    let counter = 1;
    while (await prisma.company.findUnique({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${candidateSlug}-${counter}`;
      counter++;
    }

    // 3. Resolve Template (chosen custom template or industry default)
    const industryKey = (industry || "FASHION_ATELIER").toUpperCase() as IndustryType;
    let activeTemplate = templateSlug ? getTemplateBySlug(templateSlug) : null;
    if (!activeTemplate) {
      activeTemplate = getDefaultTemplateForIndustry(industryKey);
    }

    // Look up Template record in DB if it was seeded
    const dbTemplate = await prisma.template
      .findUnique({ where: { slug: activeTemplate.slug } })
      .catch(() => null);

    if (dbTemplate && dbTemplate.isActive === false) {
      return NextResponse.json(
        {
          error: `The ${activeTemplate.name} store is currently coming soon. Please choose an active store to complete setup.`,
          code: "STORE_COMING_SOON",
        },
        { status: 400 }
      );
    }

    // 4. Calculate 14-day Trial Expiration
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14);

    // 5. Create Multi-Tenant Company Entity in DB
    const company = await prisma.company.create({
      data: {
        name: brandName.trim(),
        slug: uniqueSlug,
        industry: industryKey as any,
        status: "ACTIVE",
        planSelected: resolvedPlan,
        subscription_status: "ACTIVE", // Active trial
        trialEndsAt,
        activeTemplateId: dbTemplate?.id || null,
        storageLimit: resolvedStorage,
        storageUsed: 0,
        trafficLimit: resolvedTraffic,
        monthlyVisits: 0,
        bankInfo: bankInfo || null,
      },
    });

    // 6. Link User as CompanyMember with OWNER role
    await prisma.companyMember.upsert({
      where: {
        companyId_userId: {
          companyId: company.id,
          userId: user.id,
        },
      },
      update: {
        role: "OWNER",
        status: "ACTIVE",
      },
      create: {
        companyId: company.id,
        userId: user.id,
        role: "OWNER",
        status: "ACTIVE",
      },
    });

    // 7. Initialize Company SiteSetting with Template Theme Defaults
    await prisma.siteSetting.upsert({
      where: { companyId: company.id },
      update: {
        companyName: company.name,
        whatsappNumber: user.phone,
        primaryColor: activeTemplate.theme.primary,
        accentColor: activeTemplate.theme.accent,
        backgroundColor: activeTemplate.theme.background,
        ...(profileImage ? { tailorBioImage: profileImage } : {}),
      },
      create: {
        companyId: company.id,
        companyName: company.name,
        whatsappNumber: user.phone,
        primaryColor: activeTemplate.theme.primary,
        accentColor: activeTemplate.theme.accent,
        backgroundColor: activeTemplate.theme.background,
        tailorBioImage: profileImage || null,
      },
    });

    // 8. Copy Template Pages into Merchant's StorePage records
    for (const page of activeTemplate.pages) {
      await prisma.storePage.upsert({
        where: {
          companyId_slug: {
            companyId: company.id,
            slug: page.slug,
          },
        },
        update: {
          title: page.title,
          isSystem: page.isSystem,
          version: page.version,
          sections: page.sections as any,
          isPublished: true,
        },
        create: {
          companyId: company.id,
          slug: page.slug,
          title: page.title,
          isSystem: page.isSystem,
          version: page.version,
          sections: page.sections as any,
          isPublished: true,
        },
      });
    }

    // 9. Update transitional fields on User record
    await prisma.user.update({
      where: { id: user.id },
      data: {
        companyName: company.name,
        paymentVerified: true,
        planSelected: resolvedPlan,
        subscription_status: "ACTIVE",
        storageLimit: resolvedStorage,
        trafficLimit: resolvedTraffic,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Onboarding completed successfully. Welcome to your storefront!",
      company: {
        id: company.id,
        name: company.name,
        slug: company.slug,
        industry: company.industry,
        trialEndsAt: company.trialEndsAt?.toISOString(),
      },
      redirectUrl: `/dashboard/${company.id}`,
    });
  } catch (error) {
    console.error("[RegistrationCompleteAPI] Error:", error);
    return NextResponse.json(
      { error: "Failed to complete onboarding. Please try again." },
      { status: 500 }
    );
  }
}
