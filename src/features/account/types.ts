import type { AccountRole } from "@/features/account/domain/user-role";
import type { SocialLinks } from "@/features/account/domain/social-links";

export type AccountPlan = "free" | "pro";

export type AuthenticatedAccount = {
  avatarPath: string | null;
  avatarUrl: string | null;
  bio: string;
  id: string;
  email: string;
  displayName: string;
  role: AccountRole;
  socialLinks: SocialLinks;
  plan: AccountPlan;
  website: string;
};
