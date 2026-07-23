export type ManuscriptWizardStep = "info" | "structure" | "readers";

export type ManuscriptAccessMode = "invite" | "open";

export type ManuscriptWordCountBand =
  | "under_40k"
  | "40k_80k"
  | "80k_120k"
  | "120k_plus";

export type ManuscriptGenre = {
  slug: string;
  label: string;
};

export type ChapterEditorialStatus = "draft" | "needs_work" | "complete";

export type ManuscriptBlockKind =
  | "paragraph"
  | "scene_break"
  | "heading"
  | "blockquote";

export type ImportedManuscriptChapter = {
  blocks: Array<{
    content: string;
    kind: "paragraph";
  }>;
  title: string;
};

export type ManuscriptDraft = {
  title: string;
  logline: string;
  genreSlugs: string[];
  draftNumber: number;
  chapters: number;
  wordCountBand: ManuscriptWordCountBand | "";
  deadline: string;
  maxReaders: number;
  accessMode: ManuscriptAccessMode;
  readerNote: string;
};

export type ManuscriptSummary = {
  id: string;
  title: string;
  draft: string;
  versionId: string | null;
  versionNumber: number | null;
  chapters: number;
  readers: number;
};

export type CreatedManuscript = {
  manuscriptId: string;
  manuscriptVersionId: string;
  readingRoundId: string;
};

export type ManuscriptWorkspaceBlock = {
  id: string;
  kind: ManuscriptBlockKind;
  content: string;
  position: number;
};

export type ManuscriptWorkspaceAnnotation = {
  id: string;
  chapterId: string;
  comment: string | null;
  createdAt: string;
  isSeenByAuthor: boolean;
  quote: string;
  readerName: string;
  tag: {
    color: string;
    label: string;
  };
};

export type ManuscriptWorkspaceChapter = {
  annotations: ManuscriptWorkspaceAnnotation[];
  blocks: ManuscriptWorkspaceBlock[];
  editorialStatus: ChapterEditorialStatus;
  id: string;
  position: number;
  title: string;
  wordCount: number;
};

export type ManuscriptWorkspaceData = {
  chapters: ManuscriptWorkspaceChapter[];
  id: string;
  title: string;
  totalWordCount: number;
  version: {
    id: string;
    logline: string | null;
    number: number;
    title: string;
  } | null;
};
