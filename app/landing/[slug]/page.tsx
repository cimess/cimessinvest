import { notFound } from "next/navigation";
import { Metadata } from "next";
import { prisma } from "@/app/lib/prisma/prisma";
import { bufferCompanyVisit } from "@/app/api/workers/trafficWorker";
import { resolveTemplateForCompany, resolveStorefrontComponent } from "@/templates/resolver";
import { StorefrontSlots } from "@/templates/types";
import { buildStorefrontMetadata, buildStorefrontJsonLd, MerchantSeoData } from "@/app/lib/seo/storefrontSeo";
import { isImageUrl } from "@/app/lib/utils/media";

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60; // 60-second ISR cache

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const company = await prisma.company.findUnique({
    where: { slug: slug.toLowerCase().trim() },
    include: { siteSetting: true },
  }).catch(() => null);

  if (!company || company.status !== "ACTIVE") {
    return {
      title: "Store Not Found | Cimessinvest",
      description: "The requested brand storefront could not be located.",
    };
  }

  const activeTemplate = resolveTemplateForCompany(company);
  const siteSetting = company.siteSetting;

  const previewImage = await prisma.image.findFirst({
    where: {
      companyId: company.id,
      OR: [{ placement: "both" }, { placement: "story" }],
    },
    orderBy: { createdAt: "desc" },
    select: { url: true },
  }).catch(() => null);

  const merchantSeo: MerchantSeoData = {
    companyName: siteSetting?.companyName || company.name,
    slug: company.slug,
    industry: company.industry,
    brandBio: company.brandBio,
    tailorBioText: siteSetting?.tailorBioText,
    whatsappNumber: siteSetting?.whatsappNumber,
    physicalAddress: siteSetting?.physicalAddress,
    city: siteSetting?.city,
    state: siteSetting?.state,
    country: siteSetting?.country,
    openingHours: siteSetting?.openingHours,
    heroImage: previewImage?.url || siteSetting?.tailorBioImage,
    logoImage: siteSetting?.tailorBioImage,
  };

  const baseUrl = process.env.NEXTAUTH_URL || "https://cimessinvest.com";
  return buildStorefrontMetadata(merchantSeo, activeTemplate.seo, baseUrl);
}

export default async function MerchantLandingPage({ params }: Props) {
  const { slug } = await params;

  // 1. Fetch Company & Site Settings
  const company = await prisma.company.findUnique({
    where: { slug: slug.toLowerCase().trim() },
    include: { siteSetting: true },
  }).catch(() => null);

  if (!company) {
    notFound();
  }

  if (company.status === "SUSPENDED") {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex flex-col items-center justify-center p-6 text-center font-body text-[#F5F0EB]">
        <div className="max-w-md w-full bg-black/40 rounded-3xl border border-amber-500/30 p-8 shadow-2xl space-y-4">
          <h1 className="text-xl font-bold text-amber-400 font-brand">Atelier Showcase Inactive</h1>
          <p className="text-xs text-zinc-400 leading-relaxed">
            This merchant showcase is temporarily offline. If you are the owner, please log in to your merchant portal.
          </p>
        </div>
      </div>
    );
  }

  // Record visit asynchronously (zero DB lock contention)
  bufferCompanyVisit(company.id).catch(() => null);

  // 2. Resolve Active Template and Component
  const activeTemplate = resolveTemplateForCompany(company);
  const StorefrontComponent = resolveStorefrontComponent(activeTemplate.slug);

  // 3. Fetch Custom Images / Showcase Collections from DB
  const collectionsFromDb = await prisma.image.findMany({
    where: {
      companyId: company.id,
      OR: [{ placement: "both" }, { placement: "story" }, { placement: null }],
    },
    orderBy: { createdAt: "desc" },
    take: 8,
  }).catch(() => []);

  const formattedCustomProducts = collectionsFromDb.map((item) => ({
    id: item.id,
    title: item.title || "Custom Piece",
    category: item.category || "Native",
    group: item.group || "Native",
    image: item.url,
  }));

  const siteSetting = company.siteSetting;

  // 4. Assemble Slotted Props for Template (enforce strictly video for hero)
  const rawHeroVideo = siteSetting?.heroVideoUrl?.trim();
  const safeHeroVideoUrl = rawHeroVideo && !isImageUrl(rawHeroVideo) ? rawHeroVideo : undefined;

  const slots: StorefrontSlots = {
    brandName: siteSetting?.companyName?.trim() || company.name,
    whatsappNumber: siteSetting?.whatsappNumber?.trim() || undefined,
    heroVideoUrl: safeHeroVideoUrl,
    heroGridImages: siteSetting?.heroGridImages?.filter((img: string) => img && img.trim() !== "").length
      ? siteSetting.heroGridImages
      : undefined,
    bioImage: siteSetting?.tailorBioImage?.trim() || undefined,
    bioText: siteSetting?.tailorBioText?.trim() || company.brandBio || undefined,
    rawMaterialImages: siteSetting?.rawMaterialImages?.filter((img: string) => img && img.trim() !== "").length
      ? siteSetting.rawMaterialImages
      : undefined,
    customProducts: formattedCustomProducts.length > 0 ? formattedCustomProducts : undefined,
    showDefaultImages: siteSetting?.showDefaultImages,
    appendDefaults: siteSetting?.appendDefaults,
    removeAllDefaults: siteSetting?.removeAllDefaults,
    colors: siteSetting?.primaryColor
      ? {
          primary: siteSetting.primaryColor,
          accent: siteSetting.accentColor || undefined,
          background: siteSetting.backgroundColor || undefined,
        }
      : undefined,
    homeUrl: "/",
    storeUrl: "/store",
  };

  return <StorefrontComponent slots={slots} />;
}
