"use client";

import { Bold, Italic } from "lucide-react";
import {
  type ClipboardEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { Button } from "@/components/ui/button";
import {
  createRichText,
  createRichTextDocument,
  getRichTextContent,
  manuscriptFontFamilyStacks,
  marksToStyle,
  normalizeMarks,
  type ManuscriptFontFamily,
  type ManuscriptRichTextDocument,
  type ManuscriptRichTextRun,
  type ManuscriptTextMarks,
} from "@/features/manuscript/lib/rich-text";
import { cn } from "@/lib/utils";

type RichTextEditorProps = {
  disabled?: boolean;
  id: string;
  onChange: (document: ManuscriptRichTextDocument) => void;
  value: ManuscriptRichTextDocument;
};

type SelectionSnapshot = {
  range: Range;
  selectionText: string;
};

export function RichTextEditor({ disabled = false, id, onChange, value }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const latestValueRef = useRef("");
  const selectionRef = useRef<SelectionSnapshot | null>(null);
  const [hasSelection, setHasSelection] = useState(false);

  const syncValue = useCallback((document: ManuscriptRichTextDocument) => {
    const editor = editorRef.current;
    if (!editor) return;

    const serialized = JSON.stringify(document);
    if (latestValueRef.current === serialized) return;

    editor.replaceChildren(...document.blocks.map((block) => createEditorBlock(block.richContent)));
    latestValueRef.current = serialized;
  }, []);

  useEffect(() => {
    syncValue(value);
  }, [syncValue, value]);

  const storeSelection = useCallback(() => {
    const editor = editorRef.current;
    const selection = window.getSelection();
    if (!editor || !selection || selection.rangeCount === 0 || selection.isCollapsed) {
      setHasSelection(false);
      return;
    }

    const range = selection.getRangeAt(0);
    const selectionText = selection.toString();
    if (!editor.contains(range.startContainer) || !editor.contains(range.endContainer) || !selectionText) {
      setHasSelection(false);
      return;
    }

    selectionRef.current = {
      range: range.cloneRange(),
      selectionText,
    };
    setHasSelection(true);
  }, []);

  useEffect(() => {
    document.addEventListener("selectionchange", storeSelection);
    return () => document.removeEventListener("selectionchange", storeSelection);
  }, [storeSelection]);

  const emitChange = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const document = readEditorDocument(editor);
    latestValueRef.current = JSON.stringify(document);
    onChange(document);
    storeSelection();
  }, [onChange, storeSelection]);

  function restoreSelection() {
    const snapshot = selectionRef.current;
    if (!snapshot) return false;

    const editor = editorRef.current;
    if (!editor || !editor.contains(snapshot.range.commonAncestorContainer)) return false;

    const selection = window.getSelection();
    if (!selection) return false;
    selection.removeAllRanges();
    selection.addRange(snapshot.range);
    return true;
  }

  function runNativeCommand(command: "bold" | "italic") {
    if (disabled || !restoreSelection()) return;
    document.execCommand(command);
    emitChange();
  }

  function applyFontFamily(fontFamily: ManuscriptFontFamily) {
    if (disabled || !restoreSelection()) return;
    document.execCommand("styleWithCSS", false, "true");
    document.execCommand("fontName", false, manuscriptFontFamilyStacks[fontFamily]);
    emitChange();
  }

  function handlePaste(event: ClipboardEvent<HTMLDivElement>) {
    event.preventDefault();
    const text = event.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
    emitChange();
  }

  return (
    <div className="overflow-hidden border border-foreground/20 bg-background">
      <div
        className={cn(
          "flex min-h-10 flex-wrap items-center gap-x-1 gap-y-1 border-b border-foreground/10 bg-muted/[0.16] px-2 py-1.5 transition-opacity",
          !hasSelection && "opacity-55",
        )}
        aria-label="Selected text formatting"
        aria-live="polite"
        role="toolbar"
      >
        <span className="mr-1 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
          {hasSelection ? "Selection" : "Select text"}
        </span>
        <ToolbarButton label="Bold" onClick={() => runNativeCommand("bold")} disabled={disabled || !hasSelection}>
          <Bold className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton label="Italic" onClick={() => runNativeCommand("italic")} disabled={disabled || !hasSelection}>
          <Italic className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          label="Serif"
          onClick={() => applyFontFamily("serif")}
          disabled={disabled || !hasSelection}
          className="w-auto px-2 font-serif text-xs"
        >
          Serif
        </ToolbarButton>
        <ToolbarButton
          label="Sans serif"
          onClick={() => applyFontFamily("sans-serif")}
          disabled={disabled || !hasSelection}
          className="w-auto px-2 font-sans text-[10px]"
        >
          Sans
        </ToolbarButton>
      </div>
      <div
        id={id}
        ref={editorRef}
        contentEditable={!disabled}
        suppressContentEditableWarning
        role="textbox"
        aria-label="Chapter content"
        aria-multiline="true"
        data-placeholder="Paste or write the chapter text here."
        onInput={emitChange}
        onMouseUp={storeSelection}
        onKeyUp={storeSelection}
        onPaste={handlePaste}
        className={cn(
          "rich-text-editor min-h-72 whitespace-pre-wrap px-3 py-3 font-serif text-base leading-7 text-foreground outline-none",
          "empty:before:pointer-events-none empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground",
          disabled && "cursor-not-allowed bg-muted/[0.14] text-muted-foreground",
        )}
      />
    </div>
  );
}

