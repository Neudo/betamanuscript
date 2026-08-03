import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { Database } from "@/lib/supabase/database.types";

export type ReaderStatus = Database["public"]["Enums"]["reader_assignment_status"];

export type InviteableChapter = {
  id: string;
  position: number;
  title: string;
};

export type ManagedDraft = {
  chapters: InviteableChapter[];
  hasActiveReadingRound: boolean;
  id: string;
  number: number;
  title: string;
};

export type ManagedReaderDraftChapterAccess = {
  chapterIds: string[];
  readerAssignmentId: string;
};

export type ManagedReader = {
  accessibleDraftIds: string[];
  chapterAccessByDraftId: Record<string, ManagedReaderDraftChapterAccess>;
  email: string;
  expiresAt: string | null;
  feedbackCount: number;
  firstFeedbackAt: string | null;
  id: string;
  invitationId: string | null;
  joinedAt: string | null;
  name: string | null;
  participationOrigin: "email_invitation" | "public_link";
  readerProfileId: string | null;
  sentAt: string | null;
  startedAt: string | null;
  status: ReaderStatus;
};

export type ManagedReaderPlaceRequest = {
  cancelledAt: string | null;
  id: string;
  readerEmail: string;
  readerName: string;
  readerProfileId: string;
  readingRoundId: string;
  requestedAt: string;
  respondedAt: string | null;
  status: Database["public"]["Enums"]["reader_place_request_status"];
};

export type ManuscriptReaders = {
  drafts: ManagedDraft[];
  id: string;
  maxReaders: number | null;
  placeRequests: ManagedReaderPlaceRequest[];
  publicLinkId: string | null;
  readingRoundId: string | null;
  readers: ManagedReader[];
  title: string;
};

type ReaderAssignmentRow = {
  first_feedback_at: string | null;
  id: string;
  joined_at: string | null;
  participation_origin: "email_invitation" | "public_link";
  reader_display_name: string | null;
  reader_email: string;
  reader_profile_id: string | null;
  reader_draft_access: { id: string } | null;
  reader_assignment_chapter_access: Array<{ chapter_id: string }>;
  reading_invitations: {
    expires_at: string | null;
    id: string;
    sent_at: string | null;
  } | null;
  started_at: string | null;
  status: ReaderStatus;
};

type ReaderAssignmentWithRound = ReaderAssignmentRow & {
  manuscriptVersionId: string;
  readingRoundId: string;
  readingRoundCreatedAt: string;
};

type ManuscriptReadersRow = {
  id: string;
  internal_title: string;
  manuscript_versions: Array<{
    archived_at: string | null;
    id: string;
    manuscript_chapters: Array<InviteableChapter & { archived_at: string | null }>;
    title: string;
    version_number: number;
    reading_rounds: Array<{
      created_at: string;
      id: string;
      max_readers: number;
      status: Database["public"]["Enums"]["reading_round_status"];
      reader_assignments: ReaderAssignmentRow[];
    }>;
  }>;
};

const readerStatusRank: Record<ReaderStatus, number> = {
  active: 3,
  completed: 4,
  pending: 2,
  revoked: 1,
  started: 3,
};

function latestDate(left: string | null, right: string | null) {
  if (!left) return right;
  if (!right) return left;
  return left > right ? left : right;
}

