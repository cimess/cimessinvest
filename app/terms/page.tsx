"use client"

import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { Shield, ScrollText, AlertTriangle, Scale, UserCheck, ShieldAlert, CreditCard, Ban, Share2, Globe, Database, FileText, HelpCircle, UserPlus, } from 'lucide-react';


const LegalSection = ({ id, title, icon: Icon, children }: { id: string; title: string; icon: any; children: React.ReactNode }) => (
  <div id={id} className="legal-section glass-panel p-8 rounded-3xl mb-8 border border-white/5 hover:border-white/10 transition-colors">
    <div className="flex items-center gap-4 mb-6">
      <div className="p-3 bg-white/5 rounded-2xl">
        <Icon className="w-6 h-6 text-white" strokeWidth={1.5} />
      </div>
      <h2 className="text-2xl font-bold gradient-text">{title}</h2>
    </div>
    <div className="text-slate-400 leading-relaxed space-y-4 text-sm md:text-base">
      {children}
    </div>
  </div>
);

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a
    href={href}
    className="block py-2 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors border-l-2 border-transparent hover:border-white pl-4"
  >
    {children}
  </a>
);

export default function ConditionPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.legal-section', {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out'
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
        <div className="min-h-screen bg-[#0B0B0E] text-[#F5F0EB] font-sans selection:bg-[#C9A96E]/30 selection:text-white pb-24 sm:pb-0">
      {/* Background Ambience Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[340px] sm:w-[700px] h-[340px] sm:h-[500px] bg-gradient-to-b from-[#C9A96E]/15 to-transparent blur-[100px] sm:blur-[140px] rounded-full" />
        <div className="absolute top-[40%] left-[-15%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-[#C9A96E]/5 blur-[120px] sm:blur-[160px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-15%] w-[320px] sm:w-[600px] h-[320px] sm:h-[600px] bg-[#C9A96E]/8 blur-[120px] sm:blur-[180px] rounded-full" />
      </div>

      <main className="max-w-7xl mx-auto px-6 pt-32 pb-24" ref={containerRef}>
        
        <div className="grid lg:grid-cols-[1fr_300px] gap-16">
          {/* Content Column */}
          <div className="space-y-4">
            <div className="mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-6">
                Last updated: September 2026
              </div>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 premium-text-gradient">
                Terms of <br /> Service
              </h1>
              <p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">
                Please read these legal terms carefully before using CimessInvest.
                By accessing our services, you agree to be bound by these conditions.
              </p>
            </div>
            <LegalSection id="platform" title="1. Platform Nature & Services" icon={Globe}>
  <p>
    We are <strong>CimessInvest</strong> ("Company", "we", "us", "our"), a company registered in Nigeria with address at 54, Olude Bustop, Ipaja, Lagos, Nigeria.
  </p>

  <p>
    We operate the website <a href="https://www.cimessinvest.com" target="_blank" rel="noreferrer" className="text-blue-500 underline">https://www.cimessinvest.com</a> (the "Site"), our mobile application software, hosted merchant storefronts, dynamic subdomains, and any related products or software services that link to these legal terms (collectively, the "Services").
  </p>

  <p>
    You can contact us by phone at <strong><a href="tel:+2348089273565">+234 808 927 3565</a></strong>, email at <a href="mailto:cimessinvest@gmail.com" className="hover:text-[#C9A96E] transition-colors">cimessinvest@gmail.com</a>, or by mail to 54, Olude Bustop, Ipaja, Lagos, Nigeria.
  </p>

  <div className="bg-white/[0.03] border border-white/10 p-5 rounded-2xl mt-4">
    <p className="font-bold text-white mb-2 flex items-center gap-2">
      <AlertTriangle className="w-4 h-4 text-emerald-500" />
      CRITICAL DISCLOSURE
    </p>
    <p className="text-xs uppercase tracking-wider leading-relaxed">
      CimessInvest is an e-commerce software and technology platform. We provide software tools that enable independent merchants to create digital storefronts, display product catalogs, and route orders. 
      CimessInvest is NOT a merchant, retailer, manufacturer, payment processor, bank, or logistics courier. 
      All products displayed on hosted merchant storefronts are sold and fulfilled directly by independent third-party vendors. Online payments are processed by licensed third-party payment gateways (including Paystack), and deliveries are fulfilled by independent vendors or third-party logistics providers (including integrated delivery services).
    </p>
  </div>

  <p className="mt-4">
    These Legal Terms constitute a legally binding agreement made between you ("you", whether as a merchant, customer, or general visitor)
    and CimessInvest concerning your access to and use of the Services. By accessing or using the Services,
    you agree that you have read, understood, and agreed to be bound by all of these Legal Terms.
    IF YOU DO NOT AGREE WITH ALL OF THESE LEGAL TERMS, THEN YOU ARE EXPRESSLY PROHIBITED FROM USING THE SERVICES AND MUST DISCONTINUE USE IMMEDIATELY.
  </p>

  <p>
    We reserve the right to modify these Legal Terms from time to time.
    The modified Legal Terms will become effective upon posting on the Site or upon notifying registered users via email at <a href="mailto:cimessinvest@gmail.com" className="hover:text-[#C9A96E] transition-colors">cimessinvest@gmail.com</a>.
    By continuing to use the Services after the effective date of any changes, you agree to be bound by the modified terms.
  </p>

  <p>
    The Services are intended for users who are at least 18 years old. Persons under 18 are not permitted to register as merchants, manage storefronts, or initiate financial transactions through the Services.
  </p>

  <p>
    We recommend that you print or save a copy of these Legal Terms for your records.
  </p>