function ToolbarButton({
  children,
  disabled,
  label,
  onClick,
  className,
}: {
  children: ReactNode;
  className?: string;
  disabled: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      disabled={disabled}
      aria-label={label}
      title={label}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={cn("h-7 w-7 rounded-none", className)}
    >
      {children}
    </Button>
  );
}

function createEditorBlock(richText: ManuscriptRichTextDocument["blocks"][number]["richContent"]) {
  const block = document.createElement("p");
  block.dataset.richTextBlock = "true";
  block.className = "min-h-7";

  for (const run of richText.runs) {
    if (!run.marks) {
      block.append(run.text);
      continue;
    }

    const span = document.createElement("span");
    Object.assign(span.style, marksToStyle(run.marks));
    span.append(run.text);
    block.append(span);
  }

  if (!block.hasChildNodes()) block.append(document.createElement("br"));
  return block;
}

function readEditorDocument(editor: HTMLDivElement): ManuscriptRichTextDocument {
  const blocks = Array.from(editor.children)
    .filter((child): child is HTMLElement => child instanceof HTMLElement)
    .map((block) => {
      const richContent = readRichTextBlock(block);
      return { content: getRichTextContent(richContent), richContent };
    });

  if (blocks.length === 0 && editor.textContent) {
    const richContent = readRichTextBlock(editor);
    blocks.push({ content: getRichTextContent(richContent), richContent });
  }

  return createRichTextDocument(blocks);
}

function readRichTextBlock(block: HTMLElement) {
  const runs: ManuscriptRichTextRun[] = [];
  readNodeRuns(block, undefined, runs);
  return createRichText(runs);
}

function readNodeRuns(
  node: Node,
  inheritedMarks: ManuscriptTextMarks | undefined,
  runs: ManuscriptRichTextRun[],
) {
  if (node.nodeType === Node.TEXT_NODE) {
    if (node.textContent) runs.push({ marks: inheritedMarks, text: node.textContent });
    return;
  }

  if (!(node instanceof HTMLElement)) return;
  if (node.tagName === "BR") {
    runs.push({ marks: inheritedMarks, text: "\n" });
    return;
  }

  const marks = getElementMarks(node, inheritedMarks);
  node.childNodes.forEach((child) => readNodeRuns(child, marks, runs));
}

function getElementMarks(element: HTMLElement, inheritedMarks: ManuscriptTextMarks | undefined) {
  const fontFamily = getEditorFontFamily(element.style.fontFamily || element.getAttribute("face") || "");

  return normalizeMarks({
    ...inheritedMarks,
    ...(element.tagName === "B" || element.tagName === "STRONG" || element.style.fontWeight === "bold" || Number(element.style.fontWeight) >= 600 ? { bold: true } : {}),
    ...(fontFamily ? { fontFamily } : {}),
    ...(element.tagName === "I" || element.tagName === "EM" || element.style.fontStyle === "italic" ? { italic: true } : {}),
  });
}

function getEditorFontFamily(fontFamily: string) {
  const normalizedFamily = fontFamily.toLowerCase();
  if (normalizedFamily.includes("--font-eb-garamond") || /\bserif\b/u.test(normalizedFamily) && !normalizedFamily.includes("sans-serif")) {
    return "serif" as const;
  }
  if (normalizedFamily.includes("--font-inter") || normalizedFamily.includes("sans-serif")) {
    return "sans-serif" as const;
  }
  return undefined;
}
