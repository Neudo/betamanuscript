import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export type AuthorNotification = {
  body: string;
  createdAt: string;
  eventType: "new_annotation" | "reader_started" | "reader_completed" | "survey_response";
  href: string;
  id: string;
  readAt: string | null;
  title: string;
};

export type AuthorNotificationPreferences = {
  newAnnotation: boolean;
  readerProgress: boolean;
  surveyResponse: boolean;
};

export const defaultAuthorNotificationPreferences: AuthorNotificationPreferences = {
  newAnnotation: true,
  readerProgress: false,
  surveyResponse: true,
};

export async function getAuthorNotifications(profileId: string): Promise<AuthorNotification[]> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("author_notifications")
    .select("id, event_type, title, body, href, read_at, created_at")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) throw new Error(error.message);

  return (data ?? []).map((notification) => ({
    body: notification.body,
    createdAt: notification.created_at,
    eventType: notification.event_type as AuthorNotification["eventType"],
    href: notification.href,
    id: notification.id,
    readAt: notification.read_at,
    title: notification.title,
  }));
}

export async function getAuthorNotificationPreferences(
  profileId: string,
): Promise<AuthorNotificationPreferences> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("author_notification_preferences")
    .select("new_annotation, reader_progress, survey_response")
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return defaultAuthorNotificationPreferences;

  return {
    newAnnotation: data.new_annotation,
    readerProgress: data.reader_progress,
    surveyResponse: data.survey_response,
  };
}

export async function saveAuthorNotificationPreferences(
  profileId: string,
  preferences: AuthorNotificationPreferences,
) {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase
    .from("author_notification_preferences")
    .upsert(
      {
        new_annotation: preferences.newAnnotation,
        profile_id: profileId,
        reader_progress: preferences.readerProgress,
        survey_response: preferences.surveyResponse,
      },
      { onConflict: "profile_id" },
    );

  if (error) throw new Error(error.message);
}

export async function markAuthorNotificationsRead(profileId: string, notificationIds?: string[]) {
  const supabase = createSupabaseBrowserClient();
  let query = supabase
    .from("author_notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("profile_id", profileId)
    .is("read_at", null);

  if (notificationIds && notificationIds.length > 0) {
    query = query.in("id", notificationIds);
  }

  const { error } = await query;
  if (error) throw new Error(error.message);
}
