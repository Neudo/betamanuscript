import { redirect } from "next/navigation";

import { createNoIndexMetadata } from "@/shared/config/seo";
import { AccountPersonalizationScreen } from "@/features/account/components/AccountPersonalizationScreen";
import { getSafeInternalPath } from "@/features/account/domain/auth-redirect";
import { getWorkspaceHome } from "@/features/account/domain/user-role";
import { getAuthenticatedAccount } from "@/features/account/server/get-authenticated-account";

type OnboardingPageProps = {
  searchParams: Promise<{
    next?: string | string[];
  }>;
};

export const metadata = createNoIndexMetadata("Set up your account | BetaManuscript");

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

  if (account.role !== null) {
    redirect(
      account.role === "super_admin"
        ? getWorkspaceHome(account.role)
        : safeNext ?? getWorkspaceHome(account.role),
    );
  }

  return (
    <AccountPersonalizationScreen
      accountId={account.id}
      initialAvatarPath={account.avatarPath}
      initialAvatarUrl={account.avatarUrl}
      initialDisplayName={account.displayName}
      initialRole={account.role}
      next={safeNext}
    />
  );
}
