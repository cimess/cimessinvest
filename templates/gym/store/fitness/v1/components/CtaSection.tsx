"use client";

import { MessageCircle, ArrowRight } from "lucide-react";
import { buildWhatsAppUrl } from "@/app/lib/utils/whatsapp";

export interface GymCtaSectionProps {
  id?: string;
  copy?: {
    headline?: string;
    subheadline?: string;
    buttonLabel?: string;
  };
  context?: {
    brandName?: string;
    whatsappNumber?: string;
  };
}

export default function GymCtaSection({ copy, context }: GymCtaSectionProps) {
  const headline = copy?.headline || "Start Your Transformation Today";
  const subheadline =
    copy?.subheadline ||
    "Book your complimentary physical assessment and private facility walkthrough with our head coach. Zero pressure, pure performance.";
  const buttonLabel = copy?.buttonLabel || "Claim Free Pass on WhatsApp";
  const whatsappNumber = context?.whatsappNumber || "2348000000000";

  const whatsappUrl = buildWhatsAppUrl(
    whatsappNumber,
    "Hello Coach, I am ready to book my free assessment and claim my introductory pass."
  );

  return (
    <section className="py-24 sm:py-32 bg-gradient-to-b from-[#111114] to-[#0A0A0C] text-[#F4F4F5] border-t border-zinc-800 text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[var(--color-accent,#CCFF00)]/10 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
        <span className="text-xs uppercase tracking-[0.35em] text-[var(--color-accent,#CCFF00)] font-bold block">
          Take Action
        </span>

        <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white uppercase leading-tight">
          {headline}
        </h2>

        <p className="text-sm sm:text-lg text-zinc-400 font-light max-w-2xl mx-auto leading-relaxed">
          {subheadline}
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-10 py-5 text-xs sm:text-sm font-extrabold tracking-widest uppercase bg-[var(--color-accent,#CCFF00)] text-black hover:bg-white transition-all duration-300 shadow-2xl rounded flex items-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{buttonLabel}</span>
          </a>
        </div>
      </div>
    </section>
  );
}
