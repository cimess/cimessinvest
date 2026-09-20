import { notFound } from "next/navigation";
import { Metadata } from "next";
import { prisma } from "@/app/lib/prisma/prisma";
import { bufferCompanyVisit } from "@/app/api/workers/trafficWorker";
import StorefrontClient, { StorefrontData, StoreProduct } from "./StorefrontClient";

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
      title: "Store Not Found | Ti Stiches",
      description: "The requested storefront could not be located.",
    };
  }

  const brandName = company.siteSetting?.companyName || company.name;
  const bio = company.siteSetting?.tailorBioText || company.brandBio || "Official store and product catalog.";
  const previewImage = company.siteSetting?.tailorBioImage || undefined;

  return {
    title: `${brandName} — Official Store & Catalog`,
    description: bio,
    openGraph: {
      title: brandName,
      description: bio,
      images: previewImage ? [{ url: previewImage }] : [],
    },
  };
}

export default async function MerchantStorePage({ params }: Props) {
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
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold font-brand text-[#F5F0EB]">Storefront Suspended</h1>
          <p className="text-xs text-[#E0D5C9]/70 leading-relaxed">
            This merchant storefront has been temporarily suspended by platform compliance. 
            If you are the owner of this store, you can submit an appeal for expedited review.
          </p>
          <div className="pt-2">
            <a
              href={`/appeal?store=${company.slug}`}
              className="inline-block px-6 py-2.5 rounded-full text-xs font-semibold text-black bg-[#C9A96E] hover:bg-[#D4B87D] transition-colors"
            >
              Submit an Appeal
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (company.status !== "ACTIVE") {
    notFound();
  }

  // Batched in-memory visit counter (zero DB lock contention)
  bufferCompanyVisit(company.id).catch(() => null);

  // 2. Fetch Commercial Products and Collection Images in parallel
  const [dbProducts, dbImages] = await Promise.all([
    prisma.product.findMany({
      where: {
        companyId: company.id,
        isAvailable: true,
      },
      orderBy: { createdAt: "desc" },
    }).catch(() => []),
    prisma.image.findMany({
      where: {
        companyId: company.id,
        OR: [{ placement: "both" }, { placement: "story" }, { placement: null }],
      },
      orderBy: { createdAt: "desc" },
      take: 24,
    }).catch(() => []),
  ]);

  const siteSetting = company.siteSetting;

  // 3. Format Products and Bespoke Collection Pieces
  const productItems: StoreProduct[] = dbProducts.map((p) => {
    const priceNaira = Math.round(p.priceKobo / 100);
    return {
      id: p.id,
      name: p.title,
      description: p.description || null,
      price: priceNaira,
      priceKobo: p.priceKobo,
      formattedPrice: `₦${priceNaira.toLocaleString("en-NG")}`,
      image: p.images[0] || siteSetting?.tailorBioImage || "/images/placeholder.webp",
      images: p.images.length > 0 ? p.images : (siteSetting?.tailorBioImage ? [siteSetting.tailorBioImage] : []),
      category: p.category || "General",
      stock: p.stock,
      available: p.isAvailable && p.stock !== 0,
      attributes: (p.attributes as Record<string, any>) || null,
    };
  });

  const collectionItems: StoreProduct[] = dbImages.map((img, idx) => {
    const allImgs = [img.url, ...(img.additionalUrls || [])].filter(Boolean);
    const priceNaira = img.priceKobo ? Math.round(img.priceKobo / 100) : 35000;
    return {
      id: img.id,
      name: img.title || `Bespoke Piece #${idx + 1}`,
      description: img.description || "Handcrafted tailored design.",
      price: priceNaira,
      priceKobo: img.priceKobo || 3500000,
      formattedPrice: `₦${priceNaira.toLocaleString("en-NG")}`,
      image: allImgs[0] || "/images/placeholder.webp",
      images: allImgs.length > 0 ? allImgs : ["/images/placeholder.webp"],
      category: img.category || "Bespoke",
      stock: 5,
      available: true,
      attributes: { "Fitting": "Available", "Material": "Premium Fabric" },
    };
  });

  let formattedProducts: StoreProduct[] = [...productItems, ...collectionItems];

  // 4. Extract Category Tabs
  const rawCategories = Array.from(
    new Set(formattedProducts.map((p) => p.category).filter(Boolean))
  );
  const categories = ["All", ...rawCategories];

  // 5. Build Unified Storefront Payload
  const storeData: StorefrontData = {
    storeName: siteSetting?.companyName?.trim() || company.name,
    slug: company.slug,
    industry: company.industry,
    avatar: siteSetting?.tailorBioImage || "/bg-img/native10.jpg",
    bio: siteSetting?.tailorBioText?.trim() || company.brandBio?.trim() || "Quality craftsmanship & personalized service.",
    location: [siteSetting?.city, siteSetting?.state].filter(Boolean).join(", ") || "Lagos, Nigeria",
    physicalAddress: siteSetting?.physicalAddress || null,
    whatsappNumber: siteSetting?.whatsappNumber || null,
    themeColor: siteSetting?.themeColor || siteSetting?.accentColor || "#C9A96E",
    layoutMode: (siteSetting?.layoutMode as "GRID_2X2" | "LIST") || "GRID_2X2",
    categories,
    products: formattedProducts,
  };

  return <StorefrontClient store={storeData} />;
}
