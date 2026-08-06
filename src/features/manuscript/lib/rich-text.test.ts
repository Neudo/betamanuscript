import { describe, expect, it } from "vitest";

import {
  createRichText,
  getRichTextContent,
  manuscriptFontFamilyStacks,
  marksToStyle,
  normalizeRichText,
  normalizeRichTextWhitespace,
  sliceRichText,
  splitRichTextRunLines,
  splitLongRichText,
} from "./rich-text";

describe("manuscript rich text", () => {
  it("keeps typography aligned with its plain-text anchor", () => {
    const richText = createRichText([
      { marks: { bold: true, italic: true }, text: "A voice" },
      { text: " answers." },
    ]);

    expect(getRichTextContent(richText)).toBe("A voice answers.");
    expect(sliceRichText(richText, 2, 7).runs).toEqual([
      { marks: { bold: true, italic: true }, text: "voice" },
    ]);
  });

  it("falls back to plain text when stored styles no longer match the anchor", () => {
    const richText = normalizeRichText({
      runs: [{ marks: { bold: true }, text: "Different" }],
      version: 1,
    }, "Original");

    expect(richText).toEqual({
      runs: [{ text: "Original" }],
      version: 1,
    });
  });

  it("keeps only bold and italic marks from an untrusted rich-text value", () => {
    const richText = normalizeRichText({
      runs: [{ marks: { bold: true, color: "#7B1D1D", underline: true }, text: "Only bold" }],
      version: 1,
    }, "Only bold");

    expect(richText).toEqual({
      runs: [{ marks: { bold: true }, text: "Only bold" }],
      version: 1,
    });
  });

  it("keeps only the supported serif and sans-serif categories", () => {
    const richText = normalizeRichText({
      runs: [
        { marks: { fontFamily: "serif" }, text: "A foreign phrase" },
        { marks: { fontFamily: "Comic Sans MS" }, text: " stays unclassified" },
      ],
      version: 1,
    }, "A foreign phrase stays unclassified");

    expect(richText).toEqual({
      runs: [
        { marks: { fontFamily: "serif" }, text: "A foreign phrase" },
        { text: " stays unclassified" },
      ],
      version: 1,
    });
  });

  it("renders each supported font category with the matching bundled font stack", () => {
    expect(marksToStyle({ fontFamily: "serif" }).fontFamily).toBe(manuscriptFontFamilyStacks.serif);
    expect(marksToStyle({ fontFamily: "sans-serif" }).fontFamily).toBe(manuscriptFontFamilyStacks["sans-serif"]);
  });

  it("keeps line breaks as explicit rendering boundaries", () => {
    expect(splitRichTextRunLines({
      marks: { italic: true },
      text: "First line\r\nSecond line\nThird line",
    })).toEqual([
      { kind: "text", marks: { italic: true }, text: "First line" },
      { kind: "break" },
      { kind: "text", marks: { italic: true }, text: "Second line" },
      { kind: "break" },
      { kind: "text", marks: { italic: true }, text: "Third line" },
    ]);
  });

  it("keeps whitespace from unmarked DOCX runs", () => {
    const richText = normalizeRichTextWhitespace(createRichText([
      { text: "Three men, clad in silver armor. It " },
      { marks: { italic: true }, text: "was" },
      { text: " quite impressive." },
    ]));

    expect(richText).toEqual({
      runs: [
        { text: "Three men, clad in silver armor. It " },
        { marks: { italic: true }, text: "was" },
        { text: " quite impressive." },
      ],
      version: 1,
    });
  });

  it("preserves DOCX hard line breaks while removing indentation after them", () => {
    const richText = normalizeRichTextWhitespace(createRichText([
      { text: "First line\r\n  Second line" },
      { marks: { italic: true }, text: "\nThird line" },
    ]));

    expect(richText).toEqual({
      runs: [
        { text: "First line\nSecond line" },
        { marks: { italic: true }, text: "\nThird line" },
      ],
      version: 1,
    });
  });

  it("splits long imported paragraphs without dropping their styles", () => {
    const richText = createRichText([
      { marks: { bold: true, italic: true }, text: "Marked words stay together" },
    ]);
    const chunks = splitLongRichText(richText, 12);

    expect(chunks.map(getRichTextContent).join(" ")).toBe("Marked words stay together");
    expect(chunks.every((chunk) => chunk.runs[0]?.marks?.bold && chunk.runs[0]?.marks?.italic)).toBe(true);
  });
});
