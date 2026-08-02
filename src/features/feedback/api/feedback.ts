import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { FeedbackAnnotation } from "@/features/feedback/types";

type ManuscriptVersionRow = {
  id: string;
};

type ChapterRow = {
  archived_at: string | null;
  id: string;
  position: number;
  title: string;
};

type AnnotationRow = {
  archived_at: string | null;
  archived_reason: FeedbackAnnotation["archivedReason"];
  author_seen_at: string | null;
  chapter_block_id: string;
  chapter_id: string;
  comment: string | null;
  created_at: string;
  id: string;
  quote: string;
  reader_assignment_id: string;
  tag_id: string;
};

type GeneralCommentRow = {
  archived_at: string | null;
  archived_reason: FeedbackAnnotation["archivedReason"];
  author_seen_at: string | null;
  chapter_id: string;
  comment: string;
  created_at: string;
  id: string;
  reader_assignment_id: string;
};

type ReaderAssignmentRow = {
  id: string;
  reader_display_name: string | null;
  reader_email: string;
};

type AnnotationTagRow = {
  color: string;
  label: string;
  slug: string;
  sort_order: number;
};

const readerColors = ["#7B1D1D", "#3B4A8A", "#1E5C2E", "#7A4800", "#1A5C50"];
const generalCommentTag = {
  color: "#6B7280",
  label: "General annotation",
  slug: "general-comment",
  sortOrder: 0,
} as const;

/**
 * Reads only the annotations attached to one selected draft of a manuscript.
 * Keeping this lookup explicit makes the author-facing scope easy to audit and
 * avoids mixing feedback from archived drafts.
 */
