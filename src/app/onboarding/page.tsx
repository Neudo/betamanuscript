import { redirect } from "next/navigation";

import { AccountPersonalizationScreen } from "@/features/account/components/AccountPersonalizationScreen";
import { getSafeInternalPath } from "@/features/account/domain/auth-redirect";
import { getAuthenticatedAccount } from "@/features/account/server/get-authenticated-account";

type OnboardingPageProps = {
  searchParams: Promise<{
    next?: string | string[];
  }>;
};

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const account = await getAuthenticatedAccount();
  const { next } = await searchParams;
  const safeNext = getSafeInternalPath(Array.isArray(next) ? next[0] : next);

  if (!account) {
    const loginUrl = safeNext
      ? `/login?next=${encodeURIComponent(`/onboarding?next=${safeNext}`)}`
      : "/login";
    redirect(loginUrl);
  }

  return (
    <AccountPersonalizationScreen
      accountId={account.id}
      initialDisplayName={account.displayName}
      initialRole={account.role}
      next={safeNext}
    />
  );
}
