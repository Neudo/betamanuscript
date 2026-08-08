"use client";

import { ArrowLeft, ArrowRight, Check, ChevronLeft, CircleHelp, MessageSquare, MessageSquarePlus } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  annotationBackgroundColor,
  getTextAnnotationSegments,
} from "@/features/annotations/lib/text-annotations";
import {
  createMultiBlockTextSelection,
  getAnnotationEndAnchor,
  type MultiBlockTextSelection,
} from "@/features/annotations/lib/multi-block-annotations";
import { MobileAnnotationActionBar } from "@/features/annotations/components/MobileAnnotationActionBar";
import type {
  ReaderAnnotation,
  ReaderAnnotationDraft,
  ReaderDueSurvey,
  ReaderManuscript,
  ReaderManuscriptListItem,
  ReaderSurveyAnswer,
} from "@/features/reading/api/reading";
import { ReaderAnnotationSheet } from "@/features/reading/components/ReaderAnnotationSheet";
import { ReaderAnnotationGuide } from "@/features/reading/components/ReaderAnnotationGuide";
import { ReaderChapterGeneralCommentSheet } from "@/features/reading/components/ReaderChapterGeneralCommentSheet";
import { ReaderEndScreen } from "@/features/reading/components/ReaderEndScreen";
import { ReaderSurveyDialog } from "@/features/reading/components/ReaderSurveyDialog";
import { RichText } from "@/features/manuscript/components/RichText";
import { getReaderManuscriptPath } from "@/features/manuscript/lib/manuscript-url";
import {
  useCompleteReaderChapter,
  useReaderDueSurveys,
  useReaderManuscripts,
  useReaderManuscript,
  useStartReaderChapter,
  useSubmitReaderSurvey,
} from "@/features/reading/hooks/use-reading";
import { cn } from "@/lib/utils";
import { Heading } from "@/shared/ui/Heading";

type AnnotationPanel =
  | { annotation: ReaderAnnotation; kind: "edit" }
  | { draft: ReaderAnnotationDraft; kind: "create" };

const readerAnnotationGuideStorageKey = "betaquill.reader.annotation-guide.v1";