function toManagedReader(
  assignments: ReaderAssignmentWithRound[],
  accessibleDraftIds: string[],
  feedbackCountByAssignmentId: Map<string, number>,
): ManagedReader {
  const sortedAssignments = [...assignments].sort((left, right) => {
    const statusDifference = readerStatusRank[right.status] - readerStatusRank[left.status];
    if (statusDifference !== 0) return statusDifference;

    return (right.started_at ?? "").localeCompare(left.started_at ?? "");
  });
  const statusSource = sortedAssignments[0];
  const invitationSource = assignments.find((assignment) => (
    assignment.reading_invitations && assignment.status !== "revoked"
  )) ?? assignments.find((assignment) => assignment.reading_invitations) ?? statusSource;
  const chapterAccessByDraftId: Record<string, ManagedReaderDraftChapterAccess> = {};

  for (const assignment of [...assignments].sort((left, right) => (
    right.readingRoundCreatedAt.localeCompare(left.readingRoundCreatedAt)
  ))) {
    if (chapterAccessByDraftId[assignment.manuscriptVersionId]) continue;

    chapterAccessByDraftId[assignment.manuscriptVersionId] = {
      chapterIds: assignment.reader_assignment_chapter_access.map((access) => access.chapter_id),
      readerAssignmentId: assignment.id,
    };
  }

  return {
    accessibleDraftIds,
    chapterAccessByDraftId,
    email: statusSource.reader_email,
    expiresAt: invitationSource.reading_invitations?.expires_at ?? null,
    feedbackCount: assignments.reduce(
      (count, assignment) => count + (feedbackCountByAssignmentId.get(assignment.id) ?? 0),
      0,
    ),
    firstFeedbackAt: assignments.reduce(
      (latest, assignment) => latestDate(latest, assignment.first_feedback_at),
      null as string | null,
    ),
    id: invitationSource.id,
    invitationId: invitationSource.reading_invitations?.id ?? null,
    joinedAt: assignments.reduce(
      (latest, assignment) => latestDate(latest, assignment.joined_at),
      null as string | null,
    ),
    name: statusSource.reader_display_name,
    participationOrigin: statusSource.participation_origin,
    readerProfileId: statusSource.reader_profile_id,
    sentAt: invitationSource.reading_invitations?.sent_at ?? null,
    startedAt: assignments.reduce(
      (latest, assignment) => latestDate(latest, assignment.started_at),
      null as string | null,
    ),
    status: statusSource.status,
  };
}

