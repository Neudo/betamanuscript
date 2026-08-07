import { describe, expect, it } from "vitest";

import {
  classifyDocxFontFamily,
  extractPdfPageParagraphs,
  getExplicitChapterTitle,
  groupDocxParagraphs,
  getSourceDocumentMetadata,
} from "./source-document";
import { createPlainRichText, createRichText } from "./rich-text";

describe("DOCX font family classification", () => {
  it("distinguishes Roboto Serif from Roboto", () => {
    expect(classifyDocxFontFamily("Roboto Serif")).toBe("serif");
    expect(classifyDocxFontFamily("Roboto")).toBe("sans-serif");
  });

  it("normalizes quoted and irregularly spaced font names", () => {
    expect(classifyDocxFontFamily(" 'Roboto   Serif' ")).toBe("serif");
  });

  it("recognizes the font-name variants emitted by Word", () => {
    expect(classifyDocxFontFamily("Helvetica Neue")).toBe("sans-serif");
    expect(classifyDocxFontFamily("American Typewriter")).toBe("serif");
    expect(classifyDocxFontFamily("Arial Black")).toBe("sans-serif");
    expect(classifyDocxFontFamily("Arial Unicode MS")).toBe("sans-serif");
    expect(classifyDocxFontFamily("Chillax Regular")).toBe("sans-serif");
    expect(classifyDocxFontFamily("Muli")).toBe("sans-serif");
    expect(classifyDocxFontFamily("Palatino")).toBe("serif");
    expect(classifyDocxFontFamily("Times New Roman")).toBe("serif");
    expect(classifyDocxFontFamily("OpenSans-Regular")).toBe("sans-serif");
    expect(classifyDocxFontFamily("SF Pro Text Regular")).toBe("sans-serif");
  });

  it("leaves unknown fonts unclassified", () => {
    expect(classifyDocxFontFamily("A Writer's Private Typeface")).toBeUndefined();
  });
});

describe("explicit chapter titles", () => {
  it.each([
    "Chapter 2 (Remnants)",
    "Magma (Chapter 1)",
    "Part IV (The return)",
    "Le debut (Chapitre 3)",
  ])("detects parenthesized chapter labels: %s", (title) => {
    expect(getExplicitChapterTitle(title)).toBe(title);
  });

  it("does not mistake an ordinary parenthetical sentence for a chapter", () => {
    expect(getExplicitChapterTitle("They discussed chapter 2 (Remnants) over dinner.")).toBeNull();
  });
});

describe("DOCX paragraph grouping", () => {
  it("keeps consecutive Word lines inside one rendered paragraph until a blank Word paragraph", () => {
    const grouped = groupDocxParagraphs([
      { richContent: createPlainRichText("“Well, that’s stupid. We don’t even have theirs!”"), text: "“Well, that’s stupid. We don’t even have theirs!”" },
      { richContent: createRichText([{ marks: { italic: true }, text: "“For once we agree.”" }, { text: " Ember giggled." }]), text: "“For once we agree.” Ember giggled." },
      { richContent: createPlainRichText("“Alright, all that before the meeting in, um.”"), text: "“Alright, all that before the meeting in, um.”" },
      { richContent: createPlainRichText(""), text: "" },
      { richContent: createPlainRichText("A new prose paragraph."), text: "A new prose paragraph." },
    ]);

    expect(grouped).toHaveLength(2);
    expect(grouped[0]?.text).toBe("“Well, that’s stupid. We don’t even have theirs!”\n“For once we agree.” Ember giggled.\n“Alright, all that before the meeting in, um.”");
    expect(grouped[0]?.richContent.runs).toEqual([
      { text: "“Well, that’s stupid. We don’t even have theirs!”\n" },
      { marks: { italic: true }, text: "“For once we agree.”" },
      { text: " Ember giggled.\n“Alright, all that before the meeting in, um.”" },
    ]);
    expect(grouped[1]?.text).toBe("A new prose paragraph.");
  });

  it("keeps chapter titles separate from the prose that follows", () => {
    const grouped = groupDocxParagraphs([
      { richContent: createPlainRichText("Chapter 1"), text: "Chapter 1" },
      { richContent: createPlainRichText("The first line."), text: "The first line." },
      { richContent: createPlainRichText("The next line."), text: "The next line." },
    ]);

    expect(grouped.map((paragraph) => paragraph.text)).toEqual([
      "Chapter 1",
      "The first line.\nThe next line.",
    ]);
  });
});

describe("PDF source documents", () => {
  it("accepts PDFs as source documents", () => {
    expect(getSourceDocumentMetadata({ name: "Talina's Work.PDF" } as File)).toEqual({
      extension: "pdf",
      mimeType: "application/pdf",
    });
  });

  it("reassembles PDF lines into formatted paragraphs", () => {
    const [paragraph] = extractPdfPageParagraphs({
      items: [
        {
          fontName: "body-font",
          hasEOL: true,
          str: "The first line",
          transform: [12, 0, 0, 12, 72, 700],
        },
        {
          fontName: "body-font",
          hasEOL: false,
          str: "continues here.",
          transform: [12, 0, 0, 12, 72, 683],
        },
      ],
      styles: {
        "body-font": { fontFamily: "sans-serif" },
      },
    });

    expect(paragraph?.text).toBe("The first line continues here.");
    expect(paragraph?.richContent.runs).toEqual([
      {
        marks: { fontFamily: "sans-serif" },
        text: "The first line",
      },
      { text: " " },
      {
        marks: { fontFamily: "sans-serif" },
        text: "continues here.",
      },
    ]);
  });
});
