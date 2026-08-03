import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { Json } from "@/lib/supabase/database.types";
import type { SocialPlatform } from "@/features/account/domain/social-links";
import { getBlockAnnotationRanges } from "@/features/annotations/lib/multi-block-annotations";

export type ReaderManuscriptListItem = {
  assignmentId: string;
  accessibleChapterIds: string[];
  feedbackEnabled: boolean;
  closingNote: string | null;
  completedChapterIds: string[];
  completedChapters: number;
  coverUrl: string | null;
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

export type ReaderManuscriptDetails = {
  author: {
    avatarUrl: string | null;
    bio: string;
    displayName: string;
    socialLinks: Array<{
      platform: SocialPlatform;
      url: string;
    }>;
    website: string | null;
  } | null;
  authorNote: string | null;
  deadline: string | null;
  genres: string[];
  logline: string | null;
  readerNote: string | null;
};

export type ReaderAnnotationTag = {
  color: string;
  id: string;
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
  selectionEndChapterBlockId: string | null;
  selectionEndOffset: number | null;
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
  selectionEndChapterBlockId: string | null;
  selectionEndOffset: number | null;
  selectionStart: number;
};

export type ReaderChapterGeneralComment = {
  comment: string;
  id: string;
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

export type ReaderSurveyAnswerValue = boolean | number | string | string[];

export type ReaderSubmittedSurvey = {
  answers: Record<string, ReaderSurveyAnswerValue>;
  canEdit: boolean;
  manuscriptId: string;
  manuscriptTitle: string;
  name: string;
  questions: ReaderSurveyQuestion[];
  readerAssignmentId: string;
  submissionId: string;
  submittedAt: string | null;
  surveyId: string;
  updatedAt: string;
};

type ReaderAssignmentRow = {
  id: string;
  reader_assignment_chapter_access: Array<{ chapter_id: string }>;
  status: "completed" | "pending" | "started";
  reading_rounds: {
    id: string;
    reading_deadline: string | null;
    reader_closing_note: string | null;
    reader_note: string | null;
    status: "archived" | "closed" | "draft" | "open";
    manuscript_versions: {
      id: string;
      logline: string | null;
      manuscript_id: string;
      title: string;
      version_number: number;
    } | null;
  } | null;
};

type ReaderDraftAccessRow = {
  reader_assignments: ReaderAssignmentRow | null;
};

type ChapterProgressRow = {
  chapter_id: string;
  last_read_at: string;
  reader_assignment_id: string;
  status: "completed" | "in_progress";
};

type ManuscriptCoverRow = {
  manuscript_version_id: string;
  storage_bucket: string;
  storage_path: string;
};

type ReaderManuscriptDetailsResponse = {
  details?: ReaderManuscriptDetails;
  error?: string;
  ok?: boolean;
};

export async function getReaderManuscriptDetails(assignmentId: string) {
  const query = new URLSearchParams({ assignmentId });
  const response = await fetch(`/api/reader/manuscript-details?${query.toString()}`, {
    cache: "no-store",
  });
  const payload = await response.json().catch(() => null) as ReaderManuscriptDetailsResponse | null;

  if (!response.ok || !payload?.ok || !payload.details) {
    throw new Error(payload?.error ?? "Manuscript details could not be loaded.");
  }

  return payload.details;
}

export async function getReaderManuscripts(): Promise<ReaderManuscriptListItem[]> {
  const supabase = createSupabaseBrowserClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError) throw new Error(authError.message);
  if (!authData.user) return [];

  const { data: draftAccess, error: draftAccessError } = await supabase
    .from("reader_draft_access")
    .select(`
      reader_assignments!inner (
        id,
        status,
        reader_assignment_chapter_access (chapter_id),
        reading_rounds!inner (
          id,
          status,
          reading_deadline,
          reader_closing_note,
          reader_note,
          manuscript_versions!inner (id, manuscript_id, title, logline, version_number)
        )
      )
    `)
    .eq("reader_assignments.reader_profile_id", authData.user.id)
    .order("created_at", { ascending: false });

  if (draftAccessError) throw new Error(draftAccessError.message);

  const rows = ((draftAccess ?? []) as unknown as ReaderDraftAccessRow[])
    .flatMap((access) => access.reader_assignments ? [access.reader_assignments] : [])
    .filter((assignment) => assignment.reader_assignment_chapter_access.length > 0);
  const versionIds = rows.flatMap((row) => row.reading_rounds?.manuscript_versions?.id ?? []);
  const manuscriptIdByVersionId = new Map(
    rows.flatMap((row) => {
      const version = row.reading_rounds?.manuscript_versions;
      return version ? [[version.id, version.manuscript_id] as const] : [];
    }),
  );
  const assignmentIds = rows.map((row) => row.id);

  const [progressResult, coversResult] = await Promise.all([
    assignmentIds.length > 0
      ? supabase
        .from("chapter_reading_progress")
        .select("reader_assignment_id, chapter_id, status, last_read_at")
        .in("reader_assignment_id", assignmentIds)
      : Promise.resolve({ data: [], error: null }),
    versionIds.length > 0
      ? supabase
        .from("manuscript_assets")
        .select("manuscript_version_id, storage_bucket, storage_path")
        .in("manuscript_version_id", versionIds)
        .eq("asset_kind", "cover")
        .eq("processing_status", "available")
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (progressResult.error) throw new Error(progressResult.error.message);
  if (coversResult.error) throw new Error(coversResult.error.message);

  const coverUrlByVersionId = new Map<string, string>();
  const fallbackCoverUrlByManuscriptId = new Map<string, string>();
  await Promise.all(
    ((coversResult.data ?? []) as ManuscriptCoverRow[]).map(async (cover) => {
      const { data } = await supabase.storage
        .from(cover.storage_bucket)
        .createSignedUrl(cover.storage_path, 60 * 60);

      if (data?.signedUrl) {
        coverUrlByVersionId.set(cover.manuscript_version_id, data.signedUrl);
        const manuscriptId = manuscriptIdByVersionId.get(cover.manuscript_version_id);
        if (manuscriptId && !fallbackCoverUrlByManuscriptId.has(manuscriptId)) {
          fallbackCoverUrlByManuscriptId.set(manuscriptId, data.signedUrl);
        }
      }
    }),
  );

  const accessibleChapterIdsByAssignment = new Map(
    rows.map((assignment) => [
      assignment.id,
      new Set(assignment.reader_assignment_chapter_access.map((access) => access.chapter_id)),
    ]),
  );

  const completedByAssignment = new Map<string, number>();
  const completedChapterIdsByAssignment = new Map<string, string[]>();
  const latestProgressByAssignment = new Map<string, ChapterProgressRow>();
  for (const progress of (progressResult.data ?? []) as ChapterProgressRow[]) {
    if (!accessibleChapterIdsByAssignment.get(progress.reader_assignment_id)?.has(progress.chapter_id)) {
      continue;
    }

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

    const accessibleChapterIds = [
      ...(accessibleChapterIdsByAssignment.get(assignment.id) ?? new Set<string>()),
    ];
    const totalChapters = accessibleChapterIds.length;
    const completedChapters = completedByAssignment.get(assignment.id) ?? 0;
    const status: ReaderManuscriptListItem["status"] = assignment.status === "completed" || (totalChapters > 0 && completedChapters >= totalChapters)
      ? "finished"
      : latestProgressByAssignment.has(assignment.id)
        ? "reading"
        : "not-started";

    return [{
      assignmentId: assignment.id,
      accessibleChapterIds,
      closingNote: readingRound.reader_closing_note,
      completedChapterIds: completedChapterIdsByAssignment.get(assignment.id) ?? [],
      completedChapters,
      coverUrl: coverUrlByVersionId.get(version.id)
        ?? fallbackCoverUrlByManuscriptId.get(version.manuscript_id)
        ?? null,
      deadline: readingRound.reading_deadline,
      feedbackEnabled: readingRound.status !== "archived",
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
  }).sort((left, right) => right.versionNumber - left.versionNumber);
}

export type ReaderManuscript = ReaderManuscriptListItem & {
  chapters: Array<{
    blocks: Array<{
      annotations: ReaderAnnotation[];
      content: string;
      id: string;
      position: number;
    }>;
    generalComment: ReaderChapterGeneralComment | null;
    id: string;
    position: number;
    title: string;
  }>;
};

export async function getReaderManuscript(
  manuscriptId: string,
  manuscriptVersionId: string | null = null,
): Promise<ReaderManuscript | null> {
  const manuscripts = await getReaderManuscripts();
  const manuscript = manuscriptVersionId
    ? manuscripts.find((item) => item.id === manuscriptId && item.versionId === manuscriptVersionId)
    : manuscripts.find((item) => item.id === manuscriptId);
  if (!manuscript) return null;

  const supabase = createSupabaseBrowserClient();
  const { data: chapterRows, error: chaptersError } = await supabase
    .from("manuscript_chapters")
    .select("id, position, title")
    .eq("manuscript_version_id", manuscript.versionId)
    .in("id", manuscript.accessibleChapterIds)
    .is("archived_at", null)
    .order("position", { ascending: true });

  if (chaptersError) throw new Error(chaptersError.message);

  const chapters = chapterRows ?? [];
  const chapterIds = chapters.map((chapter) => chapter.id);
  const { data: blockRows, error: blocksError } = chapterIds.length > 0
    ? await supabase
      .from("chapter_blocks")
      .select("id, chapter_id, position, content")
      .in("chapter_id", chapterIds)
      .is("archived_at", null)
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
        tag_id,
        quote,
        selection_start,
        selection_end,
        selection_end_chapter_block_id,
        selection_end_offset,
        context_before,
        context_after,
        comment
      `)
      .eq("reader_assignment_id", manuscript.assignmentId)
      .in("chapter_id", chapterIds)
      .is("archived_at", null)
    : { data: [], error: null };

  if (annotationsError) throw new Error(annotationsError.message);

  const { data: generalCommentRows, error: generalCommentsError } = chapterIds.length > 0
    ? await supabase
      .from("chapter_general_comments")
      .select("id, chapter_id, comment")
      .eq("reader_assignment_id", manuscript.assignmentId)
      .in("chapter_id", chapterIds)
      .is("archived_at", null)
    : { data: [], error: null };

  if (generalCommentsError) throw new Error(generalCommentsError.message);

  const annotationTagIds = [...new Set((annotationRows ?? []).map((annotation) => annotation.tag_id))];
  const { data: annotationTagRows, error: annotationTagsError } = annotationTagIds.length > 0
    ? await supabase
      .from("manuscript_annotation_tags")
      .select("id, slug, label, color")
      .in("id", annotationTagIds)
    : { data: [], error: null };

  if (annotationTagsError) throw new Error(annotationTagsError.message);

  const annotationTagsById = new Map(
    (annotationTagRows ?? []).map((tag) => [tag.id, tag]),
  );
  const annotationsByChapter = new Map<string, ReaderAnnotation[]>();
  const generalCommentsByChapter = new Map<string, ReaderChapterGeneralComment>();

  for (const generalComment of generalCommentRows ?? []) {
    generalCommentsByChapter.set(generalComment.chapter_id, {
      comment: generalComment.comment,
      id: generalComment.id,
    });
  }

  for (const annotation of annotationRows ?? []) {
    const tag = annotationTagsById.get(annotation.tag_id);
    const annotations = annotationsByChapter.get(annotation.chapter_id) ?? [];
    annotations.push({
      chapterBlockId: annotation.chapter_block_id,
      chapterId: annotation.chapter_id,
      comment: annotation.comment,
      contextAfter: annotation.context_after,
      contextBefore: annotation.context_before,
      id: annotation.id,
      quote: annotation.quote,
      selectionEnd: annotation.selection_end,
      selectionEndChapterBlockId: annotation.selection_end_chapter_block_id,
      selectionEndOffset: annotation.selection_end_offset,
      selectionStart: annotation.selection_start,
      tag: {
        color: tag?.color ?? "#6B7280",
        id: annotation.tag_id,
        label: tag?.label ?? "Unknown tag",
        slug: tag?.slug ?? "unknown",
      },
    });
    annotationsByChapter.set(annotation.chapter_id, annotations);
  }

  const blocksByChapter = new Map<string, ReaderManuscript["chapters"][number]["blocks"]>();
  for (const block of blockRows ?? []) {
    const blocks = blocksByChapter.get(block.chapter_id) ?? [];
    blocks.push({
      annotations: [],
      content: block.content,
      id: block.id,
      position: block.position,
    });
    blocksByChapter.set(block.chapter_id, blocks);
  }

  return {
    ...manuscript,
    chapters: chapters.map((chapter) => {
      const chapterBlocks = blocksByChapter.get(chapter.id) ?? [];
      const chapterAnnotations = annotationsByChapter.get(chapter.id) ?? [];

      return {
        blocks: chapterBlocks.map((block) => ({
          ...block,
          annotations: getBlockAnnotationRanges(chapterBlocks, block, chapterAnnotations),
        })),
        generalComment: generalCommentsByChapter.get(chapter.id) ?? null,
        id: chapter.id,
        position: chapter.position,
        title: chapter.title,
      };
    }),
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

export async function startReaderChapter({
  chapterId,
  readerAssignmentId,
}: {
  chapterId: string;
  readerAssignmentId: string;
}) {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase
    .from("chapter_reading_progress")
    .upsert(
      {
        chapter_id: chapterId,
        last_read_at: new Date().toISOString(),
        reader_assignment_id: readerAssignmentId,
        status: "in_progress",
      },
      { onConflict: "reader_assignment_id,chapter_id" },
    );

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

type SubmittedReaderSurveyRow = {
  id: string;
  reader_assignment_id: string;
  submitted_at: string | null;
  survey_id: string;
  updated_at: string;
  surveys: {
    id: string;
    name: string;
    status: "active" | "closed" | "draft";
    reading_rounds: {
      manuscript_versions: {
        manuscript_id: string;
        title: string;
      } | null;
    } | null;
  } | null;
};

type SubmittedReaderSurveyAnswerRow = {
  boolean_value: boolean | null;
  number_value: number | null;
  selected_option_id: string | null;
  survey_question_id: string;
  survey_submission_id: string;
  text_value: string | null;
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
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.rpc("submit_reader_survey", {
    p_answers: serializeReaderSurveyRpcAnswers(answers),
    p_reader_assignment_id: readerAssignmentId,
    p_survey_id: surveyId,
  });

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Your survey response could not be saved.");

  return data;
}

export async function getReaderSubmittedSurveys(): Promise<ReaderSubmittedSurvey[]> {
  const supabase = createSupabaseBrowserClient();
  const { data: submissionRows, error: submissionsError } = await supabase
    .from("survey_submissions")
    .select(`
      id,
      reader_assignment_id,
      survey_id,
      submitted_at,
      updated_at,
      surveys!inner (
        id,
        name,
        status,
        reading_rounds!inner (
          manuscript_versions!inner (manuscript_id, title)
        )
      )
    `)
    .eq("status", "submitted")
    .order("updated_at", { ascending: false });

  if (submissionsError) throw new Error(submissionsError.message);

  const submissions = (submissionRows ?? []) as unknown as SubmittedReaderSurveyRow[];
  if (submissions.length === 0) return [];

  const surveyIds = [...new Set(submissions.map((submission) => submission.survey_id))];
  const submissionIds = submissions.map((submission) => submission.id);
  const { data: questionRows, error: questionsError } = await supabase
    .from("survey_questions")
    .select("id, survey_id, position, question_type, prompt, is_required")
    .in("survey_id", surveyIds)
    .order("position", { ascending: true });

  if (questionsError) throw new Error(questionsError.message);

  const questions = (questionRows ?? []) as DueSurveyQuestionRow[];
  const questionIds = questions.map((question) => question.id);
  const [optionsResult, answersResult] = await Promise.all([
    questionIds.length > 0
      ? supabase
        .from("survey_question_options")
        .select("id, survey_question_id, position, label")
        .in("survey_question_id", questionIds)
        .order("position", { ascending: true })
      : Promise.resolve({ data: [], error: null }),
    supabase
      .from("survey_answers")
      .select("survey_submission_id, survey_question_id, text_value, number_value, boolean_value, selected_option_id")
      .in("survey_submission_id", submissionIds),
  ]);

  if (optionsResult.error) throw new Error(optionsResult.error.message);
  if (answersResult.error) throw new Error(answersResult.error.message);

  const optionsByQuestionId = new Map<string, ReaderSurveyOption[]>();
  for (const option of (optionsResult.data ?? []) as DueSurveyOptionRow[]) {
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

  const answersBySubmissionId = new Map<string, Map<string, SubmittedReaderSurveyAnswerRow[]>>();
  for (const answer of (answersResult.data ?? []) as SubmittedReaderSurveyAnswerRow[]) {
    const answersByQuestionId = answersBySubmissionId.get(answer.survey_submission_id) ?? new Map();
    const questionAnswers = answersByQuestionId.get(answer.survey_question_id) ?? [];
    questionAnswers.push(answer);
    answersByQuestionId.set(answer.survey_question_id, questionAnswers);
    answersBySubmissionId.set(answer.survey_submission_id, answersByQuestionId);
  }

  return submissions.flatMap((submission) => {
    const survey = submission.surveys;
    const version = survey?.reading_rounds?.manuscript_versions;
    if (!survey || !version) return [];

    const questionsForSurvey = questionsBySurveyId.get(survey.id) ?? [];
    const answerRowsByQuestionId = answersBySubmissionId.get(submission.id)
      ?? new Map<string, SubmittedReaderSurveyAnswerRow[]>();
    const answers: Record<string, ReaderSurveyAnswerValue> = {};

    for (const question of questionsForSurvey) {
      const answerRows = answerRowsByQuestionId.get(question.id) ?? [];
      if (question.type === "multiple-choice") {
        const selectedOptionIds = answerRows.flatMap((answer) => (
          answer.selected_option_id ? [answer.selected_option_id] : []
        ));
        if (selectedOptionIds.length > 0) answers[question.id] = selectedOptionIds;
        continue;
      }

      const answer = answerRows[0];
      if (!answer) continue;
      if (question.type === "rating" && answer.number_value !== null) {
        answers[question.id] = answer.number_value;
      } else if (question.type === "yes-no" && answer.boolean_value !== null) {
        answers[question.id] = answer.boolean_value;
      } else if (question.type === "open-text" && answer.text_value !== null) {
        answers[question.id] = answer.text_value;
      }
    }

    return [{
      answers,
      canEdit: survey.status === "active",
      manuscriptId: version.manuscript_id,
      manuscriptTitle: version.title,
      name: survey.name,
      questions: questionsForSurvey,
      readerAssignmentId: submission.reader_assignment_id,
      submissionId: submission.id,
      submittedAt: submission.submitted_at,
      surveyId: submission.survey_id,
      updatedAt: submission.updated_at,
    } satisfies ReaderSubmittedSurvey];
  });
}

export async function updateReaderSurveyResponse({
  answers,
  readerAssignmentId,
  surveyId,
}: {
  answers: ReaderSurveyAnswer[];
  readerAssignmentId: string;
  surveyId: string;
}) {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.rpc("update_reader_survey_response", {
    p_answers: serializeReaderSurveyRpcAnswers(answers),
    p_reader_assignment_id: readerAssignmentId,
    p_survey_id: surveyId,
  });

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Your survey response could not be updated.");

  return data;
}

function serializeReaderSurveyRpcAnswers(answers: ReaderSurveyAnswer[]): Json[] {
  return answers.map((answer) => {
    const serialized: { [key: string]: Json | undefined } = {
      question_id: answer.questionId,
    };

    if (answer.numberValue !== undefined) serialized.number_value = answer.numberValue;
    if (answer.booleanValue !== undefined) serialized.boolean_value = answer.booleanValue;
    if (answer.selectedOptionIds !== undefined) serialized.selected_option_ids = answer.selectedOptionIds;
    if (answer.textValue !== undefined) serialized.text_value = answer.textValue;

    return serialized;
  });
}

type ReaderAnnotationTagScopeRow = {
  reading_rounds: {
    manuscript_versions: {
      manuscript_id: string;
    } | null;
  } | null;
};

export async function getReaderAnnotationTags(
  readerAssignmentId: string,
): Promise<ReaderAnnotationTag[]> {
  const supabase = createSupabaseBrowserClient();
  const { data: assignment, error: assignmentError } = await supabase
    .from("reader_assignments")
    .select(`reading_rounds!inner (manuscript_versions!inner (manuscript_id))`)
    .eq("id", readerAssignmentId)
    .maybeSingle();

  if (assignmentError) throw new Error(assignmentError.message);
  const manuscriptId = (assignment as unknown as ReaderAnnotationTagScopeRow | null)
    ?.reading_rounds?.manuscript_versions?.manuscript_id;
  if (!manuscriptId) return [];

  const { data, error } = await supabase
    .from("manuscript_annotation_tags")
    .select("id, slug, label, color")
    .eq("manuscript_id", manuscriptId)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);

  return data ?? [];
}

export type CreateReaderAnnotationInput = ReaderAnnotationDraft & {
  comment: string;
  readerAssignmentId: string;
  tagId: string;
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
  selectionEndChapterBlockId,
  selectionEndOffset,
  selectionStart,
  tagId,
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
      selection_end_chapter_block_id: selectionEndChapterBlockId,
      selection_end_offset: selectionEndOffset,
      selection_start: selectionStart,
      tag_id: tagId,
    });

  if (error) throw new Error(error.message);
}

export async function updateReaderAnnotation({
  annotationId,
  comment,
  tagId,
}: {
  annotationId: string;
  comment: string;
  tagId: string;
}) {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("annotations")
    .update({
      comment: comment.trim() || null,
      tag_id: tagId,
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

export type UpsertReaderChapterGeneralCommentInput = {
  chapterId: string;
  comment: string;
  readerAssignmentId: string;
};

export async function upsertReaderChapterGeneralComment({
  chapterId,
  comment,
  readerAssignmentId,
}: UpsertReaderChapterGeneralCommentInput): Promise<ReaderChapterGeneralComment> {
  const normalizedComment = comment.trim();
  if (!normalizedComment || normalizedComment.length > 4000) {
    throw new Error("A general annotation must contain between 1 and 4,000 characters.");
  }

  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("chapter_general_comments")
    .upsert(
      {
        chapter_id: chapterId,
        comment: normalizedComment,
        reader_assignment_id: readerAssignmentId,
      },
      { onConflict: "reader_assignment_id,chapter_id" },
    )
    .select("id, comment")
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("This general annotation is no longer available.");

  return data;
}

export async function deleteReaderChapterGeneralComment(generalCommentId: string) {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("chapter_general_comments")
    .delete()
    .eq("id", generalCommentId)
    .select("id")
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("This general annotation is no longer available.");
}
