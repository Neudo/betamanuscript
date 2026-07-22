import { redirect } from "next/navigation";

import { LoginScreen } from "@/features/account/components/LoginScreen";
import { getSafeInternalPath } from "@/features/account/domain/auth-redirect";
import { getWorkspaceHome } from "@/features/account/domain/user-role";
import { getAuthenticatedAccount } from "@/features/account/server/get-authenticated-account";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string | string[];
    next?: string | string[];
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const account = await getAuthenticatedAccount();

  if (account) {
    redirect(getWorkspaceHome(account.role));
  }

  const { error, next } = await searchParams;
  const safeNext = getSafeInternalPath(Array.isArray(next) ? next[0] : next);
  const authError = Array.isArray(error) ? error[0] : error;

  return <LoginScreen next={safeNext} error={authError ?? null} />;
}
