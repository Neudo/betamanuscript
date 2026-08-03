import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type AdminFeatureRequest = {
  authorName: string;
  createdAt: string;
  id: string;
  manuscriptTitle: string | null;
  message: string;
};

export async function getFeatureRequests(): Promise<AdminFeatureRequest[]> {
  const admin = createSupabaseAdminClient();
  const { data: featureRequests, error: featureRequestsError } = await admin
    .from("feature_requests")
    .select("id, profile_id, manuscript_id, message, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (featureRequestsError) {
    throw new Error(`Unable to load feature requests: ${featureRequestsError.message}`);
  }

  const profileIds = [...new Set((featureRequests ?? []).map((request) => request.profile_id))];
  const manuscriptIds = [
    ...new Set(
      (featureRequests ?? [])
        .map((request) => request.manuscript_id)
        .filter((manuscriptId): manuscriptId is string => manuscriptId !== null),
    ),
  ];

  const [profilesResult, manuscriptsResult] = await Promise.all([
    profileIds.length > 0
      ? admin.from("profiles").select("id, display_name").in("id", profileIds)
      : Promise.resolve({ data: [], error: null }),
    manuscriptIds.length > 0
      ? admin.from("manuscripts").select("id, internal_title").in("id", manuscriptIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (profilesResult.error) {
    throw new Error(`Unable to load feature request authors: ${profilesResult.error.message}`);
  }

  if (manuscriptsResult.error) {
    throw new Error(`Unable to load feature request manuscripts: ${manuscriptsResult.error.message}`);
  }

  const authorNamesById = new Map(
    (profilesResult.data ?? []).map((profile) => [profile.id, profile.display_name]),
  );
  const manuscriptTitlesById = new Map(
    (manuscriptsResult.data ?? []).map((manuscript) => [manuscript.id, manuscript.internal_title]),
  );

  return (featureRequests ?? []).map((request) => ({
    id: request.id,
    authorName: authorNamesById.get(request.profile_id) ?? "Deleted account",
    manuscriptTitle: request.manuscript_id
      ? (manuscriptTitlesById.get(request.manuscript_id) ?? "Deleted manuscript")
      : null,
    message: request.message,
    createdAt: request.created_at,
  }));
}
