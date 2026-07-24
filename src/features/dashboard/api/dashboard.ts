import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { Database } from "@/lib/supabase/database.types";

export type DashboardTag = {
  color: string;
  label: string;
  slug: string;
};

export type DashboardChapter = {
  annotationCount: number;
  completedReaders: number;
  id: string;
  position: number;
  title: string;
};

export type DashboardReader = {
  color: string;
  completedChapters: number;
  id: string;
  initials: string;
  lastActiveAt: string | null;
  name: string;
  status: "finished" | "pending" | "reading" | "started";
};

export type DashboardAnnotation = {
  chapter: Pick<DashboardChapter, "id" | "position" | "title">;
  comment: string | null;
  createdAt: string;
  id: string;
  quote: string;
  reader: Pick<DashboardReader, "color" | "id" | "initials" | "name">;
  tag: DashboardTag;
};

export type DashboardPriority = {
  annotationCount: number;
  chapter: Pick<DashboardChapter, "id" | "position" | "title">;
  tag: DashboardTag;
};

export type DashboardOverviewData = {
  annotationCount: number;
  chapters: DashboardChapter[];
  chaptersReached: number;
  draftLabel: string;
  lastActivityAt: string | null;
  maxReaders: number;
  mostAnnotatedChapter: DashboardChapter | null;
  readers: DashboardReader[];
  recentAnnotations: DashboardAnnotation[];
  revisionPriorities: DashboardPriority[];
  startedReaders: number;
  strongestMoments: DashboardAnnotation[];
  surveyResponseCount: number;
  tagCounts: Array<DashboardTag & { count: number }>;
  title: string;
};

type ManuscriptRow = {
  id: string;
  internal_title: string;
};

type VersionRow = {
  id: string;
  version_number: number;
};

type ReadingRoundRow = {
  id: string;
  max_readers: number;
};

type ChapterRow = {
  id: string;
  position: number;
  title: string;
};

type ReaderAssignmentRow = {
  completed_at: string | null;
  id: string;
  last_active_at: string | null;
  reader_display_name: string | null;
  reader_email: string;
  started_at: string | null;
  status: Database["public"]["Enums"]["reader_assignment_status"];
};

type ChapterProgressRow = {
  chapter_id: string;
  last_read_at: string;
  reader_assignment_id: string;
  status: "completed" | "in_progress";
};

type AnnotationRow = {
  chapter_id: string;
  comment: string | null;
  created_at: string;
  id: string;
  quote: string;
  reader_assignment_id: string;
  tag_slug: string;
};

type AnnotationTagRow = DashboardTag;

type SurveyRow = { id: string };

type SurveySubmissionRow = {
  submitted_at: string | null;
};

const readerColors = ["#8B1A1A", "#3B4A8A", "#1E5C2E", "#7A4800", "#1A5C50"];

