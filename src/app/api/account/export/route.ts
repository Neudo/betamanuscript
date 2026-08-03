import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type QueryResult = {
  error: { message: string } | null;
};

function assertQueriesSucceeded(results: QueryResult[]) {
  const failedQuery = results.find((result) => result.error);

  if (failedQuery?.error) {
    throw new Error(failedQuery.error.message);
  }
}

function jsonError(message: string, status: number) {
  return Response.json(
    { error: message },
    {
      status,
      headers: { "Cache-Control": "private, no-store" },
    },
  );
}

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return jsonError("Sign in to export your account data.", 401);
  }

  try {
    const admin = createSupabaseAdminClient();
    const [
      profileResult,
      socialLinksResult,
      notificationPreferencesResult,
      notificationsResult,
      featureRequestsResult,
      manuscriptsResult,
    ] = await Promise.all([
      admin.from("profiles").select("*").eq("id", user.id).single(),
      admin.from("profile_social_links").select("*").eq("profile_id", user.id),
      admin.from("author_notification_preferences").select("*").eq("profile_id", user.id).maybeSingle(),
      admin.from("author_notifications").select("*").eq("profile_id", user.id).order("created_at", { ascending: true }),
      admin.from("feature_requests").select("*").eq("profile_id", user.id).order("created_at", { ascending: true }),
      admin.from("manuscripts").select("*").eq("owner_id", user.id).order("created_at", { ascending: true }),
    ]);

    assertQueriesSucceeded([
      profileResult,
      socialLinksResult,
      notificationPreferencesResult,
      notificationsResult,
      featureRequestsResult,
      manuscriptsResult,
    ]);

    const manuscripts = manuscriptsResult.data ?? [];
    const manuscriptIds = manuscripts.map((manuscript) => manuscript.id);

    const emptyWorkspace = {
      annotations: [],
      annotationTags: [],
      chapterBlocks: [],
      chapterGeneralAnnotations: [],
      chapterReadingProgress: [],
      chapters: [],
      manuscriptAssets: [],
      manuscriptVersionGenres: [],
      manuscriptVersions: [],
      readerAssignmentChapterAccess: [],
      readerAssignments: [],
      readerDraftAccess: [],
      readingInvitations: [],
      readingRoundAccessLinks: [],
      readingRounds: [],
      surveyAnswers: [],
      surveyQuestionOptions: [],
      surveyQuestions: [],
      surveySubmissions: [],
      surveys: [],
    };

    const workspace = manuscriptIds.length > 0
      ? await getWorkspaceExport(admin, manuscriptIds)
      : emptyWorkspace;

    const exportedAt = new Date().toISOString();
    const filenameDate = exportedAt.slice(0, 10);

    return new Response(
      JSON.stringify(
        {
          account: {
            email: user.email ?? null,
            featureRequests: featureRequestsResult.data ?? [],
            notificationPreferences: notificationPreferencesResult.data,
            notifications: notificationsResult.data ?? [],
            profile: profileResult.data,
            socialLinks: socialLinksResult.data ?? [],
          },
          exportedAt,
          formatVersion: 1,
          manuscripts,
          workspace,
        },
        null,
        2,
      ),
      {
        headers: {
          "Cache-Control": "private, no-store",
          "Content-Disposition": `attachment; filename="betamanuscript-account-export-${filenameDate}.json"`,
          "Content-Type": "application/json; charset=utf-8",
          "X-Content-Type-Options": "nosniff",
        },
      },
    );
  } catch (error) {
    console.error("Unable to export account data.", error);
    return jsonError("Unable to export account data. Please try again.", 500);
  }
}

