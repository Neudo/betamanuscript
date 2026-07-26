import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type {
  ManuscriptSurvey,
  ManuscriptSurveysData,
  SurveyChapter,
  SurveyQuestion,
  SurveyQuestionType,
  SurveyResponseAnswer,
  SurveyStatus,
} from "@/features/surveys/types";

type ManuscriptVersionRow = {
  id: string;
};

type ReadingRoundRow = {
  id: string;
};

type SurveyRow = {
  chapter_id: string | null;
  id: string;
  name: string;
  reading_round_id: string;
  status: SurveyStatus;
  trigger_type: "after_chapter" | "after_manuscript";
};

type QuestionRow = {
  id: string;
  is_required: boolean;
  position: number;
  prompt: string;
  question_type: "rating" | "yes_no" | "multiple_choice" | "open_text";
  survey_id: string;
};

type OptionRow = {
  id: string;
  label: string;
  position: number;
  survey_question_id: string;
};

type SubmissionRow = {
  id: string;
  reader_assignment_id: string;
  submitted_at: string | null;
  survey_id: string;
};

type ReaderAssignmentRow = {
  id: string;
  reader_display_name: string | null;
  reader_email: string;
};

type SurveyAnswerRow = {
  boolean_value: boolean | null;
  number_value: number | null;
  selected_option_id: string | null;
  survey_question_id: string;
  survey_submission_id: string;
  text_value: string | null;
};

type SurveyWriteInput = Pick<
  ManuscriptSurvey,
  "delivery" | "name" | "questions"
> & {
  readingRoundId: string;
};

const questionTypeFromDatabase: Record<QuestionRow["question_type"], SurveyQuestionType> = {
  multiple_choice: "multiple-choice",
  open_text: "open-text",
  rating: "rating",
  yes_no: "yes-no",
};

const questionTypeToDatabase: Record<SurveyQuestionType, QuestionRow["question_type"]> = {
  "multiple-choice": "multiple_choice",
  "open-text": "open_text",
  rating: "rating",
  "yes-no": "yes_no",
};

/** Returns surveys for the latest non-archived reading round of the active draft. */
export async function getManuscriptSurveys(
  manuscriptId: string,
): Promise<ManuscriptSurveysData | null> {
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
  if (!version) return null;

  const [chaptersResult, readingRoundsResult] = await Promise.all([
    supabase
      .from("manuscript_chapters")
      .select("id, position, title")
      .eq("manuscript_version_id", version.id)
      .order("position", { ascending: true }),
    supabase
      .from("reading_rounds")
      .select("id")
      .eq("manuscript_version_id", version.id)
      .neq("status", "archived")
      .order("created_at", { ascending: false })
      .limit(1),
  ]);

  if (chaptersResult.error) throw new Error(chaptersResult.error.message);
  if (readingRoundsResult.error) throw new Error(readingRoundsResult.error.message);

  const chapters = (chaptersResult.data ?? []) as SurveyChapter[];
  const readingRound = (readingRoundsResult.data?.[0] ?? null) as ReadingRoundRow | null;
  if (!readingRound) {
    return { chapters, readingRoundId: null, surveys: [] };
  }

  const { data: surveyRows, error: surveyError } = await supabase
    .from("surveys")
    .select("id, reading_round_id, name, status, trigger_type, chapter_id")
    .eq("reading_round_id", readingRound.id)
    .order("created_at", { ascending: true });

  if (surveyError) throw new Error(surveyError.message);

  return {
    chapters,
    readingRoundId: readingRound.id,
    surveys: await hydrateSurveys(
      supabase,
      (surveyRows ?? []) as SurveyRow[],
    ),
  };
}

export async function createSurvey(input: SurveyWriteInput): Promise<ManuscriptSurvey> {
  validateSurveyInput(input);

  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("surveys")
    .insert({
      chapter_id: input.delivery.scope === "chapter" ? input.delivery.chapterId : null,
      name: input.name.trim(),
      reading_round_id: input.readingRoundId,
      status: "draft",
      trigger_type: input.delivery.scope === "chapter" ? "after_chapter" : "after_manuscript",
    })
    .select("id, reading_round_id, name, status, trigger_type, chapter_id")
    .single();

  if (error) throw new Error(error.message);

  await replaceSurveyQuestions(supabase, data.id, input.questions);
  return getSurvey(data.id);
}

export async function saveSurvey(survey: ManuscriptSurvey): Promise<ManuscriptSurvey> {
  validateSurveyInput({
    delivery: survey.delivery,
    name: survey.name,
    questions: survey.questions,
    readingRoundId: survey.readingRoundId,
  });

  const supabase = createSupabaseBrowserClient();
  const { count, error: submissionError } = await supabase
    .from("survey_submissions")
    .select("id", { count: "exact", head: true })
    .eq("survey_id", survey.id);

  if (submissionError) throw new Error(submissionError.message);
  if ((count ?? 0) > 0) {
    throw new Error("A survey with responses can no longer have its questions changed.");
  }

  await replaceSurveyQuestions(supabase, survey.id, survey.questions);

  const { error } = await supabase
    .from("surveys")
    .update({
      chapter_id: survey.delivery.scope === "chapter" ? survey.delivery.chapterId : null,
      name: survey.name.trim(),
      trigger_type: survey.delivery.scope === "chapter" ? "after_chapter" : "after_manuscript",
    })
    .eq("id", survey.id);

  if (error) throw new Error(error.message);

  return getSurvey(survey.id);
}

