import type { ImportedManuscriptChapter } from "@/features/manuscript/types";

export const MAX_SOURCE_DOCUMENT_SIZE_BYTES = 20 * 1024 * 1024;
export const MAX_IMPORTED_CHARACTER_COUNT = 1_000_000;
export const sourceDocumentAccept = ".docx,.txt,.md,text/plain,text/markdown,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

const MAX_CHAPTER_COUNT = 200;
const MAX_BLOCK_CHARACTER_COUNT = 25_000;
const wordprocessingNamespace = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";

const sourceDocumentMimeTypes = {
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  md: "text/markdown",
  txt: "text/plain",
} as const;

type SourceDocumentExtension = keyof typeof sourceDocumentMimeTypes;

type DocumentParagraph = {
  style?: string;
  text: string;
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
    return "Choose a DOCX, TXT, or Markdown file.";
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
    : extractPlainTextParagraphs(await file.text());
  const characterCount = paragraphs.reduce((total, paragraph) => total + paragraph.text.length, 0);

  if (characterCount === 0) {
    throw new Error("This document does not contain readable text.");
  }

  if (characterCount > MAX_IMPORTED_CHARACTER_COUNT) {
    throw new Error("The extracted manuscript text must contain 1,000,000 characters or fewer.");
  }

  const chapters = detectChapters(paragraphs);
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
    if (paragraph) paragraphs.push({ text: paragraph });
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
        style: `markdown-heading-${markdownHeading[1].length}`,
        text: markdownHeading[2].trim(),
      });
      continue;
    }

    currentLines.push(line);
  }

  flushParagraph();
  return paragraphs;
}

async function extractDocxParagraphs(file: File): Promise<DocumentParagraph[]> {
  const documentXml = await readZipEntry(await file.arrayBuffer(), "word/document.xml");
  const document = new DOMParser().parseFromString(
    new TextDecoder().decode(documentXml),
    "application/xml",
  );

  if (document.getElementsByTagName("parsererror").length > 0) {
    throw new Error("The DOCX document could not be parsed.");
  }

  return Array.from(document.getElementsByTagNameNS(wordprocessingNamespace, "p"))
    .map((paragraph) => {
      const text = Array.from(paragraph.getElementsByTagNameNS(wordprocessingNamespace, "t"))
        .map((node) => node.textContent ?? "")
        .join("")
        .replace(/\s+/g, " ")
        .trim();
      const style = paragraph
        .getElementsByTagNameNS(wordprocessingNamespace, "pStyle")[0]
        ?.getAttributeNS(wordprocessingNamespace, "val")
        ?? paragraph
          .getElementsByTagNameNS(wordprocessingNamespace, "pStyle")[0]
          ?.getAttribute("w:val")
        ?? undefined;

      return { style, text };
    })
    .filter((paragraph) => paragraph.text.length > 0);
}

function detectChapters(paragraphs: DocumentParagraph[]): ImportedManuscriptChapter[] {
  const firstHeadingIndex = paragraphs.findIndex((paragraph) => getChapterTitle(paragraph));
  if (firstHeadingIndex === -1) {
    return [toChapter("Chapter 1", paragraphs.map((paragraph) => paragraph.text))];
  }

  const firstTitle = getChapterTitle(paragraphs[firstHeadingIndex]);
  if (!firstTitle) return [toChapter("Chapter 1", paragraphs.map((paragraph) => paragraph.text))];

  const chapters: ImportedManuscriptChapter[] = [];
  let currentTitle = firstTitle;
  let currentParagraphs = paragraphs
    .slice(0, firstHeadingIndex)
    .map((paragraph) => paragraph.text);

  for (const paragraph of paragraphs.slice(firstHeadingIndex + 1)) {
    const chapterTitle = getChapterTitle(paragraph);
    if (!chapterTitle) {
      currentParagraphs.push(paragraph.text);
      continue;
    }

    chapters.push(toChapter(currentTitle, currentParagraphs));
    currentTitle = chapterTitle;
    currentParagraphs = [];
  }

  chapters.push(toChapter(currentTitle, currentParagraphs));
  return chapters;
}

function getChapterTitle(paragraph: DocumentParagraph) {
  const text = paragraph.text.trim();
  if (!text || text.length > 500) return null;

  if (paragraph.style && /^(heading|titre)[ _-]?[12]$/i.test(paragraph.style.replace(/\s+/g, ""))) {
    return text;
  }

  if (paragraph.style?.startsWith("markdown-heading-")) return text;

  if (/^(chapter|chapitre|part|partie)\s+(?:\d+|[ivxlcdm]+)(?:\s*[-–—:.]\s*.+)?$/i.test(text)) {
    return text;
  }

  return null;
}

function toChapter(title: string, paragraphs: string[]): ImportedManuscriptChapter {
  return {
    blocks: paragraphs.flatMap((paragraph) => splitLongParagraph(paragraph).map((content) => ({
      content,
      kind: "paragraph" as const,
    }))),
    title,
  };
}

function splitLongParagraph(paragraph: string): string[] {
  if (paragraph.length <= MAX_BLOCK_CHARACTER_COUNT) return [paragraph];

  const chunks: string[] = [];
  let remaining = paragraph;

  while (remaining.length > MAX_BLOCK_CHARACTER_COUNT) {
    const boundary = remaining.lastIndexOf(" ", MAX_BLOCK_CHARACTER_COUNT);
    const splitAt = boundary > 0 ? boundary : MAX_BLOCK_CHARACTER_COUNT;
    chunks.push(remaining.slice(0, splitAt).trim());
    remaining = remaining.slice(splitAt).trim();
  }

  if (remaining) chunks.push(remaining);
  return chunks;
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
