import type { UserRole } from "@/features/account/domain/user-role";

export type AccountPlan = "free" | "pro";

export type AuthenticatedAccount = {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  plan: AccountPlan;
};
