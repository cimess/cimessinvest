"use client";

import { Shield, Target, Flame } from "lucide-react";

export interface GymBrandStatementProps {
  id?: string;
  copy?: {
    title?: string;
    statement?: string;
    subtitle?: string;
  };
}

export default function GymBrandStatement({ copy }: GymBrandStatementProps) {
  const title = copy?.title || "THE IRONCORE STANDARD";
  const statement =
    copy?.statement ||
    "We do not sell casual workouts. We build discipline, functional power, and peak physical longevity.";
  const subtitle =
    copy?.subtitle ||
    "World-class biomechanics, Olympic barbells, and science-backed conditioning.";

  return (
    <section className="py-20 sm:py-28 bg-[#111114] text-[#F4F4F5] border-y border-zinc-800/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <span className="text-xs uppercase tracking-[0.35em] text-[var(--color-accent,#CCFF00)] font-bold block">
          {title}
        </span>

        <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight max-w-4xl mx-auto leading-snug">
          &ldquo;{statement}&rdquo;
        </h2>

        <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto font-light leading-relaxed">
          {subtitle}
        </p>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 max-w-4xl mx-auto">
          <div className="p-6 bg-[#18181D] rounded-xl border border-zinc-800/80 text-left space-y-2">
            <Shield className="w-6 h-6 text-[var(--color-accent,#CCFF00)]" />
            <h4 className="font-bold text-sm uppercase tracking-wider text-white">Elite Equipment</h4>
            <p className="text-xs text-zinc-400 font-light">
              Calibrated plates, competition power racks, and precision turf sleds.
            </p>
          </div>

          <div className="p-6 bg-[#18181D] rounded-xl border border-zinc-800/80 text-left space-y-2">
            <Target className="w-6 h-6 text-[var(--color-accent,#CCFF00)]" />
            <h4 className="font-bold text-sm uppercase tracking-wider text-white">Data-Driven Coaching</h4>
            <p className="text-xs text-zinc-400 font-light">
              Heart rate zones, VO2 max metrics, and progressive overload tracking.
            </p>
          </div>

          <div className="p-6 bg-[#18181D] rounded-xl border border-zinc-800/80 text-left space-y-2">
            <Flame className="w-6 h-6 text-[var(--color-accent,#CCFF00)]" />
            <h4 className="font-bold text-sm uppercase tracking-wider text-white">Relentless Community</h4>
            <p className="text-xs text-zinc-400 font-light">
              Surround yourself with athletes and high achievers who push your baseline.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
