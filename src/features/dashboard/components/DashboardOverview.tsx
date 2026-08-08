"use client";

import { ArrowRight, ClipboardList, MessageSquare, Users } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { type ReactNode, useState } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  type DashboardAnnotation,
  type DashboardOverviewData,
  type DashboardReader,
} from "@/features/dashboard/api/dashboard";
import { useDashboardOverview } from "@/features/dashboard/hooks/use-dashboard-overview";
import { getAnnotationTagColor, isDefaultAnnotationTag } from "@/features/annotations/lib/tag-colors";
import { FeatureRequestDialog } from "@/features/feature-requests/components/FeatureRequestDialog";
import { NoManuscriptState } from "@/features/manuscript/components/ManuscriptFullPageState";
import { useManuscripts } from "@/features/manuscript/hooks/use-manuscripts";
import {
  findManuscriptByReference,
  withManuscriptReference,
} from "@/features/manuscript/lib/manuscript-url";
import { InviteReaderDialog } from "@/features/readers/components/InviteReaderDialog";
import { cn } from "@/lib/utils";
import { Heading } from "@/shared/ui/Heading";

import { TagBadge } from "./TagBadge";

function accessibleTagColor(tag: { color: string; slug?: string }) {
  const color = getAnnotationTagColor(tag);

  return isDefaultAnnotationTag(tag)
    ? color
    : `color-mix(in srgb, hsl(var(--foreground)) 68%, ${color})`;
}

export function DashboardOverview() {
  const searchParams = useSearchParams();
  const selectedManuscriptReference = searchParams.get("manuscript") ?? searchParams.get("manuscriptId");
  const selectedVersionId = searchParams.get("versionId");
  const manuscriptsQuery = useManuscripts();
  const selectedManuscript = findManuscriptByReference(
    manuscriptsQuery.data ?? [],
    selectedManuscriptReference,
  ) ?? manuscriptsQuery.data?.[0] ?? null;
  const manuscriptId = selectedManuscript?.id ?? null;
  const overviewQuery = useDashboardOverview(manuscriptId, selectedVersionId);
  const [selectedTagSlug, setSelectedTagSlug] = useState<string | null>(null);

  const isLoading = manuscriptsQuery.isPending || (!manuscriptId ? false : overviewQuery.isPending);
  const error = manuscriptsQuery.error ?? overviewQuery.error;

  if (isLoading) return <DashboardOverviewLoadingSkeleton />;
  if (error) return <DashboardMessage message="Unable to load your dashboard. Please refresh the page." />;
  if (!manuscriptId) return <NoManuscriptState />;
  if (!overviewQuery.data) return <DashboardMessage message="This manuscript is no longer available." />;

  return (
    <DashboardContent
      data={overviewQuery.data}
      manuscript={selectedManuscript}
      manuscriptId={manuscriptId}
      selectedTagSlug={selectedTagSlug}
      onSelectTag={(tagSlug) => setSelectedTagSlug((current) => current === tagSlug ? null : tagSlug)}
    />
  );
}

