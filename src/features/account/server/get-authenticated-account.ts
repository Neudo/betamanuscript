import "server-only";

import { cache } from "react";

import type { UserRole } from "@/features/account/domain/user-role";
import type {
  AccountPlan,
  AuthenticatedAccount,
} from "@/features/account/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const getAuthenticatedAccount = cache(
  async (): Promise<AuthenticatedAccount | null> => {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return null;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("display_name, role, plan")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      throw new Error("Authenticated user profile is missing.");
    }

    return {
      id: user.id,
      email: user.email ?? "",
      displayName: profile.display_name,
      role: profile.role as UserRole,
      plan: profile.plan as AccountPlan,
    };
  },
);
