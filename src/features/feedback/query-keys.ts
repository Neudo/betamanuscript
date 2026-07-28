export const feedbackKeys = {
  all: ["feedback"] as const,
  manuscript: (manuscriptId: string, manuscriptVersionId?: string | null) =>
    [
      ...feedbackKeys.all,
      "manuscript",
      manuscriptId,
      ...(manuscriptVersionId ? [manuscriptVersionId] : []),
    ] as const,
  tags: (manuscriptId: string) =>
    [...feedbackKeys.all, "tags", manuscriptId] as const,
};
