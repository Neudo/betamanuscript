"use client";

import { MessageSquare, UserPlus } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  type DashboardAnnotation,
  type DashboardOverviewData,
  type DashboardReader,
} from "@/features/dashboard/api/dashboard";
import { useDashboardOverview } from "@/features/dashboard/hooks/use-dashboard-overview";
import { useManuscripts } from "@/features/manuscript/hooks/use-manuscripts";
import { cn } from "@/lib/utils";

import { TagBadge } from "./TagBadge";

export function DashboardOverview() {
  const searchParams = useSearchParams();
  const selectedManuscriptId = searchParams.get("manuscriptId");
  const manuscriptsQuery = useManuscripts();
  const manuscriptId = selectedManuscriptId ?? manuscriptsQuery.data?.[0]?.id ?? null;
  const overviewQuery = useDashboardOverview(manuscriptId);
  const [selectedTagSlug, setSelectedTagSlug] = useState<string | null>(null);

  const isLoading = manuscriptsQuery.isPending || (!manuscriptId ? false : overviewQuery.isPending);
  const error = manuscriptsQuery.error ?? overviewQuery.error;

  if (isLoading) return <DashboardLoading />;
  if (error) return <DashboardMessage message="Unable to load your dashboard. Please refresh the page." />;
  if (!manuscriptId) {
    return <DashboardMessage message="Create a manuscript to start tracking reader activity." />;
  }
  if (!overviewQuery.data) return <DashboardMessage message="This manuscript is no longer available." />;

  return (
    <DashboardContent
      data={overviewQuery.data}
      manuscriptId={manuscriptId}
      selectedTagSlug={selectedTagSlug}
      onSelectTag={(tagSlug) => setSelectedTagSlug((current) => current === tagSlug ? null : tagSlug)}
    />
  );
}

function DashboardContent({
  data,
  manuscriptId,
  onSelectTag,
  selectedTagSlug,
}: {
  data: DashboardOverviewData;
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

  return (
    <div className="max-w-[1100px] px-5 py-7 sm:px-8 sm:py-8">
      <div className="mb-8 flex items-start justify-between gap-5">
        <div>
          <p className="mb-1 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Overview</p>
          <h1 className="text-[28px] font-normal leading-tight tracking-normal">{data.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{data.draftLabel} · {formatActivityDate(data.lastActivityAt)}</p>
        </div>
        <Button asChild size="sm" variant="outline" className="border-primary text-primary">
          <Link href={`/dashboard/readers?manuscriptId=${manuscriptId}`}>
            <UserPlus className="h-3.5 w-3.5" />
            Invite reader
          </Link>
        </Button>
      </div>

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
                <h2 className="mt-1 text-sm font-medium">Tags across all chapters</h2>
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
                        backgroundColor: tag.color,
                        height: `${Math.max(8, Math.round(tag.count / highestTagCount * 100))}%`,
                        opacity: selectedTagSlug && selectedTagSlug !== tag.slug ? 0.3 : 0.82,
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
                    style={{ backgroundColor: tag.color }}
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
                {data.readers.map((reader) => <ReaderProgress key={reader.id} reader={reader} totalChapters={data.chapters.length} />)}
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
                    <p className="text-xs leading-5 text-foreground/85">“{annotation.quote}”</p>
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

function ReaderProgress({ reader, totalChapters }: { reader: DashboardReader; totalChapters: number }) {
  const progress = totalChapters > 0 ? Math.round(reader.completedChapters / totalChapters * 100) : 0;
  return (
    <div>
      <div className="flex items-center gap-2.5">
        <span className="grid h-6 w-6 place-items-center rounded-full font-mono text-[8px] font-semibold text-white" style={{ backgroundColor: reader.color }}>{reader.initials}</span>
        <span className="flex-1 truncate text-[11px] font-medium">{reader.name}</span>
        <span className="px-1.5 py-0.5 font-mono text-[8px] uppercase" style={{ color: reader.status === "pending" ? "#8B7355" : reader.color, backgroundColor: `${reader.color}14` }}>{formatReaderStatus(reader.status)}</span>
      </div>
      <div className="mt-2 pl-8">
        <div className="mb-1 flex justify-between font-mono text-[8px] text-muted-foreground"><span>Ch {reader.completedChapters} of {totalChapters}</span><span>{progress}%</span></div>
        <div className="h-0.5 bg-foreground/[0.08]"><div className="h-full" style={{ width: `${progress}%`, backgroundColor: reader.status === "pending" ? "rgba(28,24,18,.2)" : reader.color }} /></div>
      </div>
    </div>
  );
}

function DashboardLoading() {
  return (
    <div className="max-w-[1100px] animate-pulse px-5 py-7 sm:px-8 sm:py-8">
      <div className="h-3 w-16 bg-foreground/10" />
      <div className="mt-3 h-8 w-72 max-w-full bg-foreground/10" />
      <div className="mt-2 h-4 w-44 bg-foreground/10" />
      <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-32 border border-foreground/10 bg-card" />)}</div>
    </div>
  );
}

function DashboardMessage({ message }: { message: string }) {
  return <div className="grid min-h-[420px] max-w-[1100px] place-items-center px-5 py-7 text-center text-sm text-muted-foreground sm:px-8">{message}</div>;
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
