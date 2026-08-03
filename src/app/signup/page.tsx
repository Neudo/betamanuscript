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
  }>;
};

export const metadata = createNoIndexMetadata("Create your account | BetaManuscript");

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const account = await getAuthenticatedAccount();
  const { displayName, feedback, flow, next } = await searchParams;
  const safeNext = getSafeInternalPath(Array.isArray(next) ? next[0] : next);
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

  return (
    <SignUpScreen
      next={safeNext}
      feedbackToken={feedbackToken}
      publicReaderDisplayName={publicReaderDisplayName}
      publicReaderFlow={Boolean(publicReaderPath && publicReaderDisplayName)}
    />
  );
}
