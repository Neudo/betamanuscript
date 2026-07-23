"use client";

import { ArrowLeft, ArrowRight, Check, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  annotationBackgroundColor,
  getTextAnnotationSegments,
} from "@/features/annotations/lib/text-annotations";
import type {
  ReaderAnnotation,
  ReaderAnnotationDraft,
  ReaderManuscript,
} from "@/features/reading/api/reading";
import { ReaderAnnotationSheet } from "@/features/reading/components/ReaderAnnotationSheet";
import { useCompleteReaderChapter, useReaderManuscript } from "@/features/reading/hooks/use-reading";
import { cn } from "@/lib/utils";

type AnnotationPanel =
  | { annotation: ReaderAnnotation; kind: "edit" }
  | { draft: ReaderAnnotationDraft; kind: "create" };

export function ReadingView({ manuscriptId }: { manuscriptId: string }) {
  const manuscriptQuery = useReaderManuscript(manuscriptId);
  const completeChapterMutation = useCompleteReaderChapter();
  const [chapterIndex, setChapterIndex] = useState(0);
  const [annotationPanel, setAnnotationPanel] = useState<AnnotationPanel | null>(null);
  const manuscript = manuscriptQuery.data;
  const chapters = manuscript?.chapters ?? [];
  const currentChapterIndex = Math.min(chapterIndex, Math.max(0, chapters.length - 1));
  const chapter = chapters[currentChapterIndex];

  if (manuscriptQuery.isLoading) {
    return <div className="p-8 text-sm text-muted-foreground">Loading manuscript…</div>;
  }

  if (manuscriptQuery.isError) {
    return <div className="p-8"><Alert variant="destructive"><AlertDescription>{manuscriptQuery.error.message}</AlertDescription></Alert></div>;
  }

  if (!manuscript || !chapter) {
    return (
      <div className="p-8">
        <Alert><AlertDescription>This manuscript is unavailable or has no readable chapters yet.</AlertDescription></Alert>
      </div>
    );
  }

  const progress = (currentChapterIndex + 1) / chapters.length * 100;
  const readerAssignmentId = manuscript.assignmentId;

  function completeAndContinue() {
    completeChapterMutation.mutate(
      { chapterId: chapter.id, readerAssignmentId },
      {
        onSuccess() {
          toast.success("Chapter marked complete.");
          if (currentChapterIndex < chapters.length - 1) {
            setChapterIndex((current) => current + 1);
          }
        },
        onError(error) {
          toast.error(error.message);
        },
      },
    );
  }

  function changeChapter(nextChapterIndex: number) {
    setAnnotationPanel(null);
    setChapterIndex(nextChapterIndex);
  }

  function handleTextSelection() {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount !== 1 || selection.isCollapsed) return;

    const range = selection.getRangeAt(0);
    const startBlockElement = getReaderBlockElement(range.startContainer);
    const endBlockElement = getReaderBlockElement(range.endContainer);

    if (!startBlockElement || startBlockElement !== endBlockElement) {
      toast.error("Select text from a single paragraph to add one annotation.");
      return;
    }

    const block = chapter.blocks.find((item) => item.id === startBlockElement.dataset.readerBlockId);
    if (!block) return;

    const blockText = block.content;
    const rawSelectionStart = getTextOffset(startBlockElement, range.startContainer, range.startOffset);
    const rawSelectionEnd = getTextOffset(startBlockElement, range.endContainer, range.endOffset);
    const rawQuote = blockText.slice(rawSelectionStart, rawSelectionEnd);
    const selectionStart = rawSelectionStart + (rawQuote.length - rawQuote.trimStart().length);
    const selectionEnd = rawSelectionEnd - (rawQuote.length - rawQuote.trimEnd().length);
    const quote = blockText.slice(selectionStart, selectionEnd);

    selection.removeAllRanges();

    if (!quote) return;

    const matchingAnnotation = block.annotations.find(
      (annotation) => annotation.selectionStart === selectionStart && annotation.selectionEnd === selectionEnd,
    );
    if (matchingAnnotation) {
      setAnnotationPanel({ annotation: matchingAnnotation, kind: "edit" });
      return;
    }

    const hasOverlappingAnnotation = block.annotations.some(
      (annotation) => selectionStart < annotation.selectionEnd && selectionEnd > annotation.selectionStart,
    );
    if (hasOverlappingAnnotation) {
      toast.error("This passage already overlaps one of your annotations. Click its highlight to edit it.");
      return;
    }

    setAnnotationPanel({
      draft: {
        chapterBlockId: block.id,
        chapterId: chapter.id,
        contextAfter: blockText.slice(selectionEnd, selectionEnd + 180) || null,
        contextBefore: blockText.slice(Math.max(0, selectionStart - 180), selectionStart) || null,
        quote,
        selectionEnd,
        selectionStart,
      },
      kind: "create",
    });
  }

  return (
    <div className="relative min-h-full bg-surface">
      <Progress value={progress} className="sticky top-0 z-20 h-0.5 rounded-none" />

      <header className="sticky top-0.5 z-10 border-b border-foreground/10 bg-surface px-4 py-2 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <Link href="/reader" className="flex items-center gap-1 text-xs text-muted-foreground"><ChevronLeft className="h-3.5 w-3.5" />Reading list</Link>
            <span className="h-7 w-px bg-foreground/10" />
            <p className="text-sm font-medium">{manuscript.title}</p>
          </div>
          <Select value={String(currentChapterIndex)} onValueChange={(value) => changeChapter(Number(value))}>
            <SelectTrigger className="h-9 w-[260px] rounded-none border-foreground/15 bg-card text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {chapters.map((item, index) => (
                <SelectItem key={item.id} value={String(index)}>Ch {item.position}: {item.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      <article className="reader-copy mx-auto max-w-[760px] px-5 py-12 sm:px-10 sm:py-16" onMouseUp={handleTextSelection}>
        <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">Chapter {chapter.position}</p>
        <h1 className="mt-4 font-display text-[42px] font-semibold leading-none">{chapter.title}</h1>
        <div className="mt-12 space-y-7 font-display text-[21px] leading-9 text-foreground/90 sm:text-[23px] sm:leading-10">
          {chapter.blocks.length > 0 ? chapter.blocks.map((block) => (
            <ReaderAnnotatedBlock
              key={block.id}
              block={block}
              onAnnotationClick={(annotation) => {
                setAnnotationPanel({ annotation, kind: "edit" });
              }}
            />
          )) : <p className="text-muted-foreground">This chapter has no text yet.</p>}
        </div>

        <nav className="mt-14 flex items-center justify-between border-t pt-6" aria-label="Chapter navigation">
          <Button variant="ghost" size="sm" disabled={currentChapterIndex === 0} onClick={() => changeChapter(Math.max(0, currentChapterIndex - 1))}>
            <ArrowLeft className="h-3.5 w-3.5" />Previous chapter
          </Button>
          <span className="font-mono text-[9px] text-muted-foreground">{currentChapterIndex + 1} / {chapters.length}</span>
          <Button size="sm" onClick={completeAndContinue} disabled={completeChapterMutation.isPending}>
            {completeChapterMutation.isPending
              ? "Saving…"
              : currentChapterIndex === chapters.length - 1
                ? "Mark chapter complete"
                : "Complete & next"}
            {currentChapterIndex === chapters.length - 1 ? <Check className="h-3.5 w-3.5" /> : <ArrowRight className="h-3.5 w-3.5" />}
          </Button>
        </nav>
      </article>

      {annotationPanel ? (
        <ReaderAnnotationSheet
          key={annotationPanel.kind === "edit" ? annotationPanel.annotation.id : `${annotationPanel.draft.chapterBlockId}:${annotationPanel.draft.selectionStart}:${annotationPanel.draft.selectionEnd}`}
          annotation={annotationPanel.kind === "edit" ? annotationPanel.annotation : undefined}
          draft={annotationPanel.kind === "create" ? annotationPanel.draft : undefined}
          readerAssignmentId={readerAssignmentId}
          onClose={() => setAnnotationPanel(null)}
        />
      ) : null}
    </div>
  );
}

