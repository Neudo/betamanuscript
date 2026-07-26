export const surveyKeys = {
  all: ["surveys"] as const,
  manuscript: (manuscriptId: string) =>
    [...surveyKeys.all, "manuscript", manuscriptId] as const,
};
