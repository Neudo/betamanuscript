import type { SupabaseClient } from "@supabase/supabase-js";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { Database, Json } from "@/lib/supabase/database.types";
import {
  MANUSCRIPT_COVERS_BUCKET,
  MANUSCRIPT_SOURCES_BUCKET,
} from "@/features/manuscript/api/manuscript-assets";
import type {
  ChapterEditorialStatus,
  CreatedManuscript,
  CreatedManuscriptDraftVersion,
  ImportedManuscriptChapter,
  ManuscriptDraft,
  ManuscriptGenre,
  ManuscriptSummary,
  ManuscriptWorkspaceAnnotation,
  ManuscriptWorkspaceBlock,
  ManuscriptWorkspaceData,
  ManuscriptWorkspaceGeneralComment,
  ManuscriptWorkspaceVersion,
  ManuscriptWordCountBand,
} from "@/features/manuscript/types";
import {
  normalizeRichText,
  type ManuscriptRichTextBlock,
} from "@/features/manuscript/lib/rich-text";

type ManuscriptSummaryRow = {
  id: string;
  internal_title: string;
  manuscript_versions: Array<{
    archived_at: string | null;
    id: string;
    version_number: number;
    manuscript_chapters: Array<{ archived_at: string | null; id: string }>;
    reading_rounds: Array<{
      reader_assignments: Array<{ id: string; status: string }>;
    }>;
  }>;
};

type ManuscriptVersionRow = {
  estimated_word_count_band: ManuscriptWordCountBand | null;
  id: string;
  logline: string | null;
  title: string;
  version_number: number;
};

type ReadingRoundSettingsRow = {
  max_readers: number;
  reader_note: string | null;
  reader_closing_note: string | null;
  reading_deadline: string | null;
};

type ManuscriptAssetStorageRow = {
  storage_bucket: string;
  storage_path: string;
};

type ManuscriptVersionGenreRow = {
  genre_slug: string;
  sort_order: number;
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
  rich_content: Json;
};

type AnnotationRow = {
  author_seen_at: string | null;
  chapter_block_id: string;
  chapter_id: string;
  comment: string | null;
  created_at: string;
  id: string;
  quote: string;
  reader_assignment_id: string;
  selection_end: number;
  selection_end_chapter_block_id: string | null;
  selection_end_offset: number | null;
  selection_start: number;
  tag_id: string;
};

type GeneralCommentRow = {
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
};

