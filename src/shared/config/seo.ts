import type { Metadata } from "next";

import { site } from "@/shared/config/site";

const socialImage = "/opengraph-image";

type PublicMetadataInput = {
  description: string;
  pathname: string;
  title: string;
};

export function createNoIndexMetadata(title: string, description?: string): Metadata {
  return {
    ...(description ? { description } : {}),
    title,
    robots: {
      follow: false,
      googleBot: {
        follow: false,
        index: false,
        noimageindex: true,
      },
      index: false,
    },
  };
}

export function createSharedManuscriptMetadata(manuscript: {
  logline: string | null;
  title: string;
} | null): Metadata {
  if (!manuscript) {
    return createNoIndexMetadata("Shared manuscript | BetaManuscript");
  }

  const title = normalizeMetadataText(manuscript.title) || "Shared manuscript";
  const logline = normalizeMetadataText(manuscript.logline);
  const description = logline
    ? truncateMetadataText(logline, 160)
    : `Read ${title} on BetaManuscript.`;

  return createNoIndexMetadata(`${title} | BetaManuscript`, description);
}

export function createPublicMetadata({
  description,
  pathname,
  title,
}: PublicMetadataInput): Metadata {
  return {
    alternates: {
      canonical: pathname,
    },
    description,
    openGraph: {
      description,
      images: [
        {
          alt: "BetaManuscript — beta reader feedback workspace",
          height: 630,
          url: socialImage,
          width: 1200,
        },
      ],
      locale: site.locale,
      siteName: site.name,
      title,
      type: "website",
      url: pathname,
    },
    title,
    twitter: {
      card: "summary_large_image",
      description,
      images: [socialImage],
      title,
    },
  };
}

function normalizeMetadataText(value: string | null) {
  return value?.replace(/\s+/g, " ").trim() ?? "";
}

function truncateMetadataText(value: string, maxLength: number) {
  if (value.length <= maxLength) return value;

  return `${value.slice(0, maxLength - 1).trimEnd()}…`;
}
