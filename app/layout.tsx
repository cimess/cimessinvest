import type { Metadata } from "next";
import { Geist, Playfair_Display } from "next/font/google";
import "./globals.css";
import SmoothScrollProvider from "@/app/components/providers/smootgScrollProvider";
import AuthProvider from "@/app/components/providers/authProvider";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "cimessinvest | Bespoke Fashion & Luxury Commerce Platform",
  description: "High-fashion bespoke native wear and luxury atelier management platform powered by cimessinvest.",
};  

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${playfair.variable} antialiased`}>
      <body className="min-h-screen flex flex-col bg-[#F5F0EB]">
        <AuthProvider>
          <SmoothScrollProvider>{children}</SmoothScrollProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
