import type { ImportedManuscriptChapter } from "@/features/manuscript/types";
import {
  createPlainRichText,
  createRichText,
  getRichTextContent,
  normalizeRichTextWhitespace,
  splitLongRichText,
  type ManuscriptFontFamily,
  type ManuscriptRichText,
  type ManuscriptRichTextRun,
  type ManuscriptTextMarks,
} from "@/features/manuscript/lib/rich-text";

export const MAX_SOURCE_DOCUMENT_SIZE_BYTES = 20 * 1024 * 1024;
export const MAX_IMPORTED_CHARACTER_COUNT = 1_000_000;
export const sourceDocumentAccept = ".docx,.pdf,.txt,.md,application/pdf,text/plain,text/markdown,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

const MAX_CHAPTER_COUNT = 200;
const MAX_BLOCK_CHARACTER_COUNT = 25_000;
const wordprocessingNamespace = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
const drawingNamespace = "http://schemas.openxmlformats.org/drawingml/2006/main";

const docxFontFamilies = {
  serif: [
    "baskerville",
    "american typewriter",
    "bodoni",
    "book antiqua",
    "bookman",
    "cambria",
    "caslon",
    "charis",
    "constantia",
    "cormorant",
    "didot",
    "droid serif",
    "eb garamond",
    "garamond",
    "gentium",
    "georgia",
    "libre baskerville",
    "merriweather",
    "minion",
    "noto serif",
    "palatino",
    "playfair",
    "playfair display",
    "roboto serif",
    "robotoserif",
    "sabon",
    "serif",
    "source serif",
    "times",
    "times new roman",
  ],
  "sans-serif": [
    "arial",
    "aptos",
    "avenir",
    "calibri",
    "century gothic",
    "chillax",
    "franklin gothic",
    "futura",
    "gill sans",
    "helvetica",
    "inter",
    "lato",
    "montserrat",
    "muli",
    "noto sans",
    "open sans",
    "proxima nova",
    "roboto",
    "sans serif",
    "sans-serif",
    "segoe",
    "segoe ui",
    "sf pro",
    "source sans",
    "tahoma",
    "trebuchet",
    "trebuchet ms",
    "ubuntu",
    "univers",
    "verdana",
    "work sans",
  ],
} as const satisfies Record<ManuscriptFontFamily, readonly string[]>;

const docxFontFamilyByName = new Map<string, ManuscriptFontFamily>(
  (Object.entries(docxFontFamilies) as Array<[ManuscriptFontFamily, readonly string[]]>)
    .flatMap(([fontFamily, fontNames]) => fontNames.map((fontName) => [fontName, fontFamily] as const)),
);

const docxFontNamesBySpecificity = [...docxFontFamilyByName.entries()]
  .sort(([leftName], [rightName]) => rightName.length - leftName.length);

const sourceDocumentMimeTypes = {
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  md: "text/markdown",
  pdf: "application/pdf",
  txt: "text/plain",
} as const;

type SourceDocumentExtension = keyof typeof sourceDocumentMimeTypes;

type DocumentParagraph = {
  richContent: ManuscriptRichText;
  style?: string;
  text: string;
};

type DocxThemeFontSet = {
  complexScript?: string;
  eastAsia?: string;
  latin?: string;
};

type DocxFontContext = {
  defaultMarks?: ManuscriptTextMarks;
  styleMarks: Map<string, ManuscriptTextMarks>;
  themeFonts: {
    major: DocxThemeFontSet;
    minor: DocxThemeFontSet;
  };
};

type DocxMarkOverrides = {
  bold?: boolean;
  fontFamily?: ManuscriptFontFamily;
  italic?: boolean;
};

export type SourceDocumentMetadata = {
  extension: SourceDocumentExtension;
  mimeType: (typeof sourceDocumentMimeTypes)[SourceDocumentExtension];
};

export function getSourceDocumentMetadata(file: File): SourceDocumentMetadata | null {
  const extension = file.name.trim().split(".").pop()?.toLowerCase();
  if (!extension || !(extension in sourceDocumentMimeTypes)) return null;

  return {
    extension: extension as SourceDocumentExtension,
    mimeType: sourceDocumentMimeTypes[extension as SourceDocumentExtension],
  };
}

