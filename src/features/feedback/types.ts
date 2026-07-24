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
  chapter: FeedbackChapter;
  chapterBlockId: string;
  comment: string | null;
  createdAt: string;
  id: string;
  quote: string;
  reader: FeedbackReader;
  tag: FeedbackTag;
};
