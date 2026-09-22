"use client";

import CookieConsent from "react-cookie-consent";

export default function CookieConsentBanner() {
  return (
    <CookieConsent
      location="none"
      buttonText="Accept All"
      declineButtonText="Essential Only"
      enableDeclineButton
      cookieName="cimessinvest_consent"
      expires={365}
      overlay={true}
      disableStyles={true}
      onAccept={() => console.log("User accepted cookies")}
      onDecline={() => console.log("User declined cookies")}
      containerClasses="fixed !bottom-8 !left-1/2 !-translate-x-1/2 !w-[90%] !max-w-4xl glass-panel !flex !flex-col md:!flex-row !items-center !justify-between !px-8 !py-6 !rounded-3xl !border !border-white/10 !shadow-2xl !z-[10000]"
      contentClasses="text-slate-400 text-sm font-medium leading-relaxed max-w-2xl !m-0 mb-4 md:mb-0"
      buttonWrapperClasses="flex items-center gap-4 shrink-0"
      buttonClasses="!bg-[var(--color-accent)] cursor-pointer !text-black !font-bold !px-8 !py-3 !rounded-full !text-[10px] !uppercase !tracking-[0.2em] !transition-all hover:!bg-color-accent/80 active:!scale-95 !m-0 !border-0 flex items-center justify-center min-w-[140px]"
      declineButtonClasses="!bg-white/[0.03] cursor-pointer !text-slate-500 !font-bold !px-8 !py-3 !rounded-full !text-[10px] !uppercase !tracking-[0.2em] !transition-all hover:!text-white hover:!bg-white/10 !m-0 !border !border-white/5 flex items-center justify-center min-w-[140px]"
      overlayClasses="fixed inset-0 bg-black/60 backdrop-blur-xs z-[9999] animate-in fade-in duration-500"
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)] animate-pulse" />

          <span className="text-white text-[10px] font-black uppercase tracking-[0.3em]">
            Privacy Preference
          </span>
        </div>

        <p className="max-w-xl text-slate-400">
          We use essential cookies to keep cimessinvest secure and functional,
          and optional analytics and preference cookies to improve your
          experience.
          <a href="/privacy" className="text-emerald-500 hover:text-emerald-400 underline underline-offset-4 transition-colors">Privacy Policy</a> and <a href="/terms" className="text-emerald-500 hover:text-emerald-400 underline underline-offset-4 transition-colors"> cookie policy</a>
        </p>
      </div>
    </CookieConsent>
  );
}