"use client";

import Image from "next/image";
import { Award, CheckCircle2 } from "lucide-react";

export interface GymTrainerStoryProps {
  id?: string;
  copy?: {
    name?: string;
    title?: string;
    bioParagraphs?: string[];
    bioText?: string;
  };
  media?: {
    image?: string;
  };
}

export default function GymTrainerStory({ copy, media }: GymTrainerStoryProps) {
  const name = copy?.name || "Coach Marcus Vance";
  const title = copy?.title || "Head of Human Performance & Strength";
  const image = media?.image || "/bg-img/showcase2.jpeg";

  const paragraphs = copy?.bioParagraphs || (copy?.bioText ? [copy.bioText] : [
    "Former Olympic weightlifting coach with over 15 years developing professional athletes, competitive lifters, and dedicated fitness enthusiasts.",
    "Our methodology combines heavy compound lifts, neuromuscular speed training, and personalized nutritional tracking to guarantee tangible physical evolution."
  ]);

  return (
    <section className="py-24 sm:py-32 bg-[#0A0A0C] text-[#F4F4F5] border-t border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Coach Portrait */}
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden border-2 border-[var(--color-accent,#CCFF00)]/40 bg-zinc-900 shadow-2xl">
              <Image
                src={image}
                alt={name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--color-accent,#CCFF00)] text-black rounded text-[10px] uppercase tracking-wider font-extrabold mb-2">
                  <Award className="w-3.5 h-3.5" />
                  <span>Master Coach</span>
                </div>
                <h4 className="text-xl font-bold text-white">{name}</h4>
                <p className="text-xs text-zinc-300">{title}</p>
              </div>
            </div>
          </div>

          {/* Bio & Credentials */}
          <div className="lg:col-span-7 space-y-6">
            <span className="text-xs uppercase tracking-[0.3em] text-[var(--color-accent,#CCFF00)] font-bold block">
              Coaching Pedigree
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white uppercase leading-tight">
              Science-Backed Programming. Zero Compromises.
            </h2>
            <div className="space-y-4 text-sm sm:text-base text-zinc-300 font-light leading-relaxed">
              {paragraphs.map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>

            <div className="pt-4 border-t border-zinc-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
                <CheckCircle2 className="w-4 h-4 text-[var(--color-accent,#CCFF00)]" />
                <span>CSCS & USAW Level 2 Certified</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
                <CheckCircle2 className="w-4 h-4 text-[var(--color-accent,#CCFF00)]" />
                <span>Over 500+ Member Transformations</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
                <CheckCircle2 className="w-4 h-4 text-[var(--color-accent,#CCFF00)]" />
                <span>Biomechanic Joint Safety Protocols</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
                <CheckCircle2 className="w-4 h-4 text-[var(--color-accent,#CCFF00)]" />
                <span>Custom Nutritional Architecture</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