function subscribeToAnnotationGuidePreference(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

function hasSeenReaderAnnotationGuide() {
  try {
    return window.localStorage.getItem(readerAnnotationGuideStorageKey) === "seen";
  } catch {
    return false;
  }
}

function hasSeenReaderAnnotationGuideOnServer() {
  return true;
}

export function ReadingView({ manuscriptReference }: { manuscriptReference: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const manuscriptVersionId = searchParams.get("version");
  const manuscriptQuery = useReaderManuscript(manuscriptReference, manuscriptVersionId);
  const readerManuscriptsQuery = useReaderManuscripts();
  const completeChapterMutation = useCompleteReaderChapter();
  const { mutate: startReaderChapter } = useStartReaderChapter();
  const { mutate: loadDueSurveys } = useReaderDueSurveys();
  const submitSurveyMutation = useSubmitReaderSurvey();
  const [chapterIndex, setChapterIndex] = useState<number | null>(null);
  const [annotationPanel, setAnnotationPanel] = useState<AnnotationPanel | null>(null);
  const [mobileSelectionDraft, setMobileSelectionDraft] = useState<MultiBlockTextSelection | null>(null);
  const [isGeneralCommentOpen, setIsGeneralCommentOpen] = useState(false);
  const [isAnnotationGuideDismissed, setIsAnnotationGuideDismissed] = useState(false);
  const [isAnnotationGuideManuallyOpen, setIsAnnotationGuideManuallyOpen] = useState(false);
  const hasSeenAnnotationGuide = useSyncExternalStore(
    subscribeToAnnotationGuidePreference,
    hasSeenReaderAnnotationGuide,
    hasSeenReaderAnnotationGuideOnServer,
  );
  const [surveyQueue, setSurveyQueue] = useState<ReaderDueSurvey[]>([]);
  const [isSurveyPromptOpen, setIsSurveyPromptOpen] = useState(false);
  const startedChapterRef = useRef<string | null>(null);
  const mobileSelectionCaptureTimeoutRef = useRef<number | null>(null);
  const manuscript = manuscriptQuery.data;
  const manuscriptId = manuscript?.id ?? null;
  const readerSearchParams = searchParams.toString();
  const availableDrafts = useMemo(() => {
    const draftsById = new Map<string, ReaderManuscriptListItem>();

    for (const draft of readerManuscriptsQuery.data ?? []) {
      if (draft.id === manuscriptId && !draftsById.has(draft.versionId)) {
        draftsById.set(draft.versionId, draft);
      }
    }

    return [...draftsById.values()].sort((left, right) => right.versionNumber - left.versionNumber);
  }, [manuscriptId, readerManuscriptsQuery.data]);
  const chapters = manuscript?.chapters ?? [];
  const completedChapterIds = useMemo(
    () => manuscript?.completedChapterIds ?? [],
    [manuscript?.completedChapterIds],
  );
  const completedChapterIdsKey = [...completedChapterIds].sort().join(",");
  const pendingReaderAssignmentId = manuscript?.assignmentId ?? null;
  const pendingReadingRoundId = manuscript?.readingRoundId ?? null;
  const isManuscriptComplete = chapters.length > 0 && chapters.every((item) => completedChapterIds.includes(item.id));
  const isReadingAgain = searchParams.get("reread") === "1";
  const showEndScreen = isManuscriptComplete && !isReadingAgain;
  const chapterFromLink = searchParams.get("chapter");
  const linkedChapterIndex = chapterFromLink
    ? chapters.findIndex((item) => item.id === chapterFromLink)
    : -1;
  const initialChapterIndex = linkedChapterIndex >= 0 ? linkedChapterIndex : 0;
  const currentChapterIndex = Math.min(
    chapterIndex ?? initialChapterIndex,
    Math.max(0, chapters.length - 1),
  );
  const chapter = chapters[currentChapterIndex];
  const isAnnotationGuideVisible = isAnnotationGuideManuallyOpen
    || (!hasSeenAnnotationGuide && !isAnnotationGuideDismissed);
  const initialChapterId = chapter?.id ?? null;
  const initialReaderAssignmentId = manuscript?.assignmentId ?? null;
  const shouldStartReading = manuscript?.status === "not-started";

  useEffect(() => {
    if (!initialReaderAssignmentId || !initialChapterId || !shouldStartReading) return;

    const startKey = `${initialReaderAssignmentId}:${initialChapterId}`;
    if (startedChapterRef.current === startKey) return;
    startedChapterRef.current = startKey;

    startReaderChapter(
      { chapterId: initialChapterId, readerAssignmentId: initialReaderAssignmentId },
      {
        onError(error) {
          startedChapterRef.current = null;
          toast.error(`Unable to save your reading progress: ${error.message}`);
        },
      },
    );
  }, [initialChapterId, initialReaderAssignmentId, shouldStartReading, startReaderChapter]);

  useEffect(() => () => {
    if (mobileSelectionCaptureTimeoutRef.current !== null) {
      window.clearTimeout(mobileSelectionCaptureTimeoutRef.current);
    }
  }, []);

  useEffect(() => {
    if (!manuscript) return;

    const canonicalPath = getReaderManuscriptPath(manuscript);
    if (pathname === canonicalPath) return;

    router.replace(
      readerSearchParams ? `${canonicalPath}?${readerSearchParams}` : canonicalPath,
      { scroll: false },
    );
  }, [manuscript, pathname, readerSearchParams, router]);

  useEffect(() => {
    if (
      !pendingReaderAssignmentId
      || !pendingReadingRoundId
      || !manuscript?.feedbackEnabled
      || completedChapterIds.length === 0
    ) return;

    loadDueSurveys(
      {
        completedChapterIds,
        isManuscriptComplete,
        readerAssignmentId: pendingReaderAssignmentId,
        readingRoundId: pendingReadingRoundId,
      },
      {
        onError(error) {
          toast.error(`Your pending survey could not be loaded: ${error.message}`);
        },
        onSuccess(surveys) {
          if (surveys.length === 0) return;
          enqueueDueSurveys(
            surveys,
            surveyQueue.length === 0 && surveys.some((survey) => survey.isNew),
          );
        },
      },
    );
  }, [
    completedChapterIds,
    completedChapterIdsKey,
    isManuscriptComplete,
    loadDueSurveys,
    pendingReaderAssignmentId,
    pendingReadingRoundId,
    manuscript?.feedbackEnabled,
    surveyQueue.length,
  ]);

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

  const progress = showEndScreen ? 100 : (currentChapterIndex + 1) / chapters.length * 100;
  const readerAssignmentId = manuscript.assignmentId;
  const readerCompletedChapterIds = manuscript.completedChapterIds;
  const readingRoundId = manuscript.readingRoundId;
  const readerUrl = `${getReaderManuscriptPath(manuscript)}?version=${manuscript.versionId}`;
  const activeSurvey = surveyQueue[0] ?? null;
  const isLastChapter = currentChapterIndex === chapters.length - 1;

  function enqueueDueSurveys(surveys: ReaderDueSurvey[], shouldOpenPrompt: boolean) {
    setSurveyQueue((current) => {
      const knownSurveyIds = new Set(current.map((survey) => survey.id));
      const newSurveys = surveys.filter((survey) => !knownSurveyIds.has(survey.id));
      return newSurveys.length > 0 ? [...current, ...newSurveys] : current;
    });

    if (shouldOpenPrompt) setIsSurveyPromptOpen(true);
  }

  function completeAndContinue() {
    completeChapterMutation.mutate(
      { chapterId: chapter.id, readerAssignmentId },
      {
        onSuccess() {
          toast.success("Chapter marked complete.");
          if (!isLastChapter) {
            setChapterIndex(currentChapterIndex + 1);
          }

          const nextCompletedChapterIds = [...new Set([...readerCompletedChapterIds, chapter.id])];
          const nextIsManuscriptComplete = chapters.every((item) => (
            nextCompletedChapterIds.includes(item.id)
          ));
          if (isReadingAgain && isLastChapter) {
            router.replace(readerUrl, { scroll: false });
          }

          loadDueSurveys(
            {
              completedChapterIds: nextCompletedChapterIds,
              isManuscriptComplete: nextIsManuscriptComplete,
              readerAssignmentId,
              readingRoundId,
            },
            {
              onError(error) {
                toast.error(`The chapter is saved, but its survey could not be loaded: ${error.message}`);
            },
            onSuccess(surveys) {
              if (surveys.length === 0) return;
              enqueueDueSurveys(
                surveys,
                surveyQueue.length === 0 && surveys.some((survey) => survey.isNew),
              );
            },
            },
          );
        },
        onError(error) {
          toast.error(error.message);
        },
      },
    );
  }

  function changeChapter(nextChapterIndex: number) {
    dismissMobileTextSelection();
    setAnnotationPanel(null);
    setIsGeneralCommentOpen(false);
    setChapterIndex(nextChapterIndex);
  }

  function changeDraft(nextVersionId: string) {
    if (nextVersionId === manuscriptVersionId) return;

    dismissMobileTextSelection();
    setAnnotationPanel(null);
    setIsGeneralCommentOpen(false);
    setChapterIndex(null);
    setIsSurveyPromptOpen(false);
    setSurveyQueue([]);
    const nextDraft = availableDrafts.find((draft) => draft.versionId === nextVersionId);
    if (!nextDraft) return;
    router.push(`${getReaderManuscriptPath(nextDraft)}?${new URLSearchParams({ version: nextVersionId })}`);
  }

  function dismissAnnotationGuide() {
    setIsAnnotationGuideDismissed(true);
    setIsAnnotationGuideManuallyOpen(false);

    try {
      window.localStorage.setItem(readerAnnotationGuideStorageKey, "seen");
    } catch {
      // Private browsing or disabled storage should not prevent reading.
    }
  }

  function showAnnotationGuide() {
    setIsAnnotationGuideDismissed(false);
    setIsAnnotationGuideManuallyOpen(true);
  }

  function submitSurvey(answers: ReaderSurveyAnswer[]) {
    if (!activeSurvey) return;

    submitSurveyMutation.mutate(
      {
        answers,
        readerAssignmentId,
        surveyId: activeSurvey.id,
      },
      {
        onError(error) {
          toast.error(error.message);
        },
        onSuccess() {
          toast.success("Feedback sent. Thank you.");
          setSurveyQueue((current) => current.slice(1));
          setIsSurveyPromptOpen(surveyQueue.length > 1);
        },
      },
    );
  }

  function getTextSelectionDraft() {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount !== 1 || selection.isCollapsed) return null;

    const range = selection.getRangeAt(0);
    const startBlockElement = getReaderBlockElement(range.startContainer);
    const endBlockElement = getReaderBlockElement(range.endContainer);

    if (!startBlockElement || !endBlockElement) return null;

    const startBlockId = startBlockElement.dataset.readerBlockId;
    const endBlockId = endBlockElement.dataset.readerBlockId;
    if (!startBlockId || !endBlockId) return null;

    const rawSelectionStart = getTextOffset(startBlockElement, range.startContainer, range.startOffset);
    const rawSelectionEnd = getTextOffset(endBlockElement, range.endContainer, range.endOffset);
    return createMultiBlockTextSelection({
      blocks: chapter.blocks,
      endBlockId,
      rawSelectionEnd,
      rawSelectionStart,
      startBlockId,
    });
  }

  function openTextSelectionDraft(selectionDraft: MultiBlockTextSelection) {
    if (selectionDraft.quote.length > 10_000) {
      toast.error("Select a passage shorter than 10,000 characters.");
      return;
    }

    const startBlockIndex = chapter.blocks.findIndex(
      (block) => block.id === selectionDraft.chapterBlockId,
    );
    const selectionEndBlockId = selectionDraft.selectionEndChapterBlockId
      ?? selectionDraft.chapterBlockId;
    const endBlockIndex = chapter.blocks.findIndex((block) => block.id === selectionEndBlockId);
    if (startBlockIndex === -1 || endBlockIndex < startBlockIndex) return;

    const startBlock = chapter.blocks[startBlockIndex];

    const matchingAnnotation = startBlock.annotations.find((annotation) => {
      const annotationEnd = getAnnotationEndAnchor(annotation);
      return annotation.chapterBlockId === selectionDraft.chapterBlockId
        && annotation.selectionStart === selectionDraft.selectionStart
        && annotationEnd.chapterBlockId === selectionEndBlockId
        && annotationEnd.selectionEnd === (
          selectionDraft.selectionEndOffset ?? selectionDraft.selectionEnd
        );
    });

    if (matchingAnnotation) {
      setAnnotationPanel({ annotation: matchingAnnotation, kind: "edit" });
      return;
    }

    const hasOverlappingAnnotation = chapter.blocks
      .slice(startBlockIndex, endBlockIndex + 1)
      .some((block, index, selectedBlocks) => {
        const isFirstBlock = index === 0;
        const isLastBlock = index === selectedBlocks.length - 1;
        const selectionStart = isFirstBlock ? selectionDraft.selectionStart : 0;
        const selectionEnd = isLastBlock
          ? selectionDraft.selectionEndOffset ?? selectionDraft.selectionEnd
          : block.content.length;

        return block.annotations.some(
          (annotation) => selectionStart < annotation.selectionEnd && selectionEnd > annotation.selectionStart,
        );
      });
    if (hasOverlappingAnnotation) {
      toast.error("This passage already overlaps one of your annotations. Click its highlight to edit it.");
      return;
    }

    setAnnotationPanel({
      draft: {
        chapterId: chapter.id,
        ...selectionDraft,
      },
      kind: "create",
    });
    dismissAnnotationGuide();
  }

  function handleTextSelection() {
    if (!manuscript?.feedbackEnabled || usesCoarsePointer()) return;

    const selectionDraft = getTextSelectionDraft();
    if (!selectionDraft) return;

    window.getSelection()?.removeAllRanges();
    openTextSelectionDraft(selectionDraft);
  }

  function captureMobileTextSelection() {
    if (!manuscript?.feedbackEnabled || !usesCoarsePointer()) return;

    if (mobileSelectionCaptureTimeoutRef.current !== null) {
      window.clearTimeout(mobileSelectionCaptureTimeoutRef.current);
    }

    mobileSelectionCaptureTimeoutRef.current = window.setTimeout(() => {
      mobileSelectionCaptureTimeoutRef.current = null;
      const selectionDraft = getTextSelectionDraft();

      if (!selectionDraft || selectionDraft.quote.length > 10_000) {
        setMobileSelectionDraft(null);
        return;
      }

      setMobileSelectionDraft(selectionDraft);
    }, 50);
  }

  function openMobileTextSelection() {
    if (!mobileSelectionDraft) return;

    window.getSelection()?.removeAllRanges();
    setMobileSelectionDraft(null);
    openTextSelectionDraft(mobileSelectionDraft);
  }

  function dismissMobileTextSelection() {
    if (mobileSelectionCaptureTimeoutRef.current !== null) {
      window.clearTimeout(mobileSelectionCaptureTimeoutRef.current);
      mobileSelectionCaptureTimeoutRef.current = null;
    }

    window.getSelection()?.removeAllRanges();
    setMobileSelectionDraft(null);
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
          <div className="flex items-center gap-2">
            {manuscript.feedbackEnabled ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-9 px-2 text-xs text-muted-foreground"
                onClick={showAnnotationGuide}
                aria-label="Show feedback instructions"
              >
                <CircleHelp className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="hidden lg:inline">How to leave feedback</span>
              </Button>
            ) : null}
            {surveyQueue.length > 0 ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 rounded-none border-foreground/15 bg-card text-xs"
                onClick={() => setIsSurveyPromptOpen(true)}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                {surveyQueue.length === 1 ? "Feedback waiting" : `${surveyQueue.length} feedback requests`}
              </Button>
            ) : null}
            {availableDrafts.length > 1 ? (
              <Select value={manuscript.versionId} onValueChange={changeDraft}>
                <SelectTrigger aria-label="Select draft" className="h-9 w-[150px] rounded-none border-foreground/15 bg-card text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableDrafts.map((draft) => (
                    <SelectItem key={draft.versionId} value={draft.versionId}>
                      {draft.title} · Draft {draft.versionNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : null}
            {!showEndScreen ? (
              <Select value={String(currentChapterIndex)} onValueChange={(value) => changeChapter(Number(value))}>
                <SelectTrigger className="h-9 w-[260px] rounded-none border-foreground/15 bg-card text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {chapters.map((item, index) => (
                    <SelectItem key={item.id} value={String(index)}>Ch {item.position}: {item.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : null}
          </div>
        </div>
      </header>

      {showEndScreen ? (
        <ReaderEndScreen
          closingNote={manuscript.closingNote}
          manuscriptTitle={manuscript.title}
          onReadAgain={() => {
            setChapterIndex(0);
            router.replace(`${readerUrl}&reread=1`, { scroll: false });
          }}
        />
      ) : <article
        className="reader-copy mx-auto max-w-[760px] px-5 py-12 pb-28 sm:px-10 sm:py-16 sm:pb-32"
        onMouseUp={manuscript.feedbackEnabled ? handleTextSelection : undefined}
        onTouchEnd={manuscript.feedbackEnabled ? captureMobileTextSelection : undefined}
      >
        <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">Chapter {chapter.position}</p>
        <Heading level={1} size="section" className="mt-4">{chapter.title}</Heading>
        {!manuscript.feedbackEnabled ? (
          <Alert className="mt-6 border-foreground/10 bg-muted/30">
            <AlertDescription>This draft is available to read. Feedback will open when the author opens its reading round.</AlertDescription>
          </Alert>
        ) : isAnnotationGuideVisible ? <ReaderAnnotationGuide onDismiss={dismissAnnotationGuide} /> : null}
        <div className={cn(
          "space-y-7 font-display text-[21px] leading-9 text-foreground/90 sm:text-[23px] sm:leading-10",
          isAnnotationGuideVisible ? "mt-8" : "mt-12",
        )}>
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
          {manuscript.feedbackEnabled ? (
            <Button size="sm" onClick={completeAndContinue} disabled={completeChapterMutation.isPending}>
              {completeChapterMutation.isPending
                ? "Saving…"
                : isLastChapter
                  ? "The end"
                  : "Complete & next"}
              {isLastChapter ? <Check className="h-3.5 w-3.5" /> : <ArrowRight className="h-3.5 w-3.5" />}
            </Button>
          ) : <Button size="sm" disabled>Feedback not open</Button>}
        </nav>
      </article>
      }

      {manuscript.feedbackEnabled && !showEndScreen ? (
        <Button
          type="button"
          size="sm"
          className="fixed bottom-5 right-5 z-30 h-11 rounded-none px-4 sm:bottom-7 sm:right-7"
          onClick={() => setIsGeneralCommentOpen(true)}
        >
          <MessageSquarePlus className="h-4 w-4" />
          {chapter.generalComment ? "Edit general annotation" : "General annotation"}
        </Button>
      ) : null}

      {mobileSelectionDraft ? (
        <MobileAnnotationActionBar
          onAnnotate={openMobileTextSelection}
          onDismiss={dismissMobileTextSelection}
        />
      ) : null}

      {annotationPanel ? (
        <ReaderAnnotationSheet
          key={annotationPanel.kind === "edit" ? annotationPanel.annotation.id : `${annotationPanel.draft.chapterBlockId}:${annotationPanel.draft.selectionStart}:${annotationPanel.draft.selectionEndChapterBlockId ?? ""}:${annotationPanel.draft.selectionEndOffset ?? annotationPanel.draft.selectionEnd}`}
          annotation={annotationPanel.kind === "edit" ? annotationPanel.annotation : undefined}
          draft={annotationPanel.kind === "create" ? annotationPanel.draft : undefined}
          readerAssignmentId={readerAssignmentId}
          onClose={() => setAnnotationPanel(null)}
        />
      ) : null}

      {isGeneralCommentOpen ? (
        <ReaderChapterGeneralCommentSheet
          key={chapter.id}
          chapterId={chapter.id}
          chapterPosition={chapter.position}
          chapterTitle={chapter.title}
          generalComment={chapter.generalComment}
          readerAssignmentId={readerAssignmentId}
          onClose={() => setIsGeneralCommentOpen(false)}
        />
      ) : null}

      {activeSurvey && isSurveyPromptOpen ? (
        <ReaderSurveyDialog
          key={activeSurvey.id}
          isSubmitting={submitSurveyMutation.isPending}
          onDefer={() => setIsSurveyPromptOpen(false)}
          onSubmit={submitSurvey}
          position={1}
          survey={activeSurvey}
          total={surveyQueue.length}
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
        const [segmentStart, segmentEnd] = segment.group
          ? [segment.group.start, segment.group.end]
          : getTextSegmentRange(segment.key);
        const start = segmentStart;
        const end = segmentEnd;
        if (!segment.group) {
          return <RichText key={segment.key} content={block.content} richContent={block.richContent} start={start} end={end} />;
        }

        const { annotations, color, hasMultipleTags } = segment.group;
        const count = annotations.length;
        const tagLabel = hasMultipleTags ? "multiple tags" : annotations[0].tag.label;

        return (
          <span
            key={segment.key}
            role="button"
            tabIndex={0}
            className={cn(
              "inline cursor-pointer rounded-sm border-0 px-0.5 text-inherit decoration-2 underline-offset-4 transition-colors hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              hasMultipleTags && "font-medium",
            )}
            style={{ backgroundColor: annotationBackgroundColor(color), textDecorationColor: color }}
            data-annotation-id={annotations[0].id}
            data-annotation-count={count}
            data-annotation-tag={tagLabel}
            onClick={(event) => {
              event.stopPropagation();
              onAnnotationClick(annotations[0]);
            }}
            onKeyDown={(event) => {
              if (event.key !== "Enter" && event.key !== " ") return;
              event.preventDefault();
              event.stopPropagation();
              onAnnotationClick(annotations[0]);
            }}
            aria-label={`${count} annotation${count > 1 ? "s" : ""} tagged ${tagLabel}. Open annotation.`}
          >
            <RichText content={block.content} richContent={block.richContent} start={start} end={end} />
            {count > 1 ? (
              <span
                className="ml-1 inline-flex h-4 min-w-4 translate-y-[-0.45em] items-center justify-center rounded-full px-1 align-super font-mono text-[8px] leading-none text-white"
                style={{ backgroundColor: color }}
                aria-hidden="true"
              >
                {count}
              </span>
            ) : null}
          </span>
        );
      })}
    </p>
  );
}

function getTextSegmentRange(key: string): [number, number] {
  const [, start, end] = key.split(":").map(Number);
  return [start, end];
}

function usesCoarsePointer() {
  return window.matchMedia("(pointer: coarse)").matches;
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
