"use client";

import { Check, ChevronDown, EyeOff, Maximize2, MessageSquareText, PencilLine, Tags, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { type CSSProperties, useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  annotationBackgroundColor,
  annotationFocusedBackgroundColor,
  getTextAnnotationSegments,
} from "@/features/annotations/lib/text-annotations";
import { getAnnotationTagColor } from "@/features/annotations/lib/tag-colors";
import { getBlockAnnotationRanges } from "@/features/annotations/lib/multi-block-annotations";
import {
  useUpdateAnnotationSeenMutation,
  useUpdateManuscriptChapterMutation,
  useUpdateChapterStatusMutation,
  useUpdateGeneralCommentSeenMutation,
} from "@/features/manuscript/hooks/use-manuscript-mutations";
import {
  useManuscript,
  useManuscripts,
} from "@/features/manuscript/hooks/use-manuscripts";
import { RichTextEditor } from "@/features/manuscript/components/RichTextEditor";
import { RichText } from "@/features/manuscript/components/RichText";
import {
  ManuscriptFullPageState,
  NoManuscriptState,
} from "@/features/manuscript/components/ManuscriptFullPageState";
import type {
  ChapterEditorialStatus,
  ManuscriptWorkspaceAnnotation,
  ManuscriptWorkspaceBlock,
  ManuscriptWorkspaceChapter,
  ManuscriptWorkspaceGeneralComment,
} from "@/features/manuscript/types";
import {
  createRichTextDocument,
  getRichTextDocumentContent,
  type ManuscriptRichTextDocument,
} from "@/features/manuscript/lib/rich-text";
import { cn } from "@/lib/utils";
import { Heading } from "@/shared/ui/Heading";

const statusStyles: Record<ChapterEditorialStatus, string> = {
  complete: "border-success/25 bg-success/10 text-success",
  needs_work: "border-warning/25 bg-warning/10 text-warning",
  draft: "border-foreground/10 bg-foreground/[0.04] text-muted-foreground",
};

const statusLabels: Record<ChapterEditorialStatus, string> = {
  complete: "Complete",
  needs_work: "Needs work",
  draft: "Draft",
};

const wordCountFormat = new Intl.NumberFormat("en-US");
const annotationDateFormat = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
});
const generalAnnotationTag = {
  color: "#6B7280",
  label: "General annotation",
  slug: "__general_annotation__",
} as const;

type FeedbackTagFilter = {
  color: string;
  label: string;
  slug: string;
};

type FeedbackFiltersState = {
  hideReadFeedback: boolean;
  hiddenFeedbackTagSlugs: string[];
  scope: string;
};

type ChapterEditImpact = {
  generalFeedbackCount: number;
  inlineFeedbackCount: number;
};

function useDesktopLayout() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const updateIsDesktop = () => setIsDesktop(mediaQuery.matches);

    updateIsDesktop();
    mediaQuery.addEventListener("change", updateIsDesktop);
    return () => mediaQuery.removeEventListener("change", updateIsDesktop);
  }, []);

  return isDesktop;
}

function useScopedFeedbackFilters(scope: string) {
  const [filters, setFilters] = useState<FeedbackFiltersState>(() => ({
    hideReadFeedback: false,
    hiddenFeedbackTagSlugs: [],
    scope,
  }));

  if (filters.scope !== scope) {
    setFilters({
      hideReadFeedback: false,
      hiddenFeedbackTagSlugs: [],
      scope,
    });
  }

  return [filters, setFilters] as const;
}

