"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "", rememberMe: false });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (res?.error) {
        setError("Invalid credentials. Please check your email and password.");
        setLoading(false);
      } else {
        window.location.href = "/dashboard/1/payment";
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#1A1A1A] flex text-[#F5F0EB]">
      {/* Left Panel: Atelier Cinematic Brand Presentation */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-black overflow-hidden flex-col justify-between p-16">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity scale-105 transition-transform duration-1000 ease-out hover:scale-100"
          style={{ backgroundImage: "url('/bg-img/native1.jpeg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-transparent to-[#1A1A1A]/80" />

        {/* Brand Header */}
        <div className="relative z-10">
          <Link href="/" className="inline-block">
            <span className="font-brand text-2xl tracking-[0.3em] text-[#C9A96E] uppercase font-bold">
              TI STICHES
            </span>
          </Link>
        </div>

        {/* Brand Statement */}
        <div className="relative z-10 max-w-md space-y-4">
          <span className="text-xs uppercase tracking-[0.3em] text-[#C9A96E] font-medium">
            Private Atelier Portal
          </span>
          <h2 className="text-4xl font-heading text-[#F5F0EB] leading-tight">
            Exquisite Bespoke Craftsmanship & Heritage Luxury
          </h2>
          <p className="text-xs text-[#E0D5C9]/80 leading-relaxed font-light">
            Access your private fitting schedules, custom measurements, and exclusive collection previews.
          </p>
        </div>

        {/* Footer Badge */}
        <div className="relative z-10 flex items-center space-x-2 text-[10px] uppercase tracking-widest text-[#C9A96E]">
          <ShieldCheck className="w-4 h-4" />
          <span>Encrypted Client Vault</span>
        </div>
      </div>

      {/* Right Panel: Interactive Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-20">
        <div className="w-full max-w-md space-y-8">
          
          {/* Mobile Brand Logo */}
          <div className="lg:hidden text-center">
            <Link href="/">
              <span className="font-brand text-xl tracking-[0.3em] text-[#C9A96E] uppercase font-bold">
                TI STICHES
              </span>
            </Link>
          </div>

          <div>
            <h1 className="text-3xl font-heading text-[#F5F0EB] tracking-wide">
              Sign In to Your Account
            </h1>
            <p className="mt-2 text-xs text-[#E0D5C9]/70 font-light">
              Welcome back. Enter your credentials to manage your bespoke orders.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-4 bg-red-950/40 border border-red-500/40 text-red-300 text-xs rounded-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-[0.2em] text-[#C9A96E]">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C9A96E]/60" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="artisan@tistiches.com"
                  className="w-full bg-black/40 border border-white/10 px-11 py-3.5 text-sm text-[#F5F0EB] placeholder:text-white/20 focus:outline-none focus:border-[#C9A96E] transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-xs uppercase tracking-[0.2em] text-[#C9A96E]">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] text-[#E0D5C9]/60 hover:text-[#C9A96E] transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C9A96E]/60" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••••••"
                  className="w-full bg-black/40 border border-white/10 pl-11 pr-11 py-3.5 text-sm text-[#F5F0EB] placeholder:text-white/20 focus:outline-none focus:border-[#C9A96E] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-[#C9A96E] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="rememberMe"
                checked={formData.rememberMe}
                onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                className="w-4 h-4 accent-[#C9A96E] bg-black border-white/20"
              />
              <label htmlFor="rememberMe" className="text-xs text-[#E0D5C9]/80 cursor-pointer">
                Keep me signed in on this device
              </label>
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#C9A96E] text-[#1A1A1A] text-xs font-bold uppercase tracking-[0.25em] hover:bg-[#F5F0EB] transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              <span>{loading ? "Authenticating..." : "Sign In to Atelier"}</span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {/* Switch to Register */}
          <div className="pt-6 border-t border-white/10 text-center text-xs text-[#E0D5C9]/60">
            Don&apos;t have an account yet?{" "}
            <Link href="/register" className="text-[#C9A96E] hover:underline font-semibold ml-1">
              Create an Account
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
