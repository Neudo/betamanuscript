"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CircleHelp, MessageSquarePlus } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { BrandLogo } from "@/components/BrandLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { createMultiBlockTextSelection } from "@/features/annotations/lib/multi-block-annotations";
import {
  createPublicReaderAnnotation,
  createPublicReaderGeneralAnnotation,
  createReaderPlaceRequest,
} from "@/features/readers/api/public-reading";
import { ReaderAnnotationGuide } from "@/features/reading/components/ReaderAnnotationGuide";
import { ReaderAnnotationSheet } from "@/features/reading/components/ReaderAnnotationSheet";
import { ReaderChapterGeneralCommentSheet } from "@/features/reading/components/ReaderChapterGeneralCommentSheet";
import { PublicFeedbackAuthDialog } from "@/features/reading/components/PublicFeedbackAuthDialog";
import type { ReaderAnnotationDraft } from "@/features/reading/api/reading";
import {
  type PendingPublicFeedback,
  parsePendingPublicFeedback,
  pendingFeedbackStorageKey,
} from "@/features/reading/lib/public-feedback-draft";
import type { PublicReaderManuscript } from "@/features/reading/server/public-reading";
import { cn } from "@/lib/utils";
import { Heading } from "@/shared/ui/Heading";

type AnnotationPanel = {
  draft: ReaderAnnotationDraft;
  initialComment?: string;
  initialDisplayName?: string;
  initialTagId?: string;
};

type GeneralAnnotationPanel = {
  chapterId: string;
  initialComment?: string;
  initialDisplayName?: string;
};

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

function readPendingFeedback(accessLinkId: string): PendingPublicFeedback | null {
  try {
    return parsePendingPublicFeedback(
      window.sessionStorage.getItem(pendingFeedbackStorageKey(accessLinkId)),
    );
  } catch {
    // Storage is only a convenience for a draft; it is never an identity or access check.
  }

  return null;
}

function savePendingFeedback(accessLinkId: string, feedback: PendingPublicFeedback) {
  try {
    window.sessionStorage.setItem(pendingFeedbackStorageKey(accessLinkId), JSON.stringify(feedback));
  } catch {
    // Browsers that disable storage can still use the normal account flow.
  }
}

function clearPendingFeedback(accessLinkId: string) {
  try {
    window.sessionStorage.removeItem(pendingFeedbackStorageKey(accessLinkId));
  } catch {
    // Nothing to clear when session storage is unavailable.
  }
}