export function ManuscriptWorkspace() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedManuscriptId = searchParams.get("manuscriptId");
  const selectedVersionIdFromUrl = searchParams.get("versionId");
  const focusedAnnotationIdFromUrl = searchParams.get("annotationId");
  const focusedGeneralCommentIdFromUrl = searchParams.get("generalCommentId");
  const selectedChapterIdFromUrl = searchParams.get("chapterId");
  const manuscriptsQuery = useManuscripts();
  const manuscriptId = selectedManuscriptId ?? manuscriptsQuery.data?.[0]?.id ?? null;
  const manuscriptQuery = useManuscript(manuscriptId, selectedVersionIdFromUrl);
  const [feedbackFilters, setFeedbackFilters] = useScopedFeedbackFilters(
    `${manuscriptId ?? "none"}:${selectedVersionIdFromUrl ?? "latest"}`,
  );
  const { hiddenFeedbackTagSlugs, hideReadFeedback } = feedbackFilters;
  const updateChapterStatus = useUpdateChapterStatusMutation();
  const updateAnnotationSeen = useUpdateAnnotationSeenMutation();
  const updateGeneralCommentSeen = useUpdateGeneralCommentSeenMutation();
  const updateManuscriptChapter = useUpdateManuscriptChapterMutation();
  const isDesktopLayout = useDesktopLayout();
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [editingDocument, setEditingDocument] = useState<ManuscriptRichTextDocument | null>(null);
  const [initialEditingDocument, setInitialEditingDocument] = useState<ManuscriptRichTextDocument | null>(null);
  const [isDiscardDialogOpen, setIsDiscardDialogOpen] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [pendingChapterUpdate, setPendingChapterUpdate] = useState<ChapterEditImpact | null>(null);

  useEffect(() => {
    if (!isFocusMode) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsFocusMode(false);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFocusMode]);

  useEffect(() => {
    if (!isFocusMode) return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousDocumentOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousDocumentOverflow;
    };
  }, [isFocusMode]);

  if (!manuscriptId && !manuscriptsQuery.isLoading) {
    return <NoManuscriptState />;
  }

  if (manuscriptQuery.isLoading || manuscriptsQuery.isLoading) {
    return <ManuscriptWorkspaceLoadingSkeleton />;
  }

  if (manuscriptQuery.isError) {
    return (
      <ManuscriptFullPageState
        title="The manuscript could not be loaded"
        description={manuscriptQuery.error.message}
      />
    );
  }

  const manuscript = manuscriptQuery.data;
  if (!manuscript) {
    return (
      <ManuscriptFullPageState
        title="This manuscript is no longer available"
        description="Choose another manuscript from the switcher."
      />
    );
  }

  const workspace = manuscript;

  const selectedChapter = manuscript.chapters.find(
    (chapter) => chapter.id === selectedChapterIdFromUrl,
  ) ?? manuscript.chapters[0];
  const isEditing = editingChapterId === selectedChapter?.id && editingDocument !== null;
  const hasUnsavedChanges = editingDocument !== null
    && initialEditingDocument !== null
    && JSON.stringify(editingDocument) !== JSON.stringify(initialEditingDocument);
  const completeCount = manuscript.chapters.filter(
    (chapter) => chapter.editorialStatus === "complete",
  ).length;
  if (!selectedChapter) {
    return (
      <ManuscriptFullPageState
        title={manuscript.title}
        description="This version has no chapters yet. Add one from the Draft section in the workspace sidebar, or import a source document when you create the next version."
      />
    );
  }

  const feedbackTags = getFeedbackTags(
    selectedChapter.annotations,
    selectedChapter.generalComments,
  );
  const feedbackTagSlugs = new Set(feedbackTags.map((tag) => tag.slug));
  const hiddenTagSlugsForChapter = hiddenFeedbackTagSlugs.filter(
    (slug) => feedbackTagSlugs.has(slug),
  );
  const visibleAnnotations = selectedChapter.annotations.filter((annotation) => (
    !hiddenTagSlugsForChapter.includes(annotation.tag.slug)
    && (!hideReadFeedback || !annotation.isSeenByAuthor)
  ));
  const visibleGeneralComments = selectedChapter.generalComments.filter((generalComment) => (
    !hiddenTagSlugsForChapter.includes(generalAnnotationTag.slug)
    && (!hideReadFeedback || !generalComment.isSeenByAuthor)
  ));
  const visibleFeedbackCount = visibleAnnotations.length + visibleGeneralComments.length;
  const totalFeedbackCount = selectedChapter.annotations.length + selectedChapter.generalComments.length;
  const hasActiveFeedbackFilters = hiddenTagSlugsForChapter.length > 0 || hideReadFeedback;

  const focusedAnnotationId = visibleAnnotations.some(
    (annotation) => annotation.id === focusedAnnotationIdFromUrl,
  ) ? focusedAnnotationIdFromUrl : null;
  const focusedGeneralCommentId = visibleGeneralComments.some(
    (generalComment) => generalComment.id === focusedGeneralCommentIdFromUrl,
  ) ? focusedGeneralCommentIdFromUrl : null;

  function handleStatusChange(status: ChapterEditorialStatus) {
    updateChapterStatus.mutate({
      chapterId: selectedChapter.id,
      manuscriptId: workspace.id,
      manuscriptVersionId: workspace.version?.id ?? "",
      status,
    });
  }

  function startEditing() {
    updateManuscriptChapter.reset();
    const document = createRichTextDocument(selectedChapter.blocks);
    setEditingChapterId(selectedChapter.id);
    setEditingDocument(document);
    setInitialEditingDocument(document);
    setPendingChapterUpdate(null);
  }

  function leaveEditing() {
    setEditingChapterId(null);
    setEditingDocument(null);
    setInitialEditingDocument(null);
    setPendingChapterUpdate(null);
    setIsDiscardDialogOpen(false);
    updateManuscriptChapter.reset();
  }

  function requestLeaveEditing() {
    if (updateManuscriptChapter.isPending) return;
    if (hasUnsavedChanges) {
      setIsDiscardDialogOpen(true);
      return;
    }

    leaveEditing();
  }

  async function persistEditingChanges() {
    if (!editingDocument || !hasUnsavedChanges || editingChapterId !== selectedChapter.id) return;

    try {
      await updateManuscriptChapter.mutateAsync({
        chapterId: selectedChapter.id,
        content: getRichTextDocumentContent(editingDocument),
        manuscriptId: workspace.id,
        richBlocks: editingDocument.blocks,
        title: selectedChapter.title,
      });
      setInitialEditingDocument(editingDocument);
      setPendingChapterUpdate(null);
    } catch {
      // The mutation state renders the database error above the manuscript.
    }
  }

  function requestSaveEditingChanges() {
    if (!editingDocument || !hasUnsavedChanges || editingChapterId !== selectedChapter.id || updateManuscriptChapter.isPending) return;

    const impact = getChapterEditImpact(
      selectedChapter,
      getRichTextDocumentContent(editingDocument),
    );
    if (impact.inlineFeedbackCount > 0 || impact.generalFeedbackCount > 0) {
      setPendingChapterUpdate(impact);
      return;
    }

    void persistEditingChanges();
  }

  function handleAnnotationSeen(annotation: ManuscriptWorkspaceAnnotation) {
    updateAnnotationSeen.mutate({
      annotationId: annotation.id,
      isSeen: !annotation.isSeenByAuthor,
      manuscriptId: workspace.id,
      manuscriptVersionId: workspace.version?.id ?? "",
    });
  }

  function handleGeneralCommentSeen(generalComment: ManuscriptWorkspaceGeneralComment) {
    updateGeneralCommentSeen.mutate({
      generalCommentId: generalComment.id,
      isSeen: !generalComment.isSeenByAuthor,
      manuscriptId: workspace.id,
      manuscriptVersionId: workspace.version?.id ?? "",
    });
  }

  function handleChapterSelect(chapterId: string) {
    const nextSearchParams = new URLSearchParams(searchParams.toString());
    nextSearchParams.delete("annotationId");
    nextSearchParams.delete("generalCommentId");
    nextSearchParams.set("chapterId", chapterId);
    router.replace(`${pathname}?${nextSearchParams.toString()}`, { scroll: false });
  }

  function handleAnnotationFocus(annotationId: string) {
    const nextSearchParams = new URLSearchParams(searchParams.toString());
    nextSearchParams.set("chapterId", selectedChapter.id);
    nextSearchParams.set("annotationId", annotationId);
    nextSearchParams.delete("generalCommentId");
    router.replace(`${pathname}?${nextSearchParams.toString()}`, { scroll: false });
  }

  function handleAnnotationFocusDismiss() {
    if (!focusedAnnotationIdFromUrl) return;

    const nextSearchParams = new URLSearchParams(searchParams.toString());
    nextSearchParams.delete("annotationId");
    const queryString = nextSearchParams.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  }

  function handleGeneralCommentFocusDismiss() {
    if (!focusedGeneralCommentIdFromUrl) return;

    const nextSearchParams = new URLSearchParams(searchParams.toString());
    nextSearchParams.delete("generalCommentId");
    const queryString = nextSearchParams.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  }

  function handleFeedbackTagVisibility(tagSlug: string) {
    setFeedbackFilters((filters) => ({
      ...filters,
      hiddenFeedbackTagSlugs: filters.hiddenFeedbackTagSlugs.includes(tagSlug)
        ? filters.hiddenFeedbackTagSlugs.filter((slug) => slug !== tagSlug)
        : [...filters.hiddenFeedbackTagSlugs, tagSlug],
    }));
  }

  function handleShowAllFeedbackTags() {
    setFeedbackFilters((filters) => ({
      ...filters,
      hiddenFeedbackTagSlugs: [],
    }));
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-background md:grid md:h-screen md:grid-cols-[minmax(0,1fr)_360px] md:overflow-hidden">
      <section className="min-w-0 md:flex md:min-h-0 md:flex-col">
        <header className="flex min-h-16 flex-col gap-3 border-b border-foreground/10 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
          <ChapterSwitcher
            chapters={manuscript.chapters}
            completeCount={completeCount}
            disabled={isEditing}
            onChapterSelect={handleChapterSelect}
            selectedChapter={selectedChapter}
          />
          <div className="grid w-full grid-cols-2 items-center gap-2 sm:flex sm:w-auto sm:flex-wrap sm:justify-end">
            <span className="col-span-2 font-mono text-[9px] text-muted-foreground sm:mr-2 sm:col-auto">
              {wordCountFormat.format(selectedChapter.wordCount)} words
            </span>
            <div className="min-w-0 [&_button]:w-full sm:[&_button]:w-auto">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={updateManuscriptChapter.isPending}
                onClick={isEditing ? requestLeaveEditing : startEditing}
                className="rounded-none"
              >
                {isEditing ? <X className="h-3.5 w-3.5" /> : <PencilLine className="h-3.5 w-3.5" />}
                {isEditing ? "Exit edit mode" : "Edit text"}
              </Button>
            </div>
            <div className="min-w-0 [&_button]:w-full sm:[&_button]:w-auto">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isEditing}
                onClick={() => setIsFocusMode(true)}
                title="Focus mode — press Escape to exit"
                className="rounded-none"
              >
                <Maximize2 className="h-3.5 w-3.5" />
                Focus mode
              </Button>
            </div>
            {!isDesktopLayout ? (
              <div>
                <AnnotationSheet
                  activeTags={feedbackTags}
                  annotations={visibleAnnotations}
                  chapterPosition={selectedChapter.position}
                  emptyMessage={hasActiveFeedbackFilters
                    ? "No feedback matches these filters."
                    : "No feedback in this chapter yet."}
                  focusedAnnotationId={focusedAnnotationId}
                  focusedGeneralCommentId={focusedGeneralCommentId}
                  generalComments={visibleGeneralComments}
                  hiddenTagSlugs={hiddenTagSlugsForChapter}
                  hideReadFeedback={hideReadFeedback}
                  isUpdating={updateAnnotationSeen.isPending || updateGeneralCommentSeen.isPending}
                  onFocusedAnnotationDismiss={handleAnnotationFocusDismiss}
                  onFocusedGeneralCommentDismiss={handleGeneralCommentFocusDismiss}
                  onAnnotationFocus={handleAnnotationFocus}
                  onShowAllTags={handleShowAllFeedbackTags}
                  onToggleGeneralCommentSeen={handleGeneralCommentSeen}
                  onToggleHideRead={() => setFeedbackFilters((filters) => ({
                    ...filters,
                    hideReadFeedback: !filters.hideReadFeedback,
                  }))}
                  onToggleSeen={handleAnnotationSeen}
                  onToggleTag={handleFeedbackTagVisibility}
                  triggerClassName="w-full sm:w-auto"
                />
              </div>
            ) : null}
            <Select
              value={selectedChapter.editorialStatus}
              onValueChange={(value) => handleStatusChange(value as ChapterEditorialStatus)}
              disabled={updateChapterStatus.isPending || isEditing}
            >
              <SelectTrigger
                className={cn(
                  "col-span-2 h-9 w-full rounded-none border-foreground/15 font-mono text-[10px] sm:w-[138px]",
                  statusStyles[selectedChapter.editorialStatus],
                )}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(statusLabels).map(([status, label]) => (
                  <SelectItem key={status} value={status}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </header>

        {(updateChapterStatus.isError || updateAnnotationSeen.isError || updateGeneralCommentSeen.isError || updateManuscriptChapter.isError) ? (
          <p className="border-b border-destructive/20 bg-destructive/5 px-5 py-3 text-xs text-destructive">
            {(updateChapterStatus.error ?? updateAnnotationSeen.error ?? updateGeneralCommentSeen.error ?? updateManuscriptChapter.error)?.message}
          </p>
        ) : null}

        <ScrollArea className="md:min-h-0 md:flex-1">
          <article className={cn(
            "reader-copy mx-auto max-w-3xl px-5 pt-10 sm:px-10 sm:pt-14",
            isEditing ? "pb-40 sm:pb-32" : "pb-10 sm:pb-14",
          )}>
            <Heading level={2}>{selectedChapter.title}</Heading>
            {isEditing && editingDocument ? (
              <div className="mt-10">
                <RichTextEditor
                  id={`chapter-editor-${selectedChapter.id}`}
                  value={editingDocument}
                  onChange={setEditingDocument}
                  disabled={updateManuscriptChapter.isPending}
                  footerAction={(
                    <Button
                      type="button"
                      size="lg"
                      disabled={!hasUnsavedChanges || updateManuscriptChapter.isPending}
                      onClick={requestSaveEditingChanges}
                      className="h-11 w-full min-w-[11.5rem] rounded-none px-5 shadow-[0_8px_18px_rgba(28,24,18,0.18)] sm:w-auto"
                    >
                      {updateManuscriptChapter.isPending ? "Saving…" : "Save changes"}
                    </Button>
                  )}
                  variant="workspace"
                />
              </div>
            ) : selectedChapter.blocks.length > 0 ? (
              <div className="mt-10 space-y-6 font-display text-[20px] leading-8 text-foreground/90 sm:text-[22px] sm:leading-9">
                {selectedChapter.blocks.map((block) => (
                  <ChapterBlock
                    key={block.id}
                    block={block}
                    focusedAnnotationId={focusedAnnotationId}
                    annotations={getBlockAnnotationRanges(
                      selectedChapter.blocks,
                      block,
                      visibleAnnotations,
                    )}
                    onAnnotationFocus={handleAnnotationFocus}
                  />
                ))}
              </div>
            ) : (
              <div className="mt-10 border border-dashed border-foreground/15 p-8 text-center text-sm text-muted-foreground">
                This chapter has no imported content yet.
              </div>
            )}
          </article>
        </ScrollArea>
      </section>

      <aside className="hidden min-h-0 border-l border-foreground/10 bg-sidebar/45 md:flex md:flex-col">
        <div className="flex min-h-16 items-center justify-between gap-3 border-b border-foreground/10 px-5 py-3">
          <div className="min-w-0">
            <Heading level={2} size="small">Feedback</Heading>
            <span className="mt-0.5 block font-mono text-[9px] text-muted-foreground">
              {hasActiveFeedbackFilters
                ? `${visibleFeedbackCount} of ${totalFeedbackCount} shown`
                : `${totalFeedbackCount} total`}
            </span>
          </div>
          <FeedbackFilters
            activeTags={feedbackTags}
            hiddenTagSlugs={hiddenTagSlugsForChapter}
            hideReadFeedback={hideReadFeedback}
            onShowAllTags={handleShowAllFeedbackTags}
            onToggleHideRead={() => setFeedbackFilters((filters) => ({
              ...filters,
              hideReadFeedback: !filters.hideReadFeedback,
            }))}
            onToggleTag={handleFeedbackTagVisibility}
          />
        </div>
        <ScrollArea className="min-h-0 flex-1">
          <FeedbackList
            annotations={visibleAnnotations}
            focusedAnnotationId={focusedAnnotationId}
            focusedGeneralCommentId={focusedGeneralCommentId}
            generalComments={visibleGeneralComments}
            isUpdating={updateAnnotationSeen.isPending || updateGeneralCommentSeen.isPending}
            onAnnotationFocus={handleAnnotationFocus}
            onToggleGeneralCommentSeen={handleGeneralCommentSeen}
            onToggleSeen={handleAnnotationSeen}
            className="p-4"
            emptyMessage={hasActiveFeedbackFilters
              ? "No feedback matches these filters."
              : "No feedback in this chapter yet."}
          />
        </ScrollArea>
      </aside>

      <AlertDialog open={isEditing && isDiscardDialogOpen} onOpenChange={setIsDiscardDialogOpen}>
        <AlertDialogContent className="rounded-none border-foreground/15 bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription>
              The chapter will return to its last saved version.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction onClick={leaveEditing} className="rounded-none">
              Discard changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isEditing && Boolean(pendingChapterUpdate)} onOpenChange={(open) => {
        if (!updateManuscriptChapter.isPending && !open) setPendingChapterUpdate(null);
      }}>
        <AlertDialogContent className="rounded-none border-foreground/15 bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Archive affected feedback?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingChapterUpdate?.inlineFeedbackCount ? (
                <>
                  {pendingChapterUpdate.inlineFeedbackCount} inline {pendingChapterUpdate.inlineFeedbackCount === 1 ? "feedback entry" : "feedback entries"} will be archived because {pendingChapterUpdate.inlineFeedbackCount === 1 ? "its selected passage no longer exists" : "their selected passages no longer exist"}.
                </>
              ) : null}
              {pendingChapterUpdate?.inlineFeedbackCount && pendingChapterUpdate.generalFeedbackCount ? " " : null}
              {pendingChapterUpdate?.generalFeedbackCount ? (
                <>
                  {pendingChapterUpdate.generalFeedbackCount} general {pendingChapterUpdate.generalFeedbackCount === 1 ? "annotation" : "annotations"} will also be archived because this chapter is being fully replaced.
                </>
              ) : null}
              {" "}Archived feedback remains available only on the Feedback page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updateManuscriptChapter.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={updateManuscriptChapter.isPending}
              onClick={(event) => {
                event.preventDefault();
                void persistEditingChanges();
              }}
              className="rounded-none"
            >
              {updateManuscriptChapter.isPending ? "Saving…" : "Save and archive feedback"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {isFocusMode ? (
        <FocusReadingMode
          blocks={selectedChapter.blocks}
          onExit={() => setIsFocusMode(false)}
          title={selectedChapter.title}
        />
      ) : null}
    </div>
  );
}

export function ManuscriptWorkspaceLoadingSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading manuscript workspace"
      role="status"
      className="min-h-[calc(100vh-3.5rem)] bg-background md:grid md:h-screen md:grid-cols-[minmax(0,1fr)_360px] md:overflow-hidden"
    >
      <span className="sr-only">Loading manuscript workspace</span>

      <section className="min-w-0 md:flex md:min-h-0 md:flex-col" aria-hidden="true">
        <header className="flex min-h-16 flex-col gap-3 border-b border-foreground/10 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-9 w-full max-w-[17rem] rounded-none sm:w-64" />
          <div className="grid w-full grid-cols-2 items-center gap-2 sm:flex sm:w-auto sm:flex-wrap sm:justify-end">
            <Skeleton className="col-span-2 h-3 w-20 sm:mr-2 sm:col-auto" />
            <Skeleton className="h-9 w-full rounded-none sm:w-28" />
            <Skeleton className="h-9 w-full rounded-none sm:w-[138px]" />
          </div>
        </header>

        <div className="md:min-h-0 md:flex-1">
          <article className="reader-copy mx-auto max-w-3xl px-5 py-10 sm:px-10 sm:py-14">
            <Skeleton className="h-9 w-3/5 max-w-80 rounded-none" />
            <div className="mt-10 space-y-10">
              {["w-full", "w-[93%]", "w-[88%]", "w-[96%]", "w-[72%]", "w-[91%]", "w-[84%]", "w-[63%]"].map((width, index) => (
                <Skeleton
                  key={`${width}-${index}`}
                  className={`h-5 ${width} rounded-none bg-foreground/[0.07]`}
                />
              ))}
            </div>
          </article>
        </div>
      </section>

      <aside className="hidden min-h-0 border-l border-foreground/10 bg-sidebar/45 md:flex md:flex-col" aria-hidden="true">
        <div className="flex min-h-16 items-center justify-between gap-3 border-b border-foreground/10 px-5 py-3">
          <div className="space-y-2">
            <Skeleton className="h-5 w-20 rounded-none" />
            <Skeleton className="h-3 w-14" />
          </div>
          <Skeleton className="h-8 w-24 rounded-none" />
        </div>
        <div className="space-y-3 p-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="border border-foreground/10 bg-card/65 p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-3 w-24 rounded-none" />
                  <Skeleton className="h-3 w-16 rounded-none" />
                </div>
                <Skeleton className="h-3 w-8" />
              </div>
              <div className="mt-4 space-y-2">
                <Skeleton className="h-3 w-full rounded-none" />
                <Skeleton className="h-3 w-4/5 rounded-none" />
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