</LegalSection>

            <LegalSection id="jurisdiction" title="2. Jurisdiction and Regulatory Compliance" icon={Globe}>
  <p>
    The information, software, and tools provided through the Services are not intended for distribution to or use by any person or entity in any jurisdiction or country where such distribution, hosting, or use would be contrary to local laws or regulations, or which would subject us to any mandatory registration or licensing requirements within such jurisdiction.
    Merchants and consumers accessing the Services from outside Nigeria do so on their own initiative and are solely responsible for compliance with their local applicable laws.
  </p>

  <p className="mt-4">
    The Services are operated out of the Federal Republic of Nigeria and are designed to align with applicable Nigerian statutes, including the Nigeria Data Protection Act (NDPA), the Federal Competition and Consumer Protection Act (FCCPA), and relevant e-commerce and guidelines. 
    Merchants and users may not use the Services for any unlawful purpose, including but not limited to the sale of counterfeit, illegal, or regulated goods, processing fraudulent transactions, or committing acts that violate applicable consumer protection, anti-money laundering (AML), or data privacy laws.
  </p>
</LegalSection>

            <LegalSection id="ip" title="3. Intellectual Property Rights" icon={Scale}>
  <h3>Our Intellectual Property</h3>
  <p>
    We are the owner or the licensee of all intellectual property rights in our Services,
    including all source code, databases, application architecture, API protocols, software, website designs, audio, video, text,
    and graphics in the Services (collectively, the "Platform Content"), as well as the trademarks,
    service marks, and logos contained therein (the "Marks").
  </p>
  <p>
    Our Platform Content and Marks are protected by copyright, trademark, and other intellectual property laws in Nigeria and internationally.
  </p>
  <p>
    The Platform Content and Marks are provided in or through the Services <strong>"AS IS"</strong> solely for your internal business operations as a merchant or for your personal, non-commercial use as a consumer.
  </p>

  <h3>Your Use of Our Services</h3>
  <p>
    Subject to your compliance with these Legal Terms, including the <a href="#prohibited" className="text-blue-500 underline">PROHIBITED ACTIVITIES</a> section below,
    we grant you a non-exclusive, non-transferable, revocable license to:
  </p>

  <ul className="list-decimal pl-6 marker:text-gray-500 marker:text-xs space-y-1 my-2">
    <li>access and use the Services to operate your hosted storefront (as a merchant) or to browse and purchase goods (as a customer); and</li>
    <li>download or print a copy of any portion of the Platform Content to which you have properly gained access,</li>
  </ul>

  <p>solely for your authorized internal business or personal checkout purposes.</p>

  <p>
    Except as set out in this section or elsewhere in our Legal Terms, no part of the Services and no Platform Content or Marks
    may be copied, reproduced, aggregated, republished, reverse-engineered, uploaded, posted, publicly displayed, encoded, translated,
    transmitted, distributed, sold, licensed, or otherwise exploited for any unauthorized commercial purpose whatsoever without our express prior written permission.
  </p>

  <p>
    If you wish to make any use of the Services, Platform Content, or Marks other than as set out above, please contact:{" "}
    <a href="mailto:cimessinvest@gmail.com" className="text-blue-500 underline">cimessinvest@gmail.com</a>.
  </p>

  <p>We reserve all rights not expressly granted to you in and to the Services, Platform Content, and Marks.</p>

  <h3>Merchant Content & Brand Intellectual Property</h3>
  <p>
    <strong>Ownership of Your Store Content:</strong> Merchants retain full ownership of all product photos, brand logos, store descriptions, product listings, and registered trademarks ("Merchant Content") uploaded or published to their hosted storefronts.
  </p>

  <p>
    <strong>License to Host and Display:</strong> By uploading Merchant Content to the Services, you grant us a worldwide, non-exclusive, royalty-free, transferable license to host, store, cache, reformat, display, index, transmit, and distribute your Merchant Content solely for the purpose of operating, rendering, optimizing, and promoting your storefront, generating social media previews (such as OpenGraph share cards for WhatsApp and Instagram), and indexing products within our central marketplace search engines.
  </p>

  <p>
    <strong>Merchant Warranties:</strong> You are solely responsible for the Merchant Content you publish. By uploading content, you warrant and represent that:
  </p>

  <ul className="list-decimal pl-6 marker:text-gray-500 marker:text-xs space-y-1 my-2">
    <li>You own or hold all necessary licenses, copyrights, rights, and permissions for all product photography, graphics, brand names, and descriptions uploaded to your store;</li>
    <li>Your Merchant Content does not infringe upon any third-party copyright, trademark, patent, trade secret, or privacy right;</li>
    <li>Your storefront listings do not promote counterfeit, bootleg, or unauthorized replica merchandise.</li>
  </ul>

  <p>
    You agree to indemnify and hold harmless CimessInvest against any third-party claims, losses, or legal expenses resulting from copyright or trademark infringement arising from your Merchant Content.
  </p>

  <h3>Submissions and Feedback</h3>
  <p>
    <strong>Submissions:</strong> By sending us any question, comment, feature request, suggestion, idea, or feedback regarding the Services ("Submissions"), you agree to assign to us all intellectual property rights in such Submissions. We shall own all Submissions and be entitled to their unrestricted implementation and use for any lawful purpose, commercial or otherwise, without acknowledgment or compensation to you.
  </p>

  <h3>Content Removal and Takedowns</h3>
  <p>
    Although we have no obligation to pre-screen Merchant Content, we reserve the right to review, edit, disable, or permanently remove any product listings, Merchant Content, or storefronts at any time without prior notice if we believe such content violates these Legal Terms, infringes upon third-party intellectual property rights, promotes counterfeit goods, or breaches applicable law.
  </p>

  <h3>Copyright Infringement & IP Disputes</h3>
  <p>
    We respect the intellectual property rights of others. If you believe any product listing, photo, or material available on or through the Services infringes upon your copyright or trademark, please immediately refer to the <a href="#copyrightyes" className="text-blue-500 underline">COPYRIGHT INFRINGEMENTS</a> section below.
  </p>
