import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { Json } from "@/lib/supabase/database.types";
import {
  MANUSCRIPT_COVERS_BUCKET,
  MANUSCRIPT_SOURCES_BUCKET,
} from "@/features/manuscript/api/manuscript-assets";
import type {
  ChapterEditorialStatus,
  CreatedManuscript,
  ImportedManuscriptChapter,
  ManuscriptDraft,
  ManuscriptGenre,
  ManuscriptSummary,
  ManuscriptWorkspaceAnnotation,
  ManuscriptWorkspaceBlock,
  ManuscriptWorkspaceData,
} from "@/features/manuscript/types";

type ManuscriptSummaryRow = {
  id: string;
  internal_title: string;
  manuscript_versions: Array<{
    archived_at: string | null;
    id: string;
    version_number: number;
    manuscript_chapters: Array<{ id: string }>;
    reading_rounds: Array<{
      reader_assignments: Array<{ id: string; status: string }>;
    }>;
  }>;
};

type ManuscriptVersionRow = {
  id: string;
  logline: string | null;
  title: string;
  version_number: number;
};

type ManuscriptAssetStorageRow = {
  storage_bucket: string;
  storage_path: string;
};

type ManuscriptChapterRow = {
  editorial_status: ChapterEditorialStatus;
  id: string;
  position: number;
  title: string;
};

type ChapterBlockRow = {
  chapter_id: string;
  content: string;
  id: string;
  kind: ManuscriptWorkspaceBlock["kind"];
  position: number;
};

type AnnotationRow = {
  author_seen_at: string | null;
  chapter_id: string;
  comment: string | null;
  created_at: string;
  id: string;
  quote: string;
  reader_assignment_id: string;
  tag_slug: string;
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
};

const manuscriptSummarySelect = `
  id,
  internal_title,
  manuscript_versions (
    archived_at,
    id,
    version_number,
    manuscript_chapters (id),
    reading_rounds (
      reader_assignments (id, status)
    )
  )
`;

function toManuscriptSummary(row: ManuscriptSummaryRow): ManuscriptSummary {
  const currentVersion = row.manuscript_versions.filter(
    (version) => version.archived_at === null,
  ).sort(
    (left, right) => right.version_number - left.version_number,
  )[0];
  const readers = currentVersion
    ? currentVersion.reading_rounds.flatMap((round) => round.reader_assignments)
      .filter((assignment) => assignment.status === "started" || assignment.status === "completed").length
    : 0;

  return {
    id: row.id,
    title: row.internal_title,
    draft: currentVersion ? `Draft ${currentVersion.version_number}` : "No draft",
    versionId: currentVersion?.id ?? null,
    versionNumber: currentVersion?.version_number ?? null,
    chapters: currentVersion?.manuscript_chapters.length ?? 0,
    readers,
  };
}

export type CreateManuscriptInput = {
  draft: ManuscriptDraft;
  importedChapters?: ImportedManuscriptChapter[];
};

function toCreateManuscriptPayload({
  draft,
  importedChapters,
}: CreateManuscriptInput): Json {
  return {
    title: draft.title.trim(),
    logline: draft.logline.trim(),
    genre_slugs: draft.genreSlugs,
    draft_number: draft.draftNumber,
    chapter_count: draft.chapters,
    word_count_band: draft.wordCountBand || null,
    reading_deadline: draft.deadline || null,
    max_readers: draft.maxReaders,
    access_mode: draft.accessMode === "open" ? "open_signup" : "invite_only",
    reader_note: draft.readerNote.trim(),
    ...(importedChapters ? {
      chapters: importedChapters.map((chapter) => ({
        blocks: chapter.blocks.map((block) => ({
          content: block.content,
          kind: block.kind,
        })),
        title: chapter.title,
      })),
    } : {}),
  };
}

export async function getManuscripts(): Promise<ManuscriptSummary[]> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("manuscripts")
    .select(manuscriptSummarySelect)
    .is("archived_at", null)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return ((data ?? []) as unknown as ManuscriptSummaryRow[]).map(
    toManuscriptSummary,
  );
}

