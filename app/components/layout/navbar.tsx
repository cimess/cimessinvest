"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import BrandLogo from "../shared/brandLogo";
import { buildWhatsAppUrl } from "@/app/lib/utils/whatsapp";

interface NavbarProps {
  brandName: string;
  whatsappNumber: string;
  ctaLabel: string;
}

export default function Navbar({ brandName, whatsappNumber, ctaLabel }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const whatsappUrl = buildWhatsAppUrl(
    whatsappNumber,
    `Hello ${brandName}, I would like to book a private fitting consultation.`
  );

  const handleToggle = (e: React.SyntheticEvent) => {
    e.preventDefault();
    setMobileMenuOpen((prev) => !prev);
  };

  return (
    <header 
      data-lenis-prevent 
      className="fixed top-0 left-0 right-0 z-50 pointer-events-auto bg-[var(--color-bg,#F5F0EB)]/95 backdrop-blur-md border-b border-[#E0D5C9]/40"
    >
      <nav className="app-max-width app-x-padding h-20 flex items-center justify-between relative">
        {/* 1. Touch-Proof Mobile Hamburger Button */}
        <button
          type="button"
          onClick={handleToggle}
          className="md:hidden relative z-50 p-4 -ml-2 text-[var(--color-primary,#1A1A1A)] hover:text-[var(--color-accent,#C9A96E)] focus:outline-none cursor-pointer touch-manipulation select-none"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="w-7 h-7 text-[var(--color-primary,#1A1A1A)] pointer-events-none" />
          ) : (
            <Menu className="w-7 h-7 text-[var(--color-primary,#1A1A1A)] pointer-events-none" />
          )}
        </button>

        {/* 2. Brand Logo (Centered on Mobile, Left-aligned on Desktop) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none md:static md:justify-start md:flex-initial">
          <div className="pointer-events-auto">
            <BrandLogo name={brandName} />
          </div>
        </div>

        {/* 3. Desktop Nav Links */}
        <div className="hidden md:flex items-center space-x-10 text-sm tracking-widest uppercase font-medium text-[var(--color-primary,#1A1A1A)] relative z-10">
          <Link href="/" className="hover:text-[var(--color-accent,#C9A96E)] transition-colors">Home</Link>
          <Link href="/store" className="hover:text-[var(--color-accent,#C9A96E)] transition-colors">Store</Link>
          <Link href="/login" className="hover:text-[var(--color-accent,#C9A96E)] transition-colors">Sign In</Link>
        </div>

        {/* 4. Desktop CTA Button */}
        <div className="hidden md:block relative z-10">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2.5 text-xs font-semibold tracking-widest uppercase bg-[var(--color-primary,#1A1A1A)] text-[var(--color-bg,#F5F0EB)] hover:bg-[var(--color-accent,#C9A96E)] hover:text-[var(--color-primary,#1A1A1A)] transition-all duration-300 rounded-none border border-[var(--color-primary,#1A1A1A)] cursor-pointer"
          >
            {ctaLabel}
          </a>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div 
          data-lenis-prevent
          className="md:hidden relative z-50 bg-[var(--color-bg,#F5F0EB)] border-b border-[#E0D5C9]/40 px-6 py-8 flex flex-col space-y-6 text-center text-sm tracking-widest uppercase text-[var(--color-primary,#1A1A1A)] shadow-2xl"
        >
          <Link 
            href="/" 
            onClick={() => setMobileMenuOpen(false)}
            className="hover:text-[var(--color-accent,#C9A96E)] transition-colors py-2 font-semibold"
          >
            Home
          </Link>
          <Link 
            href="/store" 
            onClick={() => setMobileMenuOpen(false)}
            className="hover:text-[var(--color-accent,#C9A96E)] transition-colors py-2 font-semibold"
          >
            Store
          </Link>
          <Link 
            href="/login" 
            onClick={() => setMobileMenuOpen(false)}
            className="hover:text-[var(--color-accent,#C9A96E)] transition-colors py-2 font-semibold"
          >
            Sign In
          </Link>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 px-6 py-3 text-xs font-semibold tracking-widest uppercase bg-[var(--color-primary,#1A1A1A)] text-[var(--color-bg,#F5F0EB)] hover:bg-[var(--color-accent,#C9A96E)] hover:text-[var(--color-primary,#1A1A1A)] transition-all"
          >
            {ctaLabel}
          </a>
        </div>
      )}
    </header>
  );
}