export function getSourceDocumentError(file: File) {
  const metadata = getSourceDocumentMetadata(file);
  if (!metadata) {
    return "Choose a DOCX, PDF, TXT, or Markdown file.";
  }

  if (file.size > MAX_SOURCE_DOCUMENT_SIZE_BYTES) {
    return "The source document must be 20 MB or smaller.";
  }

  const filename = file.name.trim();
  if (!filename || filename.length > 512) {
    return "Choose a document with a filename shorter than 513 characters.";
  }

  return null;
}

export async function importSourceDocument(file: File): Promise<ImportedManuscriptChapter[]> {
  const validationError = getSourceDocumentError(file);
  if (validationError) throw new Error(validationError);

  const metadata = getSourceDocumentMetadata(file);
  if (!metadata) throw new Error("The source document format is not supported.");

  const paragraphs = metadata.extension === "docx"
    ? await extractDocxParagraphs(file)
    : metadata.extension === "pdf"
      ? await extractPdfParagraphs(file)
      : extractPlainTextParagraphs(await file.text());
  const characterCount = paragraphs.reduce((total, paragraph) => total + paragraph.text.length, 0);

  if (characterCount === 0) {
    throw new Error("This document does not contain readable text.");
  }

  if (characterCount > MAX_IMPORTED_CHARACTER_COUNT) {
    throw new Error("The extracted manuscript text must contain 1,000,000 characters or fewer.");
  }

  const chapters = detectChapters(paragraphs);
  if (chapters.length === 0) {
    throw new Error("No readable chapter content could be detected in this document.");
  }

  if (chapters.length > MAX_CHAPTER_COUNT) {
    throw new Error("The document contains more than 200 detected chapters.");
  }

  return chapters;
}

function extractPlainTextParagraphs(text: string): DocumentParagraph[] {
  const paragraphs: DocumentParagraph[] = [];
  let currentLines: string[] = [];

  function flushParagraph() {
    const paragraph = currentLines.join(" ").replace(/\s+/g, " ").trim();
    if (paragraph) paragraphs.push({ richContent: createPlainRichText(paragraph), text: paragraph });
    currentLines = [];
  }

  for (const rawLine of text.replace(/^\uFEFF/, "").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) {
      flushParagraph();
      continue;
    }

    const markdownHeading = line.match(/^(#{1,2})\s+(.+)$/);
    if (markdownHeading) {
      flushParagraph();
      paragraphs.push({
        richContent: createPlainRichText(markdownHeading[2].trim()),
        style: "markdown-heading-" + markdownHeading[1].length,
        text: markdownHeading[2].trim(),
      });
      continue;
    }

    currentLines.push(line);
  }

  flushParagraph();
  return paragraphs;
}

type PdfTextItem = {
  fontName: string;
  hasEOL: boolean;
  str: string;
  transform: number[];
};

type PdfTextStyle = {
  fontFamily?: string;
};

type PdfTextContent = {
  items: unknown[];
  styles: Record<string, PdfTextStyle>;
};

type PdfParagraph = DocumentParagraph & {
  fontSize: number;
};

async function extractPdfParagraphs(file: File): Promise<DocumentParagraph[]> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");

  if (typeof window !== "undefined") {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
      import.meta.url,
    ).toString();
  }

  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(await file.arrayBuffer()),
    stopAtErrors: true,
  });

  try {
    const pdf = await loadingTask.promise;
    if (pdf.numPages > 500) {
      throw new Error("The PDF must contain 500 pages or fewer.");
    }

    const paragraphs: PdfParagraph[] = [];
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const textContent = await page.getTextContent();
      paragraphs.push(...extractPdfPageParagraphs(textContent));
      page.cleanup();
    }

    return classifyPdfHeadings(paragraphs);
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("The PDF must")) throw error;

    const errorName = error instanceof Error ? error.name : "";
    if (errorName === "PasswordException") {
      throw new Error("Password-protected PDFs are not supported.");
    }

    throw new Error("The PDF could not be read. Upload a text-based PDF instead of a scanned image.");
  } finally {
    await loadingTask.destroy();
  }
}