export async function getManuscriptFeedback(
  manuscriptId: string,
  manuscriptVersionId: string | null = null,
): Promise<FeedbackAnnotation[]> {
  const supabase = createSupabaseBrowserClient();

  const { data: versionRows, error: versionError } = await supabase
    .from("manuscript_versions")
    .select("id")
    .eq("manuscript_id", manuscriptId)
    .is("archived_at", null)
    .order("version_number", { ascending: false });

  if (versionError) throw new Error(versionError.message);

  const activeVersions = (versionRows ?? []) as ManuscriptVersionRow[];
  const version = manuscriptVersionId
    ? activeVersions.find((item) => item.id === manuscriptVersionId) ?? activeVersions[0] ?? null
    : activeVersions[0] ?? null;
  if (!version) return [];

  const { data: chapterRows, error: chapterError } = await supabase
    .from("manuscript_chapters")
    .select("id, position, title, archived_at")
    .eq("manuscript_version_id", version.id)
    .order("position", { ascending: true });

  if (chapterError) throw new Error(chapterError.message);

  const chapters = (chapterRows ?? []) as ChapterRow[];
  const chapterIds = chapters.map((chapter) => chapter.id);
  if (chapterIds.length === 0) return [];

  const [annotationsResult, generalCommentsResult] = await Promise.all([
    supabase
      .from("annotations")
      .select("id, chapter_id, chapter_block_id, reader_assignment_id, tag_id, quote, comment, created_at, author_seen_at, archived_at, archived_reason")
      .in("chapter_id", chapterIds)
      .order("created_at", { ascending: false }),
    supabase
      .from("chapter_general_comments")
      .select("id, chapter_id, reader_assignment_id, comment, created_at, author_seen_at, archived_at, archived_reason")
      .in("chapter_id", chapterIds)
      .order("created_at", { ascending: false }),
  ]);

  if (annotationsResult.error) throw new Error(annotationsResult.error.message);
  if (generalCommentsResult.error) throw new Error(generalCommentsResult.error.message);

  const annotations = (annotationsResult.data ?? []) as AnnotationRow[];
  const generalComments = (generalCommentsResult.data ?? []) as GeneralCommentRow[];
  if (annotations.length === 0 && generalComments.length === 0) return [];

  const readerAssignmentIds = [...new Set(
    [
      ...annotations.map((annotation) => annotation.reader_assignment_id),
      ...generalComments.map((generalComment) => generalComment.reader_assignment_id),
    ],
  )];
  const tagIds = [...new Set(annotations.map((annotation) => annotation.tag_id))];

  const [readerAssignmentsResult, annotationTagsResult] = await Promise.all([
    supabase
      .from("reader_assignments")
      .select("id, reader_display_name, reader_email")
      .in("id", readerAssignmentIds),
    tagIds.length > 0
      ? supabase
        .from("manuscript_annotation_tags")
        .select("id, slug, label, color, sort_order")
        .in("id", tagIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (readerAssignmentsResult.error) {
    throw new Error(readerAssignmentsResult.error.message);
  }
  if (annotationTagsResult.error) {
    throw new Error(annotationTagsResult.error.message);
  }

  const chaptersById = new Map(chapters.map((chapter) => [chapter.id, chapter]));
  const readerAssignmentsById = new Map(
    ((readerAssignmentsResult.data ?? []) as ReaderAssignmentRow[]).map((reader) => [
      reader.id,
      reader,
    ]),
  );
  const annotationTagsById = new Map(
    ((annotationTagsResult.data ?? []) as Array<AnnotationTagRow & { id: string }>).map((tag) => [
      tag.id,
      tag,
    ]),
  );

  const passageAnnotations = annotations.flatMap((annotation) => {
    const chapter = chaptersById.get(annotation.chapter_id);
    if (!chapter) return [];

    const assignment = readerAssignmentsById.get(annotation.reader_assignment_id);
    const readerName = assignment?.reader_display_name
      ?? assignment?.reader_email
      ?? "Reader";
    const tag = annotationTagsById.get(annotation.tag_id);

    return [{
      archivedAt: annotation.archived_at,
      archivedReason: annotation.archived_reason,
      chapter,
      chapterBlockId: annotation.chapter_block_id,
      comment: annotation.comment,
      createdAt: annotation.created_at,
      id: annotation.id,
      isSeenByAuthor: annotation.author_seen_at !== null,
      kind: "annotation",
      quote: annotation.quote,
      reader: {
        color: colorForReader(annotation.reader_assignment_id),
        id: annotation.reader_assignment_id,
        initials: initialsFor(readerName),
        name: readerName,
      },
      tag: {
        color: tag?.color ?? "#6B7280",
        label: tag?.label ?? "Unknown tag",
        slug: tag?.slug ?? "unknown",
        sortOrder: tag?.sort_order ?? Number.MAX_SAFE_INTEGER,
      },
    } satisfies FeedbackAnnotation];
  });

  const chapterGeneralComments = generalComments.flatMap((generalComment) => {
    const chapter = chaptersById.get(generalComment.chapter_id);
    if (!chapter) return [];

    const assignment = readerAssignmentsById.get(generalComment.reader_assignment_id);
    const readerName = assignment?.reader_display_name
      ?? assignment?.reader_email
      ?? "Reader";

    return [{
      archivedAt: generalComment.archived_at,
      archivedReason: generalComment.archived_reason,
      chapter,
      chapterBlockId: null,
      comment: generalComment.comment,
      createdAt: generalComment.created_at,
      id: generalComment.id,
      isSeenByAuthor: generalComment.author_seen_at !== null,
      kind: "general-comment",
      quote: null,
      reader: {
        color: colorForReader(generalComment.reader_assignment_id),
        id: generalComment.reader_assignment_id,
        initials: initialsFor(readerName),
        name: readerName,
      },
      tag: generalCommentTag,
    } satisfies FeedbackAnnotation];
  });

  return [...passageAnnotations, ...chapterGeneralComments]
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export async function updateFeedbackSeenStatus({
  feedbackId,
  isSeen,
  kind,
}: {
  feedbackId: string;
  isSeen: boolean;
  kind: FeedbackAnnotation["kind"];
}) {
  const supabase = createSupabaseBrowserClient();
  const authorSeenAt = isSeen ? new Date().toISOString() : null;
  const { error } = kind === "annotation"
    ? await supabase
      .from("annotations")
      .update({ author_seen_at: authorSeenAt })
      .eq("id", feedbackId)
    : await supabase
      .from("chapter_general_comments")
      .update({ author_seen_at: authorSeenAt })
      .eq("id", feedbackId);

  if (error) throw new Error(error.message);
}

export async function deleteArchivedFeedback({
  feedbackId,
  kind,
}: {
  feedbackId: string;
  kind: FeedbackAnnotation["kind"];
}) {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.rpc("delete_archived_feedback", {
    p_feedback_id: feedbackId,
    p_feedback_kind: kind,
  });

  if (error) throw new Error(error.message);
}

export async function archiveFeedback({
  feedbackId,
  kind,
}: {
  feedbackId: string;
  kind: FeedbackAnnotation["kind"];
}) {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.rpc("archive_feedback", {
    p_feedback_id: feedbackId,
    p_feedback_kind: kind,
  });

  if (error) throw new Error(error.message);
}

function initialsFor(name: string): string {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return initials || "R";
}

function colorForReader(readerAssignmentId: string): string {
  let hash = 0;
  for (let index = 0; index < readerAssignmentId.length; index += 1) {
    hash = ((hash << 5) - hash + readerAssignmentId.charCodeAt(index)) | 0;
  }

  return readerColors[Math.abs(hash) % readerColors.length];
}
