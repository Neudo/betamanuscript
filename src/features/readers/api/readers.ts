import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { Database } from "@/lib/supabase/database.types";

export type ReaderStatus = Database["public"]["Enums"]["reader_assignment_status"];

export type ManagedReader = {
  email: string;
  expiresAt: string | null;
  id: string;
  invitationId: string | null;
  name: string | null;
  sentAt: string | null;
  startedAt: string | null;
  status: ReaderStatus;
};

export type ReaderRound = {
  deadline: string | null;
  id: string;
  manuscriptTitle: string;
  maxReaders: number;
  name: string;
  readers: ManagedReader[];
  status: Database["public"]["Enums"]["reading_round_status"];
  versionTitle: string;
};

type ReaderRoundRow = {
  id: string;
  max_readers: number;
  name: string;
  reading_deadline: string | null;
  status: ReaderRound["status"];
  manuscript_versions: {
    title: string;
    manuscripts: { internal_title: string } | null;
  } | null;
  reader_assignments: Array<{
    id: string;
    reader_display_name: string | null;
    reader_email: string;
    reading_invitations: {
      expires_at: string | null;
      id: string;
      sent_at: string | null;
    } | null;
    started_at: string | null;
    status: ReaderStatus;
  }>;
};

export async function getReaderRounds(): Promise<ReaderRound[]> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("reading_rounds")
    .select(`
      id,
      name,
      status,
      max_readers,
      reading_deadline,
      manuscript_versions!inner (
        title,
        manuscripts!inner (internal_title)
      ),
      reader_assignments (
        id,
        reader_email,
        reader_display_name,
        status,
        started_at,
        reading_invitations (id, sent_at, expires_at)
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as unknown as ReaderRoundRow[]).map((round) => ({
    deadline: round.reading_deadline,
    id: round.id,
    manuscriptTitle: round.manuscript_versions?.manuscripts?.internal_title ?? "Untitled manuscript",
    maxReaders: round.max_readers,
    name: round.name,
    readers: [...round.reader_assignments]
      .sort((left, right) => right.started_at?.localeCompare(left.started_at ?? "") ?? 0)
      .map((assignment) => ({
        email: assignment.reader_email,
        expiresAt: assignment.reading_invitations?.expires_at ?? null,
        id: assignment.id,
        invitationId: assignment.reading_invitations?.id ?? null,
        name: assignment.reader_display_name,
        sentAt: assignment.reading_invitations?.sent_at ?? null,
        startedAt: assignment.started_at,
        status: assignment.status,
      })),
    status: round.status,
    versionTitle: round.manuscript_versions?.title ?? "Untitled draft",
  }));
}

type ReaderInvitationInput = {
  personalNote: string;
  readingRoundId: string;
  recipientEmail: string;
};

async function requestReaderInvitation(
  path: string,
  options: RequestInit,
) {
  const response = await fetch(path, options);
  const body = (await response.json()) as { error?: string; ok?: boolean };

  if (!response.ok || !body.ok) {
    throw new Error(body.error ?? "The invitation could not be sent.");
  }
}

export async function inviteReader(input: ReaderInvitationInput) {
  return requestReaderInvitation("/api/reader-invitations", {
    body: JSON.stringify(input),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
}

export async function resendReaderInvitation(invitationId: string) {
  return requestReaderInvitation(
    `/api/reader-invitations/${invitationId}/resend`,
    { method: "POST" },
  );
}

export async function revokeReaderInvitation(invitationId: string) {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.rpc("revoke_reading_invitation", {
    p_invitation_id: invitationId,
  });

  if (error) {
    throw new Error(error.message);
  }
}
