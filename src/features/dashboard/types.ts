export type AnnotationTag =
  | "Confusing"
  | "Pacing issue"
  | "Missing context"
  | "Strong line"
  | "Emotional impact";

export type ChapterStatus = "Complete" | "Needs work" | "Draft";

export type Chapter = {
  id: string;
  number: number;
  title: string;
  words: number;
  annotations: number;
  status: ChapterStatus;
  content: string[];
};

export type Reader = {
  id: string;
  name: string;
  email: string;
  initials: string;
  status: "finished" | "reading" | "inactive";
  chapter: number;
  annotations: number;
  lastActive: string;
  color: string;
};

export type Annotation = {
  id: string;
  readerId: string;
  tag: AnnotationTag;
  chapter: number;
  chapterTitle: string;
  excerpt: string;
  comment: string;
  createdAt: string;
  read?: boolean;
};

export type ReadingListItem = {
  id: string;
  title: string;
  author: string;
  draft: string;
  genre: string;
  words: string;
  deadline?: string;
  logline: string;
  note: string;
  status: "reading" | "not-started" | "finished";
  chapter: number;
  totalChapters: number;
  accent: string;
};
