import {
  featureRequestSchema,
  type FeatureRequestInput,
} from "@/features/feature-requests/schemas/feature-request.schema";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export async function createFeatureRequest({
  manuscriptId,
  message,
}: FeatureRequestInput & {
  manuscriptId: string;
}) {
  const request = featureRequestSchema.parse({ message });
  const supabase = createSupabaseBrowserClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Sign in to send a feature request.");
  }

  const { error } = await supabase
    .from("feature_requests")
    .insert({
      manuscript_id: manuscriptId,
      message: request.message,
      profile_id: user.id,
    });

  if (error) throw new Error(error.message);
}
