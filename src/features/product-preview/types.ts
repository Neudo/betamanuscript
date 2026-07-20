export type TagKey =
  | "confusing"
  | "strong"
  | "pacing"
  | "missing"
  | "emotional";

export type Annotation = {
  id: string;
  tag: TagKey;
  phrase: string;
  comments: { reader: string; text: string }[];
};

export type RepeatedAnnotationIssue = {
  tag: TagKey;
  count: number;
  chapters: string;
};

export type StrongestMoment = {
  chapter: string;
  scene: string;
  score: number;
};

export type AttentionItem = {
  chapter: string;
  issue: string;
};

export type ReaderProgress = {
  name: string;
  avatar: string;
  chapter: number;
  total: number;
  status: "finished" | "reading" | "inactive";
};
