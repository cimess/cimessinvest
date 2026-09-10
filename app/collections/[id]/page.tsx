import { Metadata } from "next";
import { getSiteConfig } from "@/app/lib/content/service";
import Navbar from "@/app/components/layout/navbar";
import Footer from "@/app/components/layout/footer";
import { buildWhatsAppItemUrl } from "@/app/lib/utils/whatsapp";

type Props = {
  params: Promise<{ category: string; id: string }>;
};

// 1. Next.js Server-Side Metadata Generator for WhatsApp Preview Cards
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, id } = await params;
  const config = await getSiteConfig();

  // In production, fetch cloth object from backend database or fallback image
  const clothName = `${category.toUpperCase()} Piece #${id}`;
  const imageUrl = `/bg-img/native1.jpg`; // Cloudinary URL or public asset

  return {
    title: `${clothName} | ${config.brandName}`,
    description: `Private fitting inquiry for ${clothName} by ${config.brandName}.`,
    openGraph: {
      title: `${clothName} | ${config.brandName}`,
      description: `Check out this exclusive native wear design from ${config.brandName}.`,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: clothName,
        },
      ],
    },
  };
}

// 2. High-Resolution Design Preview Page
export default async function ImagePreviewPage({ params }: Props) {
  const { category, id } = await params;
  const config = await getSiteConfig();

  const title = `${category.toUpperCase()} Piece #${id}`;
  const imageUrl = `/bg-img/native1.jpg`;
  const pageUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://cimessinvest.com"}/image/${category}/${id}`;

  const whatsappUrl = buildWhatsAppItemUrl({
    phone: config.whatsappNumber,
    itemTitle: title,
    itemUrl: pageUrl,
  });

  return (
    <main className="min-h-screen bg-[#1A1A1A] text-[#F5F0EB]">
      <Navbar brandName={config.brandName} whatsappNumber={config.whatsappNumber} ctaLabel={config.ctaLabel} />

      <section className="pt-32 pb-24 app-max-width app-x-padding">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* High-Resolution Image View */}
          <div className="lg:col-span-7 relative group overflow-hidden border border-[#C9A96E]/30 bg-black">
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-auto max-h-[750px] object-contain mx-auto"
            />
          </div>

          {/* Piece Details & Action Buttons */}
          <div className="lg:col-span-5 flex flex-col space-y-6">
            <span className="text-xs uppercase tracking-[0.3em] text-[#C9A96E] font-semibold">
              Bespoke {category}
            </span>

            <h1 className="text-3xl sm:text-5xl font-heading text-[#F5F0EB]">
              {title}
            </h1>

            <p className="text-sm sm:text-base text-[#E0D5C9] font-light leading-relaxed">
              Hand-tailored West African native garment crafted with premium wool and handloomed embroidery accents. Available for private custom fitting appointments.
            </p>

            <div className="pt-6 space-y-4">
              {/* WhatsApp Inquiry Button */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 text-center text-xs font-bold tracking-[0.25em] uppercase bg-[#C9A96E] text-[#1A1A1A] hover:bg-[#F5F0EB] transition-colors block"
              >
                Inquire & Book Fitting
              </a>

              {/* Download Image Button */}
              <a
                href={imageUrl}
                download={`${title}.jpg`}
                className="w-full py-4 text-center text-xs font-bold tracking-[0.25em] uppercase bg-transparent text-[#F5F0EB] border border-white/20 hover:border-[#C9A96E] hover:text-[#C9A96E] transition-colors block"
              >
                Download Design Image
              </a>
            </div>
          </div>

        </div>
      </section>

      <Footer />
    </main>
  );
}
