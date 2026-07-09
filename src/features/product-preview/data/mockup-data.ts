import { FOREST, OXBLOOD } from "../../../shared/config/design-tokens";
import type { Annotation, AttentionItem, ReaderProgress, RepeatedAnnotationIssue, StrongestMoment, TagKey } from "../types";

const TAGS = {
  confusing:  { label: "Confusing",        bg: "rgba(123,29,29,0.11)",  color: OXBLOOD,   bar: OXBLOOD },
  strong:     { label: "Strong line",       bg: "rgba(44,62,45,0.11)",   color: FOREST,    bar: FOREST },
  pacing:     { label: "Pacing issue",      bg: "rgba(139,100,40,0.12)", color: "#7A5020", bar: "#7A5020" },
  missing:    { label: "Missing context",   bg: "rgba(70,80,140,0.1)",   color: "#424878", bar: "#424878" },
  emotional:  { label: "Emotional impact",  bg: "rgba(60,100,70,0.11)",  color: "#2D5E3A", bar: "#2D5E3A" },
} as const;



const annotations: Annotation[] = [
  {
    id: "a1",
    tag: "confusing",
    phrase: "each one a different lie",
    comments: [
      { reader: "Sarah K.", text: "Different from what? The previous chapter established these maps as accurate — this contradicts without explanation." },
      { reader: "Marcus R.", text: "Confused me too. Are the maps wrong on purpose or because they're outdated?" },
      { reader: "Priya N.", text: "I had to reread the opening twice. The contradiction needs a beat of clarification." },
    ],
  },
  {
    id: "a2",
    tag: "strong",
    phrase: "he said, his voice carrying the weight of thirty years",
    comments: [
      { reader: "Sarah K.", text: "This landed. The compression of time in 'thirty years' is doing exactly the right work." },
      { reader: "Priya N.", text: "Best line in the chapter. The voice earned it." },
      { reader: "Tom W.", text: "Stopped here and read it again. Quietly devastating." },
      { reader: "Diana L.", text: "This is the emotional center — make sure the rest earns it." },
    ],
  },
  {
    id: "a3",
    tag: "pacing",
    phrase: "The commission had seemed straightforward",
    comments: [
      { reader: "Marcus R.", text: "We've been told this before. If you're repeating it, the scene needs to earn the repetition." },
      { reader: "Tom W.", text: "The pacing slowed here. I expected the guild meeting to start immediately." },
    ],
  },
  {
    id: "a4",
    tag: "missing",
    phrase: "he realized they already knew",
    comments: [
      { reader: "Sarah K.", text: "Knew what, exactly? I don't have enough context about what the guild's expectations are." },
      { reader: "Priya N.", text: "This felt abrupt — what did they know? The scene needs grounding before this reveal." },
    ],
  },
];

const repeatedAnnotationIssues: RepeatedAnnotationIssue[] = [
    { tag: "confusing" as TagKey, count: 18, chapters: "Ch 3, 5, 7" },
    { tag: "pacing" as TagKey, count: 11, chapters: "Ch 4, 6, 7" },
    { tag: "missing" as TagKey, count: 9, chapters: "Ch 3, 8" },
    { tag: "emotional" as TagKey, count: 6, chapters: "Ch 2, 5" },
    { tag: "strong" as TagKey, count: 21, chapters: "Ch 2, 3, 5, 9" },
  ];
const strongestMoments: StrongestMoment[] = [
    { chapter: "Ch 3", scene: "The guild confrontation", score: 4 },
    { chapter: "Ch 2", scene: "Opening paragraph", score: 4 },
    { chapter: "Ch 5", scene: "The border crossing", score: 3 },
  ];
const attentionItems: AttentionItem[] = [
    { chapter: "Ch 7", issue: "Scene clarity — 4 readers flagged confusion" },
    { chapter: "Ch 4", issue: "Pacing in the guild intro — 3 flags" },
    { chapter: "Ch 3", issue: "Missing context before the reveal" },
  ];
const readerProgress: ReaderProgress[] = [
    { name: "Priya N.", avatar: "P", chapter: 9, total: 9, status: "finished" },
    { name: "Sarah K.", avatar: "S", chapter: 7, total: 9, status: "reading" },
    { name: "Marcus R.", avatar: "M", chapter: 5, total: 9, status: "reading" },
    { name: "Tom W.", avatar: "T", chapter: 4, total: 9, status: "inactive" },
    { name: "Diana L.", avatar: "D", chapter: 2, total: 9, status: "reading" },
  ];


export {
  TAGS,
  annotations,
  repeatedAnnotationIssues,
  strongestMoments,
  attentionItems,
  readerProgress,
};
