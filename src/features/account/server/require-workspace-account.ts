import "server-only";

import { redirect } from "next/navigation";

import {
  canRead,
  canWrite,
  getWorkspaceHome,
} from "@/features/account/domain/user-role";
import { getAuthenticatedAccount } from "@/features/account/server/get-authenticated-account";

type Workspace = "reader" | "writer";

export async function requireWorkspaceAccount(workspace: Workspace) {
  const account = await getAuthenticatedAccount();

  if (!account) {
    const next = workspace === "reader" ? "/reader" : "/dashboard";
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }

  const hasAccess =
    workspace === "reader" ? canRead(account.role) : canWrite(account.role);

  if (!hasAccess) {
    redirect(getWorkspaceHome(account.role));
  }

  return account;
}