export async function getManuscriptReaders(): Promise<ManuscriptReaders[]> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("manuscripts")
    .select(`
      id,
      internal_title,
      manuscript_versions (
        archived_at,
        id,
        title,
        version_number,
        manuscript_chapters (id, position, title, archived_at),
        reading_rounds (
          id,
          created_at,
          max_readers,
          status,
          reader_assignments (
            id,
            reader_email,
            reader_display_name,
            reader_profile_id,
            participation_origin,
            joined_at,
            first_feedback_at,
            status,
            started_at,
            reader_draft_access (id),
            reader_assignment_chapter_access (chapter_id),
            reading_invitations (id, sent_at, expires_at)
          )
        )
      )
    `)
    .is("archived_at", null)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  const manuscripts = (data ?? []) as unknown as ManuscriptReadersRow[];
  const readerAssignmentIds = [...new Set(manuscripts.flatMap((manuscript) => (
    manuscript.manuscript_versions.flatMap((version) => (
      version.reading_rounds.flatMap((round) => (
        round.reader_assignments.map((assignment) => assignment.id)
      ))
    ))
  )))];
  const readingRoundIds = [...new Set(manuscripts.flatMap((manuscript) => (
    manuscript.manuscript_versions.flatMap((version) => version.reading_rounds.map((round) => round.id))
  )))];
  const [annotationsResult, generalAnnotationsResult, accessLinksResult, placeRequestsResult] = await Promise.all([
    readerAssignmentIds.length > 0
      ? supabase
        .from("annotations")
        .select("reader_assignment_id")
        .in("reader_assignment_id", readerAssignmentIds)
        .is("archived_at", null)
      : Promise.resolve({ data: [], error: null }),
    readerAssignmentIds.length > 0
      ? supabase
        .from("chapter_general_comments")
        .select("reader_assignment_id")
        .in("reader_assignment_id", readerAssignmentIds)
        .is("archived_at", null)
      : Promise.resolve({ data: [], error: null }),
    readingRoundIds.length > 0
      ? supabase
        .from("reading_round_access_links")
        .select("id, reading_round_id")
        .in("reading_round_id", readingRoundIds)
        .is("revoked_at", null)
      : Promise.resolve({ data: [], error: null }),
    supabase.rpc("list_author_reader_place_requests"),
  ]);

  if (annotationsResult.error) throw new Error(annotationsResult.error.message);
  if (generalAnnotationsResult.error) throw new Error(generalAnnotationsResult.error.message);
  if (accessLinksResult.error) throw new Error(accessLinksResult.error.message);
  if (placeRequestsResult.error) throw new Error(placeRequestsResult.error.message);

  const publicLinkByReadingRoundId = new Map(
    (accessLinksResult.data ?? []).map((link) => [link.reading_round_id, link.id]),
  );
  const placeRequestsByReadingRoundId = new Map<string, ManagedReaderPlaceRequest[]>();
  for (const request of placeRequestsResult.data ?? []) {
    const requests = placeRequestsByReadingRoundId.get(request.reading_round_id) ?? [];
    requests.push({
      cancelledAt: request.cancelled_at,
      id: request.request_id,
      readerEmail: request.requester_email,
      readerName: request.requester_display_name,
      readerProfileId: request.requester_profile_id,
      readingRoundId: request.reading_round_id,
      requestedAt: request.requested_at,
      respondedAt: request.responded_at,
      status: request.status,
    });
    placeRequestsByReadingRoundId.set(request.reading_round_id, requests);
  }

  const feedbackCountByAssignmentId = new Map<string, number>();
  for (const feedback of [
    ...(annotationsResult.data ?? []),
    ...(generalAnnotationsResult.data ?? []),
  ]) {
    feedbackCountByAssignmentId.set(
      feedback.reader_assignment_id,
      (feedbackCountByAssignmentId.get(feedback.reader_assignment_id) ?? 0) + 1,
    );
  }

  return manuscripts.map((manuscript) => {
    const assignmentsByEmail = new Map<string, ReaderAssignmentWithRound[]>();
    const accessibleDraftIdsByEmail = new Map<string, Set<string>>();
    const drafts = manuscript.manuscript_versions
      .filter((version) => version.archived_at === null)
      .map((version) => {
        const readingRound = [...version.reading_rounds]
          .filter((round) => round.status !== "archived")
          .sort((left, right) => right.created_at.localeCompare(left.created_at))[0] ?? null;

        return {
          chapters: version.manuscript_chapters
            .filter((chapter) => chapter.archived_at === null)
            .sort((left, right) => left.position - right.position),
          hasActiveReadingRound: readingRound !== null,
          id: version.id,
          number: version.version_number,
          readingRound,
          title: version.title,
        };
      })
      .sort((left, right) => left.number - right.number);
    const currentReadingRound = drafts
      .flatMap((draft) => draft.readingRound ? [{
        ...draft.readingRound,
        versionNumber: draft.number,
      }] : [])
      .sort((left, right) => (
        right.versionNumber - left.versionNumber
        || right.created_at.localeCompare(left.created_at)
      ))[0];

    for (const draft of drafts) {
      if (!draft.readingRound) continue;

      for (const assignment of draft.readingRound.reader_assignments) {
        const email = assignment.reader_email.toLowerCase();
        const assignments = assignmentsByEmail.get(email) ?? [];
        assignments.push({
          ...assignment,
          manuscriptVersionId: draft.id,
          readingRoundCreatedAt: draft.readingRound.created_at,
          readingRoundId: draft.readingRound.id,
        });
        assignmentsByEmail.set(email, assignments);

        if (assignment.reader_draft_access) {
          const accessibleDraftIds = accessibleDraftIdsByEmail.get(email) ?? new Set<string>();
          accessibleDraftIds.add(draft.id);
          accessibleDraftIdsByEmail.set(email, accessibleDraftIds);
        }
      }
    }

    return {
      drafts: drafts.map((draft) => ({
        chapters: draft.chapters,
        hasActiveReadingRound: draft.hasActiveReadingRound,
        id: draft.id,
        number: draft.number,
        title: draft.title,
      })),
      id: manuscript.id,
      maxReaders: currentReadingRound?.max_readers ?? null,
      placeRequests: currentReadingRound
        ? placeRequestsByReadingRoundId.get(currentReadingRound.id) ?? []
        : [],
      publicLinkId: currentReadingRound
        ? publicLinkByReadingRoundId.get(currentReadingRound.id) ?? null
        : null,
      readingRoundId: currentReadingRound?.id ?? null,
      readers: [...assignmentsByEmail.entries()]
        .map(([email, assignments]) => toManagedReader(
          assignments,
          [...(accessibleDraftIdsByEmail.get(email) ?? new Set<string>())],
          feedbackCountByAssignmentId,
        ))
        .sort((left, right) => (right.startedAt ?? "").localeCompare(left.startedAt ?? "")),
      title: manuscript.internal_title,
    };
  });
}

