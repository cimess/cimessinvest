import { MetadataRoute } from "next";
import { prisma } from "@/app/lib/prisma/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

function resolveBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL;
  if (envUrl && !envUrl.includes("localhost")) {
    return envUrl.replace(/\/+$/, "");
  }
  return "https://cimessinvest.com";
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = resolveBaseUrl();

  // 1. Static Core Platform Pages (Omit orphaned /store since it redirects to /)
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
  ];

  // 2. Fetch Active Merchants from DB
  let merchantRoutes: MetadataRoute.Sitemap = [];
  try {
    const activeCompanies = await prisma.company.findMany({
      where: {
        status: "ACTIVE",
      },
      select: {
        slug: true,
        updatedAt: true,
      },
    });

    merchantRoutes = activeCompanies.flatMap((company) => [
      {
        url: `${baseUrl}/landing/${company.slug}`,
        lastModified: company.updatedAt,
        changeFrequency: "daily" as const,
        priority: 0.9,
      },
      {
        url: `${baseUrl}/store/${company.slug}`,
        lastModified: company.updatedAt,
        changeFrequency: "daily" as const,
        priority: 0.8,
      },
    ]);
  } catch (error) {
    console.error("[Sitemap] Failed to query active merchants:", error);
  }

  return [...staticRoutes, ...merchantRoutes];
}