export function extractPdfPageParagraphs(textContent: PdfTextContent): PdfParagraph[] {
  const paragraphs: PdfParagraph[] = [];
  let paragraphRuns: ManuscriptRichTextRun[] = [];
  let lineRuns: ManuscriptRichTextRun[] = [];
  let paragraphFontSize = 0;
  let lineFontSize = 0;

  function flushLine() {
    if (lineRuns.length === 0) return;

    if (paragraphRuns.length > 0) paragraphRuns.push({ text: " " });
    paragraphRuns.push(...lineRuns);
    paragraphFontSize = Math.max(paragraphFontSize, lineFontSize);
    lineRuns = [];
    lineFontSize = 0;
  }

  function flushParagraph() {
    flushLine();
    if (paragraphRuns.length === 0) return;

    const richContent = normalizeRichTextWhitespace(createRichText(paragraphRuns));
    const text = getRichTextContent(richContent);
    if (text) {
      paragraphs.push({ fontSize: paragraphFontSize, richContent, text });
    }

    paragraphRuns = [];
    paragraphFontSize = 0;
  }

  for (const item of textContent.items) {
    if (!isPdfTextItem(item)) continue;
    if (!item.str) {
      flushParagraph();
      continue;
    }

    const marks = getPdfTextMarks(item, textContent.styles[item.fontName]);
    lineRuns.push({ ...(marks ? { marks } : {}), text: item.str });
    lineFontSize = Math.max(lineFontSize, getPdfFontSize(item));

    if (item.hasEOL) flushLine();
  }

  flushParagraph();
  return paragraphs;
}

function isPdfTextItem(item: unknown): item is PdfTextItem {
  if (!item || typeof item !== "object" || Array.isArray(item)) return false;

  const candidate = item as Partial<PdfTextItem>;
  return typeof candidate.fontName === "string"
    && typeof candidate.hasEOL === "boolean"
    && typeof candidate.str === "string"
    && Array.isArray(candidate.transform);
}

function getPdfTextMarks(
  item: PdfTextItem,
  style: PdfTextStyle | undefined,
): ManuscriptTextMarks | undefined {
  const fontName = item.fontName.toLowerCase();
  const fontFamily = classifyPdfFontFamily(style?.fontFamily);
  const marks: ManuscriptTextMarks = {
    ...(fontName.includes("bold") || fontName.includes("black") ? { bold: true } : {}),
    ...(fontFamily ? { fontFamily } : {}),
    ...(fontName.includes("italic") || fontName.includes("oblique") ? { italic: true } : {}),
  };

  return Object.keys(marks).length > 0 ? marks : undefined;
}

function classifyPdfFontFamily(fontFamily: string | undefined): ManuscriptFontFamily | undefined {
  if (!fontFamily) return undefined;

  const normalizedFontFamily = fontFamily.toLowerCase();
  if (normalizedFontFamily.includes("sans-serif") || normalizedFontFamily.includes("sans serif")) {
    return "sans-serif";
  }

  return normalizedFontFamily.includes("serif") ? "serif" : undefined;
}

function getPdfFontSize(item: PdfTextItem) {
  const horizontalScale = Number(item.transform[0]) || 0;
  const verticalScale = Number(item.transform[1]) || 0;
  const fontSize = Math.hypot(horizontalScale, verticalScale);

  return fontSize || Math.abs(Number(item.transform[3]) || 0);
}

function classifyPdfHeadings(paragraphs: PdfParagraph[]): DocumentParagraph[] {
  const bodyFontSize = getPdfMedianFontSize(paragraphs);

  return paragraphs.map(({ fontSize, richContent, text }) => ({
    richContent,
    text,
    ...(fontSize >= bodyFontSize * 1.4 && fontSize <= bodyFontSize * 2.5
      ? { style: "pdf-heading-1" }
      : {}),
  }));
}

function getPdfMedianFontSize(paragraphs: PdfParagraph[]) {
  const fontSizes = paragraphs
    .filter((paragraph) => paragraph.fontSize > 0)
    .map((paragraph) => paragraph.fontSize)
    .sort((left, right) => left - right);

  if (fontSizes.length === 0) return 0;

  const middleIndex = Math.floor(fontSizes.length / 2);
  return fontSizes.length % 2 === 0
    ? (fontSizes[middleIndex - 1] + fontSizes[middleIndex]) / 2
    : fontSizes[middleIndex];
}

