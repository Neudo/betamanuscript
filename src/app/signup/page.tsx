import { redirect } from "next/navigation";

import { SignUpScreen } from "@/features/account/components/SignUpScreen";
import { getWorkspaceHome } from "@/features/account/domain/user-role";
import { getAuthenticatedAccount } from "@/features/account/server/get-authenticated-account";

export default async function SignUpPage() {
  const account = await getAuthenticatedAccount();

  if (account) {
    redirect(getWorkspaceHome(account.role));
  }

  return <SignUpScreen />;
}
