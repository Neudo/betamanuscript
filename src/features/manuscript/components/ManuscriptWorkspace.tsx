"use client";

import { Check, MessageSquareText, Plus } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { type ReactNode, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  getTextAnnotationSegments,
} from "@/features/annotations/lib/text-annotations";
import {
  useUpdateAnnotationSeenMutation,
  useUpdateChapterStatusMutation,
} from "@/features/manuscript/hooks/use-manuscript-mutations";
import {
  useManuscript,
  useManuscripts,
} from "@/features/manuscript/hooks/use-manuscripts";
import { CreateManuscriptDialog } from "@/features/manuscript/components/CreateManuscriptDialog";
import { ManuscriptSettingsDialog } from "@/features/manuscript/components/ManuscriptSettingsDialog";
import type {
  ChapterEditorialStatus,
  ManuscriptWorkspaceAnnotation,
  ManuscriptWorkspaceBlock,
} from "@/features/manuscript/types";
import { cn } from "@/lib/utils";

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

export function ManuscriptWorkspace() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedManuscriptId = searchParams.get("manuscriptId");
  const focusedAnnotationIdFromUrl = searchParams.get("annotationId");
  const selectedChapterIdFromUrl = searchParams.get("chapterId");
  const manuscriptsQuery = useManuscripts();
  const manuscriptId = selectedManuscriptId ?? manuscriptsQuery.data?.[0]?.id ?? null;
  const manuscriptQuery = useManuscript(manuscriptId);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const updateChapterStatus = useUpdateChapterStatusMutation();
  const updateAnnotationSeen = useUpdateAnnotationSeenMutation();

  function handleManuscriptDeleted() {
    const nextSearchParams = new URLSearchParams(searchParams.toString());
    nextSearchParams.delete("manuscriptId");
    const queryString = nextSearchParams.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
  }

  if (!manuscriptId && !manuscriptsQuery.isLoading) {
    return (
      <WorkspaceMessage title="No manuscript yet">
        <CreateManuscriptDialog>
          <Button className="mt-5" size="sm">
            <Plus className="h-3.5 w-3.5" />
            Create manuscript
          </Button>
        </CreateManuscriptDialog>
      </WorkspaceMessage>
    );
  }

  if (manuscriptQuery.isLoading || manuscriptsQuery.isLoading) {
    return (
      <WorkspaceMessage
        title="Loading manuscript"
        description="Fetching your chapters and their current editorial state."
      />
    );
  }

  if (manuscriptQuery.isError) {
    return (
      <WorkspaceMessage
        title="The manuscript could not be loaded"
        description={manuscriptQuery.error.message}
      />
    );
  }

  const manuscript = manuscriptQuery.data;
  if (!manuscript) {
    return (
      <WorkspaceMessage
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
  const progress = manuscript.chapters.length > 0
    ? Math.round((completeCount / manuscript.chapters.length) * 100)
    : 0;

  if (!selectedChapter) {
    return (
      <WorkspaceMessage
        title={manuscript.title}
        description="This version has no chapters yet. Importing a source document will be the next manuscript slice."
      />
    );
  }

  const focusedAnnotationId = selectedChapter.annotations.some(
    (annotation) => annotation.id === focusedAnnotationIdFromUrl,
  ) ? focusedAnnotationIdFromUrl : null;

  function handleStatusChange(status: ChapterEditorialStatus) {
    updateChapterStatus.mutate({
      chapterId: selectedChapter.id,
      manuscriptId: workspace.id,
      status,
    });
  }

  function handleAnnotationSeen(annotation: ManuscriptWorkspaceAnnotation) {
    updateAnnotationSeen.mutate({
      annotationId: annotation.id,
      isSeen: !annotation.isSeenByAuthor,
      manuscriptId: workspace.id,
    });
  }

  function handleChapterSelect(chapterId: string) {
    setSelectedChapterId(chapterId);
    if (!focusedAnnotationIdFromUrl) return;

    const nextSearchParams = new URLSearchParams(searchParams.toString());
    nextSearchParams.delete("annotationId");
    nextSearchParams.set("chapterId", chapterId);
    router.replace(`${pathname}?${nextSearchParams.toString()}`, { scroll: false });
  }

  function handleAnnotationFocusDismiss() {
    if (!focusedAnnotationIdFromUrl) return;

    const nextSearchParams = new URLSearchParams(searchParams.toString());
    nextSearchParams.delete("annotationId");
    const queryString = nextSearchParams.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  }

  return (
    <div className="grid min-h-[calc(100vh-3.5rem)] md:h-screen md:grid-cols-[280px_minmax(0,1fr)] md:overflow-hidden">
      <aside className="border-r border-foreground/10 bg-sidebar/70 md:flex md:min-h-0 md:flex-col">
        <div className="border-b border-foreground/10 p-5">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                Manuscript
              </p>
              <p className="mt-2 text-sm font-medium leading-snug">{manuscript.title}</p>
              <p className="mt-1 font-mono text-[9px] text-muted-foreground">
                Draft {manuscript.version?.number ?? "—"} · {wordCountFormat.format(manuscript.totalWordCount)} words · {completeCount}/{manuscript.chapters.length} complete
              </p>
            </div>
            <ManuscriptSettingsDialog
              manuscript={manuscript}
              onDeleted={handleManuscriptDeleted}
            />
          </div>
        </div>

        <div className="border-b border-foreground/10 bg-card px-5 py-3">
          <div className="mb-2 flex items-center justify-between font-mono text-[9px] text-muted-foreground">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-1 rounded-none" />
        </div>

        <ScrollArea className="md:flex-1">
          <div className="divide-y divide-foreground/[0.08]">
            {manuscript.chapters.map((chapter) => (
              <button
                key={chapter.id}
                type="button"
                onClick={() => handleChapterSelect(chapter.id)}
                className={cn(
                  "grid w-full grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-3 border-l-2 border-l-transparent px-4 py-4 text-left transition-colors hover:bg-foreground/[0.035]",
                  selectedChapter.id === chapter.id && "border-l-primary bg-foreground/[0.055]",
                )}
              >
                <span className="text-center font-mono text-[10px] text-muted-foreground">
                  {chapter.position}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-xs font-medium">{chapter.title}</span>
                  <span className="mt-1 block font-mono text-[9px] text-muted-foreground">
                    {wordCountFormat.format(chapter.wordCount)} words · <MessageSquareText className="inline h-2.5 w-2.5" /> {chapter.annotations.length}
                  </span>
                </span>
                <Badge
                  variant="outline"
                  className={cn(
                    "rounded-none font-mono text-[8px] uppercase",
                    statusStyles[chapter.editorialStatus],
                  )}
                >
                  {statusLabels[chapter.editorialStatus]}
                </Badge>
              </button>
            ))}
          </div>
        </ScrollArea>
      </aside>

      <section className="min-w-0 bg-background md:flex md:min-h-0 md:flex-col">
        <div className="flex min-h-16 flex-col gap-3 border-b border-foreground/10 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <span className="shrink-0 font-mono text-[9px] text-muted-foreground">
              Ch {selectedChapter.position}
            </span>
            <h1 className="truncate text-base font-medium">{selectedChapter.title}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-2 font-mono text-[9px] text-muted-foreground">
              {wordCountFormat.format(selectedChapter.wordCount)} words
            </span>
            <AnnotationSheet
              annotations={selectedChapter.annotations}
              chapterPosition={selectedChapter.position}
              focusedAnnotationId={focusedAnnotationId}
              isUpdating={updateAnnotationSeen.isPending}
              onFocusedAnnotationDismiss={handleAnnotationFocusDismiss}
              onToggleSeen={handleAnnotationSeen}
            />
            <Select
              value={selectedChapter.editorialStatus}
              onValueChange={(value) => handleStatusChange(value as ChapterEditorialStatus)}
              disabled={updateChapterStatus.isPending}
            >
              <SelectTrigger
                className={cn(
                  "h-9 w-[138px] rounded-none border-foreground/15 font-mono text-[10px]",
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
        </div>

        {(updateChapterStatus.isError || updateAnnotationSeen.isError) ? (
          <p className="border-b border-destructive/20 bg-destructive/5 px-5 py-3 text-xs text-destructive">
            {(updateChapterStatus.error ?? updateAnnotationSeen.error)?.message}
          </p>
        ) : null}

        <ScrollArea className="md:flex-1">
          <article className="reader-copy mx-auto max-w-3xl px-5 py-10 sm:px-10 sm:py-14">
            <h2 className="font-display text-[42px] leading-none">{selectedChapter.title}</h2>
            {selectedChapter.blocks.length > 0 ? (
              <div className="mt-10 space-y-6 font-display text-[20px] leading-8 text-foreground/90 sm:text-[22px] sm:leading-9">
                {selectedChapter.blocks.map((block) => (
                  <ChapterBlock
                    key={block.id}
                    block={block}
                    focusedAnnotationId={focusedAnnotationId}
                    annotations={selectedChapter.annotations.filter(
                      (annotation) => annotation.chapterBlockId === block.id,
                    )}
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
    </div>
  );
}

function ChapterBlock({
  annotations,
  block,
  focusedAnnotationId,
}: {
  annotations: ManuscriptWorkspaceAnnotation[];
  block: ManuscriptWorkspaceBlock;
  focusedAnnotationId: string | null;
}) {
  if (block.kind === "scene_break") {
    return <p className="py-3 text-center tracking-[0.35em] text-muted-foreground">* * *</p>;
  }

  if (block.kind === "heading") {
    return <h3 className="pt-3 text-2xl font-medium"><AnnotatedChapterText content={block.content} annotations={annotations} focusedAnnotationId={focusedAnnotationId} /></h3>;
  }

  if (block.kind === "blockquote") {
    return <blockquote className="border-l-2 border-primary/40 pl-5 italic"><AnnotatedChapterText content={block.content} annotations={annotations} focusedAnnotationId={focusedAnnotationId} /></blockquote>;
  }

  return <p><AnnotatedChapterText content={block.content} annotations={annotations} focusedAnnotationId={focusedAnnotationId} /></p>;
}

function AnnotatedChapterText({
  annotations,
  content,
  focusedAnnotationId,
}: {
  annotations: ManuscriptWorkspaceAnnotation[];
  content: string;
  focusedAnnotationId: string | null;
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
          "rounded-sm px-0.5 text-inherit decoration-2 underline-offset-4",
          isFocused && "ring-2 ring-primary ring-offset-2",
        )}
        style={{ backgroundColor: annotationBackgroundColor(color), textDecorationColor: color }}
        title={`${count} annotation${count > 1 ? "s" : ""} · ${tagLabel}`}
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
  annotations,
  chapterPosition,
  focusedAnnotationId,
  isUpdating,
  onFocusedAnnotationDismiss,
  onToggleSeen,
}: {
  annotations: ManuscriptWorkspaceAnnotation[];
  chapterPosition: number;
  focusedAnnotationId: string | null;
  isUpdating: boolean;
  onFocusedAnnotationDismiss: () => void;
  onToggleSeen: (annotation: ManuscriptWorkspaceAnnotation) => void;
}) {
  const seenCount = annotations.filter((annotation) => annotation.isSeenByAuthor).length;
  const focusedAnnotation = annotations.find((annotation) => annotation.id === focusedAnnotationId) ?? null;
  const [isOpen, setIsOpen] = useState(false);

  function handleOpenChange(open: boolean) {
    if (!open && focusedAnnotation) onFocusedAnnotationDismiss();
    setIsOpen(open);
  }

  return (
    <Sheet open={isOpen || Boolean(focusedAnnotation)} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <MessageSquareText className="h-3.5 w-3.5" />
          {annotations.length} annotations
          {seenCount > 0 ? <span className="text-success">· {seenCount} read</span> : null}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="text-[28px] font-medium">Chapter annotations</SheetTitle>
          <SheetDescription>
            Comments tied to passages in chapter {chapterPosition}.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-3">
          {annotations.length > 0 ? annotations.map((annotation) => {
            const isSeen = annotation.isSeenByAuthor;

            return (
              <article
                key={annotation.id}
                ref={annotation.id === focusedAnnotationId ? (node) => {
                  if (!node) return;
                  requestAnimationFrame(() => node.scrollIntoView({ behavior: "smooth", block: "center" }));
                } : undefined}
                className={cn(
                  "border border-foreground/10 p-4",
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
                        "mt-1 rounded-none font-mono text-[9px] uppercase",
                        isSeen && "grayscale opacity-60",
                      )}
                      style={{ borderColor: annotation.tag.color, color: annotation.tag.color }}
                    >
                      {annotation.tag.label}
                    </Badge>
                  </div>
                  <span className="font-mono text-[9px] text-muted-foreground">
                    {annotationDateFormat.format(new Date(annotation.createdAt))}
                  </span>
                </div>
                <blockquote
                  className={cn(
                    "mt-4 border-l-2 pl-3 text-sm leading-6",
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
                  className={cn("mt-3 px-0", isSeen && "text-success")}
                  onClick={() => onToggleSeen(annotation)}
                >
                  <Check className="h-3.5 w-3.5" />
                  {isSeen ? "Read — undo" : "Mark as read"}
                </Button>
              </article>
            );
          }) : (
            <div className="border border-dashed border-foreground/15 p-8 text-center text-sm text-muted-foreground">
              No annotations in this chapter yet.
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function WorkspaceMessage({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center bg-background px-6 text-center">
      <div className="max-w-sm">
        <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
          Manuscript workspace
        </p>
        <h1 className="mt-3 text-xl font-medium">{title}</h1>
        {description ? (
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
        ) : null}
        {children}
      </div>
    </div>
  );
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
