import { redirect } from "next/navigation";

import { SignUpScreen } from "@/features/account/components/SignUpScreen";
import { getSafeInternalPath } from "@/features/account/domain/auth-redirect";
import { getWorkspaceHome } from "@/features/account/domain/user-role";
import { getAuthenticatedAccount } from "@/features/account/server/get-authenticated-account";

type SignUpPageProps = {
  searchParams: Promise<{
    next?: string | string[];
  }>;
};

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const account = await getAuthenticatedAccount();
  const { next } = await searchParams;
  const safeNext = getSafeInternalPath(Array.isArray(next) ? next[0] : next);

  if (account) {
    redirect(safeNext ?? getWorkspaceHome(account.role));
  }

  return <SignUpScreen next={safeNext} />;
}
