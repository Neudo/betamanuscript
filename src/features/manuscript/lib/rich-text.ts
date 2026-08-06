export type ManuscriptFontFamily = "sans-serif" | "serif";

export type ManuscriptTextMarks = {
  bold?: true;
  fontFamily?: ManuscriptFontFamily;
  italic?: true;
};

export type ManuscriptRichTextRun = {
  marks?: ManuscriptTextMarks;
  text: string;
};

export type ManuscriptRichTextLinePart =
  | { kind: "break" }
  | { kind: "text"; marks?: ManuscriptTextMarks; text: string };

export type ManuscriptRichText = {
  runs: ManuscriptRichTextRun[];
  version: 1;
};

export type ManuscriptRichTextBlock = {
  content: string;
  richContent: ManuscriptRichText;
};

export type ManuscriptRichTextDocument = {
  blocks: ManuscriptRichTextBlock[];
};

export function createPlainRichText(text: string): ManuscriptRichText {
  return createRichText([{ text }]);
}

export function createRichText(runs: ManuscriptRichTextRun[]): ManuscriptRichText {
  const normalizedRuns = runs.flatMap((run) => {
    if (!run.text) return [];

    const marks = normalizeMarks(run.marks);
    return [{
      ...(marks ? { marks } : {}),
      text: run.text,
    }];
  });

  return {
    runs: mergeAdjacentRuns(normalizedRuns),
    version: 1,
  };
}

export function getRichTextContent(richText: ManuscriptRichText): string {
  return richText.runs.map((run) => run.text).join("");
}

export function splitRichTextRunLines(run: ManuscriptRichTextRun): ManuscriptRichTextLinePart[] {
  const parts: ManuscriptRichTextLinePart[] = [];

  for (const part of run.text.split(/(\r\n|\r|\n)/u)) {
    if (part === "\r\n" || part === "\r" || part === "\n") {
      parts.push({ kind: "break" });
    } else if (part) {
      parts.push({ kind: "text", marks: run.marks, text: part });
    }
  }

  return parts;
}

export function normalizeRichText(value: unknown, content: string): ManuscriptRichText {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return createPlainRichText(content);
  }

  const candidate = value as { runs?: unknown; version?: unknown };
  if (candidate.version !== 1 || !Array.isArray(candidate.runs)) {
    return createPlainRichText(content);
  }

  const richText = createRichText(candidate.runs.flatMap((run) => {
    if (!run || typeof run !== "object" || Array.isArray(run)) return [];

    const candidateRun = run as { marks?: unknown; text?: unknown };
    if (typeof candidateRun.text !== "string") return [];

    return [{ marks: normalizeMarks(candidateRun.marks), text: candidateRun.text }];
  }));

  return getRichTextContent(richText) === content
    ? richText
    : createPlainRichText(content);
}

export function normalizeRichTextWhitespace(richText: ManuscriptRichText): ManuscriptRichText {
  const normalizedRuns: ManuscriptRichTextRun[] = [];
  let pendingWhitespace: { marks?: ManuscriptTextMarks } | null = null;
  let hasContent = false;
  let isAtLineStart = true;

  for (const run of richText.runs) {
    for (const character of run.text.replace(/\r\n?|\n/g, "\n")) {
      if (character === "\n") {
        pendingWhitespace = null;

        if (hasContent) {
          normalizedRuns.push({ marks: run.marks, text: "\n" });
          isAtLineStart = true;
        }

        continue;
      }

      if (/\s/u.test(character)) {
        if (hasContent && !isAtLineStart && !pendingWhitespace) {
          pendingWhitespace = { marks: run.marks };
        }
        continue;
      }

      if (pendingWhitespace) {
        normalizedRuns.push({ marks: pendingWhitespace.marks, text: " " });
        pendingWhitespace = null;
      }

      normalizedRuns.push({ marks: run.marks, text: character });
      hasContent = true;
      isAtLineStart = false;
    }
  }

  return createRichText(normalizedRuns);
}

