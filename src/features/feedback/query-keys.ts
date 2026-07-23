export const feedbackKeys = {
  all: ["feedback"] as const,
  manuscript: (manuscriptId: string) =>
    [...feedbackKeys.all, "manuscript", manuscriptId] as const,
};
