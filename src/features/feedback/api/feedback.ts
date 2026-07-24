import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { FeedbackAnnotation } from "@/features/feedback/types";

type ManuscriptVersionRow = {
  id: string;
};

type ChapterRow = {
  id: string;
  position: number;
  title: string;
};

type AnnotationRow = {
  chapter_block_id: string;
  chapter_id: string;
  comment: string | null;
  created_at: string;
  id: string;
  quote: string;
  reader_assignment_id: string;
  tag_id: string;
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

/**
 * Reads only the annotations attached to the current draft of one manuscript.
 * Keeping this lookup explicit makes the author-facing scope easy to audit and
 * avoids mixing feedback from archived drafts.
 */
export async function getManuscriptFeedback(
  manuscriptId: string,
): Promise<FeedbackAnnotation[]> {
  const supabase = createSupabaseBrowserClient();

  const { data: versionRows, error: versionError } = await supabase
    .from("manuscript_versions")
    .select("id")
    .eq("manuscript_id", manuscriptId)
    .is("archived_at", null)
    .order("version_number", { ascending: false })
    .limit(1);

  if (versionError) throw new Error(versionError.message);

  const version = (versionRows?.[0] ?? null) as ManuscriptVersionRow | null;
  if (!version) return [];

  const { data: chapterRows, error: chapterError } = await supabase
    .from("manuscript_chapters")
    .select("id, position, title")
    .eq("manuscript_version_id", version.id)
    .order("position", { ascending: true });

  if (chapterError) throw new Error(chapterError.message);

  const chapters = (chapterRows ?? []) as ChapterRow[];
  const chapterIds = chapters.map((chapter) => chapter.id);
  if (chapterIds.length === 0) return [];

  const { data: annotationRows, error: annotationError } = await supabase
    .from("annotations")
    .select("id, chapter_id, chapter_block_id, reader_assignment_id, tag_id, quote, comment, created_at")
    .in("chapter_id", chapterIds)
    .order("created_at", { ascending: false });

  if (annotationError) throw new Error(annotationError.message);

  const annotations = (annotationRows ?? []) as AnnotationRow[];
  if (annotations.length === 0) return [];

  const readerAssignmentIds = [...new Set(
    annotations.map((annotation) => annotation.reader_assignment_id),
  )];
  const tagIds = [...new Set(annotations.map((annotation) => annotation.tag_id))];

  const [readerAssignmentsResult, annotationTagsResult] = await Promise.all([
    supabase
      .from("reader_assignments")
      .select("id, reader_display_name, reader_email")
      .in("id", readerAssignmentIds),
    supabase
      .from("manuscript_annotation_tags")
      .select("id, slug, label, color, sort_order")
      .in("id", tagIds),
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

  return annotations.flatMap((annotation) => {
    const chapter = chaptersById.get(annotation.chapter_id);
    if (!chapter) return [];

    const assignment = readerAssignmentsById.get(annotation.reader_assignment_id);
    const readerName = assignment?.reader_display_name
      ?? assignment?.reader_email
      ?? "Reader";
    const tag = annotationTagsById.get(annotation.tag_id);

    return [{
      chapter,
      chapterBlockId: annotation.chapter_block_id,
      comment: annotation.comment,
      createdAt: annotation.created_at,
      id: annotation.id,
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