</LegalSection>




<LegalSection id="userreps" title="4. User Representations" icon={UserCheck}>
  <p>
    By accessing or using the Services (whether as a registered merchant, purchasing customer, or general visitor), you represent and warrant that:
  </p>
  <ol className="list-decimal pl-6 marker:text-gray-500 marker:text-xs space-y-2 my-2">
    <li>All registration, account creation, and identity information you submit is true, accurate, current, and complete;</li>
    <li>You will maintain the accuracy of such information and promptly update your account profile and payout settings (including local bank account details for Paystack subaccount settlements) whenever changes occur;</li>
    <li>You have the legal capacity and authority to enter into and comply with these Legal Terms;</li>
    <li>You are at least 18 years of age or possess legal corporate authority to conduct commercial business;</li>
    <li>You will not access or scrape the Services through automated or non-human means, whether via bot, script, crawler, or unauthorized automated tool;</li>
    <li>You will not use the Services for any illegal, fraudulent, or unauthorized purpose, including payment fraud, money laundering, or selling stolen goods;</li>
    <li><strong>If operating as a Merchant:</strong> You possess all necessary legal permissions, business registrations, and rights to offer, sell, and fulfill the products listed on your storefront, and your settlement bank details belong to your registered entity or authorized business representative;</li>
    <li><strong>If purchasing as a Customer:</strong> You are an authorized user of the payment instrument (debit/credit card, bank transfer account, or USSD channel) used during checkout;</li>
    <li>Your use of the Services will not violate any applicable law or regulation in Nigeria (including the NDPA and FCCPA) or internationally.</li>
  </ol>
  <p>
    If you provide any information that is untrue, inaccurate, outdated, or incomplete, or if we suspect fraudulent, deceptive, or unauthorized activity on your storefront or account, we reserve the right to immediately suspend or terminate your account, hold pending payout transfers, remove your storefront, and refuse any current or future use of the Services.
  </p>