export async function getManuscript(
  manuscriptId: string,
): Promise<ManuscriptWorkspaceData | null> {
  const supabase = createSupabaseBrowserClient();
  const { data: manuscript, error: manuscriptError } = await supabase
    .from("manuscripts")
    .select("id, internal_title")
    .eq("id", manuscriptId)
    .is("archived_at", null)
    .maybeSingle();

  if (manuscriptError) throw new Error(manuscriptError.message);
  if (!manuscript) return null;

  const { data: versions, error: versionsError } = await supabase
    .from("manuscript_versions")
    .select("id, title, version_number, logline")
    .eq("manuscript_id", manuscriptId)
    .is("archived_at", null)
    .order("version_number", { ascending: false })
    .limit(1);

  if (versionsError) throw new Error(versionsError.message);

  const version = (versions?.[0] ?? null) as ManuscriptVersionRow | null;
  if (!version) {
    return {
      chapters: [],
      id: manuscript.id,
      title: manuscript.internal_title,
      totalWordCount: 0,
      version: null,
    };
  }

  const { data: chapterRows, error: chaptersError } = await supabase
    .from("manuscript_chapters")
    .select("id, position, title, editorial_status")
    .eq("manuscript_version_id", version.id)
    .order("position", { ascending: true });

  if (chaptersError) throw new Error(chaptersError.message);

  const chapters = (chapterRows ?? []) as ManuscriptChapterRow[];
  const chapterIds = chapters.map((chapter) => chapter.id);
  if (chapterIds.length === 0) {
    return {
      chapters: [],
      id: manuscript.id,
      title: manuscript.internal_title,
      totalWordCount: 0,
      version: {
        id: version.id,
        logline: version.logline,
        number: version.version_number,
        title: version.title,
      },
    };
  }

  const [blocksResult, annotationsResult] = await Promise.all([
    supabase
      .from("chapter_blocks")
      .select("id, chapter_id, position, kind, content")
      .in("chapter_id", chapterIds)
      .order("position", { ascending: true }),
    supabase
      .from("annotations")
      .select("id, chapter_id, reader_assignment_id, tag_slug, quote, comment, created_at, author_seen_at")
      .in("chapter_id", chapterIds)
      .order("created_at", { ascending: false }),
  ]);

  if (blocksResult.error) throw new Error(blocksResult.error.message);
  if (annotationsResult.error) throw new Error(annotationsResult.error.message);

  const blocks = (blocksResult.data ?? []) as ChapterBlockRow[];
  const annotations = (annotationsResult.data ?? []) as AnnotationRow[];
  const readerAssignmentIds = [...new Set(annotations.map((annotation) => annotation.reader_assignment_id))];
  const tagSlugs = [...new Set(annotations.map((annotation) => annotation.tag_slug))];

  const [readerAssignmentsResult, annotationTagsResult] = await Promise.all([
    readerAssignmentIds.length > 0
      ? supabase
        .from("reader_assignments")
        .select("id, reader_display_name, reader_email")
        .in("id", readerAssignmentIds)
      : Promise.resolve({ data: [], error: null }),
    tagSlugs.length > 0
      ? supabase
        .from("annotation_tags")
        .select("slug, label, color")
        .in("slug", tagSlugs)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (readerAssignmentsResult.error) {
    throw new Error(readerAssignmentsResult.error.message);
  }
  if (annotationTagsResult.error) {
    throw new Error(annotationTagsResult.error.message);
  }

  const readerAssignmentsById = new Map(
    ((readerAssignmentsResult.data ?? []) as ReaderAssignmentRow[]).map((assignment) => [
      assignment.id,
      assignment,
    ]),
  );
  const annotationTagsBySlug = new Map(
    ((annotationTagsResult.data ?? []) as AnnotationTagRow[]).map((tag) => [tag.slug, tag]),
  );
  const blocksByChapterId = new Map<string, ManuscriptWorkspaceBlock[]>();
  const annotationsByChapterId = new Map<string, ManuscriptWorkspaceAnnotation[]>();

  for (const block of blocks) {
    const chapterBlocks = blocksByChapterId.get(block.chapter_id) ?? [];
    chapterBlocks.push({
      content: block.content,
      id: block.id,
      kind: block.kind,
      position: block.position,
    });
    blocksByChapterId.set(block.chapter_id, chapterBlocks);
  }

  for (const annotation of annotations) {
    const assignment = readerAssignmentsById.get(annotation.reader_assignment_id);
    const tag = annotationTagsBySlug.get(annotation.tag_slug);
    const chapterAnnotations = annotationsByChapterId.get(annotation.chapter_id) ?? [];
    chapterAnnotations.push({
      chapterId: annotation.chapter_id,
      comment: annotation.comment,
      createdAt: annotation.created_at,
      id: annotation.id,
      isSeenByAuthor: annotation.author_seen_at !== null,
      quote: annotation.quote,
      readerName: assignment?.reader_display_name ?? assignment?.reader_email ?? "Reader",
      tag: {
        color: tag?.color ?? "#6B7280",
        label: tag?.label ?? annotation.tag_slug,
      },
    });
    annotationsByChapterId.set(annotation.chapter_id, chapterAnnotations);
  }

  const workspaceChapters = chapters.map((chapter) => {
    const chapterBlocks = blocksByChapterId.get(chapter.id) ?? [];

    return {
      annotations: annotationsByChapterId.get(chapter.id) ?? [],
      blocks: chapterBlocks,
      editorialStatus: chapter.editorial_status,
      id: chapter.id,
      position: chapter.position,
      title: chapter.title,
      wordCount: chapterBlocks.reduce(
        (total, block) => total + countWords(block.content),
        0,
      ),
    };
  });

  return {
    chapters: workspaceChapters,
    id: manuscript.id,
    title: manuscript.internal_title,
    totalWordCount: workspaceChapters.reduce(
      (total, chapter) => total + chapter.wordCount,
      0,
    ),
    version: {
      id: version.id,
      logline: version.logline,
      number: version.version_number,
      title: version.title,
    },
  };
}

function countWords(content: string): number {
  const normalizedContent = content.trim();
  return normalizedContent ? normalizedContent.split(/\s+/).length : 0;
}

export async function getManuscriptGenres(): Promise<ManuscriptGenre[]> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("genres")
    .select("slug, label")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);

  return data ?? [];
}

