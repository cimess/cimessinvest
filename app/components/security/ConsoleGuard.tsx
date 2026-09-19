"use client";

import { useEffect } from "react";

/**
 * ConsoleGuard — Self-XSS Defense & Production Console Hygiene
 * 
 * Protects users from Self-XSS social engineering attacks by displaying
 * a high-visibility warning banner in the DevTools console (similar to Discord,
 * Facebook, and PayPal), and neutralizes debug logging in production.
 */
export default function ConsoleGuard() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Prominent Self-XSS Warning Banner
    try {
      const stopStyle = [
        "color: #EF4444",
        "font-size: 48px",
        "font-weight: 900",
        "font-family: sans-serif",
        "text-shadow: 2px 2px 0px rgba(0,0,0,0.4)",
      ].join(";");

      const titleStyle = [
        "color: #F59E0B",
        "font-size: 16px",
        "font-weight: bold",
        "font-family: sans-serif",
      ].join(";");

      const textStyle = [
        "color: #E0D5C9",
        "font-size: 13px",
        "line-height: 1.6",
        "font-family: sans-serif",
      ].join(";");

      const linkStyle = [
        "color: #C9A96E",
        "font-size: 12px",
        "font-style: italic",
        "font-family: sans-serif",
      ].join(";");

      console.log("%cSTOP!", stopStyle);
      console.log(
        "%cThis browser console is intended strictly for developers.",
        titleStyle
      );
      console.log(
        "%cIf someone instructed you to copy and paste code here to unlock a feature, change your tier, or hack an account, IT IS A SCAM known as Self-XSS. Giving them this script can compromise your account, store access, and customer funds.",
        textStyle
      );
      console.log(
        "%cLearn more about Self-XSS scams: https://en.wikipedia.org/wiki/Self-XSS",
        linkStyle
      );
    } catch {
      // Ignore errors in environments where console is restricted
    }

    // 2. Production Console Stripping / Hygiene
    if (process.env.NODE_ENV === "production") {
      try {
        const noop = () => {};
        window.console.log = noop;
        window.console.debug = noop;
        window.console.info = noop;
      } catch {
        // Safe fail
      }
    }
  }, []);

  return null;
}
