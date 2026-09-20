"use client";

import Link from "next/link";

interface BrandLogoProps {
  name: string;
  logoImage?: string | null;
  className?: string;
}

export default function BrandLogo({ name, logoImage, className = "" }: BrandLogoProps) {
  return (
    <Link 
      href="/" 
      className={`inline-flex items-center gap-3 font-brand font-black text-xl sm:text-2xl tracking-[0.25em] uppercase transition-opacity hover:opacity-80 ${className}`}
      style={{ fontFamily: "var(--font-brand)" }}
    >
      {logoImage && (
        <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden border border-[var(--color-accent,#C9A96E)]/60 bg-black/20 shrink-0 inline-block p-0.5 shadow-sm">
          <img
            src={logoImage}
            alt={name}
            className="w-full h-full object-cover rounded-full"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "/bg-img/native10.jpg";
            }}
          />
        </span>
      )}
      <span>{name}</span>
    </Link>
  );
}
