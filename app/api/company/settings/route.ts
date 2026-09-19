import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/auth";
import { prisma } from "@/app/lib/prisma/prisma";
import { clearSessionCookies } from "@/app/lib/auth/sessionCookies";
import { ALL_TEMPLATES, getTemplateBySlug } from "@/templates/registry";
import { TemplateDefinition } from "@/templates/types";

/**
 * GET /api/company/settings
 * Retrieves the authenticated merchant's company details:
 * - Active template & available templates for switching
 * - Paystack split payout subaccount (bankInfo)
 * - Brand metadata & subdomain handle
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, companyName: true, phone: true },
    });

    if (!user) {
      const response = NextResponse.json(
        { error: "User not found", code: "USER_NOT_FOUND" },
        { status: 401 }
      );
      clearSessionCookies(response);
      return response;
    }

    // Resolve company via CompanyMember relation or fallback by name
    const member = await prisma.companyMember.findFirst({
      where: { userId: user.id },
      include: { company: true },
    }).catch(() => null);

    let company: any = member?.company;

    if (!company) {
      // Fallback lookup by user.companyName or slug
      company = await prisma.company.findFirst({
        where: {
          OR: [
            { name: user.companyName || "" },
            { members: { some: { userId: user.id } } },
          ],
        },
      }).catch(() => null);
    }

    let activeTemplateSlug = "fashion-store-tailor-v1";
    let siteSetting: any = null;
    let currentGridColumns = 3;

    if (company?.id) {
      siteSetting = await prisma.siteSetting
        .findUnique({ where: { companyId: company.id } })
        .catch(() => null);

      if (company.activeTemplateId) {
        const bySlug = getTemplateBySlug(company.activeTemplateId);
        if (bySlug) {
          activeTemplateSlug = bySlug.slug;
        } else {
          const dbT = await prisma.template
            .findUnique({ where: { id: company.activeTemplateId } })
            .catch(() => null);
          if (dbT?.slug) activeTemplateSlug = dbT.slug;
        }
      } else if (company.industry === "FITNESS_GYM") {
        activeTemplateSlug = "gym-store-fitness-v1";
      }

      const homePage = await prisma.storePage
        .findUnique({
          where: {
            companyId_slug: {
              companyId: company.id,
              slug: "home",
            },
          },
        })
        .catch(() => null);

      if (homePage && Array.isArray(homePage.sections)) {
        const gridBlock = (homePage.sections as any[]).find(
          (s) => s.type === "FeaturedGrid" || s.type === "EquipmentGrid"
        );
        if (gridBlock?.copy?.columns || gridBlock?.layout?.columns) {
          currentGridColumns =
            Number(gridBlock.copy?.columns || gridBlock.layout?.columns) || 3;
        }
      }
    }

    // Determine the active template definition and company brand subType
    const activeTemplate = getTemplateBySlug(activeTemplateSlug);
    let brandSubType = "tailor";

    if (activeTemplate) {
      brandSubType = activeTemplate.subType;
    } else if (company?.industry === "FITNESS_GYM") {
      brandSubType = "fitness";
    } else if (company?.industry === "FASHION_BOUTIQUE") {
      brandSubType = "boutique";
    } else {
      brandSubType = "tailor";
    }

    // STRICT BRAND ISOLATION:
    // A merchant can ONLY see and switch to templates that belong to their exact brand vertical / subType.
    // Even within fashion, fashion house (boutique) cannot switch to tailor, and tailor cannot switch to fashion house!
    const brandTemplates = ALL_TEMPLATES
      .filter((t: TemplateDefinition) => t.subType.toLowerCase() === brandSubType.toLowerCase())
      .map((t: TemplateDefinition) => ({
        slug: t.slug,
        name: t.name,
        industry: t.industry,
        subType: t.subType,
        brandVibe: t.brandVibe,
        description: t.description,
        thumbnailUrl: t.thumbnailUrl,
        theme: t.theme,
        pagesCount: t.pages.length,
        componentsCount: t.components.length,
        gridConstraints: t.components.find((c) => c.gridConfig)?.gridConfig || {
          supportsGrid: true,
          minColumns: 2,
          maxColumns: 4,
          defaultColumns: 3,
          allowedColumns: [2, 3, 4],
        },
      }));

    return NextResponse.json({
      success: true,
      company: company
        ? {
            id: company.id,
            name: company.name,
            slug: company.slug,
            industry: company.industry,
            brandSubType,
            activeTemplateId: company.activeTemplateId,
            activeTemplateSlug,
            bankInfo: company.bankInfo,
            planSelected: company.planSelected,
            trialEndsAt: company.trialEndsAt,
          }
        : null,
      siteSetting,
      brandSubType,
      currentGridColumns,
      availableTemplates: brandTemplates,
    });
  } catch (error) {
    console.error("[CompanySettingsAPI] GET Error:", error);
    return NextResponse.json(
      { error: "Failed to load company settings" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/company/settings
 * Updates company configuration:
 * 1. Bank Payout Subaccount (bankInfo)
 * 2. Active Storefront Template (layout switching)
 * 3. Theme Colors & Gradient (SiteSetting)
 * 4. Grid column constraints (StorePage layout)
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      const response = NextResponse.json(
        { error: "User not found", code: "USER_NOT_FOUND" },
        { status: 401 }
      );
      clearSessionCookies(response);
      return response;
    }

    const member = await prisma.companyMember.findFirst({
      where: { userId: user.id, role: { in: ["OWNER", "MANAGER"] } },
      include: { company: true },
    }).catch(() => null);

    if (!member?.company) {
      return NextResponse.json(
        { error: "No authorized company found for this user account" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const {
      bankInfo,
      templateSlug,
      resetPagesWithTemplate,
      primaryColor,
      accentColor,
      backgroundColor,
      gridColumns,
      brandBio,
      physicalAddress,
      city,
      state,
      country,
      openingHours,
      whatsappNumber,
      companyName,
    } = body;

    const updateData: Record<string, any> = {};

    if (brandBio !== undefined) {
      updateData.brandBio = brandBio?.trim() || null;
    }

    // 1. Update Bank Payout Subaccount
    if (bankInfo !== undefined) {
      if (bankInfo === null) {
        updateData.bankInfo = null;
      } else {
        const { bankName, accountNumber, accountName } = bankInfo;
        if (!bankName || !accountNumber || accountNumber.length !== 10) {
          return NextResponse.json(
            { error: "A valid bank name and 10-digit NUBAN account number are required." },
            { status: 400 }
          );
        }
        updateData.bankInfo = {
          bankName: bankName.trim(),
          accountNumber: accountNumber.trim(),
          accountName: (accountName || "").trim(),
          updatedAt: new Date().toISOString(),
        };
      }
    }

    // Resolve current brand subType for this company
    let currentSubType = "tailor";
    if (member.company.activeTemplateId) {
      const curTpl = getTemplateBySlug(member.company.activeTemplateId);
      if (curTpl) {
        currentSubType = curTpl.subType;
      } else {
        const dbT = await prisma.template
          .findUnique({ where: { id: member.company.activeTemplateId } })
          .catch(() => null);
        if (dbT?.slug) {
          const fromSlug = getTemplateBySlug(dbT.slug);
          if (fromSlug) currentSubType = fromSlug.subType;
        }
      }
    } else if (member.company.industry === "FITNESS_GYM") {
      currentSubType = "fitness";
    } else if (member.company.industry === "FASHION_BOUTIQUE") {
      currentSubType = "boutique";
    } else {
      currentSubType = "tailor";
    }

    // 2. Update Active Template & optionally seed its default pages
    if (templateSlug) {
      const template = getTemplateBySlug(templateSlug);
      if (!template) {
        return NextResponse.json({ error: `Template "${templateSlug}" not recognized.` }, { status: 400 });
      }

      // STRICT BRAND ISOLATION CHECK:
      // Even within the same industry (e.g. fashion), a fashion house (boutique) cannot switch to tailor,
      // and a tailor cannot switch to fashion house or gym!
      if (template.subType.toLowerCase() !== currentSubType.toLowerCase()) {
        return NextResponse.json(
          {
            error: `Brand Vertical Isolation: Template "${template.name}" belongs to the "${template.subType}" brand vertical and cannot be activated for your "${currentSubType}" brand. Template switching is strictly limited to templates designed for your brand.`,
          },
          { status: 403 }
        );
      }

      let activeTemplateId: string | null = null;
      try {
        const dbTemplate = await prisma.template.upsert({
          where: { slug: template.slug },
          update: {
            name: template.name,
            industry: template.industry as any,
          },
          create: {
            slug: template.slug,
            name: template.name,
            industry: template.industry as any,
            brandVibe: template.brandVibe,
            version: template.version,
            isActive: true,
          },
        });
        activeTemplateId = dbTemplate.id;
      } catch (e) {
        console.warn("Could not upsert template record in DB:", e);
      }

      if (activeTemplateId) {
        updateData.activeTemplateId = activeTemplateId;
      }
      updateData.industry = template.industry as any;

      // Update SiteSetting colors to match new template theme defaults if not custom overridden
      await prisma.siteSetting.upsert({
        where: { companyId: member.company.id },
        update: {
          primaryColor: primaryColor || template.theme.primary,
          accentColor: accentColor || template.theme.accent,
          backgroundColor: backgroundColor || template.theme.background,
        },
        create: {
          companyId: member.company.id,
          primaryColor: primaryColor || template.theme.primary,
          accentColor: accentColor || template.theme.accent,
          backgroundColor: backgroundColor || template.theme.background,
        },
      }).catch((e) => console.warn("Could not update theme colors:", e));

      // Overwrite/sync default store pages if requested
      if (resetPagesWithTemplate) {
        for (const page of template.pages) {
          await prisma.storePage.upsert({
            where: {
              companyId_slug: {
                companyId: member.company.id,
                slug: page.slug,
              },
            },
            update: {
              title: page.title,
              sections: page.sections as any,
              version: page.version,
              isPublished: true,
            },
            create: {
              companyId: member.company.id,
              slug: page.slug,
              title: page.title,
              sections: page.sections as any,
              version: page.version,
              isPublished: true,
            },
          }).catch((e) => console.warn(`Could not sync page ${page.slug}:`, e));
        }
      }
    }

    // Upsert SiteSetting with theme colors and store location/hours
    const siteSettingPayload: Record<string, any> = {};
    if (primaryColor) siteSettingPayload.primaryColor = primaryColor;
    if (accentColor) siteSettingPayload.accentColor = accentColor;
    if (backgroundColor) siteSettingPayload.backgroundColor = backgroundColor;
    if (companyName !== undefined) siteSettingPayload.companyName = companyName?.trim() || null;
    if (whatsappNumber !== undefined) siteSettingPayload.whatsappNumber = whatsappNumber?.trim() || null;
    if (physicalAddress !== undefined) siteSettingPayload.physicalAddress = physicalAddress?.trim() || null;
    if (city !== undefined) siteSettingPayload.city = city?.trim() || null;
    if (state !== undefined) siteSettingPayload.state = state?.trim() || null;
    if (country !== undefined) siteSettingPayload.country = country?.trim() || null;
    if (openingHours !== undefined) siteSettingPayload.openingHours = openingHours?.trim() || null;

    if (Object.keys(siteSettingPayload).length > 0) {
      await prisma.siteSetting.upsert({
        where: { companyId: member.company.id },
        update: siteSettingPayload,
        create: {
          companyId: member.company.id,
          primaryColor: primaryColor || "#1A1A1A",
          accentColor: accentColor || "#C9A96E",
          backgroundColor: backgroundColor || "#F5F0EB",
          ...siteSettingPayload,
        },
      }).catch((e) => console.warn("Could not upsert siteSetting:", e));
    }

    // 3. Update Grid Columns Constraint in StorePage
    if (gridColumns && [2, 3, 4].includes(Number(gridColumns))) {
      try {
        const homePage = await prisma.storePage.findUnique({
          where: {
            companyId_slug: {
              companyId: member.company.id,
              slug: "home",
            },
          },
        });

        if (homePage && Array.isArray(homePage.sections)) {
          const updatedSections = (homePage.sections as any[]).map((sec) => {
            if (sec.type === "FeaturedGrid" || sec.type === "EquipmentGrid") {
              return {
                ...sec,
                copy: {
                  ...sec.copy,
                  columns: Number(gridColumns),
                },
                layout: {
                  ...sec.layout,
                  columns: Number(gridColumns),
                },
              };
            }
            return sec;
          });

          await prisma.storePage.update({
            where: { id: homePage.id },
            data: { sections: updatedSections },
          });
        }
      } catch (e) {
        console.warn("Could not update gridColumns:", e);
      }
    }

    const updatedCompany = Object.keys(updateData).length > 0
      ? await prisma.company.update({
          where: { id: member.company.id },
          data: updateData,
          select: {
            id: true,
            name: true,
            slug: true,
            industry: true,
            activeTemplateId: true,
            bankInfo: true,
          },
        })
      : member.company;

    return NextResponse.json({
      success: true,
      message: "Company settings updated successfully.",
      company: updatedCompany,
    });
  } catch (error) {
    console.error("[CompanySettingsAPI] PATCH Error:", error);
    return NextResponse.json(
      { error: "Failed to update company settings" },
      { status: 500 }
    );
  }
}
