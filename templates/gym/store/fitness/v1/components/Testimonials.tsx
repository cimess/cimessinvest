"use client";

import { Quote, Star } from "lucide-react";

export interface GymTestimonialsProps {
  id?: string;
  copy?: {
    headline?: string;
  };
}

const DEFAULT_GYM_REVIEWS = [
  {
    id: "review-1",
    author: "Captain Tunde B.",
    role: "Marathon Runner & Executive",
    quote:
      "Joining transformed not just my deadlift numbers but my daily mental stamina. The coaching precision here is leagues ahead of typical commercial gyms.",
    rating: 5,
  },
  {
    id: "review-2",
    author: "Zainab A.",
    role: "Competitive Cross-Athlete",
    quote:
      "The Olympic lifting platforms and supportive community gave me the confidence to compete regionally. Hands down the highest quality facility in the state.",
    rating: 5,
  },
  {
    id: "review-3",
    author: "Dr. Femi O.",
    role: "Orthopedic Surgeon",
    quote:
      "As a physician, I care immensely about biomechanical safety. Coach Vance and the staff understand anatomy, load management, and joint longevity better than anyone.",
    rating: 5,
  },
];

export default function GymTestimonials({ copy }: GymTestimonialsProps) {
  const headline = copy?.headline || "Member Triumphs & Transformations";

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[#0A0A0C] text-[#F4F4F5] border-t border-zinc-800">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs uppercase tracking-[0.3em] text-[var(--color-accent,#CCFF00)] font-bold block">
            Athlete Verified
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white uppercase">
            {headline}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {DEFAULT_GYM_REVIEWS.map((rev) => (
            <div
              key={rev.id}
              className="p-8 rounded-2xl bg-[#141418] border border-zinc-800 flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-1 text-[var(--color-accent,#CCFF00)]">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[var(--color-accent,#CCFF00)]" />
                  ))}
                </div>
                <p className="text-sm text-zinc-300 font-light leading-relaxed italic">
                  &ldquo;{rev.quote}&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-zinc-800/80">
                <h4 className="font-bold text-sm text-white">{rev.author}</h4>
                <p className="text-xs text-zinc-400 font-light">{rev.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
