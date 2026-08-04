"use client";

import { Archive, Check, Eye, EyeOff, LoaderCircle, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AccountPlan } from "@/features/account/types";
import { getAnnotationTagColor, getAnnotationTagTint } from "@/features/annotations/lib/tag-colors";
import { FeedbackTagManagerDialog } from "@/features/feedback/components/FeedbackTagManagerDialog";
import {
  useArchiveFeedbackMutation,
  useDeleteArchivedFeedbackMutation,
  useManuscriptFeedback,
  useUpdateFeedbackSeenMutation,
} from "@/features/feedback/hooks/use-feedback";
import {
  getFeedbackFilterPreferencesStorageKey,
  useFeedbackFilterPreferences,
} from "@/features/feedback/hooks/use-feedback-filter-preferences";
import type { FeedbackAnnotation, FeedbackTag } from "@/features/feedback/types";
import { NoManuscriptState } from "@/features/manuscript/components/ManuscriptFullPageState";
import { useManuscripts } from "@/features/manuscript/hooks/use-manuscripts";
import { cn } from "@/lib/utils";

type FilterTag = FeedbackTag & { count: number };
type FilterChapter = FeedbackAnnotation["chapter"] & { count: number };
type FilterReader = FeedbackAnnotation["reader"] & { count: number };
const emptyAnnotations: FeedbackAnnotation[] = [];

export function FeedbackExplorer({
  accountId,
  accountPlan,
}: {
  accountId: string;
  accountPlan: AccountPlan;
}) {
  const searchParams = useSearchParams();
  const selectedManuscriptId = searchParams.get("manuscriptId");
  const selectedVersionId = searchParams.get("versionId");
  const manuscriptsQuery = useManuscripts();
  const manuscripts = manuscriptsQuery.data ?? [];
  const manuscriptId = selectedManuscriptId ?? manuscripts[0]?.id ?? null;

  if (!manuscriptsQuery.isPending && !manuscriptsQuery.error && manuscripts.length === 0) {
    return <FeedbackNoManuscript />;
  }

  return (
    <FeedbackExplorerContent
      key={`${manuscriptId ?? "no-manuscript"}:${selectedVersionId ?? "latest"}`}
      accountId={accountId}
      accountPlan={accountPlan}
      manuscriptId={manuscriptId}
      manuscriptVersionId={selectedVersionId}
      isResolvingManuscript={!manuscriptId && manuscriptsQuery.isPending}
      manuscriptError={manuscriptsQuery.error}
    />
  );
}

function FeedbackNoManuscript() {
  return <NoManuscriptState />;
}