function ChapterSwitcher({
  chapters,
  completeCount,
  disabled = false,
  onChapterSelect,
  selectedChapter,
}: {
  chapters: ManuscriptWorkspaceChapter[];
  completeCount: number;
  disabled?: boolean;
  onChapterSelect: (chapterId: string) => void;
  selectedChapter: ManuscriptWorkspaceChapter;
}) {
  return (
    <Heading level={1} size="small" className="min-w-0">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            disabled={disabled}
            className="h-9 min-w-0 max-w-full justify-start gap-3 rounded-none border border-foreground/15 bg-background px-3 text-left hover:bg-foreground/[0.04] data-[state=open]:bg-foreground/[0.06]"
            aria-label="Choose chapter"
          >
            <span className="shrink-0 font-mono text-[9px] font-normal text-muted-foreground">
              Ch {selectedChapter.position}
            </span>
            <span className="truncate">{selectedChapter.title}</span>
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          sideOffset={10}
          className="w-[min(26rem,calc(100vw-2.5rem))] rounded-none border-foreground/10 bg-card p-1 shadow-[0_12px_32px_rgba(28,24,18,0.14)]"
        >
          <DropdownMenuLabel className="px-3 pb-2 pt-2 font-mono text-[9px] font-normal uppercase tracking-widest text-muted-foreground">
            Chapters · {completeCount}/{chapters.length} complete
          </DropdownMenuLabel>
          {chapters.map((chapter) => {
            const isSelected = chapter.id === selectedChapter.id;
            const feedbackCount = chapter.annotations.length + chapter.generalComments.length;

            return (
              <DropdownMenuItem
                key={chapter.id}
                onSelect={() => onChapterSelect(chapter.id)}
                className={cn(
                  "items-start gap-3 rounded-none px-3 py-3 focus:bg-foreground/[0.05]",
                  isSelected && "bg-foreground/[0.055]",
                )}
              >
                <span className="mt-0.5 w-5 shrink-0 text-center font-mono text-[10px] text-muted-foreground">
                  {chapter.position}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-medium">{chapter.title}</span>
                  <span className="mt-1 block font-mono text-[9px] text-muted-foreground">
                    {wordCountFormat.format(chapter.wordCount)} words · {feedbackCount} feedback
                  </span>
                </span>
                <Badge
                  variant="outline"
                  className={cn(
                    "mt-0.5 shrink-0 rounded-none font-mono text-[8px] uppercase",
                    statusStyles[chapter.editorialStatus],
                  )}
                >
                  {statusLabels[chapter.editorialStatus]}
                </Badge>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </Heading>
  );
}

function ChapterBlock({
  annotations,
  block,
  focusedAnnotationId,
  onAnnotationFocus,
}: {
  annotations: ManuscriptWorkspaceAnnotation[];
  block: ManuscriptWorkspaceBlock;
  focusedAnnotationId: string | null;
  onAnnotationFocus: (annotationId: string) => void;
}) {
  if (block.kind === "scene_break") {
    return <p className="py-3 text-center tracking-[0.35em] text-muted-foreground">* * *</p>;
  }

  if (block.kind === "heading") {
    return <Heading level={3} className="pt-3"><AnnotatedChapterText content={block.content} richContent={block.richContent} annotations={annotations} focusedAnnotationId={focusedAnnotationId} onAnnotationFocus={onAnnotationFocus} /></Heading>;
  }

  if (block.kind === "blockquote") {
    return <blockquote className="border-l-2 border-primary/40 pl-5 italic"><AnnotatedChapterText content={block.content} richContent={block.richContent} annotations={annotations} focusedAnnotationId={focusedAnnotationId} onAnnotationFocus={onAnnotationFocus} /></blockquote>;
  }

  return <p><AnnotatedChapterText content={block.content} richContent={block.richContent} annotations={annotations} focusedAnnotationId={focusedAnnotationId} onAnnotationFocus={onAnnotationFocus} /></p>;
}

function FocusReadingMode({
  blocks,
  onExit,
  title,
}: {
  blocks: ManuscriptWorkspaceBlock[];
  onExit: () => void;
  title: string;
}) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Focus reading mode"
      className="focus-reading-surface fixed inset-0 z-[var(--layer-tooltip)] isolate overflow-y-auto overscroll-contain bg-background"
    >
      <p className="sr-only">Focus mode. Press Escape to return to the manuscript workspace.</p>
      <Button
        type="button"
        variant="default"
        size="sm"
        onClick={onExit}
        autoFocus
        className="focus-reading-exit fixed right-4 top-4 z-10 rounded-none shadow-[0_8px_18px_rgba(28,24,18,0.16)] sm:right-6 sm:top-6"
      >
        <X className="h-3.5 w-3.5" />
        Exit focus mode
      </Button>
      <article className="focus-reading-copy reader-copy mx-auto max-w-[760px] px-5 py-12 sm:px-10 sm:py-20">
        <Heading level={1} size="section" className="mb-10 sm:mb-14">
          {title}
        </Heading>
        <div className="space-y-6 font-display text-[20px] leading-8 text-foreground/90 sm:text-[22px] sm:leading-9">
          {blocks.map((block) => (
            <ChapterBlock
              key={block.id}
              block={block}
              annotations={[]}
              focusedAnnotationId={null}
              onAnnotationFocus={() => undefined}
            />
          ))}
        </div>
      </article>
    </div>,
    document.body,
  );
}

function getChapterEditImpact(chapter: ManuscriptWorkspaceChapter, nextContent: string): ChapterEditImpact {
  const currentContent = chapter.blocks.map((block) => block.content).join("\n\n");
  const normalizedCurrentContent = normalizeChapterContent(currentContent);
  const normalizedNextContent = normalizeChapterContent(nextContent);

  if (normalizedCurrentContent === normalizedNextContent) {
    return { generalFeedbackCount: 0, inlineFeedbackCount: 0 };
  }

  const inlineFeedbackCount = chapter.annotations.filter((annotation) => (
    !normalizedNextContent.includes(annotation.quote)
  )).length;
  const currentBlocks = chapter.blocks.map((block) => block.content).filter(Boolean);
  const isCompleteReplacement = currentBlocks.length > 0 && currentBlocks.every((block) => (
    !normalizedNextContent.includes(block)
  ));

  return {
    generalFeedbackCount: isCompleteReplacement ? chapter.generalComments.length : 0,
    inlineFeedbackCount,
  };
}

function normalizeChapterContent(content: string) {
  return content
    .replace(/\r\n?/g, "\n")
    .split(/\n[\t ]*\n+/)
    .map((block) => block.trim())
    .filter(Boolean)
    .join("\n\n");
}

function AnnotatedChapterText({
  annotations,
  content,
  focusedAnnotationId,
  onAnnotationFocus,
  richContent,
}: {
  annotations: ManuscriptWorkspaceAnnotation[];
  content: string;
  focusedAnnotationId: string | null;
  onAnnotationFocus: (annotationId: string) => void;
  richContent: ManuscriptWorkspaceBlock["richContent"];
}) {
  const segments = getTextAnnotationSegments(content, annotations);

  return segments.map((segment) => {
    const [segmentStart, segmentEnd] = segment.group
      ? [segment.group.start, segment.group.end]
      : getTextSegmentRange(segment.key);
    const start = segmentStart;
    const end = segmentEnd;
    if (!segment.group) {
      return <RichText key={segment.key} content={content} richContent={richContent} start={start} end={end} />;
    }

    const { annotations: groupedAnnotations, color, hasMultipleTags } = segment.group;
    const count = groupedAnnotations.length;
    const tagLabel = hasMultipleTags ? "multiple tags" : groupedAnnotations[0].tag.label;
    const isFocused = focusedAnnotationId !== null && groupedAnnotations.some(
      (annotation) => annotation.id === focusedAnnotationId,
    );

    return (
      <mark
        key={segment.key}
        ref={isFocused ? (node) => {
          if (!node) return;
          requestAnimationFrame(() => node.scrollIntoView({ behavior: "smooth", block: "center" }));
        } : undefined}
        className={cn(
          "annotation-highlight cursor-pointer rounded-sm px-0.5 text-inherit decoration-2 underline-offset-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          isFocused && "annotation-highlight--focused",
        )}
        style={{
          "--annotation-highlight-background": annotationBackgroundColor(color),
          "--annotation-highlight-focus-dark": annotationFocusedBackgroundColor(color, "dark"),
          "--annotation-highlight-focus-light": annotationFocusedBackgroundColor(color, "light"),
          textDecorationColor: color,
        } as CSSProperties}
        title={`${count} annotation${count > 1 ? "s" : ""} · ${tagLabel}`}
        role="button"
        tabIndex={0}
        onClick={() => onAnnotationFocus(groupedAnnotations[0].id)}
        onKeyDown={(event) => {
          if (event.key !== "Enter" && event.key !== " ") return;
          event.preventDefault();
          onAnnotationFocus(groupedAnnotations[0].id);
        }}
      >
        <RichText content={content} richContent={richContent} start={start} end={end} />
        {count > 1 ? (
          <span
            className="ml-1 inline-flex h-4 min-w-4 translate-y-[-0.45em] items-center justify-center rounded-full px-1 align-super font-mono text-[8px] leading-none text-white"
            style={{ backgroundColor: color }}
            aria-label={`${count} annotations`}
          >
            {count}
          </span>
        ) : null}
      </mark>
    );
  });
}

function getTextSegmentRange(key: string): [number, number] {
  const [, start, end] = key.split(":").map(Number);
  return [start, end];
}

function AnnotationSheet({
  activeTags,
  annotations,
  chapterPosition,
  emptyMessage,
  focusedAnnotationId,
  focusedGeneralCommentId,
  generalComments,
  hiddenTagSlugs,
  hideReadFeedback,
  isUpdating,
  onFocusedAnnotationDismiss,
  onFocusedGeneralCommentDismiss,
  onAnnotationFocus,
  onShowAllTags,
  onToggleGeneralCommentSeen,
  onToggleHideRead,
  onToggleSeen,
  onToggleTag,
  triggerClassName,
}: {
  activeTags: FeedbackTagFilter[];
  annotations: ManuscriptWorkspaceAnnotation[];
  chapterPosition: number;
  emptyMessage: string;
  focusedAnnotationId: string | null;
  focusedGeneralCommentId: string | null;
  generalComments: ManuscriptWorkspaceGeneralComment[];
  hiddenTagSlugs: string[];
  hideReadFeedback: boolean;
  isUpdating: boolean;
  onFocusedAnnotationDismiss: () => void;
  onFocusedGeneralCommentDismiss: () => void;
  onAnnotationFocus: (annotationId: string) => void;
  onShowAllTags: () => void;
  onToggleGeneralCommentSeen: (generalComment: ManuscriptWorkspaceGeneralComment) => void;
  onToggleHideRead: () => void;
  onToggleSeen: (annotation: ManuscriptWorkspaceAnnotation) => void;
  onToggleTag: (tagSlug: string) => void;
  triggerClassName?: string;
}) {
  const feedbackCount = annotations.length + generalComments.length;
  const seenCount = annotations.filter((annotation) => annotation.isSeenByAuthor).length
    + generalComments.filter((generalComment) => generalComment.isSeenByAuthor).length;
  const focusedAnnotation = annotations.find((annotation) => annotation.id === focusedAnnotationId) ?? null;
  const focusedGeneralComment = generalComments.find(
    (generalComment) => generalComment.id === focusedGeneralCommentId,
  ) ?? null;
  const [isOpen, setIsOpen] = useState(false);

  function handleOpenChange(open: boolean) {
    if (!open && focusedAnnotation) onFocusedAnnotationDismiss();
    if (!open && focusedGeneralComment) onFocusedGeneralCommentDismiss();
    setIsOpen(open);
  }

  return (
    <Sheet open={isOpen || Boolean(focusedAnnotation) || Boolean(focusedGeneralComment)} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className={triggerClassName}>
          <MessageSquareText className="h-3.5 w-3.5" />
          {feedbackCount} feedback
          {seenCount > 0 ? <span className="text-success">· {seenCount} read</span> : null}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="text-[28px] font-medium">Chapter feedback</SheetTitle>
          <SheetDescription>
            General annotations and passage annotations for chapter {chapterPosition}.
          </SheetDescription>
          <FeedbackFilters
            activeTags={activeTags}
            hiddenTagSlugs={hiddenTagSlugs}
            hideReadFeedback={hideReadFeedback}
            onShowAllTags={onShowAllTags}
            onToggleHideRead={onToggleHideRead}
            onToggleTag={onToggleTag}
            className="pt-2"
          />
        </SheetHeader>
        <FeedbackList
          annotations={annotations}
          focusedAnnotationId={focusedAnnotationId}
          focusedGeneralCommentId={focusedGeneralCommentId}
          generalComments={generalComments}
          isUpdating={isUpdating}
          onAnnotationFocus={onAnnotationFocus}
          onToggleGeneralCommentSeen={onToggleGeneralCommentSeen}
          onToggleSeen={onToggleSeen}
          className="mt-6"
          emptyMessage={emptyMessage}
        />
      </SheetContent>
    </Sheet>
  );
}

function FeedbackFilters({
  activeTags,
  className,
  hiddenTagSlugs,
  hideReadFeedback,
  onShowAllTags,
  onToggleHideRead,
  onToggleTag,
}: {
  activeTags: FeedbackTagFilter[];
  className?: string;
  hiddenTagSlugs: string[];
  hideReadFeedback: boolean;
  onShowAllTags: () => void;
  onToggleHideRead: () => void;
  onToggleTag: (tagSlug: string) => void;
}) {
  const visibleTagCount = activeTags.filter((tag) => !hiddenTagSlugs.includes(tag.slug)).length;
  const hasHiddenTags = hiddenTagSlugs.length > 0;

  return (
    <div className={cn("flex shrink-0 items-center gap-1.5", className)}>
      {activeTags.length > 0 ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-label="Filter feedback by tag"
              className={cn(
                "h-8 gap-1.5 rounded-none border-foreground/15 bg-background/50 px-2.5 text-[10px]",
                hasHiddenTags && "border-foreground bg-foreground text-background hover:bg-foreground/90",
              )}
            >
              <Tags className="h-3.5 w-3.5" />
              <span>Tags</span>
              <span className={cn("font-mono text-[9px] text-muted-foreground", hasHiddenTags && "text-background/65")}>
                {visibleTagCount}/{activeTags.length}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="w-56 rounded-none border-foreground/10 bg-card p-1 shadow-[0_12px_32px_rgba(28,24,18,0.14)]"
          >
            <DropdownMenuLabel className="px-3 pb-2 pt-2 font-mono text-[9px] font-normal uppercase tracking-widest text-muted-foreground">
              Visible feedback tags
            </DropdownMenuLabel>
            {activeTags.map((tag) => {
              const isVisible = !hiddenTagSlugs.includes(tag.slug);

              return (
                <DropdownMenuCheckboxItem
                  key={tag.slug}
                  checked={isVisible}
                  onCheckedChange={() => onToggleTag(tag.slug)}
                  onSelect={(event) => event.preventDefault()}
                  className="rounded-none py-2 pl-8 text-xs focus:bg-foreground/[0.05]"
                >
                  <span className="mr-2 h-2 w-2 shrink-0" style={{ backgroundColor: tag.color }} aria-hidden />
                  <span className="truncate">{tag.label}</span>
                </DropdownMenuCheckboxItem>
              );
            })}
            {hasHiddenTags ? (
              <>
                <DropdownMenuSeparator className="bg-foreground/10" />
                <DropdownMenuItem
                  onSelect={onShowAllTags}
                  className="justify-center rounded-none py-2 font-mono text-[9px] uppercase tracking-widest text-muted-foreground focus:bg-foreground/[0.05]"
                >
                  Show all tags
                </DropdownMenuItem>
              </>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}

      <Button
        type="button"
        variant="outline"
        size="sm"
        aria-pressed={hideReadFeedback}
        onClick={onToggleHideRead}
        className={cn(
          "h-8 min-w-[102px] gap-1.5 rounded-none border-foreground/15 bg-background/50 px-2.5 text-[10px]",
          hideReadFeedback && "border-foreground bg-foreground text-background hover:bg-foreground/90",
        )}
      >
        <EyeOff className="h-3.5 w-3.5" />
        <span>{hideReadFeedback ? "Read hidden" : "Hide read"}</span>
      </Button>
    </div>
  );
}

function FeedbackList({
  annotations,
  className,
  emptyMessage = "No feedback in this chapter yet.",
  focusedAnnotationId,
  focusedGeneralCommentId,
  generalComments,
  isUpdating,
  onAnnotationFocus,
  onToggleGeneralCommentSeen,
  onToggleSeen,
}: {
  annotations: ManuscriptWorkspaceAnnotation[];
  className?: string;
  emptyMessage?: string;
  focusedAnnotationId: string | null;
  focusedGeneralCommentId: string | null;
  generalComments: ManuscriptWorkspaceGeneralComment[];
  isUpdating: boolean;
  onAnnotationFocus: (annotationId: string) => void;
  onToggleGeneralCommentSeen: (generalComment: ManuscriptWorkspaceGeneralComment) => void;
  onToggleSeen: (annotation: ManuscriptWorkspaceAnnotation) => void;
}) {
  const feedbackCount = annotations.length + generalComments.length;

  return (
    <div className={cn("space-y-3", className)}>
      {generalComments.length > 0 ? (
        <>
          <p className="pt-1 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
            General annotations
          </p>
          {generalComments.map((generalComment) => {
            const isSeen = generalComment.isSeenByAuthor;

            return (
              <article
                key={generalComment.id}
                ref={generalComment.id === focusedGeneralCommentId ? (node) => {
                  if (!node) return;
                  requestAnimationFrame(() => node.scrollIntoView({ behavior: "smooth", block: "center" }));
                } : undefined}
                className={cn(
                  "border border-foreground/10 bg-card/65 p-4",
                  isSeen && "bg-muted/55 text-muted-foreground",
                  generalComment.id === focusedGeneralCommentId && "ring-2 ring-primary ring-offset-2",
                )}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "grid h-8 w-8 place-items-center rounded-full bg-primary text-xs text-primary-foreground",
                      isSeen && "grayscale",
                    )}
                  >
                    {getInitials(generalComment.readerName)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium">{generalComment.readerName}</p>
                    <Badge
                      variant="outline"
                      className={cn(
                        "mt-1 rounded-none font-mono text-[9px] uppercase",
                        isSeen && "grayscale opacity-60",
                      )}
                    >
                      General annotation
                    </Badge>
                  </div>
                  <span className="font-mono text-[9px] text-muted-foreground">
                    {annotationDateFormat.format(new Date(generalComment.createdAt))}
                  </span>
                </div>
                <p className={cn("mt-4 whitespace-pre-wrap text-sm leading-6", isSeen && "line-through")}>
                  {generalComment.comment}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isUpdating}
                  className={cn(
                    "mt-3 px-0",
                    isSeen ? "text-success" : "underline underline-offset-4",
                  )}
                  onClick={() => onToggleGeneralCommentSeen(generalComment)}
                >
                  <Check className="h-3.5 w-3.5" />
                  {isSeen ? "Read — undo" : "Mark as read"}
                </Button>
              </article>
            );
          })}
        </>
      ) : null}
      {annotations.length > 0 && generalComments.length > 0 ? (
        <p className="pt-3 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
          Passage annotations
        </p>
      ) : null}
      {annotations.map((annotation) => {
        const isSeen = annotation.isSeenByAuthor;
        const tagColor = getAnnotationTagColor(annotation.tag);

        return (
          <article
            key={annotation.id}
            ref={annotation.id === focusedAnnotationId ? (node) => {
              if (!node) return;
              requestAnimationFrame(() => node.scrollIntoView({ behavior: "smooth", block: "center" }));
            } : undefined}
            className={cn(
              "border border-foreground/10 bg-card/65 p-4",
              isSeen && "bg-muted/55 text-muted-foreground",
              annotation.id === focusedAnnotationId && "ring-2 ring-primary ring-offset-2",
            )}
          >
            <div
              aria-label={`Show annotated passage from ${annotation.readerName}`}
              className="cursor-pointer rounded-none outline-none transition-colors hover:bg-foreground/[0.025] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              role="button"
              tabIndex={0}
              onClick={() => onAnnotationFocus(annotation.id)}
              onKeyDown={(event) => {
                if (event.key !== "Enter" && event.key !== " ") return;
                event.preventDefault();
                onAnnotationFocus(annotation.id);
              }}
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "grid h-8 w-8 place-items-center rounded-full border text-xs text-foreground",
                    isSeen && "grayscale",
                  )}
                  style={{ backgroundColor: "hsl(var(--muted))", borderColor: tagColor }}
                >
                  {getInitials(annotation.readerName)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium">{annotation.readerName}</p>
                  <Badge
                    variant="outline"
                    className={cn(
                      "mt-1 gap-1.5 rounded-none font-mono text-[9px] uppercase",
                      isSeen && "grayscale opacity-60",
                    )}
                    style={{ borderColor: "hsl(var(--border))", color: "hsl(var(--foreground))" }}
                  >
                    <span className="h-1.5 w-1.5 shrink-0" style={{ backgroundColor: tagColor }} aria-hidden />
                    {annotation.tag.label}
                  </Badge>
                </div>
                <span className="font-mono text-[9px] text-muted-foreground">
                  {annotationDateFormat.format(new Date(annotation.createdAt))}
                </span>
              </div>
              <blockquote
                className={cn(
                  "mt-4 whitespace-pre-wrap border-l-2 pl-3 text-sm leading-6",
                  isSeen && "line-through",
                )}
                style={{ borderLeftColor: tagColor }}
              >
                “{annotation.comment ?? annotation.quote}”
              </blockquote>
            </div>
            <Button
              variant="ghost"
              size="sm"
              disabled={isUpdating}
              className={cn(
                "mt-3 px-0",
                isSeen ? "text-success" : "underline underline-offset-4",
              )}
              onClick={() => onToggleSeen(annotation)}
            >
              <Check className="h-3.5 w-3.5" />
              {isSeen ? "Read — undo" : "Mark as read"}
            </Button>
          </article>
        );
      })}
      {feedbackCount === 0 ? (
        <div className="border border-dashed border-foreground/15 p-8 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </div>
      ) : null}
    </div>
  );
}

function getFeedbackTags(
  annotations: ManuscriptWorkspaceAnnotation[],
  generalComments: ManuscriptWorkspaceGeneralComment[],
): FeedbackTagFilter[] {
  const tagsBySlug = new Map(
    annotations.map((annotation) => [annotation.tag.slug, annotation.tag]),
  );

  return [
    ...(generalComments.length > 0 ? [generalAnnotationTag] : []),
    ...[...tagsBySlug.values()].map((tag) => ({
      color: getAnnotationTagColor(tag),
      label: tag.label,
      slug: tag.slug,
    })),
  ];
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}
