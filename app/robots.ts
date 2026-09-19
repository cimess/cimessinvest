import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXTAUTH_URL || "https://cimessinvest.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/store", "/store/", "/checkout/"],
        disallow: [
          "/api/",
          "/dashboard/",
          "/superadmin/",
          "/login",
          "/register",
          "/signup",
          "/forgot-password",
          "/reset-password",
          "/invite/",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: ["/", "/store", "/store/", "/checkout/"],
        disallow: ["/api/", "/dashboard/", "/superadmin/"],
      },
      {
        userAgent: "Bingbot",
        allow: ["/", "/store", "/store/", "/checkout/"],
        disallow: ["/api/", "/dashboard/", "/superadmin/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
