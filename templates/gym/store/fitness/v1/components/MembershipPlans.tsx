"use client";

import { Check, Zap, MessageCircle } from "lucide-react";
import { buildWhatsAppUrl } from "@/app/lib/utils/whatsapp";

export interface GymMembershipPlansProps {
  id?: string;
  copy?: {
    headline?: string;
    subheadline?: string;
  };
  context?: {
    brandName?: string;
    whatsappNumber?: string;
  };
}

const DEFAULT_MEMBERSHIP_TIERS = [
  {
    id: "day-pass",
    name: "Day Access Pass",
    price: "₦10,000",
    period: "single visit",
    description: "Ideal for visiting athletes or experiencing the facility before committing.",
    features: [
      "Full access to open gym floor & turf",
      "Locker room & cold shower facilities",
      "Complimentary electrolyte station",
    ],
    popular: false,
    cta: "Get Day Pass",
  },
  {
    id: "monthly-unlimited",
    name: "Monthly Unlimited",
    price: "₦65,000",
    period: "per month",
    description: "Unlimited access to equipment, group conditioning, and facility amenities.",
    features: [
      "Unlimited 24/7 keycard access",
      "Access to all daily group HIIT & strength classes",
      "Quarterly body composition & VO2 scan",
      "Access to recovery sauna & compression boots",
    ],
    popular: true,
    cta: "Join Monthly",
  },
  {
    id: "elite-performance",
    name: "Elite Performance",
    price: "₦180,000",
    period: "per month",
    description: "Comprehensive 1-on-1 athletic development with dedicated coach oversight.",
    features: [
      "Includes all Monthly Unlimited privileges",
      "12 dedicated 1-on-1 private coaching hours",
      "Custom macronutrient & hydration blueprint",
      "Monthly blood marker & recovery consultations",
    ],
    popular: false,
    cta: "Apply for Elite",
  },
];

export default function GymMembershipPlans({ copy, context }: GymMembershipPlansProps) {
  const headline = copy?.headline || "Membership Access Tiers";
  const subheadline =
    copy?.subheadline ||
    "Transparent pricing. Zero hidden sign-up fees. Unlimited access to greatness.";
  const whatsappNumber = context?.whatsappNumber || "2348000000000";

  return (
    <section id="membership" className="py-24 px-4 sm:px-6 lg:px-8 bg-[#111114] text-[#F4F4F5]">
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs uppercase tracking-[0.3em] text-[var(--color-accent,#CCFF00)] font-bold block">
            Pricing Plans
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white uppercase">
            {headline}
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 font-light leading-relaxed">
            {subheadline}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {DEFAULT_MEMBERSHIP_TIERS.map((tier) => {
            const whatsappUrl = buildWhatsAppUrl(
              whatsappNumber,
              `Hello, I would like to sign up for the "${tier.name}" (${tier.price} ${tier.period}) membership.`
            );

            return (
              <div
                key={tier.id}
                className={`relative rounded-2xl p-8 flex flex-col justify-between transition-all duration-300 ${
                  tier.popular
                    ? "bg-[#18181F] border-2 border-[var(--color-accent,#CCFF00)] shadow-2xl shadow-[var(--color-accent,#CCFF00)]/10 scale-105"
                    : "bg-[#141418] border border-zinc-800 hover:border-zinc-700"
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3.5 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-[var(--color-accent,#CCFF00)] text-black rounded-full text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1 shadow-lg">
                    <Zap className="w-3 h-3" />
                    <span>Most Popular</span>
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-white uppercase">{tier.name}</h3>
                    <p className="text-xs text-zinc-400 mt-1 font-light leading-relaxed">
                      {tier.description}
                    </p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                      {tier.price}
                    </span>
                    <span className="text-xs text-zinc-400">/{tier.period}</span>
                  </div>

                  <ul className="space-y-3 pt-4 border-t border-zinc-800 text-xs text-zinc-300">
                    {tier.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-[var(--color-accent,#CCFF00)] shrink-0 mt-0.5" />
                        <span className="font-light">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-8">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full py-4 text-xs font-bold uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 transition-all duration-300 ${
                      tier.popular
                        ? "bg-[var(--color-accent,#CCFF00)] text-black hover:bg-white shadow-lg"
                        : "bg-white/10 hover:bg-white/20 text-white border border-white/10"
                    }`}
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{tier.cta}</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
