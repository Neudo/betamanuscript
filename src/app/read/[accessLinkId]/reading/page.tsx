import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { PublicReadingView } from "@/features/reading/components/PublicReadingView";
import { getPendingPublicFeedbackToken } from "@/features/account/domain/auth-redirect";
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
  searchParams: Promise<{ feedback?: string | string[] }>;
};

export default async function PublicReadingPage({ params, searchParams }: PublicReadingPageProps) {
  const { accessLinkId } = await params;
  const { feedback } = await searchParams;
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

  return (
    <PublicReadingView
      isAuthenticated={access.isAuthenticated}
      manuscript={access.manuscript}
      pendingFeedbackToken={getPendingPublicFeedbackToken(Array.isArray(feedback) ? feedback[0] : feedback)}
      readerAssignmentId={access.readerAssignmentId}
    />
  );
}
