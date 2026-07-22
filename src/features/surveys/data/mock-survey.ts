import { manuscript } from "@/features/dashboard/data/mock-dashboard";
import type { ManuscriptSurvey, SurveyDelivery } from "@/features/surveys/types";

export const initialSurvey: ManuscriptSurvey = {
  id: "end-of-book",
  manuscriptId: manuscript.id,
  name: "End-of-book survey",
  status: "active",
  responseCount: 3,
  delivery: {
    scope: "manuscript",
    chapterId: null,
  },
  questions: [
    {
      id: "q1",
      prompt: "Overall, how would you rate this manuscript?",
      type: "rating",
      required: true,
      options: [],
    },
    {
      id: "q2",
      prompt: "Would you read a sequel?",
      type: "yes-no",
      required: true,
      options: [],
    },
    {
      id: "q3",
      prompt: "What was the strongest element of the book?",
      type: "multiple-choice",
      required: false,
      options: ["Characters", "Plot", "World-building", "Prose", "Pacing"],
    },
    {
      id: "q4",
      prompt: "Is there anything the author should know that you couldn't capture in annotations?",
      type: "open-text",
      required: false,
      options: [],
    },
  ],
};

export function createSurvey({
  name,
  delivery,
}: {
  name: string;
  delivery: SurveyDelivery;
}): ManuscriptSurvey {
  return {
    id: createId("survey"),
    manuscriptId: manuscript.id,
    name: name.trim(),
    status: "draft",
    responseCount: 0,
    delivery,
    questions: [
      {
        id: createId("question"),
        prompt: "Untitled question",
        type: "open-text",
        required: false,
        options: [],
      },
    ],
  };
}

export function createId(prefix: string) {
  const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${id}`;
}
