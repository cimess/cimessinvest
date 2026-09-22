"use client"

import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { 
  BookOpen, 
  UserPlus, 
  Link as LinkIcon, 
  CreditCard, 
  Percent, 
  ShoppingBag, 
  Activity, 
  Wallet,
  CheckCircle2,
  Share2
} from 'lucide-react';

/**
 * Reusable layout components for documentation sections
 */
const DocSection = ({ id, title, icon: Icon, children }: { id: string; title: string; icon: any; children: React.ReactNode }) => (
  <section id={id} className="mb-24 scroll-mt-32 group">
    <div className="flex items-center gap-4 mb-8 border-b border-white/5 pb-6">
      <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 text-[#C9A96E] group-hover:scale-110 transition-transform duration-500">
        <Icon className="w-6 h-6" />
      </div>
      <h2 className="text-3xl font-bold tracking-tight text-white">{title}</h2>
    </div>
    <div className="space-y-6 text-slate-400 leading-relaxed font-medium text-lg">
      {children}
    </div>
  </section>
);

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a 
    href={href} 
    className="block py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-slate-500 hover:text-white transition-all border-l-2 border-transparent hover:border-[#C9A96E] pl-4"
  >
    {children}
  </a>
);

export default function DocumentationPage() {
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
    <div className="min-h-screen bg-[#0B0B0E] text-white selection:bg-[#C9A96E] selection:text-black">
      
      {/* Background ambient glow matching your home page */}
      <div className="fixed top-0 inset-x-0 h-[500px] bg-gradient-to-b from-[#C9A96E]/10 via-transparent to-transparent pointer-events-none" />

      <main className="relative max-w-7xl mx-auto px-6 pt-40 pb-24" ref={containerRef}>
        <div className="grid lg:grid-cols-[1fr_300px] gap-20">
          
          {/* Content Column */}
          <div className="max-w-4xl">
            <div className="mb-20 animate-up">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 text-[#C9A96E] text-[10px] font-black uppercase tracking-[0.3em] mb-8">
                <BookOpen className="w-3 h-3" /> Merchant Guide
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 leading-[1.1]">
                Platform <br /> <span className="text-[#C9A96E]">Documentation</span>
              </h1>
              <p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">
                Everything you need to know about setting up your store, sharing your links, and accepting payments seamlessly on CimessInvest.
              </p>
            </div>

            <div className="animate-up">
              
              <DocSection id="registration" title="1. Merchant Registration" icon={UserPlus}>
                <p>Getting started on CimessInvest takes less than 2 minutes. We require only the essentials to get your storefront up and running securely.</p>
                <div className="grid md:grid-cols-2 gap-4 mt-6">
                  <div className="p-6 glass-panel rounded-3xl border border-white/5 bg-white/[0.01]">
                    <h4 className="text-white text-sm font-bold mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#C9A96E]" /> Sign Up
                    </h4>
                    <p className="text-sm text-slate-500">Provide your business name, email, and secure password to create your account.</p>
                  </div>
                  <div className="p-6 glass-panel rounded-3xl border border-white/5 bg-white/[0.01]">
                    <h4 className="text-white text-sm font-bold mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#C9A96E]" /> KYC & Bank Details
                    </h4>
                    <p className="text-sm text-slate-500">Connect your local bank account where your sales payouts will be settled automatically.</p>
                  </div>
                </div>
              </DocSection>

              <DocSection id="products" title="2. Setting Up Your Store" icon={ShoppingBag}>
                <p>Your dashboard is your command center. From here, you can easily add products to your digital storefront.</p>
                <ul className="space-y-4">
                  <li className="flex gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 items-start">
                    <div className="w-6 h-6 rounded-full bg-[#C9A96E]/20 text-[#C9A96E] flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">1</div>
                    <p className="text-sm text-slate-300"><strong className="text-white">Upload Images:</strong> Add high-quality photos of the items you are selling.</p>
                  </li>
                  <li className="flex gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 items-start">
                    <div className="w-6 h-6 rounded-full bg-[#C9A96E]/20 text-[#C9A96E] flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">2</div>
                    <p className="text-sm text-slate-300"><strong className="text-white">Set Pricing:</strong> Enter the price in Naira. Our system handles all calculations automatically.</p>
                  </li>
                  <li className="flex gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 items-start">
                    <div className="w-6 h-6 rounded-full bg-[#C9A96E]/20 text-[#C9A96E] flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">3</div>
                    <p className="text-sm text-slate-300"><strong className="text-white">Publish:</strong> Once saved, the product is immediately visible on your unique storefront link.</p>
                  </li>
                </ul>
              </DocSection>

              <DocSection id="sharing" title="3. Sharing Your Store Link" icon={LinkIcon}>
                <p>CimessInvest is built for social commerce. You don't need customers to download an app; you simply share your unique link with them.</p>
                <div className="bg-[#C9A96E]/5 p-6 rounded-3xl border border-[#C9A96E]/10 mb-6">
                  <p className="text-sm text-[#C9A96E] font-medium flex items-center gap-2 mb-2">
                    <Share2 className="w-4 h-4" /> How to share:
                  </p>
                  <p className="text-sm text-slate-400">
                    In your merchant dashboard, locate your Store URL (e.g., <code className="text-white">cimessinvest.com/store/yourbrand</code>). Click <strong>"Copy Link"</strong>. You can paste this link in your Instagram bio, WhatsApp status, or send it directly to customers in DMs.
                  </p>
                </div>
              </DocSection>

              <DocSection id="checkout" title="4. The Customer Transaction Flow" icon={Activity}>
                <p>When a customer clicks your link, here is exactly what happens:</p>
                <div className="relative border-l border-white/10 ml-4 pl-8 space-y-8 py-4">
                  
                  <div className="relative">
                    <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full bg-[#0B0B0E] border-2 border-[#C9A96E]" />
                    <h4 className="text-white font-bold text-lg mb-2">1. Browsing & Cart</h4>
                    <p className="text-sm text-slate-400">The customer views your beautiful storefront, adds items to their cart, and enters their shipping details.</p>
                  </div>

                  <div className="relative">
                    <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full bg-[#0B0B0E] border-2 border-[#C9A96E]" />
                    <h4 className="text-white font-bold text-lg mb-2">2. Secure Checkout</h4>
                    <p className="text-sm text-slate-400">The customer proceeds to checkout. They are presented with a secure payment portal powered by Paystack.</p>
                  </div>

                  <div className="relative">
                    <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full bg-[#0B0B0E] border-2 border-[#C9A96E]" />
                    <h4 className="text-white font-bold text-lg mb-2">3. Instant Notification</h4>
                    <p className="text-sm text-slate-400">Once payment is successful, the customer gets a receipt, and you get an instant notification on your dashboard with their order and delivery details.</p>
                  </div>
                  
                </div>
              </DocSection>

              <DocSection id="account-numbers" title="5. Payments & Account Numbers" icon={Wallet}>
                <p>We provide flexible ways for your customers to pay you, ensuring you never miss a sale.</p>
                <ul className="space-y-6">
                  <li>
                    <h4 className="text-white text-sm font-bold mb-1 flex items-center gap-2">Card Payments</h4>
                    <p className="text-sm text-slate-500">Customers can pay securely using their Visa, Mastercard, or Verve cards directly on your storefront.</p>
                  </li>
                  <li>
                    <h4 className="text-white text-sm font-bold mb-1 flex items-center gap-2">Virtual Account Numbers (Bank Transfer)</h4>
                    <p className="text-sm text-slate-500">During checkout, the system can generate a unique, temporary virtual bank account number. The customer simply opens their banking app, transfers the exact amount to that account number, and our system automatically confirms the payment and approves the order.</p>
                  </li>
                </ul>
              </DocSection>

              <DocSection id="fees" title="6. Platform Fees & Payouts" icon={Percent}>
                <p>We believe in transparent pricing. You only pay when you make a sale.</p>
                
                <div className="grid md:grid-cols-2 gap-6 my-6">
                  <div className="p-8 glass-panel rounded-[2.5rem] border border-white/5 bg-white/[0.01]">
                    <h3 className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-2">Transaction Fee</h3>
                    <div className="text-4xl font-black text-white mb-4">X.X% <span className="text-sm text-slate-500 font-normal">/ sale</span></div>
                    <p className="text-sm text-slate-500">Deducted automatically from the total transaction amount. Covers secure payment processing and platform maintenance.</p>
                  </div>
                  
                  <div className="p-8 glass-panel rounded-[2.5rem] border border-[#C9A96E]/20 bg-[#C9A96E]/[0.02]">
                    <h3 className="text-[#C9A96E] text-sm font-bold uppercase tracking-widest mb-2">Settlement</h3>
                    <div className="text-3xl font-black text-white mb-4">Next Day</div>
                    <p className="text-sm text-slate-400">Funds are automatically remitted to the local bank account you provided during registration (T+1 settlement).</p>
                  </div>
                </div>
                <p className="text-xs text-slate-500 italic">* Note: Fees are subject to change based on standard Paystack payment processing rates and regional taxes.</p>
              </DocSection>

            </div>
          </div>

          {/* Sidebar Navigation */}
          <aside className="hidden lg:block">
            <div className="sticky top-40 p-10 glass-panel rounded-[3rem] border border-white/5 shadow-2xl">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C9A96E] mb-8 flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-[#C9A96E] shadow-[0_0_8px_#C9A96E]" /> Index
              </h3>
              <nav className="space-y-1">
                <NavLink href="#registration">1. Registration</NavLink>
                <NavLink href="#products">2. Setting Up Store</NavLink>
                <NavLink href="#sharing">3. Sharing Links</NavLink>
                <NavLink href="#checkout">4. Transaction Flow</NavLink>
                <NavLink href="#account-numbers">5. Account Numbers</NavLink>
                <NavLink href="#fees">6. Platform Fees</NavLink>
              </nav>

              <div className="mt-12 pt-8 border-t border-white/5">
                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-500">
                   <BookOpen className="w-3 h-3" /> User Manual
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

    </div>
  );
};
