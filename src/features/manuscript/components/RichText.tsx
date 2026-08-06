import { Fragment } from "react";

import {
  marksToStyle,
  normalizeRichText,
  sliceRichText,
  splitRichTextRunLines,
  type ManuscriptRichText,
} from "@/features/manuscript/lib/rich-text";

type RichTextProps = {
  content: string;
  end?: number;
  richContent: ManuscriptRichText;
  start?: number;
};

export function RichText({
  content,
  end = content.length,
  richContent,
  start = 0,
}: RichTextProps) {
  const text = normalizeRichText(richContent, content);
  const selectedText = sliceRichText(text, start, end);

  return selectedText.runs.flatMap((run, runIndex) => splitRichTextRunLines(run).map((part, partIndex) => {
    const key = `${runIndex}:${partIndex}`;
    if (part.kind === "break") return <br key={key} />;
    if (!part.marks) return <Fragment key={key}>{part.text}</Fragment>;

    return <span key={key} style={marksToStyle(part.marks)}>{part.text}</span>;
  }));
}
