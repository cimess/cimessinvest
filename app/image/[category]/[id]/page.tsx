import {connection }from "next/server"
import { Metadata } from "next";
import Image from "next/image";
import Navbar from "@/app/components/layout/navbar";
import Footer from "@/app/components/layout/footer";
import { buildWhatsAppItemUrl } from "@/app/lib/utils/whatsapp";
import { prisma } from "@/app/lib/prisma/prisma";

type Props = {
  params: Promise<{ category: string; id: string }>;
  searchParams: Promise<{ img?: string; url?: string }>;
};

// 1. Server-Side Metadata Generator for Social Cards
export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
await connection();

  const settings = await prisma.siteSetting.findFirst();
const user = await prisma.user.findFirst();

  const { category, id } = await params;
  const { img, url } = await searchParams;

  const clothName = `${category.toUpperCase()} Piece #${id}`;
  // Cloudinary URL or local public static fallback
  const imageUrl = img || url || `/bg-img/${category}${id}.jpeg`;


  // Fallback to defaults if DB fails
  const brandName = settings?.companyName || user?.companyName ;
 

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
    title: `${clothName} | ${brandName}`,
    description: `Private fitting inquiry for ${clothName} by ${brandName}.`,
    openGraph: {
      title: `${clothName} | ${brandName}`,
      description: `Check out this exclusive native wear design from ${brandName}.`,
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
export default async function ImagePreviewPage({ params, searchParams }: Props) {
    await connection();
  const { category, id } = await params;
  const { img, url } = await searchParams;


    const settings = await prisma.siteSetting.findFirst();
const user = await prisma.user.findFirst();

  const title = `${category.toUpperCase()} Piece #${id}`;
  // Cloudinary URL or local public static fallback
  const imageUrl = img || url || `/bg-img/${category}${id}.jpg`;

  const pageUrl = `${process.env.NEXT_PUBLIC_SITE_URL || ""}/image/${category}/${id}`;

   const whatsappNumber = settings?.whatsappNumber || user?.phone ||"";

  const whatsappUrl = buildWhatsAppItemUrl({
    phone: whatsappNumber,
    itemTitle: title,
    itemUrl: pageUrl,
  });

  return (
    <main className="min-h-screen bg-[#1A1A1A]">
      <Navbar 
        brandName={settings?.companyName || user?.companyName || ""} 
        whatsappNumber={whatsappNumber} 
        ctaLabel="INQUIRE NOW" 
      />

      <section className="pt-36 pb-24 app-max-width app-x-padding">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Image View Container */}
          <div className="lg:col-span-7 relative group overflow-hidden border border-[#C9A96E]/30 bg-black min-h-[450px] w-full">
            <Image
              src={imageUrl}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
              className="object-cover"
              priority
            />
          </div>

          {/* Details & WhatsApp CTA */}
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

            <div className="pt-4">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 bg-[#C9A96E] text-[#1A1A1A] font-bold text-xs uppercase tracking-[0.2em] rounded hover:bg-[#F5F0EB] transition-colors"
              >
                Inquire via WhatsApp
              </a>
            </div>
          </div>

        </div>
      </section>

      <Footer/>
    </main>
  );
}
