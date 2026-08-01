import { FOREST, OXBLOOD, OXBLOOD_TEXT } from "../../../shared/config/design-tokens";
import type { Annotation, AttentionItem, ReaderProgress, RepeatedAnnotationIssue, StrongestMoment, TagKey } from "../types";

const TAGS = {
  confusing:  { label: "Confusing",        bg: "hsl(var(--oxblood-text) / 0.05)",  color: OXBLOOD_TEXT,   bar: OXBLOOD },
  strong:     { label: "Strong line",       bg: "hsl(var(--forest) / 0.05)",         color: FOREST,         bar: FOREST },
  pacing:     { label: "Pacing issue",      bg: "hsl(var(--tag-pacing) / 0.05)",      color: "hsl(var(--tag-pacing))",   bar: "hsl(var(--tag-pacing))" },
  missing:    { label: "Missing context",   bg: "hsl(var(--tag-missing) / 0.05)",     color: "hsl(var(--tag-missing))",  bar: "hsl(var(--tag-missing))" },
  emotional:  { label: "Emotional impact",  bg: "hsl(var(--tag-emotional) / 0.05)",   color: "hsl(var(--tag-emotional))", bar: "hsl(var(--tag-emotional))" },
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
    phrase: "The guild had never asked him to be accurate. They had asked him to be useful.",
    comments: [
      { reader: "Sarah K.", text: "This reframed the maps for me. The contrast between accurate and useful made the guild's motive clear." },
      { reader: "Marcus R.", text: "I like the turn, but the contrast feels stated rather than discovered. Could the scene let us infer more of it?" },
      { reader: "Priya N.", text: "This was the first line that made me understand why he kept drawing the maps." },
      { reader: "Tom W.", text: "The idea landed, though I wanted one more beat after it before the dialogue moved on." },
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
    { tag: "strong" as TagKey, count: 6, chapters: "Ch 3, 4" },
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
