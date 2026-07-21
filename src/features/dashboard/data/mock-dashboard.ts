import type {
  Annotation,
  AnnotationTag,
  Chapter,
  Reader,
  ReadingListItem,
} from "../types";

export const currentUser = {
  name: "Jo Harper",
  email: "jo.harper@example.com",
  initials: "JH",
};

export const manuscript = {
  id: "the-last-cartographer",
  title: "The Last Cartographer",
  draft: "Draft 2",
  sourceFile: "The Last Cartographer - Draft 2.docx",
  words: 35_637,
};

const chapterOneCopy = [
  "The boy learned to read maps before he learned to read words. His father's study smelled of ink and turpentine, and the maps covered every surface - pinned to walls, rolled in tubes, spread across the drafting table like sleeping animals.",
  '"A map," his father told him once, pressing a finger to the blank space beyond a coastline, "is not a picture of the world. It is an argument about it."',
  "Elian did not understand this for many years. He thought maps were true things, the way numbers were true. He believed in their edges.",
  "He was twelve when he first noticed a mistake. Not an error of transcription or a coastline slightly misdrawn, but something more deliberate: a village that appeared on one commission and was absent from another, though both claimed to show the same territory.",
  'His father looked for a long time. Then he rolled both maps up carefully and said: "Put these in the back room. The locked one."',
  '"Which is right?" Elian asked. His father looked out the window at the city. "That depends," he said, "on who commissioned them."',
  "From that night onward, Elian kept his own records: discrepancies between surveys, rivers that shifted, roads that vanished, settlements that bloomed from blank country.",
  "He filled three notebooks before he understood what he was actually doing. He was cataloguing the lies.",
];

function makeChapterContent(title: string, number: number) {
  if (number === 1) {
    return chapterOneCopy;
  }

  return [
    `${title} began with a line no map had prepared Elian to cross. The road narrowed until the last milestone disappeared behind the rain.`,
    "Every survey in the archive contradicted the landscape before him. The river bent east where the official chart sent it west, and the village bells rang from an empty valley.",
    '"We draw what the guild permits us to see," Mara said. "The rest survives in memory, if it survives at all."',
    "He unfolded his father's oldest map. A faint notation sat beneath the border ink, almost erased: not unknown, but unnamed.",
    "For the first time, Elian wondered whether blank space was an absence or a warning.",
  ];
}

const chapterDefinitions = [
  ["The Map-Maker's Son", 3842, 4, "Complete"],
  ["Meridian Lines", 4210, 9, "Complete"],
  ["The Uncharted Province", 3670, 11, "Complete"],
  ["Guild of Cartographers", 4105, 7, "Needs work"],
  ["The Archive", 3980, 13, "Needs work"],
  ["Cartography of Grief", 4450, 6, "Complete"],
  ["The Unnamed Province", 3610, 8, "Needs work"],
  ["False Coordinates", 4020, 2, "Draft"],
  ["The Last Map", 3750, 0, "Draft"],
] as const;

export const chapters: Chapter[] = chapterDefinitions.map(
  ([title, words, annotations, status], index) => ({
    id: `chapter-${index + 1}`,
    number: index + 1,
    title,
    words,
    annotations,
    status,
    content: makeChapterContent(title, index + 1),
  }),
);

export const readers: Reader[] = [
  {
    id: "priya",
    name: "Priya N.",
    email: "priya@example.com",
    initials: "P",
    status: "finished",
    chapter: 9,
    annotations: 18,
    lastActive: "2d ago",
    color: "#1E5C2E",
  },
  {
    id: "sarah",
    name: "Sarah K.",
    email: "sarah@example.com",
    initials: "S",
    status: "reading",
    chapter: 7,
    annotations: 12,
    lastActive: "Today",
    color: "#8B1A1A",
  },
  {
    id: "marcus",
    name: "Marcus R.",
    email: "marcus@example.com",
    initials: "M",
    status: "reading",
    chapter: 5,
    annotations: 9,
    lastActive: "Yesterday",
    color: "#3B4A8A",
  },
  {
    id: "tom",
    name: "Tom W.",
    email: "tom@example.com",
    initials: "T",
    status: "inactive",
    chapter: 4,
    annotations: 7,
    lastActive: "9d ago",
    color: "#7A4800",
  },
  {
    id: "diana",
    name: "Diana L.",
    email: "diana@example.com",
    initials: "D",
    status: "reading",
    chapter: 2,
    annotations: 4,
    lastActive: "Yesterday",
    color: "#1A5C50",
  },
];

export const tagColors: Record<AnnotationTag, string> = {
  Confusing: "bg-primary/10 text-primary border-primary/25",
  "Pacing issue": "bg-amber-900/10 text-amber-900 border-amber-900/25",
  "Missing context": "bg-sky-900/10 text-sky-900 border-sky-900/25",
  "Strong line": "bg-emerald-900/10 text-emerald-900 border-emerald-900/25",
  "Emotional impact": "bg-teal-900/10 text-teal-900 border-teal-900/25",
};

