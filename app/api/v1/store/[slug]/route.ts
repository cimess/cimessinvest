import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma/prisma";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { error: "Store slug is required" },
        { status: 400 }
      );
    }

    // 1. Query Active Company with Site Settings
    const company = await prisma.company.findUnique({
      where: { slug: slug.toLowerCase().trim() },
      include: {
        siteSetting: true,
      },
    });

    if (!company) {
      return NextResponse.json(
        { error: "Store not found" },
        { status: 404 }
      );
    }

    if (company.status !== "ACTIVE") {
      return NextResponse.json(
        { 
          error: "Store is currently unavailable", 
          status: company.status 
        },
        { status: 403 }
      );
    }

    // 2. Query Commercial Products for this company
    const dbProducts = await prisma.product.findMany({
      where: {
        companyId: company.id,
        isAvailable: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const siteSetting = company.siteSetting;

    // 3. Fallback to Images table if merchant catalog is still on legacy media
    let products = dbProducts.map((p) => {
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

    if (products.length === 0) {
      // Legacy showcase fallback
      const legacyImages = await prisma.image.findMany({
        where: {
          companyId: company.id,
          OR: [{ placement: "both" }, { placement: "story" }, { placement: null }],
        },
        orderBy: { createdAt: "desc" },
        take: 12,
      });

      if (legacyImages.length > 0) {
        products = legacyImages.map((img, idx) => ({
          id: img.id,
          name: img.title || `Featured Design #${idx + 1}`,
          description: "Handcrafted bespoke tailoring piece.",
          price: 35000,
          priceKobo: 3500000,
          formattedPrice: "₦35,000",
          image: img.url,
          images: [img.url],
          category: img.category || "Bespoke",
          stock: 5,
          available: true,
          attributes: { "Bespoke Fitting": "Available", "Material": "Premium Wool" },
        }));
      }
    }

    // 4. Extract Unique Categories Dynamically
    const rawCategories = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
    const categories = ["All", ...rawCategories];

    // 5. Construct Clean, Unified Mobile & Web Store Contract
    const storeResponse = {
      storeName: siteSetting?.companyName?.trim() || company.name,
      slug: company.slug,
      industry: company.industry,
      avatar: siteSetting?.tailorBioImage || null,
      bio: siteSetting?.tailorBioText?.trim() || company.brandBio?.trim() || "Quality craftsmanship & personalized service.",
      location: [siteSetting?.city, siteSetting?.state].filter(Boolean).join(", ") || "Nigeria",
      physicalAddress: siteSetting?.physicalAddress || null,
      whatsappNumber: siteSetting?.whatsappNumber || null,
      themeColor: siteSetting?.themeColor || siteSetting?.accentColor || "#C9A96E",
      layoutMode: (siteSetting?.layoutMode as "GRID_2X2" | "LIST") || "GRID_2X2",
      categories,
      products,
    };

    return NextResponse.json(storeResponse, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch (error) {
    console.error("Store API Error:", error);
    return NextResponse.json(
      { error: "Internal server error fetching store" },
      { status: 500 }
    );
  }
}
