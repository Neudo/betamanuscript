import { redirect } from "next/navigation";

import { SignUpScreen } from "@/features/account/components/SignUpScreen";
import { getSafeInternalPath } from "@/features/account/domain/auth-redirect";
import { getWorkspaceHome } from "@/features/account/domain/user-role";
import { getAuthenticatedAccount } from "@/features/account/server/get-authenticated-account";

type SignUpPageProps = {
  searchParams: Promise<{
    next?: string | string[];
    role?: string | string[];
  }>;
};

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const account = await getAuthenticatedAccount();
  const { next, role } = await searchParams;
  const safeNext = getSafeInternalPath(Array.isArray(next) ? next[0] : next);
  const requestedRole = Array.isArray(role) ? role[0] : role;
  const initialRole = requestedRole === "reader" ? "reader" : "writer";

  if (account) {
    redirect(safeNext ?? getWorkspaceHome(account.role));
  }

  return <SignUpScreen initialRole={initialRole} next={safeNext} />;
}
