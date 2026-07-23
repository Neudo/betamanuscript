import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export type ReaderManuscriptListItem = {
  assignmentId: string;
  completedChapters: number;
  deadline: string | null;
  id: string;
  logline: string | null;
  note: string | null;
  status: "finished" | "not-started" | "reading";
  title: string;
  totalChapters: number;
  versionId: string;
  versionNumber: number;
};

export type ReaderAnnotationTag = {
  color: string;
  label: string;
  slug: string;
};

export type ReaderAnnotation = {
  chapterBlockId: string;
  chapterId: string;
  comment: string | null;
  contextAfter: string | null;
  contextBefore: string | null;
  id: string;
  quote: string;
  selectionEnd: number;
  selectionStart: number;
  tag: ReaderAnnotationTag;
};

export type ReaderAnnotationDraft = {
  chapterBlockId: string;
  chapterId: string;
  contextAfter: string | null;
  contextBefore: string | null;
  quote: string;
  selectionEnd: number;
  selectionStart: number;
};

type ReaderAssignmentRow = {
  id: string;
  status: "completed" | "started";
  reading_rounds: {
    reading_deadline: string | null;
    reader_note: string | null;
    manuscript_versions: {
      id: string;
      logline: string | null;
      manuscript_id: string;
      title: string;
      version_number: number;
    } | null;
  } | null;
};