export async function updateSurveyStatus({
  status,
  surveyId,
}: {
  status: SurveyStatus;
  surveyId: string;
}) {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase
    .from("surveys")
    .update({ status })
    .eq("id", surveyId);

  if (error) throw new Error(error.message);
}

async function getSurvey(surveyId: string): Promise<ManuscriptSurvey> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("surveys")
    .select("id, reading_round_id, name, status, trigger_type, chapter_id")
    .eq("id", surveyId)
    .single();

  if (error) throw new Error(error.message);

  const [survey] = await hydrateSurveys(supabase, [data as SurveyRow]);
  if (!survey) throw new Error("The survey could not be loaded after saving.");
  return survey;
}

async function hydrateSurveys(
  supabase: ReturnType<typeof createSupabaseBrowserClient>,
  surveys: SurveyRow[],
): Promise<ManuscriptSurvey[]> {
  if (surveys.length === 0) return [];

  const surveyIds = surveys.map((survey) => survey.id);
  const { data: questionRows, error: questionError } = await supabase
    .from("survey_questions")
    .select("id, survey_id, position, question_type, prompt, is_required")
    .in("survey_id", surveyIds)
    .order("position", { ascending: true });

  if (questionError) throw new Error(questionError.message);

  const questions = (questionRows ?? []) as QuestionRow[];
  const questionIds = questions.map((question) => question.id);
  const [optionsResult, submissionsResult] = await Promise.all([
    questionIds.length > 0
      ? supabase
        .from("survey_question_options")
        .select("id, survey_question_id, position, label")
        .in("survey_question_id", questionIds)
        .order("position", { ascending: true })
      : Promise.resolve({ data: [], error: null }),
    supabase
      .from("survey_submissions")
      .select("id, survey_id, reader_assignment_id, submitted_at")
      .in("survey_id", surveyIds)
      .eq("status", "submitted")
      .order("submitted_at", { ascending: false }),
  ]);

  if (optionsResult.error) throw new Error(optionsResult.error.message);
  if (submissionsResult.error) throw new Error(submissionsResult.error.message);

  const submissions = (submissionsResult.data ?? []) as SubmissionRow[];
  const readerAssignmentIds = [...new Set(
    submissions.map((submission) => submission.reader_assignment_id),
  )];
  const submissionIds = submissions.map((submission) => submission.id);
  const [readerAssignmentsResult, answersResult] = await Promise.all([
    readerAssignmentIds.length > 0
      ? supabase
        .from("reader_assignments")
        .select("id, reader_display_name, reader_email")
        .in("id", readerAssignmentIds)
      : Promise.resolve({ data: [], error: null }),
    submissionIds.length > 0
      ? supabase
        .from("survey_answers")
        .select("survey_submission_id, survey_question_id, text_value, number_value, boolean_value, selected_option_id")
        .in("survey_submission_id", submissionIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (readerAssignmentsResult.error) {
    throw new Error(readerAssignmentsResult.error.message);
  }
  if (answersResult.error) throw new Error(answersResult.error.message);

  const optionsByQuestionId = new Map<string, OptionRow[]>();
  for (const option of (optionsResult.data ?? []) as OptionRow[]) {
    const questionOptions = optionsByQuestionId.get(option.survey_question_id) ?? [];
    questionOptions.push(option);
    optionsByQuestionId.set(option.survey_question_id, questionOptions);
  }
  const questionsBySurveyId = new Map<string, SurveyQuestion[]>();
  for (const question of questions) {
    const surveyQuestions = questionsBySurveyId.get(question.survey_id) ?? [];
    surveyQuestions.push({
      id: question.id,
      options: (optionsByQuestionId.get(question.id) ?? []).map((option) => ({
        id: option.id,
        label: option.label,
      })),
      prompt: question.prompt,
      required: question.is_required,
      type: questionTypeFromDatabase[question.question_type],
    });
    questionsBySurveyId.set(question.survey_id, surveyQuestions);
  }
  const answersBySubmissionId = new Map<string, Map<string, SurveyAnswerRow[]>>();
  for (const answer of (answersResult.data ?? []) as SurveyAnswerRow[]) {
    const answersByQuestionId = answersBySubmissionId.get(answer.survey_submission_id) ?? new Map();
    const questionAnswers = answersByQuestionId.get(answer.survey_question_id) ?? [];
    questionAnswers.push(answer);
    answersByQuestionId.set(answer.survey_question_id, questionAnswers);
    answersBySubmissionId.set(answer.survey_submission_id, answersByQuestionId);
  }
  const readersById = new Map(
    ((readerAssignmentsResult.data ?? []) as ReaderAssignmentRow[]).map((reader) => [
      reader.id,
      reader,
    ]),
  );
  const submissionsBySurveyId = new Map<string, SubmissionRow[]>();
  for (const submission of submissions) {
    const surveySubmissions = submissionsBySurveyId.get(submission.survey_id) ?? [];
    surveySubmissions.push(submission);
    submissionsBySurveyId.set(submission.survey_id, surveySubmissions);
  }

  return surveys.map((survey) => {
    const surveySubmissions = submissionsBySurveyId.get(survey.id) ?? [];

    return {
      delivery: {
        chapterId: survey.chapter_id,
        scope: survey.trigger_type === "after_chapter" ? "chapter" : "manuscript",
      },
      id: survey.id,
      name: survey.name,
      questions: questionsBySurveyId.get(survey.id) ?? [],
      readingRoundId: survey.reading_round_id,
      responseCount: surveySubmissions.length,
      responses: surveySubmissions.map((submission) => {
        const reader = readersById.get(submission.reader_assignment_id);
        const responseAnswers = formatSurveyResponseAnswers(
          questionsBySurveyId.get(survey.id) ?? [],
          answersBySubmissionId.get(submission.id) ?? new Map(),
        );
        return {
          answers: responseAnswers,
          id: submission.id,
          readerName: reader?.reader_display_name ?? reader?.reader_email ?? "Reader",
          submittedAt: submission.submitted_at,
        };
      }),
      status: survey.status,
    } satisfies ManuscriptSurvey;
  });
}

function formatSurveyResponseAnswers(
  questions: SurveyQuestion[],
  answersByQuestionId: Map<string, SurveyAnswerRow[]>,
): SurveyResponseAnswer[] {
  return questions.flatMap((question) => {
    const answerRows = answersByQuestionId.get(question.id) ?? [];
    if (answerRows.length === 0) return [];

    const values = answerRows.flatMap((answer) => {
      if (question.type === "open-text") return answer.text_value ? [answer.text_value] : [];
      if (question.type === "rating") return answer.number_value === null ? [] : [`${answer.number_value} / 5`];
      if (question.type === "yes-no") return answer.boolean_value === null ? [] : [answer.boolean_value ? "Yes" : "No"];

      const option = question.options.find((item) => item.id === answer.selected_option_id);
      return option ? [option.label] : [];
    });

    if (values.length === 0) return [];
    return [{
      questionId: question.id,
      questionPrompt: question.prompt,
      type: question.type,
      values,
    }];
  });
}

async function replaceSurveyQuestions(
  supabase: ReturnType<typeof createSupabaseBrowserClient>,
  surveyId: string,
  questions: SurveyQuestion[],
) {
  const { error: deleteError } = await supabase
    .from("survey_questions")
    .delete()
    .eq("survey_id", surveyId);

  if (deleteError) throw new Error(deleteError.message);

  const { data: insertedQuestionRows, error: questionError } = await supabase
    .from("survey_questions")
    .insert(questions.map((question, index) => ({
      is_required: question.required,
      position: index + 1,
      prompt: question.prompt.trim(),
      question_type: questionTypeToDatabase[question.type],
      survey_id: surveyId,
    })))
    .select("id, position");

  if (questionError) throw new Error(questionError.message);

  const questionIdByPosition = new Map(
    (insertedQuestionRows ?? []).map((question) => [question.position, question.id]),
  );
  const options = questions.flatMap((question, questionIndex) => {
    if (question.type !== "multiple-choice") return [];
    const questionId = questionIdByPosition.get(questionIndex + 1);
    if (!questionId) throw new Error("A survey question could not be saved.");

    return question.options.map((option, optionIndex) => ({
      label: option.label.trim(),
      position: optionIndex + 1,
      survey_question_id: questionId,
    }));
  });

  if (options.length === 0) return;

  const { error: optionError } = await supabase
    .from("survey_question_options")
    .insert(options);

  if (optionError) throw new Error(optionError.message);
}

function validateSurveyInput(input: SurveyWriteInput) {
  if (!input.name.trim()) throw new Error("Give the survey a name before saving.");
  if (input.delivery.scope === "chapter" && !input.delivery.chapterId) {
    throw new Error("Choose the chapter that should trigger this survey.");
  }
  if (input.questions.length === 0) {
    throw new Error("A survey needs at least one question.");
  }
  if (input.questions.some((question) => !question.prompt.trim())) {
    throw new Error("Every question needs text before saving.");
  }
  if (input.questions.some((question) => question.type === "multiple-choice" && (
    question.options.length < 2 || question.options.some((option) => !option.label.trim())
  ))) {
    throw new Error("Multiple-choice questions need at least two named options.");
  }
}