export async function getDashboardOverview(
  manuscriptId: string,
): Promise<DashboardOverviewData | null> {
  const supabase = createSupabaseBrowserClient();
  const { data: manuscriptData, error: manuscriptError } = await supabase
    .from("manuscripts")
    .select("id, internal_title")
    .eq("id", manuscriptId)
    .is("archived_at", null)
    .maybeSingle();

  if (manuscriptError) throw new Error(manuscriptError.message);
  const manuscript = manuscriptData as ManuscriptRow | null;
  if (!manuscript) return null;

  const { data: versionData, error: versionError } = await supabase
    .from("manuscript_versions")
    .select("id, version_number")
    .eq("manuscript_id", manuscript.id)
    .is("archived_at", null)
    .order("version_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (versionError) throw new Error(versionError.message);
  const version = versionData as VersionRow | null;
  if (!version) return createEmptyDashboard(manuscript.internal_title);

  const [chapterResult, roundResult] = await Promise.all([
    supabase
      .from("manuscript_chapters")
      .select("id, position, title")
      .eq("manuscript_version_id", version.id)
      .order("position", { ascending: true }),
    supabase
      .from("reading_rounds")
      .select("id, max_readers")
      .eq("manuscript_version_id", version.id)
      .neq("status", "archived")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (chapterResult.error) throw new Error(chapterResult.error.message);
  if (roundResult.error) throw new Error(roundResult.error.message);

  const chapters = (chapterResult.data ?? []) as ChapterRow[];
  const chapterIds = chapters.map((chapter) => chapter.id);
  const round = roundResult.data as ReadingRoundRow | null;

  const [assignmentsResult, annotationsResult, surveysResult] = await Promise.all([
    round
      ? supabase
        .from("reader_assignments")
        .select("id, reader_display_name, reader_email, status, started_at, completed_at, last_active_at")
        .eq("reading_round_id", round.id)
        .neq("status", "revoked")
        .order("created_at", { ascending: true })
      : Promise.resolve({ data: [], error: null }),
    chapterIds.length > 0
      ? supabase
        .from("annotations")
        .select("id, chapter_id, reader_assignment_id, tag_slug, quote, comment, created_at")
        .in("chapter_id", chapterIds)
        .order("created_at", { ascending: false })
      : Promise.resolve({ data: [], error: null }),
    round
      ? supabase
        .from("surveys")
        .select("id")
        .eq("reading_round_id", round.id)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (assignmentsResult.error) throw new Error(assignmentsResult.error.message);
  if (annotationsResult.error) throw new Error(annotationsResult.error.message);
  if (surveysResult.error) throw new Error(surveysResult.error.message);

  const assignments = (assignmentsResult.data ?? []) as ReaderAssignmentRow[];
  const annotations = (annotationsResult.data ?? []) as AnnotationRow[];
  const surveyIds = ((surveysResult.data ?? []) as SurveyRow[]).map((survey) => survey.id);
  const assignmentIds = assignments.map((assignment) => assignment.id);
  const tagSlugs = [...new Set(annotations.map((annotation) => annotation.tag_slug))];

  const [progressResult, tagsResult, surveySubmissionsResult] = await Promise.all([
    assignmentIds.length > 0
      ? supabase
        .from("chapter_reading_progress")
        .select("reader_assignment_id, chapter_id, status, last_read_at")
        .in("reader_assignment_id", assignmentIds)
      : Promise.resolve({ data: [], error: null }),
    tagSlugs.length > 0
      ? supabase
        .from("annotation_tags")
        .select("slug, label, color")
        .in("slug", tagSlugs)
      : Promise.resolve({ data: [], error: null }),
    surveyIds.length > 0
      ? supabase
        .from("survey_submissions")
        .select("submitted_at")
        .in("survey_id", surveyIds)
        .eq("status", "submitted")
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (progressResult.error) throw new Error(progressResult.error.message);
  if (tagsResult.error) throw new Error(tagsResult.error.message);
  if (surveySubmissionsResult.error) throw new Error(surveySubmissionsResult.error.message);

  const progressRows = (progressResult.data ?? []) as ChapterProgressRow[];
  const tagsBySlug = new Map(
    ((tagsResult.data ?? []) as AnnotationTagRow[]).map((tag) => [tag.slug, tag]),
  );
  const chaptersById = new Map(chapters.map((chapter) => [chapter.id, chapter]));
  const completedReadersByChapterId = new Map<string, Set<string>>();
  const progressByAssignmentId = new Map<string, ChapterProgressRow[]>();

  for (const progress of progressRows) {
    const readerProgress = progressByAssignmentId.get(progress.reader_assignment_id) ?? [];
    readerProgress.push(progress);
    progressByAssignmentId.set(progress.reader_assignment_id, readerProgress);

    if (progress.status === "completed") {
      const chapterReaders = completedReadersByChapterId.get(progress.chapter_id) ?? new Set();
      chapterReaders.add(progress.reader_assignment_id);
      completedReadersByChapterId.set(progress.chapter_id, chapterReaders);
    }
  }

  const chapterSummaries = chapters.map((chapter) => ({
    annotationCount: annotations.filter((annotation) => annotation.chapter_id === chapter.id).length,
    completedReaders: completedReadersByChapterId.get(chapter.id)?.size ?? 0,
    ...chapter,
  }));
  const readers = assignments.map((assignment, index) => toDashboardReader(
    assignment,
    progressByAssignmentId.get(assignment.id) ?? [],
    chapters.length,
    readerColors[index % readerColors.length],
  ));
  const readersById = new Map(readers.map((reader) => [reader.id, reader]));
  const dashboardAnnotations = annotations.flatMap((annotation) => {
    const chapter = chaptersById.get(annotation.chapter_id);
    const reader = readersById.get(annotation.reader_assignment_id);
    if (!chapter || !reader) return [];

    return [{
      chapter,
      comment: annotation.comment,
      createdAt: annotation.created_at,
      id: annotation.id,
      quote: annotation.quote,
      reader,
      tag: tagsBySlug.get(annotation.tag_slug) ?? {
        color: "#6B7280",
        label: annotation.tag_slug,
        slug: annotation.tag_slug,
      },
    } satisfies DashboardAnnotation];
  });
  const tagCounts = collectTagCounts(dashboardAnnotations);
  const mostAnnotatedChapter = [...chapterSummaries]
    .filter((chapter) => chapter.annotationCount > 0)
    .sort((left, right) => right.annotationCount - left.annotationCount || left.position - right.position)[0] ?? null;
  const submittedSurveyRows = (surveySubmissionsResult.data ?? []) as SurveySubmissionRow[];
  const lastActivityAt = latestDate([
    ...dashboardAnnotations.map((annotation) => annotation.createdAt),
    ...progressRows.map((progress) => progress.last_read_at),
    ...assignments.flatMap((assignment) => [assignment.last_active_at, assignment.completed_at, assignment.started_at]),
    ...submittedSurveyRows.map((submission) => submission.submitted_at),
  ]);

  return {
    annotationCount: dashboardAnnotations.length,
    chapters: chapterSummaries,
    chaptersReached: completedReadersByChapterId.size,
    draftLabel: `Draft ${version.version_number}`,
    lastActivityAt,
    maxReaders: round?.max_readers ?? 0,
    mostAnnotatedChapter,
    readers,
    recentAnnotations: dashboardAnnotations.slice(0, 6),
    revisionPriorities: collectRevisionPriorities(dashboardAnnotations),
    startedReaders: readers.filter((reader) => reader.status !== "pending").length,
    strongestMoments: dashboardAnnotations
      .filter((annotation) => annotation.tag.slug === "strong-line" || annotation.tag.slug === "emotional-impact")
      .slice(0, 3),
    surveyResponseCount: submittedSurveyRows.length,
    tagCounts,
    title: manuscript.internal_title,
  };
}

function createEmptyDashboard(title: string): DashboardOverviewData {
  return {
    annotationCount: 0,
    chapters: [],
    chaptersReached: 0,
    draftLabel: "No draft",
    lastActivityAt: null,
    maxReaders: 0,
    mostAnnotatedChapter: null,
    readers: [],
    recentAnnotations: [],
    revisionPriorities: [],
    startedReaders: 0,
    strongestMoments: [],
    surveyResponseCount: 0,
    tagCounts: [],
    title,
  };
}

function toDashboardReader(
  assignment: ReaderAssignmentRow,
  progress: ChapterProgressRow[],
  totalChapters: number,
  color: string,
): DashboardReader {
  const completedChapters = new Set(
    progress.filter((item) => item.status === "completed").map((item) => item.chapter_id),
  ).size;
  const lastProgress = [...progress].sort(
    (left, right) => right.last_read_at.localeCompare(left.last_read_at),
  )[0];
  const isFinished = assignment.status === "completed"
    || (totalChapters > 0 && completedChapters >= totalChapters);
  const status = assignment.status === "pending"
    ? "pending"
    : isFinished
      ? "finished"
      : progress.length > 0
        ? "reading"
        : "started";
  const name = assignment.reader_display_name ?? assignment.reader_email;

  return {
    color,
    completedChapters,
    id: assignment.id,
    initials: initialsFromName(name),
    lastActiveAt: assignment.last_active_at ?? lastProgress?.last_read_at ?? assignment.started_at,
    name,
    status,
  };
}

function collectTagCounts(
  annotations: DashboardAnnotation[],
): Array<DashboardTag & { count: number }> {
  const counts = new Map<string, DashboardTag & { count: number }>();
  for (const annotation of annotations) {
    const current = counts.get(annotation.tag.slug);
    if (current) {
      current.count += 1;
      continue;
    }
    counts.set(annotation.tag.slug, { ...annotation.tag, count: 1 });
  }

  return [...counts.values()]
    .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label))
    .slice(0, 5);
}

function collectRevisionPriorities(annotations: DashboardAnnotation[]): DashboardPriority[] {
  const priorities = new Map<string, DashboardPriority>();
  for (const annotation of annotations) {
    const key = `${annotation.chapter.id}:${annotation.tag.slug}`;
    const current = priorities.get(key);
    if (current) {
      current.annotationCount += 1;
      continue;
    }
    priorities.set(key, {
      annotationCount: 1,
      chapter: annotation.chapter,
      tag: annotation.tag,
    });
  }

  return [...priorities.values()]
    .sort((left, right) => right.annotationCount - left.annotationCount || left.chapter.position - right.chapter.position)
    .slice(0, 3);
}

function initialsFromName(name: string) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  return initials || "R";
}

function latestDate(values: Array<string | null>) {
  return values
    .filter((value): value is string => Boolean(value))
    .sort((left, right) => right.localeCompare(left))[0] ?? null;
}
