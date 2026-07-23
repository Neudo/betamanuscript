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
    blocks: Array<{ content: string; id: string; position: number }>;
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

  const blocksByChapter = new Map<string, Array<{ content: string; id: string; position: number }>>();
  for (const block of blockRows ?? []) {
    const blocks = blocksByChapter.get(block.chapter_id) ?? [];
    blocks.push({ content: block.content, id: block.id, position: block.position });
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
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("chapter_reading_progress")
    .upsert(
      {
        chapter_id: chapterId,
        completed_at: now,
        last_read_at: now,
        reader_assignment_id: readerAssignmentId,
        status: "completed",
      },
      { onConflict: "reader_assignment_id,chapter_id" },
    );

  if (error) throw new Error(error.message);
}
