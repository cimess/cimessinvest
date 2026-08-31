import { TestimonialItem } from "@/app/lib/content/types";

export default function Testimonials({ items }: { items: TestimonialItem[] }) {
  return (
    <section className="py-20 bg-[var(--color-bg,#F5F0EB)] overflow-hidden border-t border-b border-[#E0D5C9]/40">
      <div className="flex w-max animate-marquee space-x-12">
        {[...items, ...items].map((item, idx) => (
          <div
            key={idx}
            className="w-[320px] sm:w-[420px] bg-white p-8 border border-[#E0D5C9] shadow-sm flex-none"
          >
            <p className="text-sm sm:text-base font-heading italic text-[var(--color-primary,#1A1A1A)] mb-6">
              "{item.quote}"
            </p>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--color-primary,#1A1A1A)]">
                {item.author}
              </h4>
              {item.role && (
                <span className="text-[11px] text-[var(--color-accent,#C9A96E)] font-semibold tracking-wider block mt-1">
                  {item.role}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
