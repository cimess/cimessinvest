"use client";

import Link from "next/link";

interface BrandLogoProps {
  name: string;
  className?: string;
}

export default function BrandLogo({ name, className = "" }: BrandLogoProps) {
  return (
    <Link 
      href="/" 
      className={`inline-block font-brand font-black text-xl sm:text-2xl tracking-[0.25em] uppercase transition-opacity hover:opacity-80 ${className}`}
      style={{ fontFamily: "var(--font-brand)" }}
    >
      {name}
    </Link>
  );
}