export function trimRichText(richText: ManuscriptRichText): ManuscriptRichText {
  const content = getRichTextContent(richText);
  const start = content.search(/\S/u);
  if (start === -1) return createPlainRichText("");

  const end = content.length - content.trimEnd().length;
  return sliceRichText(richText, start, content.length - end);
}

export function sliceRichText(
  richText: ManuscriptRichText,
  start: number,
  end: number,
): ManuscriptRichText {
  const content = getRichTextContent(richText);
  const clampedStart = Math.max(0, Math.min(start, content.length));
  const clampedEnd = Math.max(clampedStart, Math.min(end, content.length));
  let offset = 0;
  const runs: ManuscriptRichTextRun[] = [];

  for (const run of richText.runs) {
    const runEnd = offset + run.text.length;
    const overlapStart = Math.max(offset, clampedStart);
    const overlapEnd = Math.min(runEnd, clampedEnd);

    if (overlapStart < overlapEnd) {
      runs.push({
        marks: run.marks,
        text: run.text.slice(overlapStart - offset, overlapEnd - offset),
      });
    }

    offset = runEnd;
  }

  return createRichText(runs);
}

export function splitLongRichText(
  richText: ManuscriptRichText,
  maximumLength: number,
): ManuscriptRichText[] {
  if (maximumLength < 1) return [richText];

  const chunks: ManuscriptRichText[] = [];
  let remaining = trimRichText(richText);

  while (getRichTextContent(remaining).length > maximumLength) {
    const content = getRichTextContent(remaining);
    const wordBoundary = content.lastIndexOf(" ", maximumLength);
    const boundary = wordBoundary > 0 ? wordBoundary : maximumLength;
    const chunk = trimRichText(sliceRichText(remaining, 0, boundary));

    if (getRichTextContent(chunk)) chunks.push(chunk);
    remaining = trimRichText(sliceRichText(remaining, boundary, content.length));
  }

  if (getRichTextContent(remaining)) chunks.push(remaining);
  return chunks;
}

export function createRichTextDocument(
  blocks: Array<{ content: string; richContent?: unknown }>,
): ManuscriptRichTextDocument {
  return {
    blocks: blocks.flatMap((block) => {
      const richContent = trimRichText(normalizeRichText(block.richContent, block.content));
      const content = getRichTextContent(richContent);
      return content ? [{ content, richContent }] : [];
    }),
  };
}

export function getRichTextDocumentContent(document: ManuscriptRichTextDocument): string {
  return document.blocks.map((block) => block.content).join("\n\n");
}

export function marksToStyle(marks: ManuscriptTextMarks | undefined) {
  if (!marks) return {};

  return {
    fontFamily: marks.fontFamily === "serif"
      ? "var(--font-eb-garamond), Georgia, serif"
      : marks.fontFamily === "sans-serif"
        ? "var(--font-inter), ui-sans-serif, system-ui, sans-serif"
        : undefined,
    fontStyle: marks.italic ? "italic" : undefined,
    fontWeight: marks.bold ? 700 : undefined,
  };
}

export function normalizeMarks(value: unknown): ManuscriptTextMarks | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;

  const candidate = value as Record<string, unknown>;
  const marks: ManuscriptTextMarks = {
    ...(candidate.bold === true ? { bold: true } : {}),
    ...(candidate.fontFamily === "serif" || candidate.fontFamily === "sans-serif"
      ? { fontFamily: candidate.fontFamily }
      : {}),
    ...(candidate.italic === true ? { italic: true } : {}),
  };

  return Object.keys(marks).length > 0 ? marks : undefined;
}

function mergeAdjacentRuns(runs: ManuscriptRichTextRun[]): ManuscriptRichTextRun[] {
  return runs.reduce<ManuscriptRichTextRun[]>((merged, run) => {
    const previous = merged.at(-1);
    if (previous && haveSameMarks(previous.marks, run.marks)) {
      previous.text += run.text;
      return merged;
    }

    merged.push({ ...run });
    return merged;
  }, []);
}

function haveSameMarks(left: ManuscriptTextMarks | undefined, right: ManuscriptTextMarks | undefined) {
  return JSON.stringify(left ?? {}) === JSON.stringify(right ?? {});
}
