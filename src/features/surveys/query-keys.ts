export const surveyKeys = {
  all: ["surveys"] as const,
  manuscript: (manuscriptId: string, manuscriptVersionId?: string | null) =>
    [
      ...surveyKeys.all,
      "manuscript",
      manuscriptId,
      ...(manuscriptVersionId ? [manuscriptVersionId] : []),
    ] as const,
};
