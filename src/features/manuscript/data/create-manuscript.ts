import type { ManuscriptDraft, ManuscriptWizardStep } from "@/features/manuscript/types";

export const manuscriptWizardSteps: Array<{ id: ManuscriptWizardStep; label: string }> = [
  { id: "info", label: "Book info" },
  { id: "structure", label: "Structure" },
  { id: "readers", label: "Beta readers" },
];

export const manuscriptGenres = [
  "Literary fiction",
  "Fantasy",
  "Science fiction",
  "Historical fiction",
  "Thriller / Mystery",
  "Romance",
  "Horror",
  "Young adult",
  "Other",
];

export const manuscriptWordCounts = [
  "Under 40k",
  "40k-80k",
  "80k-120k",
  "120k+",
];

export const initialManuscriptDraft: ManuscriptDraft = {
  title: "",
  logline: "",
  genres: [],
  draftNumber: 1,
  coverDataUrl: null,
  chapters: 12,
  wordCount: "",
  deadline: "",
  maxReaders: 5,
  accessMode: "invite",
  readerNote: "",
};
