export type SurveyQuestionType = "rating" | "yes-no" | "multiple-choice" | "open-text";

export type SurveyOption = {
  id: string;
  label: string;
};

export type SurveyQuestion = {
  id: string;
  prompt: string;
  type: SurveyQuestionType;
  required: boolean;
  options: SurveyOption[];
};

export type SurveyDelivery = {
  scope: "manuscript" | "chapter";
  chapterId: string | null;
};

export type SurveyStatus = "active" | "closed" | "draft";

export type SurveyResponse = {
  answers: SurveyResponseAnswer[];
  id: string;
  readerName: string;
  submittedAt: string | null;
};

export type SurveyResponseAnswer = {
  questionId: string;
  questionPrompt: string;
  type: SurveyQuestionType;
  values: string[];
};

export type ManuscriptSurvey = {
  id: string;
  readingRoundId: string;
  name: string;
  status: SurveyStatus;
  responseCount: number;
  delivery: SurveyDelivery;
  questions: SurveyQuestion[];
  responses: SurveyResponse[];
};

export type SurveyQuestionPatch = Partial<Omit<SurveyQuestion, "id">>;

export type SurveyChapter = {
  id: string;
  position: number;
  title: string;
};

export type ManuscriptSurveysData = {
  chapters: SurveyChapter[];
  readingRoundId: string | null;
  surveys: ManuscriptSurvey[];
};
