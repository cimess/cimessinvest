import { getCollectionsContent, getSiteConfig } from "@/app/lib/content/service";
import Navbar from "@/app/components/layout/navbar";
import Footer from "@/app/components/layout/footer";
import Link from "next/link";
import { prisma } from "@/app/lib/prisma/prisma";
import { Lock } from "lucide-react";

export default async function CollectionsPage() {
  // Check owner subscription status
  const userOwner = await prisma.user.findFirst().catch(() => null);

  if (userOwner && userOwner.subscription_status === "INACTIVE") {
    return (
      <main className="min-h-screen bg-[#1A1A1A] text-[#F5F0EB] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-[#242424] border border-[#C9A96E]/30 rounded-xl p-8 shadow-2xl space-y-6">
          <div className="w-16 h-16 rounded-full bg-[#C9A96E]/10 border border-[#C9A96E]/40 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8 text-[#C9A96E]" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#C9A96E] font-semibold block mb-2">
              COLLECTIONS OFFLINE
            </span>
            <h1 className="text-3xl font-heading font-bold text-[#F5F0EB]">Page Not Available</h1>
          </div>
          <p className="text-sm text-[#E0D5C9]/80 font-light leading-relaxed">
            This collection showcase is currently inactive. Please contact the administrator or log into your manager dashboard to activate subscription.
          </p>
          <div className="pt-2 flex flex-col gap-3">
            <a
              href="mailto:support@cimessinvest.com"
              className="w-full py-3 bg-[#C9A96E] text-[#1A1A1A] font-bold text-xs tracking-widest uppercase rounded hover:bg-[#F5F0EB] transition-colors inline-block"
            >
              Contact Admin
            </a>
            <a
              href="/login"
              className="w-full py-3 bg-white/5 border border-white/10 text-[#F5F0EB] font-semibold text-xs tracking-wider uppercase rounded hover:border-[#C9A96E] transition-colors inline-block"
            >
              Manager Dashboard Login
            </a>
          </div>
        </div>
      </main>
    );
  }

  const config = await getSiteConfig();
  const collectionsData = await getCollectionsContent();
  const collections = collectionsData.data;

  return (
    <main className="min-h-screen bg-[#F5F0EB]">
      <Navbar brandName={config.brandName} whatsappNumber={config.whatsappNumber} ctaLabel={config.ctaLabel} />

      {/* Header Banner */}
      <section className="pt-36 pb-20 bg-[#1A1A1A] text-[#F5F0EB] text-center border-b border-[#C9A96E]/20">
        <div className="app-max-width app-x-padding max-w-3xl mx-auto">
          <span className="text-xs uppercase tracking-[0.3em] text-[#C9A96E] font-semibold block mb-4">
            The Complete Portfolio
          </span>
          <h1 className="text-4xl sm:text-6xl font-heading mb-6">
            Native & Ceremonial Collections
          </h1>
          <p className="text-sm sm:text-base text-[#E0D5C9] font-light leading-relaxed">
            Explore our curated selection of bespoke Agbada, sculpted Kaftans, and Executive Senator suits designed for milestones, royalty, and high celebrations.
          </p>
        </div>
      </section>

      {/* Collections Grid */}
      <section className="py-24 app-max-width app-x-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {collections.map((collection) => (
            <div key={collection.slug} className="group bg-white border border-[#E0D5C9] shadow-sm overflow-hidden flex flex-col">
              <div 
                className="w-full h-80 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url(${collection.coverImage})` }}
              />
              <div className="p-8 flex flex-col flex-1">
                <span className="text-[10px] tracking-[0.25em] uppercase text-[#C9A96E] font-bold mb-2">
                  {collection.category}
                </span>
                <h2 className="text-2xl font-heading text-[#1A1A1A] mb-3">
                  {collection.name}
                </h2>
                <p className="text-xs text-[#6B5E54] leading-relaxed mb-6 font-light">
                  {collection.description}
                </p>
                <div className="mt-auto pt-4 border-t border-[#E0D5C9] flex items-center justify-between">
                  <span className="text-xs text-[#1A1A1A] font-semibold uppercase tracking-wider">
                    {collection.images.length} Designs
                  </span>
                  <Link
                    href={`/image/${collection.category.toLowerCase()}/${collection.slug}?img=${encodeURIComponent(collection.coverImage)}`}
                    className="px-4 py-2 text-[11px] font-bold tracking-[0.2em] uppercase bg-[#1A1A1A] text-[#F5F0EB] hover:bg-[#C9A96E] hover:text-[#1A1A1A] transition-colors"
                  >
                    View Lookbook
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer/>
    </main>
  );
}
