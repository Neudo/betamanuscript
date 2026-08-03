import "server-only";

import { redirect } from "next/navigation";

import {
  canRead,
  canWrite,
  getWorkspaceHome,
  type WorkspaceRole,
} from "@/features/account/domain/user-role";
import { getOnboardingPath } from "@/features/account/domain/auth-redirect";
import { getAuthenticatedAccount } from "@/features/account/server/get-authenticated-account";
import type { AuthenticatedAccount } from "@/features/account/types";

type Workspace = "reader" | "writer";
export type WorkspaceAuthenticatedAccount = AuthenticatedAccount & {
  role: WorkspaceRole;
};

export async function requireWorkspaceAccount(
  workspace: Workspace,
): Promise<WorkspaceAuthenticatedAccount> {
  const account = await getAuthenticatedAccount();

  if (!account) {
    const next = workspace === "reader" ? "/reader" : "/dashboard";
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }

  if (account.role === null) {
    const next = workspace === "reader" ? "/reader" : "/dashboard";
    redirect(getOnboardingPath(next));
  }

  const hasAccess = account.role === "super_admin"
    ? workspace === "writer"
    : workspace === "reader" ? canRead(account.role) : canWrite(account.role);

  if (!hasAccess) {
    redirect(getWorkspaceHome(account.role));
  }

  return account as WorkspaceAuthenticatedAccount;
}
