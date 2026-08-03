import { redirect } from "next/navigation";

import { createNoIndexMetadata } from "@/shared/config/seo";
import { LoginScreen } from "@/features/account/components/LoginScreen";
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

type LoginPageProps = {
  searchParams: Promise<{
    error?: string | string[];
    confirmation?: string | string[];
    displayName?: string | string[];
    feedback?: string | string[];
    flow?: string | string[];
    next?: string | string[];
  }>;
};

export const metadata = createNoIndexMetadata("Log in | BetaManuscript");

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const account = await getAuthenticatedAccount();

  const { error, confirmation, displayName, feedback, flow, next } = await searchParams;
  const safeNext = getSafeInternalPath(Array.isArray(next) ? next[0] : next);
  const isPublicReaderFlow = (Array.isArray(flow) ? flow[0] : flow) === publicReaderFlow;
  const publicReaderPath = isPublicReaderFlow ? getPublicReaderPath(safeNext) : null;
  const publicReaderDisplayName = publicReaderPath
    ? getSafeDisplayName(Array.isArray(displayName) ? displayName[0] : displayName)
    : null;
  const feedbackToken = publicReaderPath
    ? getPendingPublicFeedbackToken(Array.isArray(feedback) ? feedback[0] : feedback)
    : null;
  const authError = Array.isArray(error) ? error[0] : error;
  const hasConfirmedEmail = (Array.isArray(confirmation) ? confirmation[0] : confirmation) === "1";

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
    <LoginScreen
      next={safeNext}
      feedbackToken={feedbackToken}
      error={authError ?? null}
      confirmed={hasConfirmedEmail}
      publicReaderDisplayName={publicReaderDisplayName}
      publicReaderFlow={Boolean(publicReaderPath)}
    />
  );
}