async function extractDocxParagraphs(file: File): Promise<DocumentParagraph[]> {
  const archive = await file.arrayBuffer();
  const [documentXml, stylesXml, themeXml] = await Promise.all([
    readZipEntry(archive, "word/document.xml"),
    readOptionalZipEntry(archive, "word/styles.xml"),
    readOptionalZipEntry(archive, "word/theme/theme1.xml"),
  ]);
  const document = new DOMParser().parseFromString(
    new TextDecoder().decode(documentXml),
    "application/xml",
  );

  if (document.getElementsByTagName("parsererror").length > 0) {
    throw new Error("The DOCX document could not be parsed.");
  }

  const fontContext = getDocxFontContext(stylesXml, themeXml);

  return Array.from(document.getElementsByTagNameNS(wordprocessingNamespace, "p"))
    .map((paragraph) => {
      const paragraphMarks = getDocxParagraphMarks(paragraph, fontContext);
      const richContent = normalizeRichTextWhitespace(createRichText(
        Array.from(paragraph.getElementsByTagNameNS(wordprocessingNamespace, "r"))
          .flatMap((run) => getDocxRunText(run).map((text) => ({
            marks: getDocxRunMarks(run, paragraphMarks, fontContext),
            text,
          }))),
      ));
      const text = getRichTextContent(richContent);
      const style = paragraph
        .getElementsByTagNameNS(wordprocessingNamespace, "pStyle")[0]
        ?.getAttributeNS(wordprocessingNamespace, "val")
        ?? paragraph
          .getElementsByTagNameNS(wordprocessingNamespace, "pStyle")[0]
          ?.getAttribute("w:val")
        ?? undefined;

      return { richContent, style, text };
    })
    .filter((paragraph) => paragraph.text.length > 0);
}

function detectChapters(paragraphs: DocumentParagraph[]): ImportedManuscriptChapter[] {
  const explicitChapterHeadings = paragraphs
    .map((paragraph, index) => ({ index, title: getExplicitChapterTitle(paragraph.text) }))
    .filter((heading): heading is { index: number; title: string } => heading.title !== null);

  // A DOCX title is often styled as Heading 1, just like the actual chapter
  // headings. When the document contains explicit "Chapter 1"-style labels,
  // those are more reliable boundaries than the paragraph style alone.
  if (explicitChapterHeadings.length > 0) {
    return splitIntoChapters(paragraphs, explicitChapterHeadings);
  }

  const headings = paragraphs
    .map((paragraph, index) => ({ index, title: getChapterTitle(paragraph) }))
    .filter((heading): heading is { index: number; title: string } => heading.title !== null);

  const firstHeadingIndex = headings[0]?.index ?? -1;
  if (firstHeadingIndex === -1) {
    return removeEmptyChapters([toChapter("Chapter 1", paragraphs.map((paragraph) => paragraph.richContent))]);
  }

  return splitIntoChapters(paragraphs, headings);
}

function splitIntoChapters(
  paragraphs: DocumentParagraph[],
  headings: Array<{ index: number; title: string }>,
): ImportedManuscriptChapter[] {
  const firstHeading = headings[0];
  if (!firstHeading) return [];

  const chapters: ImportedManuscriptChapter[] = [];
  let currentTitle = firstHeading.title;
  let currentParagraphs: ManuscriptRichText[] = [];
  let nextHeadingIndex = 1;

  for (let index = firstHeading.index + 1; index < paragraphs.length; index += 1) {
    const nextHeading = headings[nextHeadingIndex];
    if (nextHeading?.index === index) {
      chapters.push(toChapter(currentTitle, currentParagraphs));
      currentTitle = nextHeading.title;
      currentParagraphs = [];
      nextHeadingIndex += 1;
    } else {
      currentParagraphs.push(paragraphs[index].richContent);
    }
  }

  chapters.push(toChapter(currentTitle, currentParagraphs));
  return removeEmptyChapters(chapters);
}

function getChapterTitle(paragraph: DocumentParagraph) {
  const text = paragraph.text.trim();
  if (!text || text.length > 500) return null;

  return getExplicitChapterTitle(text)
    ?? (paragraph.style && /^(heading|titre|pdf-heading)[ _-]?[12]$/i.test(paragraph.style.replace(/\s+/g, "")) ? text : null)
    ?? (paragraph.style?.startsWith("markdown-heading-") ? text : null);
}

