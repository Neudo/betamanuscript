import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { Json } from "@/lib/supabase/database.types";

export type ReaderManuscriptListItem = {
  assignmentId: string;
  closingNote: string | null;
  completedChapterIds: string[];
  completedChapters: number;
  deadline: string | null;
  id: string;
  latestChapterId: string | null;
  logline: string | null;
  note: string | null;
  readingRoundId: string;
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

export type ReaderSurveyOption = {
  id: string;
  label: string;
};

export type ReaderSurveyQuestion = {
  id: string;
  options: ReaderSurveyOption[];
  prompt: string;
  required: boolean;
  type: "rating" | "yes-no" | "multiple-choice" | "open-text";
};

export type ReaderDueSurvey = {
  id: string;
  isNew: boolean;
  name: string;
  questions: ReaderSurveyQuestion[];
};

export type ReaderSurveyAnswer = {
  booleanValue?: boolean;
  numberValue?: number;
  questionId: string;
  selectedOptionIds?: string[];
  textValue?: string;
};

type ReaderAssignmentRow = {
  id: string;
  status: "completed" | "started";
  reading_rounds: {
    id: string;
    reading_deadline: string | null;
    reader_closing_note: string | null;
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

type ChapterProgressRow = {
  chapter_id: string;
  last_read_at: string;
  reader_assignment_id: string;
  status: "completed" | "in_progress";
};

export async function getReaderManuscripts(): Promise<ReaderManuscriptListItem[]> {
  const supabase = createSupabaseBrowserClient();
  const { data: assignments, error: assignmentsError } = await supabase
    .from("reader_assignments")
    .select(`
      id,
      status,
      reading_rounds!inner (
        id,
        reading_deadline,
        reader_closing_note,
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
        .select("reader_assignment_id, chapter_id, status, last_read_at")
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
  const completedChapterIdsByAssignment = new Map<string, string[]>();
  const latestProgressByAssignment = new Map<string, ChapterProgressRow>();
  for (const progress of (progressResult.data ?? []) as ChapterProgressRow[]) {
    if (progress.status === "completed") {
      completedByAssignment.set(
        progress.reader_assignment_id,
        (completedByAssignment.get(progress.reader_assignment_id) ?? 0) + 1,
      );
      const completedChapterIds = completedChapterIdsByAssignment.get(progress.reader_assignment_id) ?? [];
      completedChapterIds.push(progress.chapter_id);
      completedChapterIdsByAssignment.set(progress.reader_assignment_id, completedChapterIds);
    }

    const latestProgress = latestProgressByAssignment.get(progress.reader_assignment_id);
    if (!latestProgress || progress.last_read_at > latestProgress.last_read_at) {
      latestProgressByAssignment.set(progress.reader_assignment_id, progress);
    }
  }

  return rows.flatMap((assignment) => {
    const readingRound = assignment.reading_rounds;
    const version = readingRound?.manuscript_versions;
    if (!readingRound || !version) return [];

    const totalChapters = totalByVersion.get(version.id) ?? 0;
    const completedChapters = completedByAssignment.get(assignment.id) ?? 0;
    const status = assignment.status === "completed" || (totalChapters > 0 && completedChapters >= totalChapters)
      ? "finished"
      : completedChapters === 0
        ? "not-started"
        : "reading";

    return [{
      assignmentId: assignment.id,
      closingNote: readingRound.reader_closing_note,
      completedChapterIds: completedChapterIdsByAssignment.get(assignment.id) ?? [],
      completedChapters,
      deadline: readingRound.reading_deadline,
      id: version.manuscript_id,
      latestChapterId: latestProgressByAssignment.get(assignment.id)?.chapter_id ?? null,
      logline: version.logline,
      note: readingRound.reader_note,
      readingRoundId: readingRound.id,
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

type DueSurveyRow = {
  id: string;
  name: string;
};

type DueSurveyQuestionRow = {
  id: string;
  is_required: boolean;
  position: number;
  prompt: string;
  question_type: "rating" | "yes_no" | "multiple_choice" | "open_text";
  survey_id: string;
};

type DueSurveyOptionRow = {
  id: string;
  label: string;
  position: number;
  survey_question_id: string;
};

type OpenedReaderSurveyRow = {
  survey_id: string;
};

type ReaderSurveySubmissionRow = {
  status: "in_progress" | "submitted";
  survey_id: string;
};

const readerSurveyQuestionType: Record<
  DueSurveyQuestionRow["question_type"],
  ReaderSurveyQuestion["type"]
> = {
  multiple_choice: "multiple-choice",
  open_text: "open-text",
  rating: "rating",
  yes_no: "yes-no",
};

/**
 * Returns active surveys whose trigger is already reached. Newly due surveys
 * are opened atomically; previously deferred `in_progress` surveys are also
 * returned, so the reader can resume them on another device without being
 * interrupted by a full form again.
 */
export async function getReaderDueSurveys({
  completedChapterIds,
  isManuscriptComplete,
  readerAssignmentId,
  readingRoundId,
}: {
  completedChapterIds: string[];
  isManuscriptComplete: boolean;
  readerAssignmentId: string;
  readingRoundId: string;
}): Promise<ReaderDueSurvey[]> {
  const supabase = createSupabaseBrowserClient();
  const [chapterSurveysResult, manuscriptSurveysResult] = await Promise.all([
    completedChapterIds.length > 0
      ? supabase
        .from("surveys")
        .select("id, name")
        .eq("reading_round_id", readingRoundId)
        .eq("status", "active")
        .eq("trigger_type", "after_chapter")
        .in("chapter_id", completedChapterIds)
        .order("created_at", { ascending: true })
      : Promise.resolve({ data: [], error: null }),
    isManuscriptComplete
      ? supabase
        .from("surveys")
        .select("id, name")
        .eq("reading_round_id", readingRoundId)
        .eq("status", "active")
        .eq("trigger_type", "after_manuscript")
        .order("created_at", { ascending: true })
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (chapterSurveysResult.error) throw new Error(chapterSurveysResult.error.message);
  if (manuscriptSurveysResult.error) throw new Error(manuscriptSurveysResult.error.message);

  const triggeredSurveys = [
    ...((chapterSurveysResult.data ?? []) as DueSurveyRow[]),
    ...((manuscriptSurveysResult.data ?? []) as DueSurveyRow[]),
  ];
  if (triggeredSurveys.length === 0) return [];

  const surveyIds = triggeredSurveys.map((survey) => survey.id);
  const { data: submissionRows, error: submissionsError } = await supabase
    .from("survey_submissions")
    .select("survey_id, status")
    .eq("reader_assignment_id", readerAssignmentId)
    .in("survey_id", surveyIds);

  if (submissionsError) throw new Error(submissionsError.message);

  const submissionStatusBySurveyId = new Map(
    ((submissionRows ?? []) as ReaderSurveySubmissionRow[]).map((submission) => [
      submission.survey_id,
      submission.status,
    ]),
  );
  const unseenSurveyIds = triggeredSurveys
    .filter((survey) => !submissionStatusBySurveyId.has(survey.id))
    .map((survey) => survey.id);

  const { data: openedSurveyRows, error: openSurveysError } = unseenSurveyIds.length > 0
    ? await supabase
      .rpc("open_reader_surveys", {
        p_reader_assignment_id: readerAssignmentId,
        p_survey_ids: unseenSurveyIds,
      })
    : { data: [], error: null };

  if (openSurveysError) throw new Error(openSurveysError.message);

  const openedSurveyIds = new Set(
    ((openedSurveyRows ?? []) as OpenedReaderSurveyRow[]).map((survey) => survey.survey_id),
  );
  const resumableSurveyIds = new Set(
    [...submissionStatusBySurveyId.entries()]
      .filter(([, status]) => status === "in_progress")
      .map(([surveyId]) => surveyId),
  );
  const availableSurveys = triggeredSurveys.filter((survey) => (
    openedSurveyIds.has(survey.id) || resumableSurveyIds.has(survey.id)
  ));
  if (availableSurveys.length === 0) return [];

  const availableSurveyIds = availableSurveys.map((survey) => survey.id);
  const { data: questionRows, error: questionsError } = await supabase
    .from("survey_questions")
    .select("id, survey_id, position, question_type, prompt, is_required")
    .in("survey_id", availableSurveyIds)
    .order("position", { ascending: true });

  if (questionsError) throw new Error(questionsError.message);

  const questions = (questionRows ?? []) as DueSurveyQuestionRow[];
  const questionIds = questions.map((question) => question.id);
  const { data: optionRows, error: optionsError } = questionIds.length > 0
    ? await supabase
      .from("survey_question_options")
      .select("id, survey_question_id, position, label")
      .in("survey_question_id", questionIds)
      .order("position", { ascending: true })
    : { data: [], error: null };

  if (optionsError) throw new Error(optionsError.message);

  const optionsByQuestionId = new Map<string, ReaderSurveyOption[]>();
  for (const option of (optionRows ?? []) as DueSurveyOptionRow[]) {
    const options = optionsByQuestionId.get(option.survey_question_id) ?? [];
    options.push({ id: option.id, label: option.label });
    optionsByQuestionId.set(option.survey_question_id, options);
  }

  const questionsBySurveyId = new Map<string, ReaderSurveyQuestion[]>();
  for (const question of questions) {
    const surveyQuestions = questionsBySurveyId.get(question.survey_id) ?? [];
    surveyQuestions.push({
      id: question.id,
      options: optionsByQuestionId.get(question.id) ?? [],
      prompt: question.prompt,
      required: question.is_required,
      type: readerSurveyQuestionType[question.question_type],
    });
    questionsBySurveyId.set(question.survey_id, surveyQuestions);
  }

  return availableSurveys
    .map((survey) => ({
    id: survey.id,
    isNew: openedSurveyIds.has(survey.id),
    name: survey.name,
    questions: questionsBySurveyId.get(survey.id) ?? [],
    }));
}

export async function submitReaderSurvey({
  answers,
  readerAssignmentId,
  surveyId,
}: {
  answers: ReaderSurveyAnswer[];
  readerAssignmentId: string;
  surveyId: string;
}) {
  const serializedAnswers: Json[] = answers.map((answer) => {
    const serialized: { [key: string]: Json | undefined } = {
      question_id: answer.questionId,
    };

    if (answer.numberValue !== undefined) serialized.number_value = answer.numberValue;
    if (answer.booleanValue !== undefined) serialized.boolean_value = answer.booleanValue;
    if (answer.selectedOptionIds !== undefined) serialized.selected_option_ids = answer.selectedOptionIds;
    if (answer.textValue !== undefined) serialized.text_value = answer.textValue;

    return serialized;
  });

  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.rpc("submit_reader_survey", {
    p_answers: serializedAnswers,
    p_reader_assignment_id: readerAssignmentId,
    p_survey_id: surveyId,
  });

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Your survey response could not be saved.");

  return data;
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
