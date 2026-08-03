import type { AccountRole } from "@/features/account/domain/user-role";

export type AccountPlan = "free" | "pro";

export type AuthenticatedAccount = {
  avatarPath: string | null;
  avatarUrl: string | null;
  bio: string;
  id: string;
  email: string;
  displayName: string;
  role: AccountRole;
  plan: AccountPlan;
  website: string;
};