export async function getReaderManuscripts(): Promise<ReaderManuscriptListItem[]> {
  const supabase = createSupabaseBrowserClient();
  const { data: assignments, error: assignmentsError } = await supabase
    .from("reader_assignments")
    .select(`
      id,
      status,
      reading_rounds!inner (
        reading_deadline,
        reader_note,
        manuscript_versions!inner (id, manuscript_id, title, logline, version_number)
      )
    `)
    .in("status", ["started", "completed"])
    .order("started_at", { ascending: false });

  if (assignmentsError) throw new Error(assignmentsError.message);

  const rows = (assignments ?? []) as unknown as ReaderAssignmentRow[];
  const versionIds = rows.flatMap((row) => row.reading_rounds?.manuscript_versions?.id ?? []);
  const assignmentIds = rows.map((row) => row.id);

  const [chaptersResult, progressResult] = await Promise.all([
    versionIds.length > 0
      ? supabase
        .from("manuscript_chapters")
        .select("id, manuscript_version_id")
        .in("manuscript_version_id", versionIds)
      : Promise.resolve({ data: [], error: null }),
    assignmentIds.length > 0
      ? supabase
        .from("chapter_reading_progress")
        .select("reader_assignment_id, status")
        .in("reader_assignment_id", assignmentIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (chaptersResult.error) throw new Error(chaptersResult.error.message);
  if (progressResult.error) throw new Error(progressResult.error.message);

  const totalByVersion = new Map<string, number>();
  for (const chapter of chaptersResult.data ?? []) {
    totalByVersion.set(
      chapter.manuscript_version_id,
      (totalByVersion.get(chapter.manuscript_version_id) ?? 0) + 1,
    );
  }

  const completedByAssignment = new Map<string, number>();
  for (const progress of progressResult.data ?? []) {
    if (progress.status === "completed") {
      completedByAssignment.set(
        progress.reader_assignment_id,
        (completedByAssignment.get(progress.reader_assignment_id) ?? 0) + 1,
      );
    }
  }

  return rows.flatMap((assignment) => {
    const version = assignment.reading_rounds?.manuscript_versions;
    if (!version) return [];

    const totalChapters = totalByVersion.get(version.id) ?? 0;
    const completedChapters = completedByAssignment.get(assignment.id) ?? 0;
    const status = assignment.status === "completed" || (totalChapters > 0 && completedChapters >= totalChapters)
      ? "finished"
      : completedChapters === 0
        ? "not-started"
        : "reading";

    return [{
      assignmentId: assignment.id,
      completedChapters,
      deadline: assignment.reading_rounds?.reading_deadline ?? null,
      id: version.manuscript_id,
      logline: version.logline,
      note: assignment.reading_rounds?.reader_note ?? null,
      status,
      title: version.title,
      totalChapters,
      versionId: version.id,
      versionNumber: version.version_number,
    }];
  });
}

export type ReaderManuscript = ReaderManuscriptListItem & {
  chapters: Array<{
    blocks: Array<{
      annotations: ReaderAnnotation[];
      content: string;
      id: string;
      position: number;
    }>;
    id: string;
    position: number;
    title: string;
  }>;
};

export async function getReaderManuscript(manuscriptId: string): Promise<ReaderManuscript | null> {
  const manuscripts = await getReaderManuscripts();
  const manuscript = manuscripts.find((item) => item.id === manuscriptId);
  if (!manuscript) return null;

  const supabase = createSupabaseBrowserClient();
  const { data: chapterRows, error: chaptersError } = await supabase
    .from("manuscript_chapters")
    .select("id, position, title")
    .eq("manuscript_version_id", manuscript.versionId)
    .order("position", { ascending: true });

  if (chaptersError) throw new Error(chaptersError.message);

  const chapters = chapterRows ?? [];
  const chapterIds = chapters.map((chapter) => chapter.id);
  const { data: blockRows, error: blocksError } = chapterIds.length > 0
    ? await supabase
      .from("chapter_blocks")
      .select("id, chapter_id, position, content")
      .in("chapter_id", chapterIds)
      .order("position", { ascending: true })
    : { data: [], error: null };

  if (blocksError) throw new Error(blocksError.message);

  const { data: annotationRows, error: annotationsError } = chapterIds.length > 0
    ? await supabase
      .from("annotations")
      .select(`
        id,
        chapter_id,
        chapter_block_id,
        tag_slug,
        quote,
        selection_start,
        selection_end,
        context_before,
        context_after,
        comment
      `)
      .eq("reader_assignment_id", manuscript.assignmentId)
      .in("chapter_id", chapterIds)
    : { data: [], error: null };

  if (annotationsError) throw new Error(annotationsError.message);

  const annotationTagSlugs = [...new Set((annotationRows ?? []).map((annotation) => annotation.tag_slug))];
  const { data: annotationTagRows, error: annotationTagsError } = annotationTagSlugs.length > 0
    ? await supabase
      .from("annotation_tags")
      .select("slug, label, color")
      .in("slug", annotationTagSlugs)
    : { data: [], error: null };

  if (annotationTagsError) throw new Error(annotationTagsError.message);

  const annotationTagsBySlug = new Map(
    (annotationTagRows ?? []).map((tag) => [tag.slug, tag]),
  );
  const annotationsByBlock = new Map<string, ReaderAnnotation[]>();

  for (const annotation of annotationRows ?? []) {
    const tag = annotationTagsBySlug.get(annotation.tag_slug);
    const annotations = annotationsByBlock.get(annotation.chapter_block_id) ?? [];
    annotations.push({
      chapterBlockId: annotation.chapter_block_id,
      chapterId: annotation.chapter_id,
      comment: annotation.comment,
      contextAfter: annotation.context_after,
      contextBefore: annotation.context_before,
      id: annotation.id,
      quote: annotation.quote,
      selectionEnd: annotation.selection_end,
      selectionStart: annotation.selection_start,
      tag: {
        color: tag?.color ?? "#6B7280",
        label: tag?.label ?? annotation.tag_slug,
        slug: annotation.tag_slug,
      },
    });
    annotationsByBlock.set(annotation.chapter_block_id, annotations);
  }

  const blocksByChapter = new Map<string, ReaderManuscript["chapters"][number]["blocks"]>();
  for (const block of blockRows ?? []) {
    const blocks = blocksByChapter.get(block.chapter_id) ?? [];
    blocks.push({
      annotations: annotationsByBlock.get(block.id) ?? [],
      content: block.content,
      id: block.id,
      position: block.position,
    });
    blocksByChapter.set(block.chapter_id, blocks);
  }

  return {
    ...manuscript,
    chapters: chapters.map((chapter) => ({
      blocks: blocksByChapter.get(chapter.id) ?? [],
      id: chapter.id,
      position: chapter.position,
      title: chapter.title,
    })),
  };
}

export async function completeReaderChapter({
  chapterId,
  readerAssignmentId,
}: {
  chapterId: string;
  readerAssignmentId: string;
}) {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase
    .rpc("complete_reader_chapter", {
      p_chapter_id: chapterId,
      p_reader_assignment_id: readerAssignmentId,
    });

  if (error) throw new Error(error.message);
}

export async function getReaderAnnotationTags(): Promise<ReaderAnnotationTag[]> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("annotation_tags")
    .select("slug, label, color")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);

  return data ?? [];
}

export type CreateReaderAnnotationInput = ReaderAnnotationDraft & {
  comment: string;
  readerAssignmentId: string;
  tagSlug: string;
};

export async function createReaderAnnotation({
  chapterBlockId,
  chapterId,
  comment,
  contextAfter,
  contextBefore,
  quote,
  readerAssignmentId,
  selectionEnd,
  selectionStart,
  tagSlug,
}: CreateReaderAnnotationInput) {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase
    .from("annotations")
    .insert({
      chapter_block_id: chapterBlockId,
      chapter_id: chapterId,
      comment: comment.trim() || null,
      context_after: contextAfter,
      context_before: contextBefore,
      quote,
      reader_assignment_id: readerAssignmentId,
      selection_end: selectionEnd,
      selection_start: selectionStart,
      tag_slug: tagSlug,
    });

  if (error) throw new Error(error.message);
}

export async function updateReaderAnnotation({
  annotationId,
  comment,
  tagSlug,
}: {
  annotationId: string;
  comment: string;
  tagSlug: string;
}) {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("annotations")
    .update({
      comment: comment.trim() || null,
      tag_slug: tagSlug,
    })
    .eq("id", annotationId)
    .select("id")
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("This annotation is no longer available.");
}

export async function deleteReaderAnnotation(annotationId: string) {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("annotations")
    .delete()
    .eq("id", annotationId)
    .select("id")
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("This annotation is no longer available.");
}