</LegalSection>



                       <LegalSection id="userregistration" title="5. User & Merchant Registration" icon={UserPlus}>
              <p>
                You may be required to register an account to use the Services, either as a Merchant to create a storefront or as a Customer to manage orders. You agree to keep your password confidential and are fully responsible for all use of your account and password.
              </p>
              <p>
                <strong>For Merchants:</strong> You must provide accurate business, identity, and bank settlement information (such as your Nigerian bank account details) to facilitate automated payouts via Paystack. We reserve the right to remove, reclaim, or change a storefront subdomain (e.g., yourbrand.cimessinvest.com) if we determine, at our sole discretion, that it infringes on another's trademark, is inappropriate, or is deceptive.
              </p>
              <p>
                You agree to comply with all applicable Nigerian laws and regulations, as well as international laws, in connection with your account, your storefront operations, and your use of the Services.
              </p>
            </LegalSection>

            <LegalSection id="purchases" title="6. Purchases, Payments, and Settlements" icon={CreditCard}>
              <p>
                <strong>Platform Role:</strong> CimessInvest facilitates payments between Customers and independent Merchants using third-party payment processors (such as Paystack). We do not hold funds, nor do we act as the seller of record.
              </p>
              <p>
                <strong>For Customers:</strong> When making a purchase on a Merchant's storefront, you agree to provide current, complete, and accurate payment information. You authorize the billing of your chosen payment method (Bank Transfer, USSD, or Card) for the total order amount. Prices, taxes, and shipping fees are determined entirely by the independent Merchant.
              </p>
              <p>
                <strong>For Merchants (Automated Settlements):</strong> Customer payments are automatically split and routed. Your earnings will be settled into your connected Nigerian bank account, typically within 24 hours, subject to Paystack's settlement schedule and escrow protection protocols. We reserve the right to delay or freeze settlements in cases of suspected fraud, excessive chargebacks, or unresolved customer disputes.
              </p>
              <p>
                We and our payment partners reserve the right to refuse or limit any transaction that appears fraudulent or violates our Acceptable Use Policy.
              </p>
            </LegalSection>

            <LegalSection id="Policy" title="7. Refund and Dispute Policy" icon={FileText}>
              <p>
                <strong>All sales made through Merchant storefronts are strictly between the Customer and the Merchant.</strong> CimessInvest does not manage inventory, fulfill orders, or issue refunds directly. 
              </p>
              <p>
                Customers seeking a refund, return, or exchange must contact the Merchant directly based on the Merchant's individual store policies. However, if a Merchant engages in fraudulent activity or fails to deliver goods, Customers may raise a dispute through the payment processor (e.g., Paystack), which may result in a chargeback or reversal deducted from the Merchant's settlement balance.
              </p>
            </LegalSection>


          <LegalSection id="ProhibitedActivities" title="8. Prohibited Activities" icon={FileText}>
  <p>
    You may not access or use the Services for any purpose other than that for which we make the Services available. As a Merchant or Customer using the CimessInvest platform, you agree not to:
  </p>
  <ul className="list-decimal pl-6 marker:text-gray-500 marker:text-xs space-y-2 my-2">
    <li>
      <strong>Fraud & Scams:</strong> Trick, defraud, or mislead us or other users. You must not use the platform to process unauthorized card transactions, engage in money laundering, or sell stolen goods.
    </li>
    <li>
      <strong>Counterfeits & Restricted Goods:</strong> List, sell, or promote counterfeit items, unauthorized replicas, weapons, illegal drugs, adult content, or any products prohibited by Nigerian law or our payment processor guidelines (e.g., Paystack acceptable use policies).
    </li>
    <li>
      <strong>Platform Abuse:</strong> Systematically retrieve data (scraping) to create databases, reverse-engineer our software, or copy our storefront templates for external commercial use.
    </li>
    <li>
      <strong>Security Circumvention:</strong> Circumvent, disable, or interfere with security-related features of the Services, including attempting to access other users' merchant dashboards or financial data.
    </li>
    <li>
      <strong>Malicious Code:</strong> Upload or transmit viruses, Trojan horses, spyware, or other material that modifies, impairs, disrupts, or interferes with the operation of the Services.
    </li>
    <li>
      <strong>Misrepresentation:</strong> Impersonate another business, brand, or person, or falsely claim affiliation with CimessInvest to provide external investment or financial advice.
    </li>
    <li>
      <strong>Bypassing Checkout:</strong> Use the platform merely as a catalog while intentionally directing customers to pay off-platform in order to bypass platform fees, security checks, or escrow protections (unless utilizing officially supported features).
    </li>
  </ul>
  <p>
    Any use of the Services in violation of the above may result in immediate suspension of your storefront, freezing of payouts, and reporting to relevant financial authorities.
  </p>
</LegalSection>

