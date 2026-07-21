"use client";

import { MessageSquare } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";
import {
  annotations,
  chapters,
  manuscript,
  readers,
  revisionPriorities,
} from "../data/mock-dashboard";
import type { AnnotationTag } from "../types";
import { InviteReaderDialog } from "./InviteReaderDialog";
import { TagBadge } from "./TagBadge";

const stats = [
  ["Total annotations", "64", "across 9 chapters"],
  ["Active readers", "4 / 5", "1 invited, not started"],
  ["Chapters reached", "7 / 9", "2 chapters unread"],
] as const;

const bars: Array<{ tag: AnnotationTag; count: number; color: string }> = [
  { tag: "Strong line", count: 21, color: "#1E5C2E" },
  { tag: "Confusing", count: 18, color: "#8B1A1A" },
  { tag: "Pacing issue", count: 11, color: "#A47A3A" },
  { tag: "Missing context", count: 9, color: "#6874A3" },
  { tag: "Emotional impact", count: 6, color: "#4E8377" },
];

export function DashboardOverview() {
  const [selectedTag, setSelectedTag] = useState<AnnotationTag | null>(null);
  const recentAnnotations = selectedTag
    ? annotations.filter((annotation) => annotation.tag === selectedTag)
    : annotations.slice(0, 6);

  return (
    <div className="max-w-[1100px] px-5 py-7 sm:px-8 sm:py-8">
      <div className="mb-8 flex items-start justify-between gap-5">
        <div>
          <p className="mb-1 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Overview</p>
          <h1 className="text-[28px] font-normal leading-tight tracking-normal">{manuscript.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{manuscript.draft} · Last activity 2 hours ago</p>
        </div>
        <InviteReaderDialog />
      </div>

      <section className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map(([label, value, detail]) => (
          <StatCard key={label} label={label} value={value} detail={detail} />
        ))}
        <StatCard label="Most flagged" value="Ch. 3" detail="15 annotations" accent />
      </section>

      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <section className="border border-foreground/10 bg-card p-5">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Annotation frequency</p>
                <h2 className="mt-1 text-sm font-medium">Tags across all chapters</h2>
              </div>
              <span className="font-mono text-[9px] text-muted-foreground">↗ 64 total</span>
            </div>
            <div className="flex h-[165px] items-end justify-around gap-3 px-2">
              {bars.map((bar) => (
                <button key={bar.tag} type="button" onClick={() => setSelectedTag(selectedTag === bar.tag ? null : bar.tag)} className="flex h-full min-w-0 flex-1 flex-col justify-end gap-2" title={`Filter by ${bar.tag}`}>
                  <span className="sr-only">{bar.count} annotations</span>
                  <span className="mx-auto w-full max-w-[40px] transition-opacity" style={{ height: `${bar.count * 5}px`, backgroundColor: bar.color, opacity: selectedTag && selectedTag !== bar.tag ? 0.3 : 0.82 }} />
                  <span className="min-h-7 text-center font-mono text-[8px] leading-3 text-muted-foreground">{bar.tag}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="border border-foreground/10 bg-card p-5">
            <p className="mb-4 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Chapters</p>
            <div className="divide-y divide-foreground/[0.07]">
              {chapters.map((chapter) => (
                <div key={chapter.id} className="grid grid-cols-[22px_minmax(0,1fr)_auto] items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                  <span className="font-mono text-[9px] text-muted-foreground">{chapter.number}</span>
                  <span className="truncate text-[11px] font-medium">{chapter.title}</span>
                  <span className="flex gap-3 font-mono text-[9px] text-muted-foreground">
                    <span>{chapter.annotations} notes</span>
                    <span>{Math.max(1, 6 - Math.floor(chapter.number / 2))}/5 readers</span>
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="border border-foreground/10 bg-card">
            <div className="flex items-center justify-between gap-4 border-b border-foreground/10 px-5 py-4">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Recent annotations</p>
                <p className="mt-1 font-mono text-[9px] text-muted-foreground">{recentAnnotations.length} shown</p>
              </div>
              <div className="flex gap-1">
                {bars.map((bar) => (
                  <button key={bar.tag} type="button" className={cn("h-3 w-3 transition-opacity", selectedTag && selectedTag !== bar.tag && "opacity-30")} style={{ backgroundColor: bar.color }} onClick={() => setSelectedTag(selectedTag === bar.tag ? null : bar.tag)} aria-label={`Filter by ${bar.tag}`} />
                ))}
              </div>
            </div>
            <div className="divide-y divide-foreground/[0.07]">
              {recentAnnotations.map((annotation) => {
                const reader = readers.find((item) => item.id === annotation.readerId);
                return (
                  <article key={annotation.id} className="grid grid-cols-[28px_minmax(0,1fr)] gap-3 px-5 py-3.5">
                    <span className="grid h-6 w-6 place-items-center rounded-full font-mono text-[8px] font-semibold text-white" style={{ backgroundColor: reader?.color }}>{reader?.initials}</span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-medium">{reader?.name}</span>
                        <TagBadge tag={annotation.tag} />
                        <span className="font-mono text-[9px] text-muted-foreground">Ch {annotation.chapter}</span>
                        <span className="ml-auto font-mono text-[9px] text-muted-foreground">{annotation.createdAt}</span>
                      </div>
                      <p className="mt-1.5 line-clamp-2 text-[11px] leading-snug text-foreground/75">“{annotation.comment}”</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="border border-foreground/10 bg-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Beta readers</p>
              <MessageSquare className="h-3 w-3 text-muted-foreground" strokeWidth={1.5} />
            </div>
            <div className="space-y-4">
              {readers.map((reader) => {
                const progress = Math.round((reader.chapter / chapters.length) * 100);
                return (
                  <div key={reader.id}>
                    <div className="flex items-center gap-2.5">
                      <span className="grid h-6 w-6 place-items-center rounded-full font-mono text-[8px] font-semibold text-white" style={{ backgroundColor: reader.color }}>{reader.initials}</span>
                      <span className="flex-1 text-[11px] font-medium">{reader.name}</span>
                      <span className="px-1.5 py-0.5 font-mono text-[8px] uppercase" style={{ color: reader.status === "inactive" ? "#8B7355" : reader.color, backgroundColor: `${reader.color}14` }}>{reader.status}</span>
                    </div>
                    <div className="mt-2 pl-8">
                      <div className="mb-1 flex justify-between font-mono text-[8px] text-muted-foreground"><span>Ch {reader.chapter} of 9</span><span>{progress}%</span></div>
                      <div className="h-0.5 bg-foreground/[0.08]"><div className="h-full" style={{ width: `${progress}%`, backgroundColor: reader.status === "inactive" ? "rgba(28,24,18,.2)" : reader.color }} /></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="border border-foreground/10 bg-card p-5">
            <p className="mb-4 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Revision priorities</p>
            <div className="divide-y divide-foreground/[0.07]">
              {revisionPriorities.map((priority, index) => (
                <div key={priority.chapter} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                  <span className="w-4 shrink-0 font-mono text-[9px] font-medium text-muted-foreground">{index + 1}.</span>
                  <div>
                    <div className="mb-1 flex items-center gap-1.5"><span className="font-mono text-[9px] text-muted-foreground">{priority.chapter}</span><TagBadge tag={priority.tag} /></div>
                    <p className="text-[11px] leading-snug text-foreground/75">{priority.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="border border-foreground/10 bg-card p-5">
            <p className="mb-4 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Strongest moments</p>
            <div className="divide-y divide-foreground/[0.07]">
              {[["Ch 3", "Guild confrontation line", 4], ["Ch 2", "Opening paragraph", 4], ["Ch 5", "The border crossing", 3]].map(([chapter, scene, count]) => (
                <div key={String(scene)} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div><p className="font-mono text-[9px] text-muted-foreground">{chapter}</p><p className="mt-0.5 text-xs">{scene}</p></div>
                  <div className="flex gap-0.5">{Array.from({ length: 5 }, (_, index) => <span key={index} className="h-1.5 w-1.5" style={{ backgroundColor: index < Number(count) ? "#2C3E2D" : "rgba(28,24,18,.1)" }} />)}</div>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function StatCard({ label, value, detail, accent = false }: { label: string; value: string; detail: string; accent?: boolean }) {
  return (
    <div className={cn("border border-foreground/10 bg-card p-5", accent && "border-primary/25 bg-primary/[0.03]")}>
      <p className="mb-2 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className={cn("mb-1 text-3xl font-normal leading-none", accent && "text-primary")}>{value}</p>
      <p className="font-mono text-[10px] text-muted-foreground">{detail}</p>
    </div>
  );
}
