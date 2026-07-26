import type {
  ManuscriptDraft,
  ManuscriptWizardStep,
  ManuscriptWordCountBand,
} from "@/features/manuscript/types";

export const manuscriptWizardSteps: Array<{ id: ManuscriptWizardStep; label: string }> = [
  { id: "info", label: "Book info" },
  { id: "structure", label: "Structure" },
  { id: "readers", label: "Beta readers" },
];

export const manuscriptWordCountOptions: Array<{
  value: ManuscriptWordCountBand;
  label: string;
}> = [
  { value: "under_40k", label: "Under 40k" },
  { value: "40k_80k", label: "40k-80k" },
  { value: "80k_120k", label: "80k-120k" },
  { value: "120k_plus", label: "120k+" },
];

export const initialManuscriptDraft: ManuscriptDraft = {
  title: "",
  logline: "",
  readerClosingNote: "",
  genreSlugs: [],
  draftNumber: 1,
  chapters: 12,
  wordCountBand: "",
  deadline: "",
  maxReaders: 5,
  accessMode: "invite",
  readerNote: "",
};