export function PublicReadingView({
  isAuthenticated,
  manuscript,
}: {
  isAuthenticated: boolean;
  manuscript: PublicReaderManuscript;
}) {
  const router = useRouter();
  const [chapterIndex, setChapterIndex] = useState(0);
  const [annotationPanel, setAnnotationPanel] = useState<AnnotationPanel | null>(null);
  const [generalAnnotationPanel, setGeneralAnnotationPanel] = useState<GeneralAnnotationPanel | null>(null);
  const [pendingFeedback, setPendingFeedback] = useState<PendingPublicFeedback | null>(null);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(true);
  const [isAtReaderLimit, setIsAtReaderLimit] = useState(false);
  const [isRequestingPlace, setIsRequestingPlace] = useState(false);
  const [hasRequestedPlace, setHasRequestedPlace] = useState(false);
  const pendingFeedbackSubmissionRef = useRef(false);
  const chapter = manuscript.chapters[chapterIndex];
  const next = `/read/${manuscript.accessLinkId}/reading`;
  const loginHref = `/login?next=${encodeURIComponent(next)}`;
  const signUpHref = `/signup?next=${encodeURIComponent(next)}`;
  const progress = manuscript.chapters.length > 0
    ? ((chapterIndex + 1) / manuscript.chapters.length) * 100
    : 0;

  const requestReaderPlace = useCallback(async () => {
    if (hasRequestedPlace) return;

    setIsRequestingPlace(true);
    try {
      await createReaderPlaceRequest(manuscript.accessLinkId);
      setHasRequestedPlace(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The place request could not be sent.");
    } finally {
      setIsRequestingPlace(false);
    }
  }, [hasRequestedPlace, manuscript.accessLinkId]);

  const saveAnnotation = useCallback(async (input: ReaderAnnotationDraft & { comment: string; tagId: string }) => {
    try {
      await createPublicReaderAnnotation({
        accessLinkId: manuscript.accessLinkId,
        ...input,
      });
      clearPendingFeedback(manuscript.accessLinkId);
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "The annotation could not be saved.";
      if (/reached its reader limit/i.test(message)) {
        setIsAtReaderLimit(true);
        await requestReaderPlace();
      }
      throw error;
    }
  }, [manuscript.accessLinkId, requestReaderPlace, router]);

  const saveGeneralAnnotation = useCallback(async (input: { chapterId: string; comment: string }) => {
    try {
      await createPublicReaderGeneralAnnotation({
        accessLinkId: manuscript.accessLinkId,
        ...input,
      });
      clearPendingFeedback(manuscript.accessLinkId);
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "The general annotation could not be saved.";
      if (/reached its reader limit/i.test(message)) {
        setIsAtReaderLimit(true);
        await requestReaderPlace();
      }
      throw error;
    }
  }, [manuscript.accessLinkId, requestReaderPlace, router]);

  useEffect(() => {
    if (!isAuthenticated || annotationPanel || generalAnnotationPanel) return;

    const pendingFeedback = readPendingFeedback(manuscript.accessLinkId);
    if (!pendingFeedback) return;

    const timeout = window.setTimeout(() => {
      if (pendingFeedback.kind === "annotation") {
        setAnnotationPanel({
          draft: pendingFeedback.draft,
          initialComment: pendingFeedback.comment,
          initialDisplayName: pendingFeedback.displayName,
          initialTagId: pendingFeedback.tagId,
        });
        return;
      }

      setGeneralAnnotationPanel({
        chapterId: pendingFeedback.chapterId,
        initialComment: pendingFeedback.comment,
        initialDisplayName: pendingFeedback.displayName,
      });
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [annotationPanel, generalAnnotationPanel, isAuthenticated, manuscript.accessLinkId]);

  useEffect(() => {
    if (isAuthenticated || !isAuthDialogOpen) return;

    function refreshSessionWhenReaderReturns() {
      if (document.visibilityState === "visible") {
        router.refresh();
      }
    }

    window.addEventListener("focus", refreshSessionWhenReaderReturns);
    return () => window.removeEventListener("focus", refreshSessionWhenReaderReturns);
  }, [isAuthenticated, isAuthDialogOpen, router]);

  useEffect(() => {
    if (!isAuthenticated || !isAuthDialogOpen || pendingFeedbackSubmissionRef.current) return;

    const pending = readPendingFeedback(manuscript.accessLinkId);
    if (!pending) return;

    const submissionTimer = window.setTimeout(() => {
      if (pendingFeedbackSubmissionRef.current) return;

      pendingFeedbackSubmissionRef.current = true;
      setAnnotationPanel(null);
      setGeneralAnnotationPanel(null);

      const save = pending.kind === "annotation"
        ? saveAnnotation({
          ...pending.draft,
          comment: pending.comment,
          tagId: pending.tagId,
        })
        : saveGeneralAnnotation({
          chapterId: pending.chapterId,
          comment: pending.comment,
        });

      void save
        .then(() => {
          setAnnotationPanel(null);
          setGeneralAnnotationPanel(null);
          setPendingFeedback(null);
          toast.success(pending.kind === "annotation" ? "Annotation saved." : "General annotation saved.");
        })
        .catch((error: unknown) => {
          const message = error instanceof Error ? error.message : "Your feedback could not be saved.";
          toast.error(message);

          if (pending.kind === "annotation") {
            setAnnotationPanel({
              draft: pending.draft,
              initialComment: pending.comment,
              initialDisplayName: pending.displayName,
              initialTagId: pending.tagId,
            });
            return;
          }

          setGeneralAnnotationPanel({
            chapterId: pending.chapterId,
            initialComment: pending.comment,
            initialDisplayName: pending.displayName,
          });
        });
    }, 0);

    return () => window.clearTimeout(submissionTimer);
  }, [isAuthenticated, isAuthDialogOpen, manuscript.accessLinkId, saveAnnotation, saveGeneralAnnotation]);

  const chapterById = useMemo(
    () => new Map(manuscript.chapters.map((item) => [item.id, item])),
    [manuscript.chapters],
  );

  if (!chapter) {
    return (
      <main className="mx-auto max-w-2xl p-8">
        <Heading level={1} size="page">This manuscript has no readable chapters yet.</Heading>
      </main>
    );
  }

  function promptForAuthentication(feedback: PendingPublicFeedback) {
    savePendingFeedback(manuscript.accessLinkId, feedback);
    setPendingFeedback(feedback);
    setIsAuthDialogOpen(true);
  }

  function promptForAnnotationAuthentication(input: ReaderAnnotationDraft & {
    comment: string;
    displayName: string;
    tagId: string;
  }) {
    const { comment, displayName, tagId, ...draft } = input;

    promptForAuthentication({
      comment,
      displayName,
      draft,
      kind: "annotation",
      tagId,
    });
  }

  async function askForPlace() {
    await requestReaderPlace();
  }

  function handleTextSelection() {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount !== 1 || selection.isCollapsed) return;

    const range = selection.getRangeAt(0);
    const startBlockElement = getReaderBlockElement(range.startContainer);
    const endBlockElement = getReaderBlockElement(range.endContainer);
    if (!startBlockElement || !endBlockElement) return;

    const startBlockId = startBlockElement.dataset.readerBlockId;
    const endBlockId = endBlockElement.dataset.readerBlockId;
    if (!startBlockId || !endBlockId) return;

    const selectionDraft = createMultiBlockTextSelection({
      blocks: chapter.blocks,
      endBlockId,
      rawSelectionEnd: getTextOffset(endBlockElement, range.endContainer, range.endOffset),
      rawSelectionStart: getTextOffset(startBlockElement, range.startContainer, range.startOffset),
      startBlockId,
    });
    selection.removeAllRanges();

    if (!selectionDraft) return;
    if (selectionDraft.quote.length > 10_000) {
      toast.error("Select a passage shorter than 10,000 characters.");
      return;
    }

    setAnnotationPanel({ draft: { chapterId: chapter.id, ...selectionDraft } });
  }

  const displayedGeneralChapter = generalAnnotationPanel
    ? chapterById.get(generalAnnotationPanel.chapterId) ?? null
    : null;

  return (
    <div className="relative min-h-full bg-surface">
      <Progress value={progress} className="sticky top-0 z-20 h-0.5 rounded-none" />

      <header className="sticky top-0.5 z-10 border-b border-foreground/10 bg-surface px-4 py-2 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <BrandLogo
              href="/"
              ariaLabel="BetaManuscript home"
              imageClassName="h-8 sm:h-9"
            />
            <span className="h-7 w-px bg-foreground/10" aria-hidden="true" />
            <p className="text-sm font-medium">{manuscript.title}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-9 px-2 text-xs text-muted-foreground"
              onClick={() => setIsGuideOpen((current) => !current)}
            >
              <CircleHelp className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden lg:inline">How to leave feedback</span>
            </Button>
            <ThemeToggle className="rounded-none" />
            {isAuthenticated ? (
              <Button asChild size="sm" className="h-9 rounded-none px-3 text-xs">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm" className="h-9 px-2 text-xs">
                  <Link href={loginHref}>Log in</Link>
                </Button>
                <Button asChild size="sm" className="h-9 rounded-none px-3 text-xs">
                  <Link href={signUpHref} target="_blank" rel="noopener">Create my account</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-5 pb-20 pt-10 sm:px-8 sm:pt-14">
        <div className="border-b border-foreground/10 pb-8">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary-text">Draft {manuscript.versionNumber}</p>
          <Heading level={1} size="page" className="mt-3">{chapter.title}</Heading>
          {manuscript.logline ? <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{manuscript.logline}</p> : null}
          {manuscript.readerNote ? (
            <blockquote className="mt-5 border-l-2 border-primary/40 bg-background/70 px-4 py-3 text-xs leading-5 text-muted-foreground">
              <span className="mr-2 font-mono text-xs uppercase tracking-[0.16em] text-primary-text">Note from the author</span>
              <span>{manuscript.readerNote}</span>
            </blockquote>
          ) : null}
        </div>

        <Alert className="mt-6 border-foreground/10 bg-muted/30">
          <AlertDescription>
            You can read freely. Select a passage or add a General annotation to start feedback; saving it requires a free BetaManuscript account.
          </AlertDescription>
        </Alert>

        {isAtReaderLimit ? (
          <Alert className="mt-4 border-primary/30 bg-primary/5">
            <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
              <span>
                {hasRequestedPlace
                  ? "Your request has been sent to the author."
                  : "This beta-reading round has reached its 5-reader limit. You can ask the author for a place."}
              </span>
              {!hasRequestedPlace ? (
                <Button size="sm" variant="outline" onClick={() => void askForPlace()} disabled={!isAuthenticated || isRequestingPlace}>
                  {isRequestingPlace ? "Sending…" : "Ask for a place"}
                </Button>
              ) : null}
            </AlertDescription>
          </Alert>
        ) : null}

        {isGuideOpen ? <ReaderAnnotationGuide onDismiss={() => setIsGuideOpen(false)} /> : null}

        <div
          className={cn(
            "space-y-7 pt-12 font-display text-[21px] leading-9 text-foreground/90 sm:text-[23px] sm:leading-10",
            isGuideOpen && "pt-8",
          )}
          onMouseUp={handleTextSelection}
        >
          {chapter.blocks.map((block) => <p key={block.id} data-reader-block-id={block.id}>{block.content}</p>)}
        </div>

        <div className="mt-12 flex justify-end border-t border-foreground/10 pt-6">
          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="sm" disabled={chapterIndex === 0} onClick={() => setChapterIndex((value) => Math.max(0, value - 1))}>
              <ArrowLeft className="h-3.5 w-3.5" />Previous
            </Button>
            <Button type="button" size="sm" disabled={chapterIndex === manuscript.chapters.length - 1} onClick={() => setChapterIndex((value) => Math.min(manuscript.chapters.length - 1, value + 1))}>
              Next<ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </main>

      <Button
        type="button"
        size="sm"
        className="fixed bottom-5 right-5 z-30 h-11 rounded-none px-4 sm:bottom-7 sm:right-7"
        onClick={() => setGeneralAnnotationPanel({ chapterId: chapter.id })}
      >
        <MessageSquarePlus className="h-4 w-4" />
        General annotation
      </Button>

      {annotationPanel ? (
        <ReaderAnnotationSheet
          key={`${annotationPanel.draft.chapterBlockId}:${annotationPanel.draft.selectionStart}:${annotationPanel.draft.selectionEnd}`}
          draft={annotationPanel.draft}
          initialComment={annotationPanel.initialComment}
          initialDisplayName={annotationPanel.initialDisplayName}
          initialTagId={annotationPanel.initialTagId}
          onAuthenticationRequired={isAuthenticated ? undefined : promptForAnnotationAuthentication}
          onClose={() => setAnnotationPanel(null)}
          onCreateAnnotation={isAuthenticated ? saveAnnotation : undefined}
          readerAssignmentId=""
          tags={manuscript.tags}
        />
      ) : null}

      {generalAnnotationPanel && displayedGeneralChapter ? (
        <ReaderChapterGeneralCommentSheet
          chapterId={displayedGeneralChapter.id}
          chapterPosition={displayedGeneralChapter.position}
          chapterTitle={displayedGeneralChapter.title}
          generalComment={null}
          initialComment={generalAnnotationPanel.initialComment}
          initialDisplayName={generalAnnotationPanel.initialDisplayName}
          onAuthenticationRequired={isAuthenticated ? undefined : (input) => promptForAuthentication({ kind: "general", ...input })}
          onClose={() => setGeneralAnnotationPanel(null)}
          onSaveGeneralAnnotation={isAuthenticated ? saveGeneralAnnotation : undefined}
          readerAssignmentId=""
        />
      ) : null}

      <PublicFeedbackAuthDialog
        displayName={pendingFeedback?.displayName ?? ""}
        next={next}
        open={!isAuthenticated && isAuthDialogOpen}
        onOpenChange={setIsAuthDialogOpen}
      />
    </div>
  );
}