export const annotations: Annotation[] = [
  {
    id: "a0",
    readerId: "priya",
    tag: "Strong line",
    chapter: 1,
    chapterTitle: "The Map-Maker's Son",
    excerpt: "It is an argument about it",
    comment:
      "This line establishes the novel's thesis without overexplaining it. I stopped and read it twice.",
    createdAt: "1h ago",
  },
  {
    id: "a00",
    readerId: "sarah",
    tag: "Missing context",
    chapter: 1,
    chapterTitle: "The Map-Maker's Son",
    excerpt: "The locked one",
    comment:
      "The locked room is intriguing, but one more sensory detail would make the warning feel immediate.",
    createdAt: "2h ago",
  },
  {
    id: "a1",
    readerId: "sarah",
    tag: "Confusing",
    chapter: 3,
    chapterTitle: "The Commission",
    excerpt: "each one a different lie",
    comment:
      "Different from what? The previous chapter established these maps as accurate - this contradicts without explanation.",
    createdAt: "2h ago",
  },
  {
    id: "a2",
    readerId: "marcus",
    tag: "Confusing",
    chapter: 3,
    chapterTitle: "The Commission",
    excerpt: "each one a different lie",
    comment:
      "Are the maps wrong on purpose or because they are outdated? I had to reread this opening.",
    createdAt: "3h ago",
  },
  {
    id: "a3",
    readerId: "priya",
    tag: "Strong line",
    chapter: 3,
    chapterTitle: "The Commission",
    excerpt: "his voice carrying the weight of thirty years",
    comment:
      "Best line in the chapter. The compression of time lands perfectly - quietly devastating.",
    createdAt: "5h ago",
  },
  {
    id: "a4",
    readerId: "tom",
    tag: "Pacing issue",
    chapter: 4,
    chapterTitle: "Crossing the Pale",
    excerpt: "The commission had seemed straightforward",
    comment:
      "The pacing slowed here. I expected the guild meeting to start immediately after the setup.",
    createdAt: "1d ago",
  },
  {
    id: "a5",
    readerId: "diana",
    tag: "Emotional impact",
    chapter: 2,
    chapterTitle: "First Cartography",
    excerpt: "the first map he ever drew, aged nine",
    comment:
      "This detail grounds the character immediately. I did not expect to care this early.",
    createdAt: "1d ago",
  },
  {
    id: "a6",
    readerId: "sarah",
    tag: "Missing context",
    chapter: 7,
    chapterTitle: "The Unnamed Province",
    excerpt: "he realized they already knew",
    comment:
      "Knew what, exactly? The guild's expectations need to be clearer before this reveal.",
    createdAt: "1d ago",
  },
];

export const revisionPriorities = [
  {
    chapter: "Ch 3",
    tag: "Confusing" as const,
    text: "Clarify the guild confrontation; three readers stopped at the same passage.",
  },
  {
    chapter: "Ch 4-5",
    tag: "Pacing issue" as const,
    text: "Compress the pre-midpoint setup where reader momentum drops.",
  },
  {
    chapter: "Ch 7",
    tag: "Missing context" as const,
    text: "Seed the guild's expectations before the province reveal.",
  },
];

export const readingList: ReadingListItem[] = [
  {
    id: "the-last-cartographer",
    title: "The Last Cartographer",
    author: "Jo Harper",
    draft: "Draft 2",
    genre: "Literary fiction",
    words: "~36,000 words",
    deadline: "Due Aug 15, 2026",
    logline:
      "A cartographer discovers that the maps she draws reshape reality - and someone is trying to stop her.",
    note: "Focus especially on whether the protagonist's motivations feel believable in the first three chapters.",
    status: "reading",
    chapter: 5,
    totalChapters: 9,
    accent: "#7b1d1d",
  },
  {
    id: "all-the-light",
    title: "All the Light We Cannot Use",
    author: "Elena Marsh",
    draft: "Draft 1",
    genre: "Historical fiction",
    words: "~72,000 words",
    deadline: "Due Sep 1, 2026",
    logline:
      "A blind radio operator pieces together a resistance network in occupied Lisbon using nothing but sound.",
    note: "This is an early draft - please focus on big-picture story questions.",
    status: "not-started",
    chapter: 0,
    totalChapters: 14,
    accent: "#3B4A8A",
  },
  {
    id: "saltwater-gospel",
    title: "Saltwater Gospel",
    author: "Marcus Reid",
    draft: "Draft 3",
    genre: "Literary fiction",
    words: "~58,000 words",
    logline:
      "Three generations of a fishing family on the same island, told backwards.",
    note: "You have read this before - I would love to know if the structural changes land differently now.",
    status: "finished",
    chapter: 11,
    totalChapters: 11,
    accent: "#1A5C50",
  },
];
