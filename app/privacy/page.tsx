"use client"

import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { 
  Shield, 
  User, 
  RefreshCcw, 
  Database, 
  Share2, 
  Globe, 
  Clock, 
  Scale, 
  EyeOff, 
  Mail,
  UserCheck,
  Zap,
  Lock
} from 'lucide-react';

/**
 * Reusable layout components for legal pages
 */
const LegalSection = ({ id, title, icon: Icon, children }: { id: string; title: string; icon: any; children: React.ReactNode }) => (
  <section id={id} className="mb-20 scroll-mt-32 group">
    <div className="flex items-center gap-4 mb-6">
      <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 text-emerald-500 group-hover:scale-110 transition-transform duration-500">
        <Icon className="w-6 h-6" />
      </div>
      <h2 className="text-2xl font-bold tracking-tight text-white">{title}</h2>
    </div>
    <div className="space-y-6 text-slate-400 leading-relaxed font-medium text-lg">
      {children}
    </div>
  </section>
);

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a 
    href={href} 
    className="block py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-slate-500 hover:text-white transition-all border-l-2 border-transparent hover:border-emerald-500 pl-4"
  >
    {children}
  </a>
);

export default function PrivacyPage() {
  const containerRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".animate-up", {
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.12,
        ease: "power4.out"
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-emerald-500 selection:text-black">
      
      <main className="max-w-7xl mx-auto px-6 pt-40 pb-24" ref={containerRef}>
        <div className="grid lg:grid-cols-[1fr_300px] gap-20">
          
          {/* Content Column */}
          <div className="max-w-4xl">
            <div className="mb-20 animate-up">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 text-emerald-500 text-[10px] font-black uppercase tracking-[0.3em] mb-8">
                <Shield className="w-3 h-3" /> Privacy & Security Protocols
              </div>
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9]">
                Privacy <br /> <span className="premium-text-gradient">Notice</span>
              </h1>
              <p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">
                Last updated <span className="text-white">April 07, 2026</span>. This notice outlines our commitment to protecting the data of our Merchants and their Customers across the CimessInvest ecosystem.
              </p>
            </div>

            <div className="animate-up">
              <LegalSection id="summary" title="Summary of Key Points" icon={Zap}>
                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    { label: "Merchant Data", text: "We collect information necessary to host your storefront, manage inventory, and process payouts." },
                    { label: "Customer Data", text: "We process shopper data strictly to facilitate orders, shipping, and payments on behalf of our Merchants." },
                    { label: "Third Parties", text: "Data is shared securely with payment gateways (e.g., Paystack) and logistics partners to fulfill orders." },
                    { label: "Your Rights", text: "You maintain control over your personal data, in compliance with the NDPA and global standards." }
                  ].map((item, i) => (
                    <div key={i} className="p-6 glass-panel rounded-3xl border border-white/5 bg-white/[0.01]">
                      <h4 className="text-white text-[10px] font-black uppercase tracking-[0.2em] mb-3">{item.label}</h4>
                      <p className="text-sm text-slate-500 leading-relaxed">{item.text}</p>
                    </div>
                  ))}
                </div>
              </LegalSection>

              <LegalSection id="collection" title="1. Information Collection" icon={Database}>
                <p>We collect personal information that you voluntarily provide when registering a merchant account, placing an order, or contacting support.</p>
                <div className="bg-emerald-500/5 p-6 rounded-3xl border border-emerald-500/10 mb-6">
                  <p className="text-sm text-emerald-400 italic font-bold">
                    Security Protocol: We automatically capture IP addresses, browser types, and approximate geolocation to verify session authenticity and prevent fraudulent transactions.
                  </p>
                </div>
                <ul className="grid grid-cols-2 gap-x-8 gap-y-2">
                  {['Contact Information', 'Shipping Addresses', 'Storefront Details', 'Order Histories', 'Device Metadata'].map(item => (
                    <li key={item} className="flex gap-3 items-center text-sm text-slate-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </LegalSection>

              <LegalSection id="processing" title="2. How We Process Your Data" icon={RefreshCcw}>
                <p>We process your data to maintain platform functionality, facilitate e-commerce operations, and ensure a secure environment for buyers and sellers.</p>
                <div className="space-y-4">
                  {[
                    "Hosting and rendering Merchant storefronts and product catalogs.",
                    "Routing customer payments securely via licensed financial partners.",
                    "Executing fraud prevention algorithms during checkout processes."
                  ].map((text, i) => (
                    <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                      <Lock className="w-4 h-4 text-emerald-500 shrink-0 mt-1" />
                      <span className="text-sm">{text}</span>
                    </div>
                  ))}
                </div>
              </LegalSection>

              <LegalSection id="sharing" title="3. Data Sharing & Disclosure" icon={Share2}>
                <p>We only share data when strictly necessary to provide our e-commerce services:</p>
                <ul className="space-y-6">
                  {[
                    { title: "Merchants & Customers", text: "Customer shipping and order details are shared with the specific Merchant to fulfill the purchase." },
                    { title: "Service Providers", text: "Data is securely transmitted to payment processors (e.g., Paystack) and logistics partners to complete transactions." },
                    { title: "Legal Compliance", text: "We may disclose information to law enforcement to comply with legal obligations or investigate suspected fraud." }
                  ].map((item, i) => (
                    <li key={i}>
                      <h4 className="text-white text-sm font-bold mb-1">{item.title}</h4>
                      <p className="text-sm text-slate-500">{item.text}</p>
                    </li>
                  ))}
                </ul>
              </LegalSection>

              <LegalSection id="tracking" title="4. Tracking & Cookies" icon={Globe}>
                <p>We utilize secure cookies and tracking technologies to maintain user sessions, save shopping cart states, and improve platform performance.</p>
                <div className="p-6 glass-panel rounded-3xl border border-white/5">
                  <p className="text-sm italic">
                    "Merchants may enable third-party tracking (such as Facebook Pixels or Google Analytics) on their individual storefronts to understand their customer traffic."
                  </p>
                </div>
              </LegalSection>

              <LegalSection id="social" title="5. Social Commerce Integrations" icon={UserCheck}>
                <p>If you choose to link your CimessInvest account to social platforms (like WhatsApp, Instagram, or Google), we receive basic profile data to authenticate your account and enable seamless product sharing and social selling features.</p>
              </LegalSection>

              <LegalSection id="retention" title="6. Data Retention" icon={Clock}>
                <p>We retain your information only as long as necessary to fulfill the purposes outlined in this notice, manage active storefronts, and comply with tax, accounting, and legal requirements.</p>
              </LegalSection>

              <LegalSection id="rights" title="7. Your Privacy Rights" icon={Scale}>
                <p>Depending on your location, you have the right to request access to, correction of, or deletion of your personal data. Merchants can manage their data directly from their dashboards, and Customers can contact merchants or our support team for data requests.</p>
              </LegalSection>

              <LegalSection id="contact" title="8. Contact Us" icon={Mail}>
                <p>If you have questions about this Privacy Notice or how we handle your data, please contact us at:</p>
                <div className="p-8 glass-panel rounded-[2.5rem] border border-white/10 bg-emerald-500/[0.02]">
                  <p className="text-white font-bold text-xl uppercase tracking-tighter mb-4">CimessInvest</p>
                  <p className="text-slate-400 text-sm leading-loose">
                    Privacy Compliance Team<br />
                    54, Olude Bustop, Ipaja, Lagos<br />
                    Nigeria<br />
                    <a href="mailto:cimessinvest@gmail.com" className="text-emerald-500 italic hover:text-emerald-400">cimessinvest@gmail.com</a>
                  </p>
                </div>
              </LegalSection>
            </div>
          </div>

          {/* Sidebar Navigation */}
          <aside className="hidden lg:block">
            <div className="sticky top-40 p-10 glass-panel rounded-[3rem] border border-white/5 shadow-2xl">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 mb-8 flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" /> Index
              </h3>
              <nav className="space-y-1">
                <NavLink href="#summary">Key Summary</NavLink>
                <NavLink href="#collection">Collection</NavLink>
                <NavLink href="#processing">Processing</NavLink>
                <NavLink href="#sharing">Data Sharing</NavLink>
                <NavLink href="#tracking">Cookies</NavLink>
                <NavLink href="#social">Social Commerce</NavLink>
                <NavLink href="#retention">Retention</NavLink>
                <NavLink href="#rights">Your Rights</NavLink>
                <NavLink href="#contact">Contact Us</NavLink>
              </nav>

              <div className="mt-12 pt-8 border-t border-white/5">
                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-700">
                   <Shield className="w-3 h-3" /> Secure Platform
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

    </div>
  );
};
