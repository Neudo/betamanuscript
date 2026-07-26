"use client";

import { Eye, LoaderCircle, Search } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FeedbackTagManagerDialog } from "@/features/feedback/components/FeedbackTagManagerDialog";
import { useManuscriptFeedback } from "@/features/feedback/hooks/use-feedback";
import type { FeedbackAnnotation, FeedbackTag } from "@/features/feedback/types";
import { useManuscripts } from "@/features/manuscript/hooks/use-manuscripts";
import { cn } from "@/lib/utils";

type FilterTag = FeedbackTag & { count: number };
type FilterChapter = FeedbackAnnotation["chapter"] & { count: number };
type FilterReader = FeedbackAnnotation["reader"] & { count: number };
const emptyAnnotations: FeedbackAnnotation[] = [];

export function FeedbackExplorer() {
  const searchParams = useSearchParams();
  const selectedManuscriptId = searchParams.get("manuscriptId");
  const manuscriptsQuery = useManuscripts();
  const manuscriptId = selectedManuscriptId ?? manuscriptsQuery.data?.[0]?.id ?? null;

  return (
    <FeedbackExplorerContent
      key={manuscriptId ?? "no-manuscript"}
      manuscriptId={manuscriptId}
      isResolvingManuscript={!manuscriptId && manuscriptsQuery.isPending}
      manuscriptError={manuscriptsQuery.error}
    />
  );
}

function FeedbackExplorerContent({
  isResolvingManuscript,
  manuscriptError,
  manuscriptId,
}: {
  isResolvingManuscript: boolean;
  manuscriptError: Error | null;
  manuscriptId: string | null;
}) {
  const feedbackQuery = useManuscriptFeedback(manuscriptId);
  const annotations = feedbackQuery.data ?? emptyAnnotations;

  const [selectedTagSlug, setSelectedTagSlug] = useState<string | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [selectedReaderId, setSelectedReaderId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const tags = useMemo(() => collectTags(annotations), [annotations]);
  const chapters = useMemo(() => collectChapters(annotations), [annotations]);
  const readers = useMemo(() => collectReaders(annotations), [annotations]);
  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return annotations.filter((annotation) => {
      const matchesTag = selectedTagSlug
        ? annotation.tag.slug === selectedTagSlug
        : true;
      const matchesChapter = selectedChapterId
        ? annotation.chapter.id === selectedChapterId
        : true;
      const matchesReader = selectedReaderId
        ? annotation.reader.id === selectedReaderId
        : true;
      const matchesQuery = normalizedQuery
        ? [
          annotation.comment,
          annotation.quote,
          annotation.chapter.title,
          annotation.reader.name,
          annotation.tag.label,
        ].filter(Boolean).join(" ").toLowerCase().includes(normalizedQuery)
        : true;

      return matchesTag && matchesChapter && matchesReader && matchesQuery;
    });
  }, [annotations, query, selectedChapterId, selectedReaderId, selectedTagSlug]);

  const isLoading = feedbackQuery.isPending || isResolvingManuscript;
  const queryError = feedbackQuery.error ?? manuscriptError;
  const emptyMessage = manuscriptId
    ? "No annotations on this manuscript yet."
    : "Create a manuscript to collect reader feedback.";

  return (
    <div className="min-h-full md:grid md:h-full md:grid-cols-[210px_minmax(0,1fr)] md:overflow-hidden">
      <aside className="border-b border-foreground/10 bg-sidebar px-5 py-7 md:overflow-y-auto md:border-b-0 md:border-r">
        <FilterGroup label="Tag" action={<FeedbackTagManagerDialog manuscriptId={manuscriptId} />}>
          {tags.map((tag) => (
            <button
              key={tag.slug}
              type="button"
              aria-pressed={selectedTagSlug === tag.slug}
              onClick={() => setSelectedTagSlug(selectedTagSlug === tag.slug ? null : tag.slug)}
              className={cn(
                "flex w-full items-center justify-between px-2 py-1.5 text-left text-xs transition-colors hover:bg-foreground/[0.04]",
                selectedTagSlug === tag.slug && "bg-foreground/[0.06] text-primary",
              )}
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
              onClick={() => setSelectedChapterId(selectedChapterId === chapter.id ? null : chapter.id)}
              className={cn(
                "flex w-full items-center justify-between px-2 py-1.5 text-left text-xs transition-colors hover:bg-foreground/[0.04]",
                selectedChapterId === chapter.id && "bg-foreground/[0.06] text-primary",
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
              onClick={() => setSelectedReaderId(selectedReaderId === reader.id ? null : reader.id)}
              className={cn(
                "flex w-full items-center gap-2 px-2 py-1.5 text-left text-xs transition-colors hover:bg-foreground/[0.04]",
                selectedReaderId === reader.id && "bg-foreground/[0.06] text-primary",
              )}
            >
              <span className="grid h-5 w-5 place-items-center rounded-full font-mono text-[8px] font-semibold text-white" style={{ backgroundColor: reader.color }}>{reader.initials}</span>
              <span className="min-w-0 flex-1 truncate">{reader.name}</span>
              <span className="font-mono text-[9px] text-muted-foreground">{reader.count}</span>
            </button>
          ))}
          {readers.length === 0 ? <EmptyFilter /> : null}
        </FilterGroup>
      </aside>

      <Tabs defaultValue="recent" className="min-w-0 md:flex md:h-full md:flex-col">
        <div className="flex flex-col gap-3 border-b border-foreground/10 px-5 py-4 sm:flex-row sm:items-center sm:px-7">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search annotations…" className="h-10 border-foreground/15 bg-card pl-9 text-xs" />
          </div>
          <TabsList className="h-10 shrink-0 rounded-none bg-transparent p-0">
            <TabsTrigger value="recent" className="h-10 rounded-none border border-foreground/15 px-5 font-mono text-[10px] data-[state=active]:border-foreground data-[state=active]:bg-foreground data-[state=active]:text-background">Most recent</TabsTrigger>
            <TabsTrigger value="chapter" className="h-10 rounded-none border border-l-0 border-foreground/15 px-5 font-mono text-[10px] data-[state=active]:border-foreground data-[state=active]:bg-foreground data-[state=active]:text-background">By chapter</TabsTrigger>
          </TabsList>
          <span className="w-28 shrink-0 text-right font-mono text-[10px] text-muted-foreground">
            {isLoading ? "Loading…" : `${filtered.length} annotations`}
          </span>
        </div>

        <TabsContent value="recent" className="m-0 md:flex-1 md:overflow-y-auto">
          <FeedbackState
            annotations={filtered}
            isLoading={isLoading}
            manuscriptId={manuscriptId}
            error={queryError}
            emptyMessage={query.trim() || selectedTagSlug || selectedChapterId || selectedReaderId
              ? "No annotations match these filters."
              : emptyMessage}
          />
        </TabsContent>

        <TabsContent value="chapter" className="m-0 md:flex-1 md:overflow-y-auto">
          {isLoading || queryError || filtered.length === 0 ? (
            <FeedbackState
              annotations={[]}
              isLoading={isLoading}
              manuscriptId={manuscriptId}
              error={queryError}
              emptyMessage={query.trim() || selectedTagSlug || selectedChapterId || selectedReaderId
                ? "No annotations match these filters."
                : emptyMessage}
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
      <div>{children}</div>
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
}: {
  annotations: FeedbackAnnotation[];
  emptyMessage: string;
  error: Error | null;
  isLoading: boolean;
  manuscriptId: string | null;
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
        />
      ))}
    </div>
  );
}

