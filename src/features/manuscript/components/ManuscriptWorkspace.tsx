"use client";

import { Check, ChevronDown, EyeOff, MessageSquareText, Tags } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { type CSSProperties, useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { getBlockAnnotationRanges } from "@/features/annotations/lib/multi-block-annotations";
import {
  useUpdateAnnotationSeenMutation,
  useUpdateChapterStatusMutation,
  useUpdateGeneralCommentSeenMutation,
} from "@/features/manuscript/hooks/use-manuscript-mutations";
import {
  useManuscript,
  useManuscripts,
} from "@/features/manuscript/hooks/use-manuscripts";
import { ChapterManagerDialog } from "@/features/manuscript/components/ChapterManagerDialog";
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
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [hiddenFeedbackTagSlugs, setHiddenFeedbackTagSlugs] = useState<string[]>([]);
  const [hideReadFeedback, setHideReadFeedback] = useState(false);
  const updateChapterStatus = useUpdateChapterStatusMutation();
  const updateAnnotationSeen = useUpdateAnnotationSeenMutation();
  const updateGeneralCommentSeen = useUpdateGeneralCommentSeenMutation();
  const isDesktopLayout = useDesktopLayout();

  useEffect(() => {
    const loadedVersionId = manuscriptQuery.data?.version?.id;
    if (!loadedVersionId || loadedVersionId === selectedVersionIdFromUrl) return;

    const nextSearchParams = new URLSearchParams(searchParams.toString());
    nextSearchParams.set("versionId", loadedVersionId);
    router.replace(`${pathname}?${nextSearchParams.toString()}`, { scroll: false });
  }, [manuscriptQuery.data?.version?.id, pathname, router, searchParams, selectedVersionIdFromUrl]);

  useEffect(() => {
    setSelectedChapterId(null);
  }, [selectedVersionIdFromUrl]);

  useEffect(() => {
    setHiddenFeedbackTagSlugs([]);
    setHideReadFeedback(false);
  }, [manuscriptId, selectedVersionIdFromUrl]);

  if (!manuscriptId && !manuscriptsQuery.isLoading) {
    return <NoManuscriptState />;
  }

  if (manuscriptQuery.isLoading || manuscriptsQuery.isLoading) {
    return (
      <ManuscriptFullPageState
        title="Loading manuscript"
        description="Fetching your chapters and their current editorial state."
      />
    );
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
    (chapter) => chapter.id === (selectedChapterId ?? selectedChapterIdFromUrl),
  ) ?? manuscript.chapters[0];
  const completeCount = manuscript.chapters.filter(
    (chapter) => chapter.editorialStatus === "complete",
  ).length;
  if (!selectedChapter) {
    return (
      <ManuscriptFullPageState
        title={manuscript.title}
        description="This version has no chapters yet. Add one now, or import a source document when you create the next version."
      >
        <div className="mt-5 flex flex-wrap justify-center">
          <ChapterManagerDialog manuscript={manuscript} onChapterSelected={handleChapterSelect} />
        </div>
      </ManuscriptFullPageState>
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
    setSelectedChapterId(chapterId);
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
    setHiddenFeedbackTagSlugs((hiddenTags) => (
      hiddenTags.includes(tagSlug)
        ? hiddenTags.filter((slug) => slug !== tagSlug)
        : [...hiddenTags, tagSlug]
    ));
  }

  function handleShowAllFeedbackTags() {
    setHiddenFeedbackTagSlugs([]);
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-background md:grid md:h-screen md:grid-cols-[minmax(0,1fr)_360px] md:overflow-hidden">
      <section className="min-w-0 md:flex md:min-h-0 md:flex-col">
        <header className="flex min-h-16 flex-col gap-3 border-b border-foreground/10 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
          <ChapterSwitcher
            chapters={manuscript.chapters}
            completeCount={completeCount}
            onChapterSelect={handleChapterSelect}
            selectedChapter={selectedChapter}
          />
          <div className="grid w-full grid-cols-2 items-center gap-2 sm:flex sm:w-auto sm:flex-wrap sm:justify-end">
            <span className="col-span-2 font-mono text-[9px] text-muted-foreground sm:mr-2 sm:col-auto">
              {wordCountFormat.format(selectedChapter.wordCount)} words
            </span>
            <div className="min-w-0 [&_button]:w-full sm:[&_button]:w-auto">
              <ChapterManagerDialog manuscript={manuscript} onChapterSelected={handleChapterSelect} />
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
                  onShowAllTags={handleShowAllFeedbackTags}
                  onToggleGeneralCommentSeen={handleGeneralCommentSeen}
                  onToggleHideRead={() => setHideReadFeedback((hidden) => !hidden)}
                  onToggleSeen={handleAnnotationSeen}
                  onToggleTag={handleFeedbackTagVisibility}
                  triggerClassName="w-full sm:w-auto"
                />
              </div>
            ) : null}
            <Select
              value={selectedChapter.editorialStatus}
              onValueChange={(value) => handleStatusChange(value as ChapterEditorialStatus)}
              disabled={updateChapterStatus.isPending}
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

        {(updateChapterStatus.isError || updateAnnotationSeen.isError || updateGeneralCommentSeen.isError) ? (
          <p className="border-b border-destructive/20 bg-destructive/5 px-5 py-3 text-xs text-destructive">
            {(updateChapterStatus.error ?? updateAnnotationSeen.error ?? updateGeneralCommentSeen.error)?.message}
          </p>
        ) : null}

        <ScrollArea className="md:min-h-0 md:flex-1">
          <article className="reader-copy mx-auto max-w-3xl px-5 py-10 sm:px-10 sm:py-14">
            <Heading level={2}>{selectedChapter.title}</Heading>
            {selectedChapter.blocks.length > 0 ? (
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
            onToggleHideRead={() => setHideReadFeedback((hidden) => !hidden)}
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
            onToggleGeneralCommentSeen={handleGeneralCommentSeen}
            onToggleSeen={handleAnnotationSeen}
            className="p-4"
            emptyMessage={hasActiveFeedbackFilters
              ? "No feedback matches these filters."
              : "No feedback in this chapter yet."}
          />
        </ScrollArea>
      </aside>
    </div>
  );
}

function ChapterSwitcher({
  chapters,
  completeCount,
  onChapterSelect,
  selectedChapter,
}: {
  chapters: ManuscriptWorkspaceChapter[];
  completeCount: number;
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
    return <Heading level={3} className="pt-3"><AnnotatedChapterText content={block.content} annotations={annotations} focusedAnnotationId={focusedAnnotationId} onAnnotationFocus={onAnnotationFocus} /></Heading>;
  }

  if (block.kind === "blockquote") {
    return <blockquote className="border-l-2 border-primary/40 pl-5 italic"><AnnotatedChapterText content={block.content} annotations={annotations} focusedAnnotationId={focusedAnnotationId} onAnnotationFocus={onAnnotationFocus} /></blockquote>;
  }

  return <p><AnnotatedChapterText content={block.content} annotations={annotations} focusedAnnotationId={focusedAnnotationId} onAnnotationFocus={onAnnotationFocus} /></p>;
}

function AnnotatedChapterText({
  annotations,
  content,
  focusedAnnotationId,
  onAnnotationFocus,
}: {
  annotations: ManuscriptWorkspaceAnnotation[];
  content: string;
  focusedAnnotationId: string | null;
  onAnnotationFocus: (annotationId: string) => void;
}) {
  const segments = getTextAnnotationSegments(content, annotations);

  return segments.map((segment) => {
    if (!segment.group) return segment.content;

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
        {segment.content}
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
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "grid h-8 w-8 place-items-center rounded-full text-xs text-white",
                  isSeen && "grayscale",
                )}
                style={{ backgroundColor: annotation.tag.color }}
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
                  <span className="h-1.5 w-1.5 shrink-0" style={{ backgroundColor: annotation.tag.color }} aria-hidden />
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
              style={{ borderLeftColor: annotation.tag.color }}
            >
              “{annotation.comment ?? annotation.quote}”
            </blockquote>
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
      color: tag.color,
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
