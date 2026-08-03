import "server-only";

import { createHash, randomBytes } from "node:crypto";

import { getPendingPublicFeedbackToken } from "@/features/account/domain/auth-redirect";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export function createPendingPublicFeedbackToken() {
  return randomBytes(32).toString("base64url");
}

export function hashPendingPublicFeedbackToken(token: string) {
  const safeToken = getPendingPublicFeedbackToken(token);
  if (!safeToken) {
    throw new Error("The saved feedback token is invalid.");
  }

  return createHash("sha256").update(safeToken).digest("hex");
}

export async function bindPendingPublicFeedbackToProfile({
  profileId,
  token,
}: {
  profileId: string;
  token: string;
}) {
  const admin = createSupabaseAdminClient();
  const { error } = await admin.rpc("bind_pending_public_feedback", {
    p_profile_id: profileId,
    p_token_digest: hashPendingPublicFeedbackToken(token),
  });

  if (error) {
    throw new Error(error.message);
  }
}
