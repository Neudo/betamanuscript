import type { Metadata } from "next";

import { site } from "@/shared/config/site";

const socialImage = "/opengraph-image";

type PublicMetadataInput = {
  description: string;
  pathname: string;
  title: string;
};

export function createNoIndexMetadata(title: string): Metadata {
  return {
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
