import { Metadata } from "next";
import { TemplateSeoContract } from "@/templates/types";

export interface MerchantSeoData {
  companyName: string;
  slug: string;
  industry: string;
  brandBio?: string | null;
  tailorBioText?: string | null;
  whatsappNumber?: string | null;
  physicalAddress?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  openingHours?: string | null;
  heroImage?: string | null;
  logoImage?: string | null;
  catalogItems?: Array<{
    title: string;
    category?: string | null;
    image?: string | null;
  }>;
}

/**
 * Resolves clean localized location strings with intelligent defaults.
 */
function resolveLocation(merchant: MerchantSeoData) {
  const city = merchant.city?.trim() || "Lagos";
  const state = merchant.state?.trim() || "Lagos State";
  const country = merchant.country?.trim() || "Nigeria";
  const address = merchant.physicalAddress?.trim() || `${city} Commercial District`;
  const hours = merchant.openingHours?.trim() || "Mo-Sa 09:00-18:00";
  return { city, state, country, address, hours };
}

/**
 * Builds rich, dynamic Next.js Metadata grounded in the merchant's real DB details.
 * Optimized for Google SERP queries e.g. "best tailor in nigeria", "gym around lagos".
 */
export function buildStorefrontMetadata(
  merchant: MerchantSeoData,
  seoContract: TemplateSeoContract,
  canonicalUrl?: string
): Metadata {
  const { city, state, country, address, hours } = resolveLocation(merchant);
  const name = merchant.companyName || "Exclusive Merchant";

  // Dynamic Title: Pattern substitution e.g. "Adeleke | Bespoke Tailoring & Native Wear in Lagos, Nigeria"
  const title = seoContract.defaultTitlePattern
    .replace(/{name}/g, name)
    .replace(/{city}/g, city)
    .replace(/{state}/g, state)
    .replace(/{country}/g, country);

  // Dynamic Description: grounded in merchant's real bio, physical workshop/gym location, and WhatsApp contact
  const realBio = merchant.tailorBioText?.trim() || merchant.brandBio?.trim();
  const contactText = merchant.whatsappNumber ? ` WhatsApp: ${merchant.whatsappNumber}.` : "";
  const addressText = address ? ` Located at ${address}, ${city}, ${state}.` : ` Located in ${city}, ${country}.`;
  
  let description = realBio
    ? `${name}: ${realBio}${addressText}${contactText} Open ${hours}.`
    : seoContract.defaultDescriptionPattern
        .replace(/{name}/g, name)
        .replace(/{city}/g, city)
        .replace(/{state}/g, state)
        .replace(/{country}/g, country) + `${addressText}${contactText}`;

  // Ensure description is under 165 chars for high CTR on mobile & desktop Google snippets
  if (description.length > 165) {
    description = description.slice(0, 162).trim() + "...";
  }

  // Merged Target Keywords: Template target keywords + merchant-specific location queries
  const mergedKeywords = Array.from(
    new Set([
      ...seoContract.targetKeywords,
      name.toLowerCase(),
      `${name.toLowerCase()} ${city.toLowerCase()}`,
      `${name.toLowerCase()} ${state.toLowerCase()}`,
      `${seoContract.category.toLowerCase()} ${city.toLowerCase()}`,
      `${seoContract.category.toLowerCase()} in ${country.toLowerCase()}`,
      `best ${seoContract.schemaType === "ExerciseGym" ? "gym" : "tailor"} in ${city.toLowerCase()}`,
      `best ${seoContract.schemaType === "ExerciseGym" ? "fitness centre" : "native wear"} in ${country.toLowerCase()}`,
    ])
  );

  const previewImage = merchant.heroImage || merchant.logoImage || "/images/brand/editorial-hero.jpg";
  const url = canonicalUrl || `https://cimessinvest.com/store/${merchant.slug}`;

  return {
    title,
    description,
    keywords: mergedKeywords,
    authors: [{ name }],
    creator: name,
    publisher: name,
    metadataBase: new URL(process.env.NEXTAUTH_URL || "http://localhost:3000"),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: name,
      locale: "en_NG",
      type: "website",
      images: [
        {
          url: previewImage,
          width: 1200,
          height: 630,
          alt: `${name} — ${seoContract.category}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [previewImage],
      creator: `@${merchant.slug}`,
    },
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

/**
 * Builds Schema.org JSON-LD structured data for Google Rich Results.
 * Supports ClothingStore, ExerciseGym, and LocalBusiness entity schemas.
 */
export function buildStorefrontJsonLd(
  merchant: MerchantSeoData,
  seoContract: TemplateSeoContract,
  storeUrl: string
) {
  const { city, state, country, address, hours } = resolveLocation(merchant);
  const name = merchant.companyName || "Exclusive Merchant";
  const description = merchant.tailorBioText?.trim() || merchant.brandBio?.trim() || seoContract.category;

  const catalogOffers = (merchant.catalogItems || []).slice(0, 8).map((item, index) => ({
    "@type": "Offer",
    position: index + 1,
    itemOffered: {
      "@type": seoContract.schemaType === "ExerciseGym" ? "Service" : "Product",
      name: item.title,
      category: item.category || seoContract.category,
      ...(item.image ? { image: item.image } : {}),
      offers: {
        "@type": "Offer",
        priceCurrency: "NGN",
        price: "Contact For Quote",
        availability: "https://schema.org/InStock",
      },
    },
  }));

  const jsonLd: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": seoContract.schemaType,
    "@id": `${storeUrl}#store`,
    name,
    description,
    url: storeUrl,
    priceRange: seoContract.priceRange || "₦₦₦",
    currenciesAccepted: "NGN",
    paymentAccepted: "Cash, Credit Card, Bank Transfer, Paystack",
    ...(merchant.whatsappNumber ? { telephone: merchant.whatsappNumber } : {}),
    ...(merchant.heroImage ? { image: merchant.heroImage } : {}),
    ...(merchant.logoImage ? { logo: merchant.logoImage } : {}),
    address: {
      "@type": "PostalAddress",
      streetAddress: address,
      addressLocality: city,
      addressRegion: state,
      addressCountry: "NG",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 6.4474,
      longitude: 3.4723,
    },
    openingHours: hours,
  };

  if (catalogOffers.length > 0) {
    jsonLd.hasOfferCatalog = {
      "@type": "OfferCatalog",
      name: seoContract.offerCatalogName,
      itemListElement: catalogOffers,
    };
  }

  return jsonLd;
}