async function getWorkspaceExport(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  manuscriptIds: string[],
) {
  const [manuscriptVersionsResult, annotationTagsResult] = await Promise.all([
    admin.from("manuscript_versions").select("*").in("manuscript_id", manuscriptIds).order("created_at", { ascending: true }),
    admin.from("manuscript_annotation_tags").select("*").in("manuscript_id", manuscriptIds).order("sort_order", { ascending: true }),
  ]);

  assertQueriesSucceeded([manuscriptVersionsResult, annotationTagsResult]);

  const manuscriptVersions = manuscriptVersionsResult.data ?? [];
  const manuscriptVersionIds = manuscriptVersions.map((version) => version.id);

  if (manuscriptVersionIds.length === 0) {
    return {
      annotations: [],
      annotationTags: annotationTagsResult.data ?? [],
      chapterBlocks: [],
      chapterGeneralAnnotations: [],
      chapterReadingProgress: [],
      chapters: [],
      manuscriptAssets: [],
      manuscriptVersionGenres: [],
      manuscriptVersions,
      readerAssignmentChapterAccess: [],
      readerAssignments: [],
      readerDraftAccess: [],
      readingInvitations: [],
      readingRoundAccessLinks: [],
      readingRounds: [],
      surveyAnswers: [],
      surveyQuestionOptions: [],
      surveyQuestions: [],
      surveySubmissions: [],
      surveys: [],
    };
  }

  const [
    manuscriptAssetsResult,
    manuscriptVersionGenresResult,
    chaptersResult,
    readingRoundsResult,
  ] = await Promise.all([
    admin.from("manuscript_assets").select("*").in("manuscript_version_id", manuscriptVersionIds).order("created_at", { ascending: true }),
    admin.from("manuscript_version_genres").select("*").in("manuscript_version_id", manuscriptVersionIds).order("sort_order", { ascending: true }),
    admin.from("manuscript_chapters").select("*").in("manuscript_version_id", manuscriptVersionIds).order("position", { ascending: true }),
    admin.from("reading_rounds").select("*").in("manuscript_version_id", manuscriptVersionIds).order("created_at", { ascending: true }),
  ]);

  assertQueriesSucceeded([
    manuscriptAssetsResult,
    manuscriptVersionGenresResult,
    chaptersResult,
    readingRoundsResult,
  ]);

  const chapters = chaptersResult.data ?? [];
  const chapterIds = chapters.map((chapter) => chapter.id);
  const readingRounds = readingRoundsResult.data ?? [];
  const readingRoundIds = readingRounds.map((round) => round.id);

  const [
    chapterBlocksResult,
    readerAssignmentsResult,
    readingInvitationsResult,
    readingRoundAccessLinksResult,
    surveysResult,
  ] = await Promise.all([
    chapterIds.length > 0
      ? admin.from("chapter_blocks").select("*").in("chapter_id", chapterIds).order("position", { ascending: true })
      : Promise.resolve({ data: [], error: null }),
    readingRoundIds.length > 0
      ? admin.from("reader_assignments").select("*").in("reading_round_id", readingRoundIds).order("created_at", { ascending: true })
      : Promise.resolve({ data: [], error: null }),
    readingRoundIds.length > 0
      ? admin.from("reading_invitations").select("id, reading_round_id, recipient_email, personal_note, status, sent_at, accepted_at, accepted_by_profile_id, expires_at, revoked_at, created_at, updated_at").in("reading_round_id", readingRoundIds).order("created_at", { ascending: true })
      : Promise.resolve({ data: [], error: null }),
    readingRoundIds.length > 0
      ? admin.from("reading_round_access_links").select("id, reading_round_id, max_uses, expires_at, revoked_at, created_at, updated_at").in("reading_round_id", readingRoundIds).order("created_at", { ascending: true })
      : Promise.resolve({ data: [], error: null }),
    readingRoundIds.length > 0
      ? admin.from("surveys").select("*").in("reading_round_id", readingRoundIds).order("created_at", { ascending: true })
      : Promise.resolve({ data: [], error: null }),
  ]);

  assertQueriesSucceeded([
    chapterBlocksResult,
    readerAssignmentsResult,
    readingInvitationsResult,
    readingRoundAccessLinksResult,
    surveysResult,
  ]);

  const readerAssignments = readerAssignmentsResult.data ?? [];
  const readerAssignmentIds = readerAssignments.map((assignment) => assignment.id);
  const surveys = surveysResult.data ?? [];
  const surveyIds = surveys.map((survey) => survey.id);

  const [
    annotationsResult,
    chapterGeneralAnnotationsResult,
    chapterReadingProgressResult,
    readerAssignmentChapterAccessResult,
    readerDraftAccessResult,
    surveyQuestionsResult,
    surveySubmissionsResult,
  ] = await Promise.all([
    readerAssignmentIds.length > 0
      ? admin.from("annotations").select("*").in("reader_assignment_id", readerAssignmentIds).order("created_at", { ascending: true })
      : Promise.resolve({ data: [], error: null }),
    readerAssignmentIds.length > 0
      ? admin.from("chapter_general_comments").select("*").in("reader_assignment_id", readerAssignmentIds).order("created_at", { ascending: true })
      : Promise.resolve({ data: [], error: null }),
    readerAssignmentIds.length > 0
      ? admin.from("chapter_reading_progress").select("*").in("reader_assignment_id", readerAssignmentIds).order("created_at", { ascending: true })
      : Promise.resolve({ data: [], error: null }),
    readerAssignmentIds.length > 0
      ? admin.from("reader_assignment_chapter_access").select("*").in("reader_assignment_id", readerAssignmentIds).order("created_at", { ascending: true })
      : Promise.resolve({ data: [], error: null }),
    readerAssignmentIds.length > 0
      ? admin.from("reader_draft_access").select("*").in("reader_assignment_id", readerAssignmentIds).order("created_at", { ascending: true })
      : Promise.resolve({ data: [], error: null }),
    surveyIds.length > 0
      ? admin.from("survey_questions").select("*").in("survey_id", surveyIds).order("position", { ascending: true })
      : Promise.resolve({ data: [], error: null }),
    surveyIds.length > 0
      ? admin.from("survey_submissions").select("*").in("survey_id", surveyIds).order("created_at", { ascending: true })
      : Promise.resolve({ data: [], error: null }),
  ]);

  assertQueriesSucceeded([
    annotationsResult,
    chapterGeneralAnnotationsResult,
    chapterReadingProgressResult,
    readerAssignmentChapterAccessResult,
    readerDraftAccessResult,
    surveyQuestionsResult,
    surveySubmissionsResult,
  ]);

  const surveyQuestions = surveyQuestionsResult.data ?? [];
  const surveyQuestionIds = surveyQuestions.map((question) => question.id);
  const surveySubmissions = surveySubmissionsResult.data ?? [];
  const surveySubmissionIds = surveySubmissions.map((submission) => submission.id);

  const [surveyQuestionOptionsResult, surveyAnswersResult] = await Promise.all([
    surveyQuestionIds.length > 0
      ? admin.from("survey_question_options").select("*").in("survey_question_id", surveyQuestionIds).order("position", { ascending: true })
      : Promise.resolve({ data: [], error: null }),
    surveySubmissionIds.length > 0
      ? admin.from("survey_answers").select("*").in("survey_submission_id", surveySubmissionIds).order("created_at", { ascending: true })
      : Promise.resolve({ data: [], error: null }),
  ]);

  assertQueriesSucceeded([surveyQuestionOptionsResult, surveyAnswersResult]);

  return {
    annotations: annotationsResult.data ?? [],
    annotationTags: annotationTagsResult.data ?? [],
    chapterBlocks: chapterBlocksResult.data ?? [],
    chapterGeneralAnnotations: chapterGeneralAnnotationsResult.data ?? [],
    chapterReadingProgress: chapterReadingProgressResult.data ?? [],
    chapters,
    manuscriptAssets: manuscriptAssetsResult.data ?? [],
    manuscriptVersionGenres: manuscriptVersionGenresResult.data ?? [],
    manuscriptVersions,
    readerAssignmentChapterAccess: readerAssignmentChapterAccessResult.data ?? [],
    readerAssignments,
    readerDraftAccess: readerDraftAccessResult.data ?? [],
    readingInvitations: readingInvitationsResult.data ?? [],
    readingRoundAccessLinks: readingRoundAccessLinksResult.data ?? [],
    readingRounds,
    surveyAnswers: surveyAnswersResult.data ?? [],
    surveyQuestionOptions: surveyQuestionOptionsResult.data ?? [],
    surveyQuestions,
    surveySubmissions,
    surveys,
  };
}
