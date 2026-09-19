import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma/prisma";
import { ALL_TEMPLATES } from "@/templates/registry";

/**
 * GET /api/registration/templates
 * Public endpoint used during merchant onboarding to query real-time store & template
 * enablement configured by the SuperAdmin in the database.
 */
export async function GET() {
  try {
    const dbTemplates = await prisma.template
      .findMany({
        select: {
          id: true,
          slug: true,
          name: true,
          industry: true,
          isActive: true,
        },
      })
      .catch(() => []);

    const dbMap = new Map(dbTemplates.map((t) => [t.slug, t.isActive]));

    // Map all registered master templates with their real-time database activation status
    const templates = ALL_TEMPLATES.map((t) => {
      // If found in DB, use its explicit isActive state. Defaults to true if not yet explicitly toggled.
      const isActive = dbMap.has(t.slug) ? Boolean(dbMap.get(t.slug)) : true;
      return {
        id: t.slug,
        slug: t.slug,
        name: t.name,
        industry: t.industry,
        subType: t.subType,
        brandVibe: t.brandVibe,
        version: t.version,
        description: t.description,
        thumbnailUrl: t.thumbnailUrl,
        isActive,
        comingSoon: !isActive,
      };
    });

    // Compute aggregated industry availability
    const industries: Record<
      string,
      { isActive: boolean; comingSoon: boolean; templateSlug: string; name: string }
    > = {
      FASHION_ATELIER: {
        isActive: true,
        comingSoon: false,
        templateSlug: "fashion-store-tailor-v1",
        name: "Fashion & Bespoke Tailor",
      },
      FITNESS_GYM: {
        isActive: true,
        comingSoon: false,
        templateSlug: "gym-store-fitness-v1",
        name: "Fitness & Athletic Gym",
      },
    };

    // Reflect database template status onto corresponding industries
    for (const tpl of templates) {
      if (tpl.industry === "FITNESS_GYM" || tpl.slug.includes("gym")) {
        industries.FITNESS_GYM = {
          isActive: tpl.isActive,
          comingSoon: !tpl.isActive,
          templateSlug: tpl.slug,
          name: "Fitness & Athletic Gym",
        };
      } else if (tpl.industry === "FASHION_ATELIER" || tpl.slug.includes("tailor")) {
        industries.FASHION_ATELIER = {
          isActive: tpl.isActive,
          comingSoon: !tpl.isActive,
          templateSlug: tpl.slug,
          name: "Fashion & Bespoke Tailor",
        };
      }
    }

    return NextResponse.json({
      success: true,
      templates,
      industries,
    });
  } catch (error) {
    console.error("[RegistrationTemplatesAPI] GET error:", error);
    // Safe fallback: allow onboarding with standard default templates
    return NextResponse.json({
      success: true,
      templates: ALL_TEMPLATES.map((t) => ({
        id: t.slug,
        slug: t.slug,
        name: t.name,
        industry: t.industry,
        isActive: true,
        comingSoon: false,
      })),
      industries: {
        FASHION_ATELIER: { isActive: true, comingSoon: false, templateSlug: "fashion-store-tailor-v1", name: "Fashion & Bespoke Tailor" },
        FITNESS_GYM: { isActive: true, comingSoon: false, templateSlug: "gym-store-fitness-v1", name: "Fitness & Athletic Gym" },
      },
    });
  }
}