function DashboardContent({
  data,
  manuscript,
  manuscriptId,
  onSelectTag,
  selectedTagSlug,
}: {
  data: DashboardOverviewData;
  manuscript: { title: string; urlKey: string } | null;
  manuscriptId: string;
  onSelectTag: (tagSlug: string) => void;
  selectedTagSlug: string | null;
}) {
  const recentAnnotations = selectedTagSlug
    ? data.recentAnnotations.filter((annotation) => annotation.tag.slug === selectedTagSlug)
    : data.recentAnnotations;
  const highestTagCount = data.tagCounts[0]?.count ?? 1;
  const pendingReaders = data.readers.filter((reader) => reader.status === "pending").length;
  const readerDetail = data.maxReaders > 0
    ? pendingReaders > 0
      ? `${pendingReaders} invitation${pendingReaders > 1 ? "s" : ""} pending`
      : "all invited readers started"
    : "no reading round yet";
  const stats = [
    ["Total annotations", String(data.annotationCount), data.annotationCount === 1 ? "across your draft" : "across your draft"],
    ["Readers started", data.maxReaders > 0 ? `${data.startedReaders} / ${data.maxReaders}` : "—", readerDetail],
    ["Chapters reached", `${data.chaptersReached} / ${data.chapters.length}`, "read by at least one reader"],
    ["Survey responses", String(data.surveyResponseCount), data.surveyResponseCount === 1 ? "reader response received" : "reader responses received"],
  ] as const;
  const hasJoinedReader = data.readers.some((reader) => reader.status !== "pending");
  const readersHref = manuscript
    ? `/dashboard/readers?${withManuscriptReference(new URLSearchParams(), manuscript).toString()}`
    : "/dashboard/readers";
  const surveysSearchParams = manuscript
    ? withManuscriptReference(new URLSearchParams(), manuscript)
    : new URLSearchParams();
  if (data.manuscriptVersionId) surveysSearchParams.set("versionId", data.manuscriptVersionId);
  const surveysHref = `/dashboard/surveys?${surveysSearchParams.toString()}`;

  return (
    <div className="max-w-[1100px] px-5 py-7 sm:px-8 sm:py-8">
      <div className="mb-8 flex flex-col-reverse flex-wrap gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="mb-1 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Overview</p>
          <Heading level={1} size="workspace">{data.title}</Heading>
          <p className="mt-1 text-sm text-muted-foreground">{data.draftLabel} · {formatActivityDate(data.lastActivityAt)}</p>
        </div>
        <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:shrink-0 sm:justify-end">
          <FeatureRequestDialog manuscriptId={manuscriptId} />
          <InviteReaderDialog manuscriptId={manuscriptId} triggerVariant="outline" />
        </div>
      </div>

      {!hasJoinedReader ? (
        <section className="mb-6 border border-primary/30 bg-primary/[0.035] p-5">
          <div className="mb-5">
            <p className="font-mono text-[9px] uppercase tracking-widest text-primary-text">Next step</p>
            <Heading level={2} size="small" className="mt-1">Start collecting feedback</Heading>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="border border-foreground/10 bg-card p-4">
              <Users className="h-4 w-4 text-primary-text" />
              <p className="mt-3 text-sm font-medium">Invite readers or share a public link</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Add named beta readers or let anyone with your public link read this draft.
              </p>
              <Button asChild size="sm" variant="outline" className="mt-4 border-primary text-primary-text">
                <Link href={readersHref}>Manage readers <ArrowRight className="h-3.5 w-3.5" /></Link>
              </Button>
            </div>
            <div className="border border-foreground/10 bg-card p-4">
              <ClipboardList className="h-4 w-4 text-primary-text" />
              <p className="mt-3 text-sm font-medium">Create surveys at the end of a chapter or book</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Add focused questions to complement passage-level feedback.
              </p>
              <Button asChild size="sm" variant="outline" className="mt-4 border-primary text-primary-text">
                <Link href={surveysHref}>Create surveys <ArrowRight className="h-3.5 w-3.5" /></Link>
              </Button>
            </div>
          </div>
        </section>
      ) : null}

      <section className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map(([label, value, detail]) => (
          <StatCard key={label} label={label} value={value} detail={detail} />
        ))}
      </section>

      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <section className="border border-foreground/10 bg-card p-5">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Annotation frequency</p>
                <Heading level={2} size="small" className="mt-1">Tags across all chapters</Heading>
              </div>
              <span className="font-mono text-[9px] text-muted-foreground">{data.annotationCount} total</span>
            </div>
            {data.tagCounts.length > 0 ? (
              <div className="flex h-[165px] items-end justify-around gap-3 px-2">
                {data.tagCounts.map((tag) => (
                  <button
                    key={tag.slug}
                    type="button"
                    onClick={() => onSelectTag(tag.slug)}
                    className="flex h-full min-w-0 flex-1 flex-col justify-end gap-2"
                    title={`Filter by ${tag.label}`}
                    aria-pressed={selectedTagSlug === tag.slug}
                  >
                    <span className="sr-only">{tag.count} annotations tagged {tag.label}</span>
                    <span
                      className="mx-auto w-full max-w-[40px] transition-opacity"
                      style={{
                        backgroundColor: accessibleTagColor(tag),
                        height: `${Math.max(8, Math.round(tag.count / highestTagCount * 100))}%`,
                        opacity: selectedTagSlug && selectedTagSlug !== tag.slug ? 0.3 : 1,
                      }}
                    />
                    <span className="min-h-7 text-center font-mono text-[8px] leading-3 text-muted-foreground">{tag.label}</span>
                  </button>
                ))}
              </div>
            ) : <EmptyPanel message="Annotations will appear here as readers highlight your manuscript." />}
          </section>

          <section className="border border-foreground/10 bg-card p-5">
            <p className="mb-4 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Chapters</p>
            {data.chapters.length > 0 ? (
              <div className="divide-y divide-foreground/[0.07]">
                {data.chapters.map((chapter) => (
                  <div key={chapter.id} className="grid grid-cols-[22px_minmax(0,1fr)_auto] items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                    <span className="font-mono text-[9px] text-muted-foreground">{chapter.position}</span>
                    <span className="truncate text-[11px] font-medium">{chapter.title}</span>
                    <span className="flex gap-3 font-mono text-[9px] text-muted-foreground">
                      <span>{chapter.annotationCount} note{chapter.annotationCount === 1 ? "" : "s"}</span>
                      <span>{chapter.completedReaders} reader{chapter.completedReaders === 1 ? "" : "s"}</span>
                    </span>
                  </div>
                ))}
              </div>
            ) : <EmptyPanel message="Add chapters to begin collecting reader progress." />}
          </section>

          <section className="border border-foreground/10 bg-card">
            <div className="flex items-center justify-between gap-4 border-b border-foreground/10 px-5 py-4">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Recent annotations</p>
                <p className="mt-1 font-mono text-[9px] text-muted-foreground">{recentAnnotations.length} shown</p>
              </div>
              <div className="flex gap-1">
                {data.tagCounts.map((tag) => (
                  <button
                    key={tag.slug}
                    type="button"
                    className={cn("h-3 w-3 transition-opacity", selectedTagSlug && selectedTagSlug !== tag.slug && "opacity-30")}
                    style={{ backgroundColor: accessibleTagColor(tag) }}
                    onClick={() => onSelectTag(tag.slug)}
                    aria-label={`Filter by ${tag.label}`}
                  />
                ))}
              </div>
            </div>
            {recentAnnotations.length > 0 ? (
              <div className="divide-y divide-foreground/[0.07]">
                {recentAnnotations.map((annotation) => <RecentAnnotation key={annotation.id} annotation={annotation} />)}
              </div>
            ) : <EmptyPanel message={selectedTagSlug ? "No recent annotations use this tag." : "Reader annotations will appear here."} />}
          </section>
        </div>

        <aside className="space-y-6">
          <section className="border border-foreground/10 bg-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Beta readers</p>
              <MessageSquare className="h-3 w-3 text-muted-foreground" strokeWidth={1.5} />
            </div>
            {data.readers.length > 0 ? (
              <div className="space-y-4">
                {data.readers.map((reader) => <ReaderProgress key={reader.id} reader={reader} />)}
              </div>
            ) : <EmptyPanel message="Invite readers to start tracking progress." />}
          </section>

          <section className="border border-foreground/10 bg-card p-5">
            <p className="mb-4 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Revision priorities</p>
            {data.revisionPriorities.length > 0 ? (
              <div className="divide-y divide-foreground/[0.07]">
                {data.revisionPriorities.map((priority, index) => (
                  <div key={`${priority.chapter.id}:${priority.tag.slug}`} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                    <span className="w-4 shrink-0 font-mono text-[9px] font-medium text-muted-foreground">{index + 1}.</span>
                    <div>
                      <div className="mb-1 flex items-center gap-1.5"><span className="font-mono text-[9px] text-muted-foreground">Ch {priority.chapter.position}</span><TagBadge tag={priority.tag} /></div>
                      <p className="text-[11px] leading-snug text-foreground/75">{priority.annotationCount} annotation{priority.annotationCount === 1 ? "" : "s"} on {priority.chapter.title}.</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : <EmptyPanel message="Repeated reader signals will surface here." />}
          </section>

          <section className="border border-foreground/10 bg-card p-5">
            <p className="mb-4 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Strongest moments</p>
            {data.strongestMoments.length > 0 ? (
              <div className="divide-y divide-foreground/[0.07]">
                {data.strongestMoments.map((annotation) => (
                  <div key={annotation.id} className="py-3 first:pt-0 last:pb-0">
                    <div className="mb-1 flex items-center gap-2"><span className="font-mono text-[9px] text-muted-foreground">Ch {annotation.chapter.position}</span><TagBadge tag={annotation.tag} /></div>
                    <p className="whitespace-pre-line text-xs leading-5 text-foreground/85">“{annotation.quote}”</p>
                    <p className="mt-1 font-mono text-[9px] text-muted-foreground">{annotation.reader.name}</p>
                  </div>
                ))}
              </div>
            ) : <EmptyPanel message="Positive reader highlights will appear here." />}
          </section>
        </aside>
      </div>
    </div>
  );
}

function RecentAnnotation({ annotation }: { annotation: DashboardAnnotation }) {
  return (
    <article className="grid grid-cols-[28px_minmax(0,1fr)] gap-3 px-5 py-3.5">
      <span className="grid h-6 w-6 place-items-center rounded-full font-mono text-[8px] font-semibold text-white" style={{ backgroundColor: annotation.reader.color }}>{annotation.reader.initials}</span>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-medium">{annotation.reader.name}</span>
          <TagBadge tag={annotation.tag} />
          <span className="font-mono text-[9px] text-muted-foreground">Ch {annotation.chapter.position}</span>
          <span className="ml-auto font-mono text-[9px] text-muted-foreground">{formatRelativeDate(annotation.createdAt)}</span>
        </div>
        <p className="mt-1.5 line-clamp-2 text-[11px] leading-snug text-foreground/75">“{annotation.comment ?? annotation.quote}”</p>
      </div>
    </article>
  );
}

function ReaderProgress({ reader }: { reader: DashboardReader }) {
  const progress = reader.totalChapters > 0 ? Math.round(reader.completedChapters / reader.totalChapters * 100) : 0;
  return (
    <div>
      <div className="flex items-center gap-2.5">
        <span className="grid h-6 w-6 place-items-center rounded-full font-mono text-[8px] font-semibold text-white" style={{ backgroundColor: reader.color }}>{reader.initials}</span>
        <span className="flex-1 truncate text-[11px] font-medium">{reader.name}</span>
        <span className="px-1.5 py-0.5 font-mono text-[8px] uppercase" style={{ color: reader.status === "pending" ? "hsl(var(--muted-foreground))" : reader.color, backgroundColor: `${reader.color}14` }}>{formatReaderStatus(reader.status)}</span>
      </div>
      <div className="mt-2 pl-8">
        <div className="mb-1 flex justify-between font-mono text-[8px] text-muted-foreground"><span>Ch {reader.completedChapters} of {reader.totalChapters}</span><span>{progress}%</span></div>
        <div className="h-0.5 bg-foreground/[0.08]"><div className="h-full" style={{ width: `${progress}%`, backgroundColor: reader.status === "pending" ? "hsl(var(--muted-foreground) / 0.45)" : reader.color }} /></div>
      </div>
    </div>
  );
}

export function DashboardOverviewLoadingSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading dashboard overview"
      role="status"
      className="max-w-[1100px] px-5 py-7 sm:px-8 sm:py-8"
    >
      <span className="sr-only">Loading dashboard overview</span>
      <div aria-hidden="true">
        <div className="mb-8 flex items-start justify-between gap-5">
          <div className="min-w-0 space-y-2">
            <Skeleton className="h-3 w-16 rounded-none bg-foreground/[0.07]" />
            <Skeleton className="h-9 w-72 max-w-full rounded-none bg-foreground/[0.07]" />
            <Skeleton className="h-4 w-44 rounded-none bg-foreground/[0.07]" />
          </div>
          <div className="flex shrink-0 gap-2">
            <Skeleton className="h-9 w-28 rounded-none bg-foreground/[0.07]" />
            <Skeleton className="h-9 w-32 rounded-none bg-foreground/[0.07]" />
          </div>
        </div>

        <section className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="min-h-32 border border-foreground/10 bg-card p-5">
              <Skeleton className="h-3 w-24 rounded-none bg-foreground/[0.07]" />
              <Skeleton className="mt-4 h-8 w-14 rounded-none bg-foreground/[0.07]" />
              <Skeleton className="mt-2 h-3 w-20 rounded-none bg-foreground/[0.07]" />
            </div>
          ))}
        </section>

        <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <section className="border border-foreground/10 bg-card p-5">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-32 rounded-none bg-foreground/[0.07]" />
                  <Skeleton className="h-5 w-48 rounded-none bg-foreground/[0.07]" />
                </div>
                <Skeleton className="h-3 w-12 rounded-none bg-foreground/[0.07]" />
              </div>
              <div className="flex h-[165px] items-end justify-around gap-3 px-2">
                {[32, 58, 76, 44, 92, 66].map((height, index) => (
                  <Skeleton key={index} className="w-full max-w-10 rounded-none bg-foreground/[0.07]" style={{ height: `${height}%` }} />
                ))}
              </div>
            </section>

            <section className="border border-foreground/10 bg-card p-5">
              <Skeleton className="mb-5 h-3 w-16 rounded-none bg-foreground/[0.07]" />
              <div className="divide-y divide-foreground/[0.07]">
                {Array.from({ length: 5 }, (_, index) => (
                  <div key={index} className="grid grid-cols-[22px_minmax(0,1fr)_auto] items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <Skeleton className="h-3 w-3 rounded-none bg-foreground/[0.07]" />
                    <Skeleton className="h-3 w-full max-w-48 rounded-none bg-foreground/[0.07]" />
                    <Skeleton className="h-3 w-20 rounded-none bg-foreground/[0.07]" />
                  </div>
                ))}
              </div>
            </section>

            <section className="border border-foreground/10 bg-card">
              <div className="flex items-center justify-between border-b border-foreground/10 px-5 py-4">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-28 rounded-none bg-foreground/[0.07]" />
                  <Skeleton className="h-3 w-12 rounded-none bg-foreground/[0.07]" />
                </div>
                <Skeleton className="h-3 w-16 rounded-none bg-foreground/[0.07]" />
              </div>
              <div className="divide-y divide-foreground/[0.07]">
                {Array.from({ length: 4 }, (_, index) => (
                  <div key={index} className="grid grid-cols-[28px_minmax(0,1fr)] gap-3 px-5 py-3.5">
                    <Skeleton className="h-6 w-6 rounded-full bg-foreground/[0.07]" />
                    <div className="space-y-2"><Skeleton className="h-3 w-40 rounded-none bg-foreground/[0.07]" /><Skeleton className="h-3 w-full rounded-none bg-foreground/[0.07]" /></div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            {Array.from({ length: 3 }, (_, index) => (
              <section key={index} className="border border-foreground/10 bg-card p-5">
                <Skeleton className="mb-5 h-3 w-28 rounded-none bg-foreground/[0.07]" />
                <div className="space-y-4">
                  {Array.from({ length: index === 0 ? 4 : 3 }, (_, rowIndex) => (
                    <div key={rowIndex} className="space-y-2">
                      <div className="flex items-center gap-2.5"><Skeleton className="h-6 w-6 rounded-full bg-foreground/[0.07]" /><Skeleton className="h-3 flex-1 rounded-none bg-foreground/[0.07]" /></div>
                      <Skeleton className="ml-8 h-2 w-[calc(100%_-_2rem)] rounded-none bg-foreground/[0.07]" />
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </aside>
        </div>
      </div>
    </div>
  );
}

function DashboardMessage({
  message,
  children,
}: {
  message: string;
  children?: ReactNode;
}) {
  return (
    <div className="grid min-h-[420px] max-w-[1100px] place-items-center px-5 py-7 text-center text-sm text-muted-foreground sm:px-8">
      <div>
        <p>{message}</p>
        {children}
      </div>
    </div>
  );
}

function EmptyPanel({ message }: { message: string }) {
  return <p className="py-8 text-center text-xs leading-5 text-muted-foreground">{message}</p>;
}

function StatCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="border border-foreground/10 bg-card p-5">
      <p className="mb-2 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mb-1 text-3xl font-normal leading-none">{value}</p>
      <p className="font-mono text-[10px] text-muted-foreground">{detail}</p>
    </div>
  );
}

function formatActivityDate(value: string | null) {
  return value ? `Last activity ${formatRelativeDate(value)}` : "No reader activity yet";
}

function formatRelativeDate(value: string) {
  const elapsed = Math.max(0, Date.now() - new Date(value).getTime());
  const minutes = Math.floor(elapsed / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function formatReaderStatus(status: DashboardReader["status"]) {
  if (status === "finished") return "finished";
  return status;
}
