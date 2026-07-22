export type SurveyQuestionType = "rating" | "yes-no" | "multiple-choice" | "open-text";

export type SurveyQuestion = {
  id: string;
  prompt: string;
  type: SurveyQuestionType;
  required: boolean;
  options: string[];
};

export type SurveyDelivery = {
  scope: "manuscript" | "chapter";
  chapterId: string | null;
};

export type SurveyStatus = "active" | "closed" | "draft";

export type ManuscriptSurvey = {
  id: string;
  manuscriptId: string;
  name: string;
  status: SurveyStatus;
  responseCount: number;
  delivery: SurveyDelivery;
  questions: SurveyQuestion[];
};

export type SurveyQuestionPatch = Partial<Omit<SurveyQuestion, "id">>;
