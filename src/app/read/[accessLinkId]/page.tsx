import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { PublicManuscriptOverview } from "@/features/reading/components/PublicManuscriptOverview";
import { getReaderResumePath } from "@/features/reading/lib/reader-resume";
import {
  getPublicReadingAccess,
  publicReadingFingerprint,
} from "@/features/reading/server/public-reading";
import { createSharedManuscriptMetadata } from "@/shared/config/seo";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PublicReadingPageProps = {
  params: Promise<{ accessLinkId: string }>;
};

export async function generateMetadata({ params }: PublicReadingPageProps): Promise<Metadata> {
  const { accessLinkId } = await params;
  const access = await getAccessForRequest(accessLinkId);

  return createSharedManuscriptMetadata(access?.manuscript ?? null);
}

export default async function PublicReadingPage({ params }: PublicReadingPageProps) {
  const { accessLinkId } = await params;
  const access = await getAccessForRequest(accessLinkId);

  if (!access) notFound();

  if (access.readerAssignmentId) {
    redirect(getReaderResumePath({
      chapterId: access.latestChapterId,
      manuscriptId: access.manuscript.manuscriptId,
      versionId: access.manuscript.versionId,
    }));
  }

  return <PublicManuscriptOverview manuscript={access.manuscript} />;
}

async function getAccessForRequest(accessLinkId: string) {
  const requestHeaders = await headers();
  return getPublicReadingAccess(
    accessLinkId,
    publicReadingFingerprint({
      forwardedFor: requestHeaders.get("x-forwarded-for"),
      realIp: requestHeaders.get("x-real-ip"),
      userAgent: requestHeaders.get("user-agent"),
    }),
  );
}