function getExplicitChapterTitle(text: string) {
  const normalizedText = text.trim();
  if (!normalizedText || normalizedText.length > 500) return null;

  if (/^(chapter|chapitre|part|partie)\s+(?:\d+|[ivxlcdm]+)(?:\s*[-–—:.]\s*.+)?$/i.test(normalizedText)) {
    return normalizedText;
  }

  return null;
}

function toChapter(title: string, paragraphs: ManuscriptRichText[]): ImportedManuscriptChapter {
  return {
    blocks: paragraphs.flatMap((paragraph) => splitLongRichText(paragraph, MAX_BLOCK_CHARACTER_COUNT).map((richContent) => ({
      content: getRichTextContent(richContent),
      kind: "paragraph" as const,
      richContent,
    }))),
    title,
  };
}

function removeEmptyChapters(chapters: ImportedManuscriptChapter[]) {
  return chapters.filter((chapter) => chapter.blocks.some((block) => countWords(block.content) > 0));
}

function countWords(text: string) {
  return text.match(/[\p{L}\p{N}]+(?:[’'][\p{L}\p{N}]+)*/gu)?.length ?? 0;
}

function getDocxRunText(run: Element): string[] {
  return Array.from(run.childNodes).flatMap((child) => {
    if (child.nodeType !== Node.ELEMENT_NODE) return [];
    const element = child as Element;
    if (element.namespaceURI !== wordprocessingNamespace) return [];
    if (element.localName === "t") return [element.textContent ?? ""];
    if (element.localName === "tab") return ["\t"];
    if (element.localName === "br" || element.localName === "cr") return ["\n"];
    return [];
  });
}

function getDocxFontContext(
  stylesXml: ArrayBuffer | null,
  themeXml: ArrayBuffer | null,
): DocxFontContext {
  const stylesDocument = parseOptionalDocxXml(stylesXml);
  const themeDocument = parseOptionalDocxXml(themeXml);
  const themeFonts = getDocxThemeFonts(themeDocument);
  const baseContext: DocxFontContext = {
    styleMarks: new Map(),
    themeFonts,
  };
  const documentDefaults = stylesDocument?.getElementsByTagNameNS(wordprocessingNamespace, "docDefaults")[0];
  const defaultRunProperties = documentDefaults
    ? getDocxChild(getDocxChild(documentDefaults, "rPrDefault"), "rPr")
    : undefined;
  const defaultMarks = getDocxMarksFromProperties(defaultRunProperties, undefined, baseContext);
  const styleMarks = getDocxStyleMarks(stylesDocument, { ...baseContext, defaultMarks });

  return {
    defaultMarks,
    styleMarks,
    themeFonts,
  };
}

function parseOptionalDocxXml(xml: ArrayBuffer | null) {
  if (!xml) return null;

  const document = new DOMParser().parseFromString(
    new TextDecoder().decode(xml),
    "application/xml",
  );
  return document.getElementsByTagName("parsererror").length > 0 ? null : document;
}

function getDocxThemeFonts(themeDocument: Document | null): DocxFontContext["themeFonts"] {
  const fontScheme = themeDocument?.getElementsByTagNameNS(drawingNamespace, "fontScheme")[0];

  return {
    major: getDocxThemeFontSet(getXmlChild(fontScheme, drawingNamespace, "majorFont")),
    minor: getDocxThemeFontSet(getXmlChild(fontScheme, drawingNamespace, "minorFont")),
  };
}

function getDocxThemeFontSet(element: Element | undefined): DocxThemeFontSet {
  return {
    complexScript: getXmlChild(element, drawingNamespace, "cs")?.getAttribute("typeface") ?? undefined,
    eastAsia: getXmlChild(element, drawingNamespace, "ea")?.getAttribute("typeface") ?? undefined,
    latin: getXmlChild(element, drawingNamespace, "latin")?.getAttribute("typeface") ?? undefined,
  };
}

function getDocxStyleMarks(
  stylesDocument: Document | null,
  context: DocxFontContext,
) {
  const styleMarks = new Map<string, ManuscriptTextMarks>();
  if (!stylesDocument) return styleMarks;

  for (const style of Array.from(stylesDocument.getElementsByTagNameNS(wordprocessingNamespace, "style"))) {
    const styleId = getWordAttribute(style, "styleId");
    const runProperties = getDocxChild(style, "rPr");
    if (!styleId || !runProperties) continue;

    const marks = getDocxMarksFromProperties(runProperties, context.defaultMarks, context);
    if (marks) styleMarks.set(styleId, marks);
  }

  return styleMarks;
}

function getDocxParagraphMarks(paragraph: Element, context: DocxFontContext) {
  const paragraphProperties = getDocxChild(paragraph, "pPr");
  const styleId = getWordAttribute(getDocxChild(paragraphProperties, "pStyle"), "val");
  const inheritedMarks = styleId
    ? context.styleMarks.get(styleId) ?? context.defaultMarks
    : context.defaultMarks;

  return getDocxMarksFromProperties(
    getDocxChild(paragraphProperties, "rPr"),
    inheritedMarks,
    context,
  );
}

function getDocxRunMarks(
  run: Element,
  inheritedMarks: ManuscriptTextMarks | undefined,
  context: DocxFontContext,
): ManuscriptRichTextRun["marks"] {
  return getDocxMarksFromProperties(getDocxChild(run, "rPr"), inheritedMarks, context);
}

function getDocxMarksFromProperties(
  runProperties: Element | undefined,
  inheritedMarks: ManuscriptTextMarks | undefined,
  context: DocxFontContext,
): ManuscriptTextMarks | undefined {
  if (!runProperties) return inheritedMarks;

  const characterStyleId = getWordAttribute(getDocxChild(runProperties, "rStyle"), "val");
  const styleMarks = characterStyleId
    ? context.styleMarks.get(characterStyleId) ?? inheritedMarks
    : inheritedMarks;
  const overrides: DocxMarkOverrides = {
    bold: getDocxToggle(runProperties, "b", "bCs"),
    fontFamily: getDocxFontFamily(runProperties, context),
    italic: getDocxToggle(runProperties, "i", "iCs"),
  };

  return mergeDocxMarks(styleMarks, overrides);
}

function mergeDocxMarks(
  inheritedMarks: ManuscriptTextMarks | undefined,
  overrides: DocxMarkOverrides,
): ManuscriptTextMarks | undefined {
  const marks: ManuscriptTextMarks = {
    ...((overrides.bold ?? inheritedMarks?.bold) ? { bold: true } : {}),
    ...(overrides.fontFamily ?? inheritedMarks?.fontFamily
      ? { fontFamily: overrides.fontFamily ?? inheritedMarks?.fontFamily }
      : {}),
    ...((overrides.italic ?? inheritedMarks?.italic) ? { italic: true } : {}),
  };

  return Object.keys(marks).length > 0 ? marks : undefined;
}

function getDocxToggle(
  runProperties: Element,
  primaryName: string,
  complexScriptName: string,
) {
  const element = getDocxChild(runProperties, primaryName)
    ?? getDocxChild(runProperties, complexScriptName);
  return element ? isDocxToggleEnabled(element) : undefined;
}

function getDocxFontFamily(
  runProperties: Element,
  context: DocxFontContext,
): ManuscriptFontFamily | undefined {
  const fonts = getDocxChild(runProperties, "rFonts");
  if (!fonts) return undefined;

  const directFontName = ["ascii", "hAnsi", "cs", "eastAsia"]
    .map((attribute) => getWordAttribute(fonts, attribute))
    .find(Boolean);
  const themeFontName = ["asciiTheme", "hAnsiTheme", "csTheme", "eastAsiaTheme"]
    .map((attribute) => getWordAttribute(fonts, attribute))
    .find(Boolean);

  return classifyDocxFontFamily(
    directFontName ?? resolveDocxThemeFont(themeFontName, context.themeFonts),
  );
}

function resolveDocxThemeFont(
  themeName: string | undefined,
  themeFonts: DocxFontContext["themeFonts"],
) {
  if (!themeName) return undefined;

  const normalizedName = themeName.toLowerCase();
  const fontSet = normalizedName.startsWith("major") ? themeFonts.major
    : normalizedName.startsWith("minor") ? themeFonts.minor
      : undefined;
  if (!fontSet) return undefined;

  return normalizedName.includes("bidi")
    ? fontSet.complexScript ?? fontSet.latin
    : normalizedName.includes("eastasia")
      ? fontSet.eastAsia ?? fontSet.latin
      : fontSet.latin;
}

export function classifyDocxFontFamily(fontName: string | undefined): ManuscriptFontFamily | undefined {
  if (!fontName) return undefined;

  const normalizedName = fontName
    .replace(/([a-z])([A-Z])/gu, "$1 $2")
    .replace(/["']/g, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase();

  return docxFontFamilyByName.get(normalizedName)
    ?? docxFontNamesBySpecificity.find(([knownFontName]) => (
      normalizedName.startsWith(knownFontName + " ")
    ))?.[1];
}

function getDocxChild(parent: Element | undefined, localName: string) {
  return Array.from(parent?.children ?? []).find((child) => (
    child.namespaceURI === wordprocessingNamespace && child.localName === localName
  ));
}

function getXmlChild(parent: Element | undefined, namespace: string, localName: string) {
  return Array.from(parent?.children ?? []).find((child) => (
    child.namespaceURI === namespace && child.localName === localName
  ));
}

function isDocxToggleEnabled(element: Element | undefined) {
  if (!element) return false;
  const value = getWordAttribute(element, "val")?.toLowerCase();
  return value !== "0" && value !== "false" && value !== "off" && value !== "none";
}

function getWordAttribute(element: Element | undefined, name: string): string | undefined {
  return element?.getAttributeNS(wordprocessingNamespace, name)
    ?? element?.getAttribute("w:" + name)
    ?? element?.getAttribute(name)
    ?? undefined;
}

async function readZipEntry(zip: ArrayBuffer, targetPath: string): Promise<ArrayBuffer> {
  const view = new DataView(zip);
  const endOfCentralDirectoryOffset = findEndOfCentralDirectory(view);
  const centralDirectoryOffset = view.getUint32(endOfCentralDirectoryOffset + 16, true);
  const entryCount = view.getUint16(endOfCentralDirectoryOffset + 10, true);
  const decoder = new TextDecoder();
  let offset = centralDirectoryOffset;

  for (let index = 0; index < entryCount; index += 1) {
    if (view.getUint32(offset, true) !== 0x02014b50) {
      throw new Error("The DOCX archive has an invalid central directory.");
    }

    const compressionMethod = view.getUint16(offset + 10, true);
    const compressedSize = view.getUint32(offset + 20, true);
    const filenameLength = view.getUint16(offset + 28, true);
    const extraLength = view.getUint16(offset + 30, true);
    const commentLength = view.getUint16(offset + 32, true);
    const localHeaderOffset = view.getUint32(offset + 42, true);
    const filename = decoder.decode(new Uint8Array(zip, offset + 46, filenameLength));

    if (filename === targetPath) {
      if (view.getUint32(localHeaderOffset, true) !== 0x04034b50) {
        throw new Error("The DOCX archive has an invalid file entry.");
      }

      const localFilenameLength = view.getUint16(localHeaderOffset + 26, true);
      const localExtraLength = view.getUint16(localHeaderOffset + 28, true);
      const dataOffset = localHeaderOffset + 30 + localFilenameLength + localExtraLength;
      const compressedData = zip.slice(dataOffset, dataOffset + compressedSize);

      if (compressionMethod === 0) return compressedData;
      if (compressionMethod === 8) return inflateDeflateRaw(compressedData);
      throw new Error("This DOCX compression method is not supported.");
    }

    offset += 46 + filenameLength + extraLength + commentLength;
  }

  throw new Error("The DOCX document body could not be found.");
}

async function readOptionalZipEntry(zip: ArrayBuffer, targetPath: string) {
  try {
    return await readZipEntry(zip, targetPath);
  } catch {
    return null;
  }
}

function findEndOfCentralDirectory(view: DataView) {
  const minimumOffset = Math.max(0, view.byteLength - 65_557);

  for (let offset = view.byteLength - 22; offset >= minimumOffset; offset -= 1) {
    if (view.getUint32(offset, true) === 0x06054b50) return offset;
  }

  throw new Error("The selected DOCX file is not a valid ZIP archive.");
}

async function inflateDeflateRaw(compressedData: ArrayBuffer) {
  if (typeof DecompressionStream === "undefined") {
    throw new Error("This browser cannot read DOCX files. Please use TXT or Markdown.");
  }

  const stream = new Blob([compressedData])
    .stream()
    .pipeThrough(new DecompressionStream("deflate-raw"));

  return new Response(stream).arrayBuffer();
}
