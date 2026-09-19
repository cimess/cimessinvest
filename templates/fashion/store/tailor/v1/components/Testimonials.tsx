"use client";

import { DEFAULT_TESTIMONIALS } from "@/app/lib/content/defaults";

export interface TestimonialsProps {
  id?: string;
  copy?: {
    headline?: string;
  };
  dataBinding?: {
    items?: Array<{
      id: string;
      quote: string;
      author: string;
      role: string;
    }>;
  };
}

export default function Testimonials({ copy, dataBinding }: TestimonialsProps) {
  const headline = copy?.headline || "Patronage & Acclaim";
  const items = (dataBinding?.items && dataBinding.items.length > 0)
    ? dataBinding.items
    : DEFAULT_TESTIMONIALS;

  return (
    <section className="py-24 sm:py-32 bg-[var(--color-primary,#1A1A1A)] text-[var(--color-bg,#F5F0EB)] overflow-hidden">
      <div className="app-max-width app-x-padding">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-[0.3em] text-[var(--color-accent,#C9A96E)] font-semibold block mb-3">
            Client Words
          </span>
          <h2 className="text-3xl sm:text-5xl font-heading text-[var(--color-bg,#F5F0EB)]">
            {headline}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-neutral-900 border border-neutral-800 p-8 flex flex-col justify-between"
            >
              <p className="text-sm sm:text-base text-[#E0D5C9] font-light italic leading-relaxed mb-8">
                {`"${item.quote}"`}
              </p>
              <div className="border-t border-neutral-800 pt-4">
                <h4 className="font-heading text-sm text-[var(--color-accent,#C9A96E)]">
                  {item.author}
                </h4>
                <span className="text-[10px] uppercase tracking-widest text-neutral-400">
                  {item.role}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