function FeedbackExplorerContent({
  accountId,
  accountPlan,
  isResolvingManuscript,
  manuscriptError,
  manuscriptId,
  manuscriptVersionId,
}: {
  accountId: string;
  accountPlan: AccountPlan;
  isResolvingManuscript: boolean;
  manuscriptError: Error | null;
  manuscriptId: string | null;
  manuscriptVersionId: string | null;
}) {
  const feedbackQuery = useManuscriptFeedback(manuscriptId, manuscriptVersionId);
  const updateFeedbackSeen = useUpdateFeedbackSeenMutation();
  const archiveFeedback = useArchiveFeedbackMutation();
  const deleteArchivedFeedback = useDeleteArchivedFeedbackMutation();
  const annotations = feedbackQuery.data ?? emptyAnnotations;
  const feedbackFilterStorageKey = getFeedbackFilterPreferencesStorageKey({
    accountId,
    manuscriptId,
    manuscriptVersionId,
  });
  const [feedbackFilters, setFeedbackFilters] = useFeedbackFilterPreferences(feedbackFilterStorageKey);

  const [feedbackScope, setFeedbackScope] = useState<"active" | "archived">("active");
  const [query, setQuery] = useState("");

  const scopedAnnotations = useMemo(
    () => annotations.filter((annotation) => (
      feedbackScope === "archived" ? annotation.archivedAt !== null : annotation.archivedAt === null
    )),
    [annotations, feedbackScope],
  );
  const tags = useMemo(() => collectTags(scopedAnnotations), [scopedAnnotations]);
  const chapters = useMemo(() => collectChapters(scopedAnnotations), [scopedAnnotations]);
  const readers = useMemo(() => collectReaders(scopedAnnotations), [scopedAnnotations]);
  const selectedTagSlug = tags.some((tag) => tag.slug === feedbackFilters.selectedTagSlug)
    ? feedbackFilters.selectedTagSlug
    : null;
  const selectedChapterId = chapters.some((chapter) => chapter.id === feedbackFilters.selectedChapterId)
    ? feedbackFilters.selectedChapterId
    : null;
  const selectedReaderId = readers.some((reader) => reader.id === feedbackFilters.selectedReaderId)
    ? feedbackFilters.selectedReaderId
    : null;
  const hideReadFeedback = feedbackFilters.hideReadFeedback;
  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return scopedAnnotations.filter((annotation) => {
      const matchesTag = selectedTagSlug
        ? annotation.tag.slug === selectedTagSlug
        : true;
      const matchesChapter = selectedChapterId
        ? annotation.chapter.id === selectedChapterId
        : true;
      const matchesReader = selectedReaderId
        ? annotation.reader.id === selectedReaderId
        : true;
      const matchesReadStatus = !hideReadFeedback || !annotation.isSeenByAuthor;
      const matchesQuery = normalizedQuery
        ? [
          annotation.comment,
          annotation.quote,
          annotation.chapter.title,
          annotation.reader.name,
          annotation.tag.label,
        ].filter(Boolean).join(" ").toLowerCase().includes(normalizedQuery)
        : true;

      return matchesTag && matchesChapter && matchesReader && matchesReadStatus && matchesQuery;
    });
  }, [hideReadFeedback, query, scopedAnnotations, selectedChapterId, selectedReaderId, selectedTagSlug]);

  const isLoading = feedbackQuery.isPending || isResolvingManuscript;
  const queryError = feedbackQuery.error ?? manuscriptError;
  const emptyMessage = manuscriptId
    ? "No feedback on this manuscript yet."
    : "Create a manuscript to collect reader feedback.";

  function handleFeedbackSeen(annotation: FeedbackAnnotation) {
    if (!manuscriptId) return;

    updateFeedbackSeen.mutate({
      feedbackId: annotation.id,
      isSeen: !annotation.isSeenByAuthor,
      kind: annotation.kind,
      manuscriptId,
      manuscriptVersionId,
    });
  }

  function handleArchivedFeedbackDelete(annotation: FeedbackAnnotation) {
    if (!manuscriptId) return;

    deleteArchivedFeedback.mutate({
      feedbackId: annotation.id,
      kind: annotation.kind,
      manuscriptId,
      manuscriptVersionId,
    });
  }

  function handleFeedbackArchive(annotation: FeedbackAnnotation) {
    if (!manuscriptId) return;

    archiveFeedback.mutate({
      feedbackId: annotation.id,
      kind: annotation.kind,
      manuscriptId,
      manuscriptVersionId,
    });
  }

  return (
    <div className="min-h-full md:grid md:h-full md:grid-cols-[210px_minmax(0,1fr)] md:overflow-hidden">
      <aside className="border-b border-foreground/10 bg-sidebar px-5 py-7 md:overflow-y-auto md:border-b-0 md:border-r">
        <FilterGroup label="Feedback">
          <button
            type="button"
            aria-pressed={feedbackScope === "active"}
            onClick={() => setFeedbackScope("active")}
            className={cn(
              "flex w-full cursor-pointer items-center justify-between border border-transparent px-2 py-1.5 text-left text-xs transition-colors hover:bg-foreground/[0.04]",
              feedbackScope === "active" && "border-primary bg-foreground/[0.06] text-primary-text",
            )}
          >
            <span>Active</span>
            <span className="font-mono text-[9px] text-muted-foreground">{annotations.filter((annotation) => annotation.archivedAt === null).length}</span>
          </button>
          <button
            type="button"
            aria-pressed={feedbackScope === "archived"}
            onClick={() => setFeedbackScope("archived")}
            className={cn(
              "flex w-full cursor-pointer items-center justify-between gap-2 border border-transparent px-2 py-1.5 text-left text-xs transition-colors hover:bg-foreground/[0.04]",
              feedbackScope === "archived" && "border-primary bg-foreground/[0.06] text-primary-text",
            )}
          >
            <span className="flex items-center gap-2"><Archive className="h-3.5 w-3.5" strokeWidth={1.5} />Archived</span>
            <span className="font-mono text-[9px] text-muted-foreground">{annotations.filter((annotation) => annotation.archivedAt !== null).length}</span>
          </button>
        </FilterGroup>

        <FilterGroup label="Tag" action={<FeedbackTagManagerDialog accountPlan={accountPlan} manuscriptId={manuscriptId} />}>
          {tags.map((tag) => (
            <button
              key={tag.slug}
              type="button"
              aria-pressed={selectedTagSlug === tag.slug}
              onClick={() => setFeedbackFilters({
                ...feedbackFilters,
                selectedTagSlug: selectedTagSlug === tag.slug ? null : tag.slug,
              })}
              className={cn(
                "flex w-full items-center justify-between border border-transparent px-2 py-1.5 text-left text-xs transition-colors hover:bg-foreground/[0.04]",
                selectedTagSlug === tag.slug && "border-primary text-primary-text",
              )}
              style={{ backgroundColor: getAnnotationTagTint(tag, 12) }}
            >
              <span>{tag.label}</span>
              <span className="font-mono text-[9px] text-muted-foreground">{tag.count}</span>
            </button>
          ))}
          {tags.length === 0 ? <EmptyFilter /> : null}
        </FilterGroup>

        <FilterGroup label="Chapter">
          {chapters.map((chapter) => (
            <button
              key={chapter.id}
              type="button"
              aria-pressed={selectedChapterId === chapter.id}
              onClick={() => setFeedbackFilters({
                ...feedbackFilters,
                selectedChapterId: selectedChapterId === chapter.id ? null : chapter.id,
              })}
              className={cn(
                "flex w-full items-center justify-between border border-transparent px-2 py-1.5 text-left text-xs transition-colors hover:bg-foreground/[0.04]",
                selectedChapterId === chapter.id && "border-primary bg-foreground/[0.06] text-primary-text",
              )}
            >
              <span>Ch {chapter.position}</span>
              <span className="font-mono text-[9px] text-muted-foreground">{chapter.count}</span>
            </button>
          ))}
          {chapters.length === 0 ? <EmptyFilter /> : null}
        </FilterGroup>

        <FilterGroup label="Reader">
          {readers.map((reader) => (
            <button
              key={reader.id}
              type="button"
              aria-pressed={selectedReaderId === reader.id}
              onClick={() => setFeedbackFilters({
                ...feedbackFilters,
                selectedReaderId: selectedReaderId === reader.id ? null : reader.id,
              })}
              className={cn(
                "flex w-full items-center gap-2 border border-transparent px-2 py-1.5 text-left text-xs transition-colors hover:bg-foreground/[0.04]",
                selectedReaderId === reader.id && "border-primary bg-foreground/[0.06] text-primary-text",
              )}
            >
              <span className="grid h-5 w-5 place-items-center rounded-full font-mono text-[8px] font-semibold text-white" style={{ backgroundColor: reader.color }}>{reader.initials}</span>
              <span className="min-w-0 flex-1 truncate">{reader.name}</span>
              <span className="font-mono text-[9px] text-muted-foreground">{reader.count}</span>
            </button>
          ))}
          {readers.length === 0 ? <EmptyFilter /> : null}
        </FilterGroup>

        <FilterGroup label="Read">
          <button
            type="button"
            aria-pressed={hideReadFeedback}
            onClick={() => setFeedbackFilters({
              ...feedbackFilters,
              hideReadFeedback: !hideReadFeedback,
            })}
            className={cn(
              "flex w-full cursor-pointer items-center gap-2 border border-transparent px-2 py-1.5 text-left text-xs transition-colors hover:bg-foreground/[0.04]",
              hideReadFeedback && "border-primary bg-foreground/[0.06] text-primary-text",
            )}
          >
            <EyeOff className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
            <span>{hideReadFeedback ? "Read hidden" : "Hide read"}</span>
          </button>
        </FilterGroup>
      </aside>

      <Tabs defaultValue="recent" className="min-w-0 md:flex md:h-full md:flex-col">
        <div className="flex flex-col gap-3 border-b border-foreground/10 px-5 py-4 sm:flex-row sm:items-center sm:px-7">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search feedback…" className="h-10 border-foreground/15 bg-card pl-9 text-xs" />
          </div>
          <TabsList className="h-10 shrink-0 rounded-none bg-transparent p-0">
            <TabsTrigger value="recent" className="h-10 rounded-none border border-foreground/15 px-5 font-mono text-[10px] data-[state=active]:border-foreground data-[state=active]:bg-foreground data-[state=active]:text-background">Most recent</TabsTrigger>
            <TabsTrigger value="chapter" className="h-10 rounded-none border border-l-0 border-foreground/15 px-5 font-mono text-[10px] data-[state=active]:border-foreground data-[state=active]:bg-foreground data-[state=active]:text-background">By chapter</TabsTrigger>
          </TabsList>
          <span className="w-28 shrink-0 text-right font-mono text-[10px] text-muted-foreground">
            {isLoading ? "Loading…" : `${filtered.length} feedback`}
          </span>
        </div>

        {updateFeedbackSeen.isError || archiveFeedback.isError || deleteArchivedFeedback.isError ? (
          <p className="border-b border-destructive/20 bg-destructive/5 px-5 py-3 text-xs text-destructive sm:px-7" role="alert">
            {(updateFeedbackSeen.error ?? archiveFeedback.error ?? deleteArchivedFeedback.error)?.message}
          </p>
        ) : null}

        <TabsContent value="recent" className="m-0 md:flex-1 md:overflow-y-auto">
          <FeedbackState
            annotations={filtered}
            isLoading={isLoading}
            manuscriptId={manuscriptId}
            manuscriptVersionId={manuscriptVersionId}
            isUpdating={updateFeedbackSeen.isPending}
            isArchiving={archiveFeedback.isPending}
            isDeleting={deleteArchivedFeedback.isPending}
            onArchive={handleFeedbackArchive}
            onDelete={handleArchivedFeedbackDelete}
            onToggleSeen={handleFeedbackSeen}
            error={queryError}
            emptyMessage={query.trim() || selectedTagSlug || selectedChapterId || selectedReaderId || hideReadFeedback
              ? "No feedback matches these filters."
              : feedbackScope === "archived" ? "No archived feedback on this manuscript." : emptyMessage}
          />
        </TabsContent>

        <TabsContent value="chapter" className="m-0 md:flex-1 md:overflow-y-auto">
          {isLoading || queryError || filtered.length === 0 ? (
            <FeedbackState
              annotations={[]}
              isLoading={isLoading}
              manuscriptId={manuscriptId}
              manuscriptVersionId={manuscriptVersionId}
              isUpdating={updateFeedbackSeen.isPending}
              isArchiving={archiveFeedback.isPending}
              isDeleting={deleteArchivedFeedback.isPending}
              onArchive={handleFeedbackArchive}
              onDelete={handleArchivedFeedbackDelete}
              onToggleSeen={handleFeedbackSeen}
              error={queryError}
              emptyMessage={query.trim() || selectedTagSlug || selectedChapterId || selectedReaderId || hideReadFeedback
                ? "No feedback matches these filters."
                : feedbackScope === "archived" ? "No archived feedback on this manuscript." : emptyMessage}
            />
          ) : (
            <div className="px-5 py-2 sm:px-7">
              {groupByChapter(filtered).map(([chapter, chapterAnnotations]) => (
                <section key={chapter.id} className="border-b border-foreground/10 py-5">
                  <p className="mb-2 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Chapter {chapter.position} — {chapter.title}</p>
                  {chapterAnnotations.map((annotation) => (
                    <AnnotationRow
                      key={annotation.id}
                      annotation={annotation}
                      compact
                      manuscriptId={manuscriptId}
                      manuscriptVersionId={manuscriptVersionId}
                      isUpdating={updateFeedbackSeen.isPending}
                      isArchiving={archiveFeedback.isPending}
                      isDeleting={deleteArchivedFeedback.isPending}
                      onArchive={handleFeedbackArchive}
                      onDelete={handleArchivedFeedbackDelete}
                      onToggleSeen={handleFeedbackSeen}
                    />
                  ))}
                </section>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function collectTags(annotations: FeedbackAnnotation[]): FilterTag[] {
  const tags = new Map<string, FilterTag>();
  for (const annotation of annotations) {
    const current = tags.get(annotation.tag.slug);
    tags.set(annotation.tag.slug, current
      ? { ...current, count: current.count + 1 }
      : { ...annotation.tag, count: 1 });
  }

  return [...tags.values()].sort((left, right) => left.sortOrder - right.sortOrder || left.label.localeCompare(right.label));
}

function collectChapters(annotations: FeedbackAnnotation[]): FilterChapter[] {
  const chapters = new Map<string, FilterChapter>();
  for (const annotation of annotations) {
    const current = chapters.get(annotation.chapter.id);
    chapters.set(annotation.chapter.id, current
      ? { ...current, count: current.count + 1 }
      : { ...annotation.chapter, count: 1 });
  }

  return [...chapters.values()].sort((left, right) => left.position - right.position);
}

function collectReaders(annotations: FeedbackAnnotation[]): FilterReader[] {
  const readers = new Map<string, FilterReader>();
  for (const annotation of annotations) {
    const current = readers.get(annotation.reader.id);
    readers.set(annotation.reader.id, current
      ? { ...current, count: current.count + 1 }
      : { ...annotation.reader, count: 1 });
  }

  return [...readers.values()].sort((left, right) => left.name.localeCompare(right.name));
}

function groupByChapter(annotations: FeedbackAnnotation[]) {
  const grouped = new Map<string, { chapter: FeedbackAnnotation["chapter"]; annotations: FeedbackAnnotation[] }>();
  for (const annotation of annotations) {
    const current = grouped.get(annotation.chapter.id) ?? {
      annotations: [],
      chapter: annotation.chapter,
    };
    current.annotations.push(annotation);
    grouped.set(annotation.chapter.id, current);
  }

  return [...grouped.values()]
    .sort((left, right) => left.chapter.position - right.chapter.position)
    .map((group) => [group.chapter, group.annotations] as const);
}

function FilterGroup({
  action,
  children,
  label,
}: {
  action?: React.ReactNode;
  children: React.ReactNode;
  label: string;
}) {
  return (
    <section className="mb-7">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">{label}</p>
        {action}
      </div>
      <div className="space-y-1.5">{children}</div>
    </section>
  );
}

function EmptyFilter() {
  return <p className="px-2 py-1.5 text-xs text-muted-foreground">No feedback yet.</p>;
}

function FeedbackState({
  annotations,
  emptyMessage,
  error,
  isLoading,
  manuscriptId,
  manuscriptVersionId,
  isArchiving,
  isDeleting,
  isUpdating,
  onArchive,
  onDelete,
  onToggleSeen,
}: {
  annotations: FeedbackAnnotation[];
  emptyMessage: string;
  error: Error | null;
  isLoading: boolean;
  manuscriptId: string | null;
  manuscriptVersionId: string | null;
  isArchiving: boolean;
  isDeleting: boolean;
  isUpdating: boolean;
  onArchive: (annotation: FeedbackAnnotation) => void;
  onDelete: (annotation: FeedbackAnnotation) => void;
  onToggleSeen: (annotation: FeedbackAnnotation) => void;
}) {
  if (isLoading) {
    return <div className="grid min-h-52 place-items-center"><LoaderCircle className="h-5 w-5 animate-spin text-muted-foreground" /></div>;
  }

  if (error) {
    return <p className="px-5 py-16 text-center text-sm text-muted-foreground sm:px-7">Unable to load feedback. Please refresh the page.</p>;
  }

  if (annotations.length === 0) {
    return <p className="px-5 py-16 text-center text-sm text-muted-foreground sm:px-7">{emptyMessage}</p>;
  }

  return (
    <div className="divide-y divide-foreground/[0.08] px-5 sm:px-7">
      {annotations.map((annotation) => (
        <AnnotationRow
          key={annotation.id}
          annotation={annotation}
          manuscriptId={manuscriptId}
          manuscriptVersionId={manuscriptVersionId}
          isArchiving={isArchiving}
          isDeleting={isDeleting}
          isUpdating={isUpdating}
          onArchive={onArchive}
          onDelete={onDelete}
          onToggleSeen={onToggleSeen}
        />
      ))}
    </div>
  );
}

function AnnotationRow({
  annotation,
  compact = false,
  manuscriptId,
  manuscriptVersionId,
  isArchiving,
  isDeleting,
  isUpdating,
  onArchive,
  onDelete,
  onToggleSeen,
}: {
  annotation: FeedbackAnnotation;
  compact?: boolean;
  manuscriptId: string | null;
  manuscriptVersionId: string | null;
  isArchiving: boolean;
  isDeleting: boolean;
  isUpdating: boolean;
  onArchive: (annotation: FeedbackAnnotation) => void;
  onDelete: (annotation: FeedbackAnnotation) => void;
  onToggleSeen: (annotation: FeedbackAnnotation) => void;
}) {
  const isSeen = annotation.isSeenByAuthor;
  const isArchived = annotation.archivedAt !== null;
  const tagColor = getAnnotationTagColor(annotation.tag);
  const href = manuscriptId && !isArchived ? `/dashboard/manuscript?${new URLSearchParams({
    ...(annotation.kind === "annotation"
      ? { annotationId: annotation.id }
      : { generalCommentId: annotation.id }),
    chapterId: annotation.chapter.id,
    manuscriptId,
    ...(manuscriptVersionId ? { versionId: manuscriptVersionId } : {}),
  }).toString()}` : null;

  return (
    <article className={cn("grid grid-cols-[30px_minmax(0,1fr)] gap-3 py-5", compact && "py-4")}>
      <span className="grid h-7 w-7 place-items-center rounded-full font-mono text-[9px] font-semibold text-white" style={{ backgroundColor: annotation.reader.color }}>{annotation.reader.initials}</span>
      <div className="min-w-0">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">{annotation.reader.name}</span>
          <FeedbackTagBadge tag={annotation.tag} />
          {isArchived ? <ArchivedFeedbackBadge reason={annotation.archivedReason} /> : null}
          <span className="font-mono text-[9px] text-muted-foreground">Ch {annotation.chapter.position} — {annotation.chapter.title}</span>
          <span className="ml-auto font-mono text-[9px] text-muted-foreground">{formatAnnotationDate(annotation.createdAt)}</span>
          {href ? (
            <Button asChild variant="ghost" size="icon-sm" className="-mr-2" title="Open feedback in manuscript">
              <Link href={href} aria-label={`Open feedback from ${annotation.reader.name} in the manuscript`}>
                <Eye className="h-3.5 w-3.5" />
              </Link>
            </Button>
          ) : null}
        </div>
        {annotation.quote ? (
          <blockquote className="whitespace-pre-wrap border-l-2 px-3 py-2 text-sm italic" style={{ borderLeftColor: tagColor, backgroundColor: getAnnotationTagTint(annotation.tag, 10) }}>“{annotation.quote}”</blockquote>
        ) : null}
        {annotation.comment ? <p className="mt-2.5 text-sm leading-6 text-foreground/85">{annotation.comment}</p> : null}
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
        {isArchived ? (
          <DeleteArchivedFeedbackButton
            annotation={annotation}
            disabled={isDeleting}
            onDelete={onDelete}
          />
        ) : (
          <ArchiveFeedbackButton
            annotation={annotation}
            disabled={isArchiving}
            onArchive={onArchive}
          />
        )}
      </div>
    </article>
  );
}

function FeedbackTagBadge({ tag }: { tag: FeedbackTag }) {
  const tagColor = getAnnotationTagColor(tag);

  return (
    <Badge variant="outline" className="gap-1.5 rounded-none font-mono text-[9px] uppercase" style={{ borderColor: "hsl(var(--border))", color: "hsl(var(--foreground))" }}>
      <span className="h-1.5 w-1.5 shrink-0" style={{ backgroundColor: tagColor }} aria-hidden />
      {tag.label}
    </Badge>
  );
}

function ArchivedFeedbackBadge({
  reason,
}: {
  reason: FeedbackAnnotation["archivedReason"];
}) {
  const label = reason === "chapter_deleted"
    ? "Chapter removed"
    : reason === "chapter_replaced"
      ? "Chapter replaced"
      : reason === "manually_archived"
        ? "Archived manually"
      : "Passage changed";

  return (
    <Badge variant="outline" className="gap-1 rounded-none border-foreground/15 font-mono text-[9px] uppercase text-muted-foreground">
      <Archive className="h-3 w-3" strokeWidth={1.5} aria-hidden="true" />
      {label}
    </Badge>
  );
}

function ArchiveFeedbackButton({
  annotation,
  disabled,
  onArchive,
}: {
  annotation: FeedbackAnnotation;
  disabled: boolean;
  onArchive: (annotation: FeedbackAnnotation) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => {
      if (!disabled) setIsOpen(open);
    }}>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={disabled}
        className="mt-3 ml-3 px-0 text-muted-foreground hover:bg-transparent hover:text-foreground"
        onClick={() => setIsOpen(true)}
      >
        <Archive className="h-3.5 w-3.5" />
        Archive
      </Button>
      <AlertDialogContent className="rounded-none bg-card">
        <AlertDialogHeader>
          <AlertDialogTitle>Archive feedback?</AlertDialogTitle>
          <AlertDialogDescription>
            This feedback will be removed from the active list and kept in Archived feedback.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={disabled}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={disabled}
            className="rounded-none"
            onClick={(event) => {
              event.preventDefault();
              onArchive(annotation);
              setIsOpen(false);
            }}
          >
            Archive feedback
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function DeleteArchivedFeedbackButton({
  annotation,
  disabled,
  onDelete,
}: {
  annotation: FeedbackAnnotation;
  disabled: boolean;
  onDelete: (annotation: FeedbackAnnotation) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => {
      if (!disabled) setIsOpen(open);
    }}>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={disabled}
        className="mt-3 ml-3 px-0 text-destructive hover:bg-transparent hover:text-destructive"
        onClick={() => setIsOpen(true)}
      >
        <Trash2 className="h-3.5 w-3.5" />
        Delete
      </Button>
      <AlertDialogContent className="rounded-none border-destructive/25 bg-card">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete archived feedback?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently deletes this archived reader feedback. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={disabled}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={disabled}
            className="rounded-none bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={(event) => {
              event.preventDefault();
              onDelete(annotation);
              setIsOpen(false);
            }}
          >
            Delete feedback
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function formatAnnotationDate(createdAt: string) {
  return new Intl.DateTimeFormat("en", { day: "numeric", month: "short" }).format(new Date(createdAt));
}
