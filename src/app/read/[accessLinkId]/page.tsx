import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { PublicManuscriptOverview } from "@/features/reading/components/PublicManuscriptOverview";
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
  );

  if (!access) notFound();

  if (access.readerAssignmentId) {
    redirect(`/reader/${access.manuscript.manuscriptId}?version=${access.manuscript.versionId}`);
  }

  return <PublicManuscriptOverview manuscript={access.manuscript} />;
}