<LegalSection id="UserGeneratedContributions" title="9. Merchant Content & User Contributions" icon={FileText}>
  <p>
    The Services allow Merchants to create product listings, upload photos, and design storefronts, and may allow Customers to leave reviews or comments (collectively, "Contributions"). When you create or make available any Contributions on the platform, you represent and warrant that:
  </p>
  <ul className="list-decimal pl-6 marker:text-gray-500 marker:text-xs space-y-2 my-2">
    <li>
      The creation, distribution, and display of your Contributions (e.g., product photos, brand logos) do not infringe the copyright, patent, trademark, trade secret, or privacy rights of any third party.
    </li>
    <li>
      You are the creator and owner of, or have the necessary licenses and permissions to use and authorize us to use, your Contributions across the Services.
    </li>
    <li>
      Your Contributions (such as product descriptions and pricing) are not false, inaccurate, deceptive, or misleading to consumers.
    </li>
    <li>
      Your Contributions do not contain obscene, violent, harassing, defamatory, or otherwise objectionable material.
    </li>
    <li>
      Your Contributions do not violate any applicable law, regulation, or consumer protection rule (including the Federal Competition and Consumer Protection Act).
    </li>
  </ul>
</LegalSection>

<LegalSection id="ContributionLicense" title="10. Content License & Hosting Rights" icon={FileText}>
  <p>
    By posting Contributions (such as product images, descriptions, and logos) to your storefront or the Services, you automatically grant us an unrestricted, worldwide, royalty-free, non-exclusive license to host, use, copy, reproduce, store, publicly display, reformat, and distribute such Contributions. 
  </p>
  <p>
    <strong>Purpose of this License:</strong> This license allows us to operate your storefront, generate social media previews (like WhatsApp or Instagram share cards), optimize images for fast loading (e.g., via our CDN), and index your products in our central search and discovery directories.
  </p>
  <p>
    We do not assert ownership over your Contributions. You retain full ownership of all your product imagery, brand trademarks, and intellectual property. You are solely responsible for your Contributions and expressly agree to exonerate us from any legal action regarding your uploaded content.
  </p>
  <p>
    We have the right, in our sole discretion, to (1) re-categorize Contributions to improve platform search, and (2) pre-screen, remove, or disable access to any Contributions at any time if we believe they violate these Legal Terms, without prior notice.
  </p>
</LegalSection>


<LegalSection id="SocialMedia" title="11. Social Commerce & Third-Party Logins" icon={FileText}>
  <p>
    As part of the functionality of the Services, you may link your account with third-party social media or service providers (like Instagram, TikTok, WhatsApp, or Google) (each a "Third-Party Account"). By granting us access to any Third-Party Accounts, you understand that we may access, make available, and store any content (such as profile pictures or basic information) that you have provided to your Third-Party Account.
  </p>
  <p>
    For Merchants utilizing social commerce features, linking your Third-Party Account allows you to easily share your storefront links (e.g., via WhatsApp or Instagram bio) and generate rich social previews. You represent that you are entitled to grant us this access without violating the terms of the Third-Party Account.
  </p>
  <p>
    Please note that your relationship with the third-party service providers is governed solely by your agreements with them. We are not responsible for the availability of their services or any data breaches originating from their platforms. You can disconnect your Third-Party Accounts from CimessInvest at any time via your account settings.
  </p>
</LegalSection>

<LegalSection id="ThirdParty" title="12. External Links and Integrations" icon={FileText}>
  <p>
    The Services may contain links to other websites ("Third-Party Websites") as well as third-party content, plugins, or integrations (such as logistics courier tracking tools or marketing pixels). Such Third-Party Websites and integrations are not monitored or checked for accuracy, appropriateness, or completeness by us.
  </p>
  <p>
    We are not responsible for any Third-Party Websites accessed through the Services or any Third-Party Content posted on your storefront. Inclusion of, or linking to, any Third-Party Websites does not imply approval or endorsement by CimessInvest. If you decide to access Third-Party Websites or use external plugins, you do so at your own risk, and our Legal Terms no longer govern those interactions.
  </p>
</LegalSection>

<LegalSection id="ServicesManagement" title="13. Platform Management and Monitoring" icon={FileText}>
  <p>
    We reserve the right, but not the obligation, to: (1) monitor the Services for violations of these Legal Terms; (2) take appropriate legal action against anyone who violates the law or these Legal Terms, including reporting them to law enforcement or financial regulators; (3) refuse, restrict access to, or disable any Merchant storefront or product listing that we deem harmful or fraudulent; (4) remove files and content that are excessive in size or burdensome to our systems; and (5) otherwise manage the Services to protect our rights and facilitate the proper functioning of the CimessInvest infrastructure.
  </p>
</LegalSection>

<LegalSection id="PrivacyPolicy" title="14. Data Privacy and Security" icon={FileText}>
  <p>
    We care about data privacy and security. By using the Services, you agree to be bound by our Privacy Policy, which is incorporated into these Legal Terms. Our data processing practices align with the Nigeria Data Protection Act (NDPA). 
  </p>
  <p>
    Please be advised that the Services are hosted on secure global cloud infrastructure. If you access the Services from outside Nigeria, you expressly consent to having your data transferred to and processed in our hosting regions in accordance with standard global data protection protocols.
  </p>
