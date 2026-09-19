import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  
  // 1. Fixes: "Information Disclosure via X-Powered-By HTTP response headers"
  // Completely disables the X-Powered-By: Next.js header
  poweredByHeader: false, 

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "*.cloudinary.com",
      },
    ],
  },

  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  allowedDevOrigins: [
    "192.168.0.197:3000",
    "192.168.0.197",
    "*.192.168.0.197.sslip.io:3000",
    "*.192.168.0.197.sslip.io",
    "*.sslip.io:3000",
    "*.sslip.io",
    "*.localhost:3000",
    "*.localhost",
    "localhost:3000",
    "localhost",
  ],

    experimental: {
    // Limits the entry files processed immediately upon boot
    preloadEntriesOnStart: false,
    // Forces Next.js to spin up temporary compilation threads that drop memory once done
    webpackBuildWorker: true
  },

    async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff"
          },
          {
            key: "X-Frame-Options",
            value: "DENY"
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block"
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin"
          },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://*.r2.cloudflarestorage.com https://*.cloudinary.com https://res.cloudinary.com; media-src 'self' data: blob: https://*.cloudinary.com https://res.cloudinary.com; connect-src 'self' ws: wss: https://*.r2.cloudflarestorage.com https://api.cloudinary.com https://*.cloudinary.com https://api.paystack.co https://va.vercel-scripts.com https://vitals.vercel-insights.com https://cimessinvest.com; font-src 'self' data:; frame-ancestors 'none';"
          }
        ]
      }
    ];
  }
};

export default nextConfig;
