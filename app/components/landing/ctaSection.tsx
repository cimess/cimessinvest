"use client";

import { buildWhatsAppUrl } from "@/app/lib/utils/whatsapp";

interface CTASectionProps {
  brandName: string;
  whatsappNumber: string;
  ctaLabel: string;
}

export default function CTASection({ brandName, whatsappNumber, ctaLabel }: CTASectionProps) {
  const whatsappUrl = buildWhatsAppUrl(whatsappNumber, `Hello ${brandName}, I would like to schedule a private fitting appointment.`);

  return (
    <section className="py-32 bg-[var(--color-primary,#1A1A1A)] text-[var(--color-bg,#F5F0EB)] text-center relative overflow-hidden">
      <div className="app-max-width app-x-padding relative z-10 max-w-3xl mx-auto flex flex-col items-center">
        <span className="text-xs uppercase tracking-[0.3em] text-[var(--color-accent,#C9A96E)] font-semibold mb-4">
          Exclusive Tailoring
        </span>

        <h2 className="text-4xl sm:text-6xl font-heading mb-6 text-[var(--color-bg,#F5F0EB)]">
          Begin Your Fitting Experience
        </h2>

        <p className="text-base sm:text-lg text-[var(--color-bg,#F5F0EB)]/80 font-light mb-12 leading-relaxed">
          Connect directly with our atelier management on WhatsApp to discuss bespoke designs, measurements, and fabric options.
        </p>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-10 py-5 text-xs sm:text-sm font-semibold tracking-[0.25em] uppercase bg-[var(--color-accent,#C9A96E)] text-[var(--color-primary,#1A1A1A)] hover:bg-[var(--color-bg,#F5F0EB)] hover:text-[var(--color-primary,#1A1A1A)] transition-all duration-300 shadow-2xl border border-[var(--color-accent,#C9A96E)] cursor-pointer"
        >
          {ctaLabel}
        </a>
      </div>
    </section>
  );
}