export async function getInviteableChapters(manuscriptId: string): Promise<InviteableChapter[]> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("manuscript_versions")
    .select("id, manuscript_chapters (id, position, title, archived_at), reading_rounds!inner (id, created_at, status)")
    .eq("manuscript_id", manuscriptId)
    .is("archived_at", null)
    .neq("reading_rounds.status", "archived")
    .order("version_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);

  return [...(data?.manuscript_chapters ?? [])]
    .filter((chapter) => chapter.archived_at === null)
    .map((chapter) => ({
      id: chapter.id,
      position: chapter.position,
      title: chapter.title,
    }))
    .sort((left, right) => left.position - right.position);
}

type ReaderInvitationInput = {
  chapterIds: string[];
  manuscriptId: string;
  personalNote: string;
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

  if (error) throw new Error(error.message);
}

export async function updateReaderLimit({
  maxReaders,
  readingRoundId,
}: {
  maxReaders: number;
  readingRoundId: string;
}) {
  if (!Number.isInteger(maxReaders) || maxReaders < 1) {
    throw new Error("Choose a whole number greater than zero.");
  }

  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("reading_rounds")
    .update({ max_readers: maxReaders })
    .eq("id", readingRoundId)
    .select("id, max_readers")
    .single();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("The reader limit could not be updated.");

  return data;
}

export async function setReaderDraftAccess({
  enabled,
  manuscriptVersionId,
  readerProfileId,
}: {
  enabled: boolean;
  manuscriptVersionId: string;
  readerProfileId: string;
}) {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.rpc("set_reader_draft_access", {
    p_enabled: enabled,
    p_manuscript_version_id: manuscriptVersionId,
    p_reader_profile_id: readerProfileId,
  });

  if (error) throw new Error(error.message);
}

export async function setReaderChapterAccess({
  chapterIds,
  readerAssignmentId,
}: {
  chapterIds: string[];
  readerAssignmentId: string;
}) {
  if (chapterIds.length === 0) {
    throw new Error("Choose at least one chapter.");
  }

  if (new Set(chapterIds).size !== chapterIds.length) {
    throw new Error("Each chapter can only be selected once.");
  }

  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.rpc("set_reader_chapter_access", {
    p_chapter_ids: chapterIds,
    p_reader_assignment_id: readerAssignmentId,
  });

  if (error) throw new Error(error.message);
}

export async function enablePublicReadingLink(readingRoundId: string) {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.rpc("enable_public_reading_link", {
    p_reading_round_id: readingRoundId,
  });

  if (error) throw new Error(error.message);
  if (!data) throw new Error("The public reading link could not be enabled.");

  return data;
}

export async function disablePublicReadingLink(readingRoundId: string) {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.rpc("disable_public_reading_link", {
    p_reading_round_id: readingRoundId,
  });

  if (error) throw new Error(error.message);
}

export async function reviewReaderPlaceRequest({
  accept,
  requestId,
}: {
  accept: boolean;
  requestId: string;
}) {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.rpc("review_reader_place_request", {
    p_accept: accept,
    p_request_id: requestId,
  });

  if (error) throw new Error(error.message);
}