const manuscriptSummarySelect = `
  id,
  internal_title,
  manuscript_versions (
    archived_at,
    id,
    version_number,
    manuscript_chapters (id, archived_at),
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
    chapters: currentVersion?.manuscript_chapters.filter((chapter) => chapter.archived_at === null).length ?? 0,
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
  const chapters = importedChapters?.filter((chapter) =>
    chapter.blocks.some((block) => countWords(block.content) > 0),
  );

  return {
    title: draft.title.trim(),
    logline: draft.logline.trim(),
    genre_slugs: draft.genreSlugs,
    draft_number: draft.draftNumber,
    chapter_count: draft.chapters,
    word_count_band: draft.wordCountBand || null,
    reading_deadline: draft.deadline || null,
    reader_closing_note: draft.readerClosingNote.trim(),
    max_readers: draft.maxReaders,
    access_mode: "invite_only",
    reader_note: draft.readerNote.trim(),
    ...(chapters ? {
      chapters: chapters.map((chapter) => ({
        blocks: chapter.blocks.map((block) => ({
          content: block.content,
          kind: block.kind,
          rich_content: block.richContent,
        })),
        title: chapter.title,
      })),
    } : {}),
  };
}

export async function getManuscripts(): Promise<ManuscriptSummary[]> {
  return getManuscriptsWithClient(createSupabaseBrowserClient());
}

export async function getManuscriptsWithClient(
  client: SupabaseClient<Database>,
): Promise<ManuscriptSummary[]> {
  const supabase = client;
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
  manuscriptVersionId: string | null = null,
): Promise<ManuscriptWorkspaceData | null> {
  return getManuscriptWithClient(
    createSupabaseBrowserClient(),
    manuscriptId,
    manuscriptVersionId,
  );
}

export async function getManuscriptWithClient(
  client: SupabaseClient<Database>,
  manuscriptId: string,
  manuscriptVersionId: string | null = null,
): Promise<ManuscriptWorkspaceData | null> {
  const supabase = client;
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
    .select("id, title, version_number, logline, estimated_word_count_band")
    .eq("manuscript_id", manuscriptId)
    .is("archived_at", null)
    .order("version_number", { ascending: false });

  if (versionsError) throw new Error(versionsError.message);

  const manuscriptVersions = (versions ?? []) as ManuscriptVersionRow[];
  const version = manuscriptVersionId
    ? manuscriptVersions.find((item) => item.id === manuscriptVersionId) ?? manuscriptVersions[0] ?? null
    : manuscriptVersions[0] ?? null;
  if (!version) {
    return {
      chapters: [],
      coverUrl: null,
      genreSlugs: [],
      id: manuscript.id,
      maxReaders: 5,
      readerDeadline: null,
      readerClosingNote: null,
      readerNote: null,
      title: manuscript.internal_title,
      totalWordCount: 0,
      version: null,
      versions: manuscriptVersions.map(toWorkspaceVersion),
    };
  }

  const [readingRoundsResult, genreResult, coverResult, chaptersResult] = await Promise.all([
    supabase
      .from("reading_rounds")
      .select("max_readers, reading_deadline, reader_note, reader_closing_note")
      .eq("manuscript_version_id", version.id)
      .neq("status", "archived")
      .order("created_at", { ascending: false })
      .limit(1),
    supabase
      .from("manuscript_version_genres")
      .select("genre_slug, sort_order")
      .eq("manuscript_version_id", version.id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("manuscript_assets")
      .select("storage_bucket, storage_path")
      .eq("manuscript_version_id", version.id)
      .eq("asset_kind", "cover")
      .eq("processing_status", "available")
      .maybeSingle(),
    supabase
      .from("manuscript_chapters")
      .select("id, position, title, editorial_status")
      .eq("manuscript_version_id", version.id)
      .is("archived_at", null)
      .order("position", { ascending: true }),
  ]);

  if (readingRoundsResult.error) throw new Error(readingRoundsResult.error.message);
  if (genreResult.error) throw new Error(genreResult.error.message);
  if (coverResult.error) throw new Error(coverResult.error.message);
  if (chaptersResult.error) throw new Error(chaptersResult.error.message);

  const readingRound = readingRoundsResult.data?.[0] as ReadingRoundSettingsRow | undefined;
  const readerClosingNote = readingRound?.reader_closing_note ?? null;
  const readerDeadline = readingRound?.reading_deadline ?? null;
  const readerNote = readingRound?.reader_note ?? null;
  const maxReaders = readingRound?.max_readers ?? 5;
  const genreSlugs = ((genreResult.data ?? []) as ManuscriptVersionGenreRow[]).map(
    (genre) => genre.genre_slug,
  );
  const coverAsset = coverResult.data as ManuscriptAssetStorageRow | null;
  let coverUrl: string | null = null;

  if (coverAsset) {
    const { data: signedCover, error: signedCoverError } = await supabase.storage
      .from(coverAsset.storage_bucket)
      .createSignedUrl(coverAsset.storage_path, 60 * 60);

    if (signedCoverError) throw new Error(signedCoverError.message);
    coverUrl = signedCover.signedUrl;
  }

  const chapters = (chaptersResult.data ?? []) as ManuscriptChapterRow[];
  const chapterIds = chapters.map((chapter) => chapter.id);
  if (chapterIds.length === 0) {
    return {
      chapters: [],
      coverUrl,
      genreSlugs,
      id: manuscript.id,
      maxReaders,
      readerDeadline,
      readerClosingNote,
      readerNote,
      title: manuscript.internal_title,
      totalWordCount: 0,
      version: {
        ...toWorkspaceVersion(version),
      },
      versions: manuscriptVersions.map(toWorkspaceVersion),
    };
  }

  const [blocksResult, annotationsResult, generalCommentsResult] = await Promise.all([
    supabase
      .from("chapter_blocks")
      .select("id, chapter_id, position, kind, content, rich_content")
      .in("chapter_id", chapterIds)
      .is("archived_at", null)
      .order("position", { ascending: true }),
    supabase
      .from("annotations")
      .select("id, chapter_id, chapter_block_id, reader_assignment_id, tag_id, quote, selection_start, selection_end, selection_end_chapter_block_id, selection_end_offset, comment, created_at, author_seen_at")
      .in("chapter_id", chapterIds)
      .is("archived_at", null)
      .order("created_at", { ascending: false }),
    supabase
      .from("chapter_general_comments")
      .select("id, chapter_id, reader_assignment_id, comment, created_at, author_seen_at")
      .in("chapter_id", chapterIds)
      .is("archived_at", null)
      .order("created_at", { ascending: false }),
  ]);

  if (blocksResult.error) throw new Error(blocksResult.error.message);
  if (annotationsResult.error) throw new Error(annotationsResult.error.message);
  if (generalCommentsResult.error) throw new Error(generalCommentsResult.error.message);

  const blocks = (blocksResult.data ?? []) as ChapterBlockRow[];
  const annotations = (annotationsResult.data ?? []) as AnnotationRow[];
  const generalComments = (generalCommentsResult.data ?? []) as GeneralCommentRow[];
  const readerAssignmentIds = [...new Set([
    ...annotations.map((annotation) => annotation.reader_assignment_id),
    ...generalComments.map((generalComment) => generalComment.reader_assignment_id),
  ])];
  const tagIds = [...new Set(annotations.map((annotation) => annotation.tag_id))];

  const [readerAssignmentsResult, annotationTagsResult] = await Promise.all([
    readerAssignmentIds.length > 0
      ? supabase
        .from("reader_assignments")
        .select("id, reader_display_name, reader_email")
        .in("id", readerAssignmentIds)
      : Promise.resolve({ data: [], error: null }),
    tagIds.length > 0
      ? supabase
        .from("manuscript_annotation_tags")
        .select("id, slug, label, color")
        .in("id", tagIds)
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
  const annotationTagsById = new Map(
    ((annotationTagsResult.data ?? []) as Array<AnnotationTagRow & { id: string }>).map((tag) => [tag.id, tag]),
  );
  const blocksByChapterId = new Map<string, ManuscriptWorkspaceBlock[]>();
  const annotationsByChapterId = new Map<string, ManuscriptWorkspaceAnnotation[]>();
  const generalCommentsByChapterId = new Map<string, ManuscriptWorkspaceGeneralComment[]>();

  for (const block of blocks) {
    const chapterBlocks = blocksByChapterId.get(block.chapter_id) ?? [];
    chapterBlocks.push({
      content: block.content,
      id: block.id,
      kind: block.kind,
      position: block.position,
      richContent: normalizeRichText(block.rich_content, block.content),
    });
    blocksByChapterId.set(block.chapter_id, chapterBlocks);
  }

  for (const annotation of annotations) {
    const assignment = readerAssignmentsById.get(annotation.reader_assignment_id);
    const tag = annotationTagsById.get(annotation.tag_id);
    const chapterAnnotations = annotationsByChapterId.get(annotation.chapter_id) ?? [];
    chapterAnnotations.push({
      chapterBlockId: annotation.chapter_block_id,
      chapterId: annotation.chapter_id,
      comment: annotation.comment,
      createdAt: annotation.created_at,
      id: annotation.id,
      isSeenByAuthor: annotation.author_seen_at !== null,
      quote: annotation.quote,
      readerName: assignment?.reader_display_name ?? assignment?.reader_email ?? "Reader",
      selectionEnd: annotation.selection_end,
      selectionEndChapterBlockId: annotation.selection_end_chapter_block_id,
      selectionEndOffset: annotation.selection_end_offset,
      selectionStart: annotation.selection_start,
      tag: {
        color: tag?.color ?? "#6B7280",
        label: tag?.label ?? "Unknown tag",
        slug: tag?.slug ?? "unknown",
      },
    });
    annotationsByChapterId.set(annotation.chapter_id, chapterAnnotations);
  }

  for (const generalComment of generalComments) {
    const assignment = readerAssignmentsById.get(generalComment.reader_assignment_id);
    const chapterGeneralComments = generalCommentsByChapterId.get(generalComment.chapter_id) ?? [];
    chapterGeneralComments.push({
      chapterId: generalComment.chapter_id,
      comment: generalComment.comment,
      createdAt: generalComment.created_at,
      id: generalComment.id,
      isSeenByAuthor: generalComment.author_seen_at !== null,
      readerName: assignment?.reader_display_name ?? assignment?.reader_email ?? "Reader",
    });
    generalCommentsByChapterId.set(generalComment.chapter_id, chapterGeneralComments);
  }

  const workspaceChapters = chapters.map((chapter) => {
    const chapterBlocks = blocksByChapterId.get(chapter.id) ?? [];

    return {
      annotations: annotationsByChapterId.get(chapter.id) ?? [],
      blocks: chapterBlocks,
      editorialStatus: chapter.editorial_status,
      generalComments: generalCommentsByChapterId.get(chapter.id) ?? [],
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
    coverUrl,
    genreSlugs,
    id: manuscript.id,
    maxReaders,
    readerDeadline,
    readerClosingNote,
    readerNote,
    title: manuscript.internal_title,
    totalWordCount: workspaceChapters.reduce(
      (total, chapter) => total + chapter.wordCount,
      0,
    ),
    version: {
      ...toWorkspaceVersion(version),
    },
    versions: manuscriptVersions.map(toWorkspaceVersion),
  };
}

function toWorkspaceVersion(version: ManuscriptVersionRow): ManuscriptWorkspaceVersion {
  return {
    estimatedWordCountBand: version.estimated_word_count_band,
    id: version.id,
    logline: version.logline,
    number: version.version_number,
    title: version.title,
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

  const manuscript = {
    manuscriptId: created.manuscript_id,
    manuscriptVersionId: created.manuscript_version_id,
    readingRoundId: created.reading_round_id,
  };

  if (importedChapters) {
    await setManuscriptVersionRichContent(
      supabase,
      manuscript.manuscriptVersionId,
      importedChapters.map((chapter) => ({ blocks: chapter.blocks })),
    );
  }

  return manuscript;
}

export async function createManuscriptDraftVersion(
  {
    sourceVersionId,
    importedChapters,
  }: {
    sourceVersionId: string;
    importedChapters?: ImportedManuscriptChapter[];
  },
): Promise<CreatedManuscriptDraftVersion> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = importedChapters
    ? await supabase.rpc("create_manuscript_draft_version_from_source", {
      p_imported_chapters: importedChapters.map((chapter) => ({
        blocks: chapter.blocks.map((block) => ({
          content: block.content,
          kind: block.kind,
        })),
        title: chapter.title,
      })) as Json,
      p_source_version_id: sourceVersionId,
    })
    : await supabase.rpc("create_manuscript_draft_version", {
      p_source_version_id: sourceVersionId,
    });

  if (error) throw new Error(error.message);

  const created = data?.[0];
  if (!created) {
    throw new Error("The draft version was created but no identifier was returned.");
  }

  const draftVersion = {
    manuscriptVersionId: created.manuscript_version_id,
    readingRoundId: created.reading_round_id,
  };

  const sourceChapters = importedChapters
    ? importedChapters.map((chapter) => ({ blocks: chapter.blocks }))
    : await getManuscriptVersionRichContent(supabase, sourceVersionId);
  await setManuscriptVersionRichContent(
    supabase,
    draftVersion.manuscriptVersionId,
    sourceChapters,
  );

  return draftVersion;
}

export async function updateManuscriptDraftVersionTitle({
  manuscriptVersionId,
  title,
}: {
  manuscriptVersionId: string;
  title: string;
}) {
  const normalizedTitle = title.trim();
  if (!normalizedTitle || normalizedTitle.length > 300) {
    throw new Error("The draft title must contain between 1 and 300 characters.");
  }

  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("manuscript_versions")
    .update({ title: normalizedTitle })
    .eq("id", manuscriptVersionId)
    .select("id, title")
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("This draft is no longer available.");

  return data;
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

export type CreateManuscriptChapterInput = {
  content: string;
  manuscriptVersionId: string;
  readerAssignmentIds?: string[];
  richBlocks: ManuscriptRichTextBlock[];
  title: string;
};

export type ManuscriptChapterAccessReader = {
  email: string;
  id: string;
  name: string | null;
};

type ChapterAccessReaderRow = {
  id: string;
  reader_display_name: string | null;
  reader_email: string;
};

export async function getManuscriptChapterAccessReaders(
  manuscriptVersionId: string,
): Promise<ManuscriptChapterAccessReader[]> {
  const supabase = createSupabaseBrowserClient();
  const { data: readingRound, error: readingRoundError } = await supabase
    .from("reading_rounds")
    .select("id")
    .eq("manuscript_version_id", manuscriptVersionId)
    .neq("status", "archived")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (readingRoundError) throw new Error(readingRoundError.message);
  if (!readingRound) return [];

  const { data, error } = await supabase
    .from("reader_assignments")
    .select("id, reader_email, reader_display_name")
    .eq("reading_round_id", readingRound.id)
    .in("status", ["pending", "started", "completed"])
    .order("reader_email", { ascending: true });

  if (error) throw new Error(error.message);

  return ((data ?? []) as unknown as ChapterAccessReaderRow[]).map((reader) => ({
    email: reader.reader_email,
    id: reader.id,
    name: reader.reader_display_name,
  }));
}

export async function createManuscriptChapter({
  content,
  manuscriptVersionId,
  readerAssignmentIds = [],
  richBlocks,
  title,
}: CreateManuscriptChapterInput) {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.rpc("create_manuscript_chapter", {
    p_content: content,
    p_manuscript_version_id: manuscriptVersionId,
    p_reader_assignment_ids: readerAssignmentIds,
    p_title: title,
  });

  if (error) throw new Error(error.message);
  if (!data) throw new Error("The chapter was created but no identifier was returned.");

  await setManuscriptChapterRichContent(supabase, data, richBlocks);
  return data;
}

export type UpdateManuscriptChapterInput = {
  chapterId: string;
  content: string;
  richBlocks: ManuscriptRichTextBlock[];
  title: string;
};

export async function updateManuscriptChapter({
  chapterId,
  content,
  richBlocks,
  title,
}: UpdateManuscriptChapterInput) {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.rpc("update_manuscript_chapter", {
    p_chapter_id: chapterId,
    p_content: content,
    p_title: title,
  });

  if (error) throw new Error(error.message);
  await setManuscriptChapterRichContent(supabase, chapterId, richBlocks);
}

async function setManuscriptChapterRichContent(
  supabase: SupabaseClient<Database>,
  chapterId: string,
  blocks: ManuscriptRichTextBlock[],
) {
  const { error } = await supabase.rpc("set_manuscript_chapter_rich_content", {
    p_blocks: blocks.map((block) => ({
      content: block.content,
      rich_content: block.richContent,
    })) as Json,
    p_chapter_id: chapterId,
  });

  if (error) throw new Error(error.message);
}

async function setManuscriptVersionRichContent(
  supabase: SupabaseClient<Database>,
  manuscriptVersionId: string,
  chapters: Array<{ blocks: ManuscriptRichTextBlock[] }>,
) {
  const { error } = await supabase.rpc("set_manuscript_version_rich_content", {
    p_chapters: chapters.map((chapter) => ({
      blocks: chapter.blocks.map((block) => ({
        content: block.content,
        rich_content: block.richContent,
      })),
    })) as Json,
    p_manuscript_version_id: manuscriptVersionId,
  });

  if (error) throw new Error(error.message);
}

async function getManuscriptVersionRichContent(
  supabase: SupabaseClient<Database>,
  manuscriptVersionId: string,
): Promise<Array<{ blocks: ManuscriptRichTextBlock[] }>> {
  const { data: chapterRows, error: chaptersError } = await supabase
    .from("manuscript_chapters")
    .select("id, position")
    .eq("manuscript_version_id", manuscriptVersionId)
    .order("position", { ascending: true });

  if (chaptersError) throw new Error(chaptersError.message);
  const chapterIds = (chapterRows ?? []).map((chapter) => chapter.id);
  if (chapterIds.length === 0) return [];

  const { data: blockRows, error: blocksError } = await supabase
    .from("chapter_blocks")
    .select("chapter_id, position, content, rich_content")
    .in("chapter_id", chapterIds)
    .order("position", { ascending: true });

  if (blocksError) throw new Error(blocksError.message);

  const blocksByChapterId = new Map<string, ManuscriptRichTextBlock[]>();
  for (const block of blockRows ?? []) {
    const blocks = blocksByChapterId.get(block.chapter_id) ?? [];
    blocks.push({
      content: block.content,
      richContent: normalizeRichText(block.rich_content, block.content),
    });
    blocksByChapterId.set(block.chapter_id, blocks);
  }

  return (chapterRows ?? []).map((chapter) => ({
    blocks: blocksByChapterId.get(chapter.id) ?? [],
  }));
}

export async function deleteManuscriptChapter(chapterId: string) {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.rpc("delete_manuscript_chapter", {
    p_chapter_id: chapterId,
  });

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

export async function updateGeneralCommentSeenStatus({
  generalCommentId,
  isSeen,
}: {
  generalCommentId: string;
  isSeen: boolean;
}) {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase
    .from("chapter_general_comments")
    .update({ author_seen_at: isSeen ? new Date().toISOString() : null })
    .eq("id", generalCommentId);

  if (error) throw new Error(error.message);
}

export type UpdateManuscriptSettingsInput = {
  estimatedWordCountBand: ManuscriptWordCountBand | null;
  genreSlugs: string[];
  logline: string;
  maxReaders: number;
  manuscriptId: string;
  manuscriptVersionId: string;
  readerDeadline: string | null;
  readerClosingNote: string;
  readerNote: string;
  title: string;
};

export async function updateManuscriptSettings({
  estimatedWordCountBand,
  genreSlugs,
  logline,
  maxReaders,
  manuscriptId,
  manuscriptVersionId,
  readerDeadline,
  readerClosingNote,
  readerNote,
  title,
}: UpdateManuscriptSettingsInput) {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.rpc("update_manuscript_settings", {
    p_estimated_word_count_band: estimatedWordCountBand ?? "",
    p_genre_slugs: genreSlugs,
    p_logline: logline,
    p_max_readers: maxReaders,
    p_manuscript_id: manuscriptId,
    p_manuscript_version_id: manuscriptVersionId,
    p_reader_note: readerNote,
    p_reading_deadline: readerDeadline ?? "",
    p_reader_closing_note: readerClosingNote,
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

  const { error: deleteError } = await supabase.rpc("delete_manuscript", {
    p_manuscript_id: manuscriptId,
  });

  if (deleteError) throw new Error(deleteError.message);
}

export async function deleteManuscriptDraftVersion(manuscriptVersionId: string) {
  const supabase = createSupabaseBrowserClient();
  const { data: assetRows, error: assetsError } = await supabase
    .from("manuscript_assets")
    .select("storage_bucket, storage_path")
    .eq("manuscript_version_id", manuscriptVersionId);

  if (assetsError) throw new Error(assetsError.message);

  const assetPathsByBucket = new Map<string, string[]>();
  for (const asset of (assetRows ?? []) as ManuscriptAssetStorageRow[]) {
    if (
      asset.storage_bucket !== MANUSCRIPT_COVERS_BUCKET
      && asset.storage_bucket !== MANUSCRIPT_SOURCES_BUCKET
    ) {
      throw new Error("This draft has an unsupported file attachment.");
    }

    const paths = assetPathsByBucket.get(asset.storage_bucket) ?? [];
    paths.push(asset.storage_path);
    assetPathsByBucket.set(asset.storage_bucket, paths);
  }

  for (const [bucket, paths] of assetPathsByBucket) {
    const { error: storageError } = await supabase.storage.from(bucket).remove(paths);
    if (storageError) throw new Error(storageError.message);
  }

  const { error: deleteError } = await supabase.rpc("delete_manuscript_draft_version", {
    p_manuscript_version_id: manuscriptVersionId,
  });

  if (deleteError) throw new Error(deleteError.message);
}