function AnnotationRow({
  annotation,
  compact = false,
  manuscriptId,
}: {
  annotation: FeedbackAnnotation;
  compact?: boolean;
  manuscriptId: string | null;
}) {
  const href = manuscriptId
    ? `/dashboard/manuscript?${new URLSearchParams({
      annotationId: annotation.id,
      chapterId: annotation.chapter.id,
      manuscriptId,
    }).toString()}`
    : null;

  return (
    <article className={cn("grid grid-cols-[30px_minmax(0,1fr)] gap-3 py-5", compact && "py-4")}>
      <span className="grid h-7 w-7 place-items-center rounded-full font-mono text-[9px] font-semibold text-white" style={{ backgroundColor: annotation.reader.color }}>{annotation.reader.initials}</span>
      <div className="min-w-0">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">{annotation.reader.name}</span>
          <FeedbackTagBadge tag={annotation.tag} />
          <span className="font-mono text-[9px] text-muted-foreground">Ch {annotation.chapter.position} — {annotation.chapter.title}</span>
          <span className="ml-auto font-mono text-[9px] text-muted-foreground">{formatAnnotationDate(annotation.createdAt)}</span>
          {href ? (
            <Button asChild variant="ghost" size="icon-sm" className="-mr-2" title="Open passage and comment">
              <Link href={href} aria-label={`Open feedback from ${annotation.reader.name} in the manuscript`}>
                <Eye className="h-3.5 w-3.5" />
              </Link>
            </Button>
          ) : null}
        </div>
        <blockquote className="border-l-2 px-3 py-2 text-sm italic" style={{ borderLeftColor: annotation.tag.color, backgroundColor: `${annotation.tag.color}1A` }}>“{annotation.quote}”</blockquote>
        {annotation.comment ? <p className="mt-2.5 text-sm leading-6 text-foreground/85">{annotation.comment}</p> : null}
      </div>
    </article>
  );
}

function FeedbackTagBadge({ tag }: { tag: FeedbackTag }) {
  return <Badge variant="outline" className="rounded-none font-mono text-[9px] uppercase" style={{ borderColor: tag.color, color: tag.color }}>{tag.label}</Badge>;
}

function formatAnnotationDate(createdAt: string) {
  return new Intl.DateTimeFormat("en", { day: "numeric", month: "short" }).format(new Date(createdAt));
}
