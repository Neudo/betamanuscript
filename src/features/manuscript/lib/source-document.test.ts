import { describe, expect, it } from "vitest";

import { classifyDocxFontFamily } from "./source-document";

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