export async function createManuscript({
  draft,
  importedChapters,
}: CreateManuscriptInput): Promise<CreatedManuscript> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.rpc("create_manuscript_from_draft", {
    p_draft: toCreateManuscriptPayload({ draft, importedChapters }),
  });

  if (error) throw new Error(error.message);

  const created = data?.[0];
  if (!created) {
    throw new Error("The manuscript was created but no identifier was returned.");
  }

  return {
    manuscriptId: created.manuscript_id,
    manuscriptVersionId: created.manuscript_version_id,
    readingRoundId: created.reading_round_id,
  };
}

export async function updateChapterEditorialStatus({
  chapterId,
  status,
}: {
  chapterId: string;
  status: ChapterEditorialStatus;
}) {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase
    .from("manuscript_chapters")
    .update({ editorial_status: status })
    .eq("id", chapterId);

  if (error) throw new Error(error.message);
}

export async function updateAnnotationSeenStatus({
  annotationId,
  isSeen,
}: {
  annotationId: string;
  isSeen: boolean;
}) {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase
    .from("annotations")
    .update({ author_seen_at: isSeen ? new Date().toISOString() : null })
    .eq("id", annotationId);

  if (error) throw new Error(error.message);
}

export type UpdateManuscriptSettingsInput = {
  logline: string;
  manuscriptId: string;
  title: string;
};

export async function updateManuscriptSettings({
  logline,
  manuscriptId,
  title,
}: UpdateManuscriptSettingsInput) {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.rpc("update_manuscript_settings", {
    p_logline: logline,
    p_manuscript_id: manuscriptId,
    p_title: title,
  });

  if (error) throw new Error(error.message);
}

export async function deleteManuscript(manuscriptId: string) {
  const supabase = createSupabaseBrowserClient();
  const { data: versionRows, error: versionsError } = await supabase
    .from("manuscript_versions")
    .select("id")
    .eq("manuscript_id", manuscriptId);

  if (versionsError) throw new Error(versionsError.message);

  const versionIds = (versionRows ?? []).map((version) => version.id);
  if (versionIds.length > 0) {
    const { data: assetRows, error: assetsError } = await supabase
      .from("manuscript_assets")
      .select("storage_bucket, storage_path")
      .in("manuscript_version_id", versionIds);

    if (assetsError) throw new Error(assetsError.message);

    const assetPathsByBucket = new Map<string, string[]>();
    for (const asset of (assetRows ?? []) as ManuscriptAssetStorageRow[]) {
      if (
        asset.storage_bucket !== MANUSCRIPT_COVERS_BUCKET
        && asset.storage_bucket !== MANUSCRIPT_SOURCES_BUCKET
      ) {
        throw new Error("This manuscript has an unsupported file attachment.");
      }

      const paths = assetPathsByBucket.get(asset.storage_bucket) ?? [];
      paths.push(asset.storage_path);
      assetPathsByBucket.set(asset.storage_bucket, paths);
    }

    for (const [bucket, paths] of assetPathsByBucket) {
      const { error: storageError } = await supabase.storage.from(bucket).remove(paths);
      if (storageError) throw new Error(storageError.message);
    }
  }

  const { data: deletedManuscript, error: deleteError } = await supabase
    .from("manuscripts")
    .delete()
    .eq("id", manuscriptId)
    .select("id")
    .maybeSingle();

  if (deleteError) throw new Error(deleteError.message);
  if (!deletedManuscript) {
    throw new Error("This manuscript could not be found or deleted.");
  }
}
