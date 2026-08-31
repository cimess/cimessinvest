import Link from "next/link";
import BrandLogo from "../shared/brandLogo";
import { buildWhatsAppUrl } from "@/app/lib/utils/whatsapp";
import { prisma } from "@/app/lib/prisma/prisma";
import {connection} from "next/server"



export default async function Footer() {
  await connection();

const user=await prisma.user.findFirst()

const {phone,companyName,email}=user ||{phone:"",companyName:"",email:""} 


  const whatsappUrl = buildWhatsAppUrl(
    phone,
    `Hello ${companyName}, I am contacting you directly from your website footer.`
  );

  return (
    <footer className="bg-[#1A1A1A] text-[#F5F0EB] border-t border-[#C9A96E]/20 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-16 pb-16 border-b border-white/10">
          
          {/* Column 1: Brand & Atelier Vision */}
          <div className="lg:col-span-5 space-y-6">
            <BrandLogo name={companyName} className="text-[#F5F0EB]" />
            <p className="text-xs sm:text-sm text-[#E0D5C9] font-light leading-relaxed max-w-sm">
              Crafting architectural West African native wear and haute couture garments for royal ceremonial occasions, galas, and milestone moments.
            </p>
            <div className="pt-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-3 text-xs font-bold tracking-[0.2em] uppercase bg-[#C9A96E] text-[#1A1A1A] hover:bg-[#F5F0EB] transition-colors duration-300"
              >
                Inquire via WhatsApp
              </a>
            </div>
          </div>

          {/* Column 2: Collections */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs uppercase tracking-[0.3em] text-[#C9A96E] font-semibold">
              Collections
            </h4>
            <ul className="space-y-3 text-xs tracking-wider uppercase text-[#E0D5C9]">
              <li>
                <Link href="/collections" className="hover:text-[#C9A96E] transition-colors">
                  Agbada Heritage
                </Link>
              </li>
              <li>
                <Link href="/collections" className="hover:text-[#C9A96E] transition-colors">
                  Modern Kaftan
                </Link>
              </li>
              <li>
                <Link href="/collections" className="hover:text-[#C9A96E] transition-colors">
                  Executive Senator
                </Link>
              </li>
              <li>
                <Link href="/collections" className="hover:text-[#C9A96E] transition-colors">
                  Private Couture
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Atelier Services */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs uppercase tracking-[0.3em] text-[#C9A96E] font-semibold">
              Atelier
            </h4>
            <ul className="space-y-3 text-xs tracking-wider uppercase text-[#E0D5C9]">
              <li>
                <Link href="/#process" className="hover:text-[#C9A96E] transition-colors">
                  Bespoke Fitting
                </Link>
              </li>
              <li>
                <Link href="/#process" className="hover:text-[#C9A96E] transition-colors">
                  Fabric Sourcing
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-[#C9A96E] transition-colors">
                  Client Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Direct Contact */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs uppercase tracking-[0.3em] text-[#C9A96E] font-semibold">
              Concierge
            </h4>
            <div className="space-y-2 text-xs text-[#E0D5C9]">
              <p className="font-mono">{phone !== "0000000" ? phone : "Private Line"}</p>
              <p className="lowercase opacity-80">{email}</p>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#6B5E54] tracking-widest uppercase space-y-4 sm:space-y-0">
          <p>© {new Date().getFullYear()} {companyName}. All rights reserved.</p>
          <div className="flex space-x-6">
            <Link href="/" className="hover:text-[#C9A96E]">Privacy Policy</Link>
            <Link href="/" className="hover:text-[#C9A96E]">Terms of Atelier</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
