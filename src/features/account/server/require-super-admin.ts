import "server-only";

import { redirect } from "next/navigation";

import { getAuthenticatedAccount } from "@/features/account/server/get-authenticated-account";
import type { AuthenticatedAccount } from "@/features/account/types";
import { adminConsolePath } from "@/shared/config/admin";

export type SuperAdminAccount = AuthenticatedAccount & {
  role: "super_admin";
};

export async function requireSuperAdmin(): Promise<SuperAdminAccount> {
  const account = await getAuthenticatedAccount();

  if (!account) {
    redirect(`/login?next=${encodeURIComponent(adminConsolePath)}`);
  }

  if (account.role !== "super_admin") {
    redirect("/");
  }

  return account as SuperAdminAccount;
}
