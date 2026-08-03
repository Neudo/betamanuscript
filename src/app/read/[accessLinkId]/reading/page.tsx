import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { PublicReadingView } from "@/features/reading/components/PublicReadingView";
import {
  getPublicReadingAccess,
  publicReadingFingerprint,
} from "@/features/reading/server/public-reading";
import { createNoIndexMetadata } from "@/shared/config/seo";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const metadata = createNoIndexMetadata("Shared manuscript | BetaManuscript");

type PublicReadingPageProps = {
  params: Promise<{ accessLinkId: string }>;
};

export default async function PublicReadingPage({ params }: PublicReadingPageProps) {
  const { accessLinkId } = await params;
  const requestHeaders = await headers();
  const access = await getPublicReadingAccess(
    accessLinkId,
    publicReadingFingerprint({
      forwardedFor: requestHeaders.get("x-forwarded-for"),
      realIp: requestHeaders.get("x-real-ip"),
      userAgent: requestHeaders.get("user-agent"),
    }),
    { includeReadingContent: true },
  );

  if (!access) notFound();

  return <PublicReadingView isAuthenticated={access.isAuthenticated} manuscript={access.manuscript} />;
}