function ReaderAnnotatedBlock({
  block,
  onAnnotationClick,
}: {
  block: ReaderManuscript["chapters"][number]["blocks"][number];
  onAnnotationClick: (annotation: ReaderAnnotation) => void;
}) {
  const segments = getTextAnnotationSegments(block.content, block.annotations);

  return (
    <p data-reader-block-id={block.id}>
      {segments.map((segment) => {
        if (!segment.group) return segment.content;

        const { annotations, color, hasMultipleTags } = segment.group;
        const count = annotations.length;
        const tagLabel = hasMultipleTags ? "multiple tags" : annotations[0].tag.label;

        return (
          <button
            key={segment.key}
            type="button"
            className={cn(
              "inline cursor-pointer rounded-sm border-0 px-0.5 text-inherit decoration-2 underline-offset-4 transition-colors hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              hasMultipleTags && "font-medium",
            )}
            style={{ backgroundColor: annotationBackgroundColor(color), textDecorationColor: color }}
            onClick={(event) => {
              event.stopPropagation();
              onAnnotationClick(annotations[0]);
            }}
            aria-label={`${count} annotation${count > 1 ? "s" : ""} tagged ${tagLabel}. Open annotation.`}
          >
            {segment.content}
            {count > 1 ? (
              <span
                className="ml-1 inline-flex h-4 min-w-4 translate-y-[-0.45em] items-center justify-center rounded-full px-1 align-super font-mono text-[8px] leading-none text-white"
                style={{ backgroundColor: color }}
                aria-hidden="true"
              >
                {count}
              </span>
            ) : null}
          </button>
        );
      })}
    </p>
  );
}

function getReaderBlockElement(node: Node) {
  const element = node.nodeType === Node.ELEMENT_NODE ? node as Element : node.parentElement;
  return element?.closest<HTMLElement>("[data-reader-block-id]") ?? null;
}

function getTextOffset(block: HTMLElement, container: Node, offset: number) {
  const prefixRange = document.createRange();
  prefixRange.selectNodeContents(block);
  prefixRange.setEnd(container, offset);
  return prefixRange.toString().length;
}
