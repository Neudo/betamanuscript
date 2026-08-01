import "server-only";

import { cache } from "react";

import type { UserRole } from "@/features/account/domain/user-role";
import type {
  AccountPlan,
  AuthenticatedAccount,
} from "@/features/account/types";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const ACTIVITY_REFRESH_INTERVAL_MS = 24 * 60 * 60 * 1000;

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
      .select("avatar_path, bio, display_name, role, plan, last_active_at, website")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      throw new Error("Authenticated user profile is missing.");
    }

    await refreshAccountActivity(user.id, profile.last_active_at);

    const avatarUrl = profile.avatar_path
      ? (await supabase.storage.from("profile-avatars").createSignedUrl(profile.avatar_path, 60 * 60)).data?.signedUrl ?? null
      : null;

    return {
      avatarPath: profile.avatar_path,
      avatarUrl,
      bio: profile.bio ?? "",
      id: user.id,
      email: user.email ?? "",
      displayName: profile.display_name,
      role: profile.role as UserRole,
      plan: profile.plan as AccountPlan,
      website: profile.website ?? "",
    };
  },
);

async function refreshAccountActivity(accountId: string, lastActiveAt: string | null) {
  const lastActivityTimestamp = lastActiveAt ? Date.parse(lastActiveAt) : Number.NaN;

  if (
    Number.isFinite(lastActivityTimestamp) &&
    Date.now() - lastActivityTimestamp < ACTIVITY_REFRESH_INTERVAL_MS
  ) {
    return;
  }

  try {
    const admin = createSupabaseAdminClient();
    const { error } = await admin
      .from("profiles")
      .update({ last_active_at: new Date().toISOString() })
      .eq("id", accountId);

    if (error) {
      console.error("Unable to refresh authenticated account activity.", error);
    }
  } catch (error) {
    console.error("Unable to initialize account activity tracking.", error);
  }
}
