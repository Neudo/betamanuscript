import { getUpload, requireUploadCookie } from "@/features/manuscript/server/pending-upload";
import { pendingUploadIdFromPath, pendingUploadPath, uploadIdSchema } from "@/features/manuscript/lib/pending-upload";
import { redirect } from "next/navigation";

import { createNoIndexMetadata } from "@/shared/config/seo";
import { SignUpScreen } from "@/features/account/components/SignUpScreen";
import {
  getPendingPublicFeedbackToken,
  getPublicReaderFeedbackPath,
  getPublicReaderPath,
  getOnboardingPath,
  getSafeDisplayName,
  getSafeInternalPath,
  publicReaderFlow,
} from "@/features/account/domain/auth-redirect";
import { getWorkspaceHome } from "@/features/account/domain/user-role";
import { getAuthenticatedAccount } from "@/features/account/server/get-authenticated-account";

type SignUpPageProps = {
  searchParams: Promise<{
    displayName?: string | string[];
    feedback?: string | string[];
    flow?: string | string[];
    next?: string | string[];
    upload?: string | string[];
  }>;
};

export const metadata = createNoIndexMetadata("Create your account | BetaManuscript");

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const account = await getAuthenticatedAccount();
  const { displayName, feedback, flow, next, upload } = await searchParams;
  const parsedUpload = uploadIdSchema.safeParse(Array.isArray(upload) ? upload[0] : upload);
  const requestedNext = getSafeInternalPath(Array.isArray(next) ? next[0] : next);
  const uploadId = parsedUpload.success ? parsedUpload.data : pendingUploadIdFromPath(requestedNext);
  const safeNext = uploadId ? pendingUploadPath(uploadId) : requestedNext;
  const isPublicReaderFlow = (Array.isArray(flow) ? flow[0] : flow) === publicReaderFlow;
  const publicReaderPath = isPublicReaderFlow ? getPublicReaderPath(safeNext) : null;
  const publicReaderDisplayName = publicReaderPath
    ? getSafeDisplayName(Array.isArray(displayName) ? displayName[0] : displayName)
    : null;
  const feedbackToken = publicReaderPath
    ? getPendingPublicFeedbackToken(Array.isArray(feedback) ? feedback[0] : feedback)
    : null;

  if (account) {
    redirect(
      publicReaderPath
        ? getPublicReaderFeedbackPath(publicReaderPath, feedbackToken) ?? publicReaderPath
        : account.role === null
        ? getOnboardingPath(safeNext)
        : safeNext ?? getWorkspaceHome(account.role),
    );
  }

  let uploadedFilename: string | null = null;
  let uploadError: string | null = null;
  if (uploadId) {
    try {
      const saved = await getUpload(uploadId);
      await requireUploadCookie(saved);
      if (saved.state === "uploading") throw new Error("Upload is incomplete.");
      uploadedFilename = saved.original_filename;
    } catch {
      uploadError = "Your upload has expired or is unavailable in this browser. You can still create an account and upload your manuscript afterwards.";
    }
  }

  return (
    <SignUpScreen
      next={uploadError ? null : safeNext}
      uploadedFilename={uploadedFilename}
      uploadError={uploadError}
      feedbackToken={feedbackToken}
      publicReaderDisplayName={publicReaderDisplayName}
      publicReaderFlow={Boolean(publicReaderPath && publicReaderDisplayName)}
    />
  );
}
