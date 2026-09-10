import { getCollectionsItems, getSiteConfig } from "@/app/lib/content/service";
import Navbar from "@/app/components/layout/navbar";
import Footer from "@/app/components/layout/footer";
import CollectionCatalog from "@/app/components/collections/collectionCatalog";
import { prisma } from "@/app/lib/prisma/prisma";
import { Lock } from "lucide-react";

export const revalidate = 0;

export default async function CollectionsPage() {
  // Check owner subscription status
  const userOwner = await prisma.user.findFirst({ where: { role: { not: "SUPERADMIN" } } }).catch(() => null);

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

  const [config, collectionsData] = await Promise.all([
    getSiteConfig(),
    getCollectionsItems({ limit: 24 }),
  ]);

  return (
    <main className="min-h-screen bg-[#141414] text-[#F5F0EB]">
      <Navbar
        brandName={config.brandName}
        whatsappNumber={config.whatsappNumber}
        ctaLabel={config.ctaLabel}
      />

      {/* Header Banner */}
      <section className="pt-36 pb-20 bg-[#1A1A1A] text-[#F5F0EB] text-center border-b border-[#C9A96E]/20">
        <div className="app-max-width app-x-padding max-w-3xl mx-auto">
          <span className="text-xs uppercase tracking-[0.35em] text-[#C9A96E] font-bold block mb-4">
            The Bespoke Archive
          </span>
          <h1 className="text-4xl sm:text-6xl font-heading mb-6 tracking-wide">
            Native & Modern Collections
          </h1>
          <p className="text-sm sm:text-base text-[#E0D5C9]/80 font-light leading-relaxed">
            Explore handcrafted Nigerian ceremonial attires—Agbada, Senator suits, Kaftans—and contemporary urban streetwear designed for nobility and distinction.
          </p>
        </div>
      </section>

      {/* Interactive Catalog Section */}
      <section className="py-20 app-max-width app-x-padding">
        <CollectionCatalog
          items={collectionsData.items}
          initialNextCursor={collectionsData.nextCursor}
          initialHasMore={collectionsData.hasMore}
          whatsappNumber={config.whatsappNumber}
          brandName={config.brandName}
        />
      </section>

      <Footer />
    </main>
  );
}
