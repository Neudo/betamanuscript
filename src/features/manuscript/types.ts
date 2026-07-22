export type ManuscriptWizardStep = "info" | "structure" | "readers";

export type ManuscriptAccessMode = "invite" | "open";

export type ManuscriptDraft = {
  title: string;
  logline: string;
  genres: string[];
  draftNumber: number;
  coverDataUrl: string | null;
  chapters: number;
  wordCount: string;
  deadline: string;
  maxReaders: number;
  accessMode: ManuscriptAccessMode;
  readerNote: string;
};

export type ManuscriptSummary = {
  id: string;
  title: string;
  draft: string;
  chapters: number;
  readers: number;
};
