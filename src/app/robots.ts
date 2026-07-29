import type { MetadataRoute } from "next";

import { site } from "@/shared/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    host: site.url,
    rules: {
      allow: "/",
      disallow: [
        "/api/",
        "/auth/",
        "/dashboard",
        "/invite",
        "/login",
        "/onboarding",
        "/reader",
        "/signup",
      ],
      userAgent: "*",
    },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
