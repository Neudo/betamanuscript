export type FeedbackTag = {
  color: string;
  label: string;
  slug: string;
  sortOrder: number;
};

export type FeedbackReader = {
  color: string;
  id: string;
  initials: string;
  name: string;
};

export type FeedbackChapter = {
  id: string;
  position: number;
  title: string;
};

export type FeedbackAnnotation = {
  archivedAt: string | null;
  archivedReason: "text_changed" | "chapter_replaced" | "chapter_deleted" | "manually_archived" | null;
  chapter: FeedbackChapter;
  chapterBlockId: string | null;
  comment: string | null;
  createdAt: string;
  id: string;
  isSeenByAuthor: boolean;
  kind: "annotation" | "general-comment";
  quote: string | null;
  reader: FeedbackReader;
  tag: FeedbackTag;
};