</LegalSection>

<LegalSection id="CopyrightInfringements" title="15. Copyright Infringements" icon={FileText}>
  <p>
    We respect the intellectual property rights of others. If you believe that any material available on or through the Services (including product photos on a Merchant's storefront) infringes upon any copyright you own or control, please immediately notify us at <a href="mailto:cimessinvest@gmail.com" className="text-blue-500 underline">cimessinvest@gmail.com</a>. 
  </p>
  <p>
    A copy of your notification will be sent to the Merchant who posted the material. Please note that under applicable law, you may be held liable for damages if you make material misrepresentations in a copyright takedown notice.
  </p>
</LegalSection>

<LegalSection id="TermTermination" title="16. Term and Termination" icon={FileText}>
  <p>
    These Legal Terms shall remain in full force and effect while you use the Services. WE RESERVE THE RIGHT TO, IN OUR SOLE DISCRETION AND WITHOUT NOTICE OR LIABILITY, DENY ACCESS TO AND USE OF THE SERVICES (INCLUDING BLOCKING IP ADDRESSES AND FREEZING ACCOUNTS) TO ANY PERSON FOR ANY REASON, INCLUDING BREACH OF THESE TERMS OR SUSPECTED FRAUDULENT ACTIVITY.
  </p>
  <p>
    If we terminate or suspend your account, you are prohibited from registering a new account under your name, a fake name, or the name of any third party. In addition to terminating your account, we reserve the right to take appropriate legal action, including civil, criminal, and injunctive redress.
  </p>
</LegalSection>

<LegalSection id="ModificationsInterruptions" title="17. Modifications and System Uptime" icon={FileText}>
  <p>
    We reserve the right to change, modify, or remove the contents or features of the Services at any time at our sole discretion. We also reserve the right to modify or discontinue all or part of the Services (including specific storefront themes or beta features).
  </p>
  <p>
    While we strive for high reliability to keep your storefronts online, we cannot guarantee 100% uptime. We may experience hardware, software, or network problems requiring maintenance, resulting in interruptions or delays. You agree that we have no liability whatsoever for any loss of revenue, damage, or inconvenience caused by your inability to access or use the Services during any downtime.
  </p>
</LegalSection>

<LegalSection id="GoverningLaw" title="18. Governing Law" icon={FileText}>
  <p>
    These Legal Terms shall be governed by and defined following the laws of the Federal Republic of Nigeria. CimessInvest and yourself irrevocably consent that the courts of Nigeria shall have exclusive jurisdiction to resolve any dispute which may arise in connection with these Legal Terms.
  </p>
</LegalSection>

<LegalSection id="DisputeResolution" title="19. Dispute Resolution" icon={FileText}>
  <h3>Informal Negotiations</h3>
  <p>
    To expedite resolution and control the cost of any dispute, controversy, or claim related to these Legal Terms (each a "Dispute"), the Parties agree to first attempt to negotiate any Dispute informally for at least thirty (30) days before initiating arbitration. Such informal negotiations commence upon written notice from one Party to the other Party.
  </p>

  <h3>Binding Arbitration</h3>
  <p>
    Any dispute arising out of or in connection with these Legal Terms shall be referred to and finally resolved by arbitration in Lagos, Nigeria, in accordance with the Arbitration and Mediation Act of Nigeria. The number of arbitrators shall be one (1). The language of the proceedings shall be English.
  </p>

  <h3>Restrictions</h3>
  <p>
    The Parties agree that any arbitration shall be limited to the Dispute between the Parties individually. To the full extent permitted by law: (a) no arbitration shall be joined with any other proceeding; (b) there is no right or authority for any Dispute to be arbitrated on a class-action basis; and (c) there is no right or authority for any Dispute to be brought in a purported representative capacity on behalf of the general public or other merchants.
  </p>

  <h3>Exceptions</h3>
  <p>
    The Parties agree that Disputes concerning intellectual property rights, theft, piracy, unauthorized use, or claims for injunctive relief are not subject to the informal negotiations and arbitration provisions above and may be brought directly in a court of competent jurisdiction in Lagos, Nigeria.
  </p>
</LegalSection>

<LegalSection id="Corrections" title="20. Corrections" icon={FileText}>
  <p>
    There may be information on the Services that contains typographical errors, inaccuracies, or omissions, including descriptions, pricing, or availability. We reserve the right to correct any errors and to change or update the information on the platform at any time, without prior notice. (Note: Merchants remain solely responsible for the accuracy of the pricing and descriptions on their individual storefronts).
  </p>
</LegalSection>


<LegalSection id="Disclaimer" title="21. Disclaimer" icon={FileText}>
  <p>
    THE SERVICES ARE PROVIDED ON AN AS-IS AND AS-AVAILABLE BASIS. YOU AGREE THAT YOUR USE OF THE SERVICES WILL BE AT YOUR SOLE RISK. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, IN CONNECTION WITH THE SERVICES AND YOUR USE THEREOF, INCLUDING, WITHOUT LIMITATION, THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. 
  </p>
  <p>
    WE MAKE NO WARRANTIES OR REPRESENTATIONS ABOUT THE ACCURACY OR COMPLETENESS OF THE SERVICES' CONTENT OR THE PRODUCTS DISPLAYED ON MERCHANT STOREFRONTS. WE WILL ASSUME NO LIABILITY OR RESPONSIBILITY FOR ANY (1) ERRORS, MISTAKES, OR INACCURACIES OF CONTENT OR PRODUCT DESCRIPTIONS, (2) PERSONAL INJURY OR PROPERTY DAMAGE RESULTING FROM YOUR USE OF PRODUCTS PURCHASED VIA THE PLATFORM, (3) ANY UNAUTHORIZED ACCESS TO OR USE OF OUR SECURE SERVERS, (4) ANY INTERRUPTION OF TRANSMISSION TO OR FROM THE SERVICES, OR (5) ANY BUGS, VIRUSES, OR TROJAN HORSES TRANSMITTED TO OR THROUGH THE SERVICES BY ANY THIRD PARTY. 
  </p>
  <p>
    WE DO NOT WARRANT, ENDORSE, GUARANTEE, OR ASSUME RESPONSIBILITY FOR ANY PRODUCT OR SERVICE ADVERTISED OR OFFERED BY A MERCHANT THROUGH THE SERVICES. WE WILL NOT BE A PARTY TO OR IN ANY WAY BE RESPONSIBLE FOR MONITORING ANY TRANSACTION BETWEEN YOU AND ANY THIRD-PARTY MERCHANTS OR LOGISTICS PROVIDERS.
  </p>
</LegalSection>

<LegalSection id="LimitationsLiability" title="22. Limitations of Liability" icon={FileText}>
  <p>
    IN NO EVENT WILL WE OR OUR DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY DIRECT, INDIRECT, CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, SPECIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFIT, LOST REVENUE, LOSS OF DATA, OR OTHER DAMAGES ARISING FROM YOUR USE OF THE SERVICES, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. 
  </p>
  <p>
    NOTWITHSTANDING ANYTHING TO THE CONTRARY CONTAINED HEREIN, OUR LIABILITY TO YOU FOR ANY CAUSE WHATSOEVER AND REGARDLESS OF THE FORM OF THE ACTION, WILL AT ALL TIMES BE LIMITED TO THE LESSER OF THE AMOUNT PAID, IF ANY, BY YOU TO US DURING THE SIX (6) MONTH PERIOD PRIOR TO ANY CAUSE OF ACTION ARISING OR THE EQUIVALENT OF $100.00 USD IN NAIRA. CERTAIN LAWS DO NOT ALLOW LIMITATIONS ON IMPLIED WARRANTIES OR THE EXCLUSION OF CERTAIN DAMAGES; IF THESE LAWS APPLY TO YOU, SOME OR ALL OF THE ABOVE DISCLAIMERS MAY NOT APPLY.
  </p>
</LegalSection>

<LegalSection id="Indemnification" title="23. Indemnification" icon={FileText}>
  <p>
    You agree to defend, indemnify, and hold us harmless, including our subsidiaries, affiliates, and all of our respective officers, agents, partners, and employees, from and against any loss, damage, liability, claim, or demand, including reasonable attorneys' fees and expenses, made by any third party due to or arising out of: (1) your Contributions or product listings; (2) use of the Services; (3) breach of these Legal Terms; (4) any breach of your representations and warranties; (5) your violation of the rights of a third party, including intellectual property rights or consumer rights; or (6) any overt harmful act toward any other user of the Services. 
  </p>
  <p>
    We reserve the right, at your expense, to assume the exclusive defense and control of any matter for which you are required to indemnify us, and you agree to cooperate, at your expense, with our defense of such claims.
  </p>
</LegalSection>

<LegalSection id="UserData" title="24. User Data" icon={FileText}>
  <p>
    We will maintain certain data that you transmit to the Services for the purpose of managing the performance of the Services, as well as data relating to your use of the Services. Although we perform regular routine backups, you are solely responsible for all data that you transmit (such as product inventories, customer lists, and store settings). You agree that we shall have no liability to you for any loss or corruption of any such data.
  </p>
</LegalSection>

<LegalSection id="ElectronicCommunications" title="25. Electronic Communications, Transactions, and Signatures" icon={FileText}>
  <p>
    Visiting the Services, sending us emails, and completing online forms constitute electronic communications. You consent to receive electronic communications, and you agree that all agreements, notices, disclosures, and other communications we provide to you electronically, via email and on the Services, satisfy any legal requirement that such communication be in writing. YOU HEREBY AGREE TO THE USE OF ELECTRONIC SIGNATURES, CONTRACTS, ORDERS, AND OTHER RECORDS, AND TO ELECTRONIC DELIVERY OF NOTICES AND POLICIES.
  </p>
</LegalSection>

<LegalSection id="Miscellaneous" title="26. Miscellaneous" icon={FileText}>
  <p>
    These Legal Terms and any policies posted by us on the Services constitute the entire agreement and understanding between you and us. Our failure to exercise or enforce any right or provision of these Legal Terms shall not operate as a waiver of such right or provision. We may assign any or all of our rights and obligations to others at any time. We shall not be responsible or liable for any loss, damage, delay, or failure to act caused by any cause beyond our reasonable control. If any provision of these Legal Terms is determined to be unlawful or unenforceable, that provision is deemed severable and does not affect the validity of any remaining provisions.
  </p>
</LegalSection>

<LegalSection id="PlatformDisclaimer" title="27. Platform Role and E-Commerce Disclaimer" icon={FileText}>
  <p>
    CimessInvest is an e-commerce infrastructure platform that allows independent merchants and ateliers to create digital storefronts and sell products. CimessInvest is NOT a retailer, manufacturer, or logistics provider, nor do we directly process funds (payments are securely routed via third-party gateways like Paystack).
  </p>
  <p>By using CimessInvest, you acknowledge and agree that:</p>
  <ol className="list-decimal pl-6 marker:text-gray-500 marker:text-xs space-y-2 my-2">
    <li>
      CimessInvest is not responsible for the quality, safety, legality, or fulfillment of any products listed by Merchants on their storefronts.
    </li>
    <li>
      CimessInvest does not directly hold user funds; all financial settlements are handled securely off-platform by licensed payment gateways and routed to the Merchant's designated bank account.
    </li>
    <li>
      Customers must direct all inquiries regarding shipping, returns, refunds, or product defects directly to the respective Merchant.
    </li>
    <li>
      Users cannot hold CimessInvest liable for disputes arising between Merchants, Customers, or third-party delivery providers.
    </li>
  </ol>
</LegalSection>

<LegalSection id="ContactUs" title="28. Contact Us" icon={FileText}>
  <p>
    In order to resolve a complaint regarding the Services or to receive further information regarding use of the Services, please contact us at:
  </p>
  <p>
    <strong>CimessInvest</strong>
    <br />
    54, Olude Bustop
    <br />
    Ipaja, Lagos
    <br />
    Nigeria
    <br />
    <strong>Phone:</strong> <a href="tel:+2348089273565" className="hover:text-[#C9A96E] transition-colors">+234 808 927 3565</a>
    <br />
    <strong>Email:</strong> <a href="mailto:cimessinvest@gmail.com" className="hover:text-[#C9A96E] transition-colors">cimessinvest@gmail.com</a>
  </p>
</LegalSection>

</div>

{/* Sidebar Navigation */}
<div className="hidden lg:block">
  <div className="sticky top-32 space-y-8">
    <div>
      <h3 className="text-xs font-bold uppercase tracking-widest text-white mb-6">Navigation</h3>
      <nav className="space-y-1">
        <NavLink href="#platform">Platform Nature & Services</NavLink>
        <NavLink href="#ip">Intellectual Property</NavLink>
        <NavLink href="#userreps">User Representations</NavLink>
        <NavLink href="#purchases">Purchases & Settlements</NavLink>
        <NavLink href="#ProhibitedActivities">Prohibited Activities</NavLink>
        <NavLink href="#SocialMedia">Social Commerce Logins</NavLink>
        <NavLink href="#PrivacyPolicy">Privacy & Data</NavLink>
        <NavLink href="#TermTermination">Term & Termination</NavLink>
        <NavLink href="#LimitationsLiability">Liability Limitations</NavLink>
        <NavLink href="#PlatformDisclaimer">Platform Role Disclaimer</NavLink>
        <NavLink href="#ContactUs">Contact Support</NavLink>
      </nav>
    </div>

    <div className="p-6 glass-panel rounded-3xl border border-white/5">
      <p className="text-xs font-bold text-white uppercase tracking-widest mb-4">Need Help?</p>
      <p className="text-slate-500 text-xs leading-relaxed mb-6">
        Have questions about our legal terms or privacy practices?
      </p>
      <a href="mailto:cimessinvest@gmail.com">
        <button className="w-full py-3 bg-white text-black rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-100 transition-all">
          Contact Support
        </button>
      </a>
    </div>
  


            </div>
          </div>
        </div>
      </main>

    </div>
  );
}