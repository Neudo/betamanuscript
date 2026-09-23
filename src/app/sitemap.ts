import type { MetadataRoute } from "next";

import { site } from "@/shared/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: site.url,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${site.url}/how-it-works`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${site.url}/for-readers`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${site.url}/pricing`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${site.url}/use-cases`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${site.url}/use-cases/manage-multiple-beta-readers`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${site.url}/use-cases/organize-beta-reader-feedback`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${site.url}/use-cases/google-docs-alternative-for-beta-reading`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${site.url}/use-cases/track-beta-reader-progress`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${site.url}/use-cases/share-manuscript-with-beta-readers`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${site.url}/use-cases/beta-reader-surveys`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${site.url}/privacy`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${site.url}/terms`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
