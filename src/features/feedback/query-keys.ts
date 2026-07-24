export const feedbackKeys = {
  all: ["feedback"] as const,
  manuscript: (manuscriptId: string) =>
    [...feedbackKeys.all, "manuscript", manuscriptId] as const,
  tags: (manuscriptId: string) =>
    [...feedbackKeys.all, "tags", manuscriptId] as const,
};
