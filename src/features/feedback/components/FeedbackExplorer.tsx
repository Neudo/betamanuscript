"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TagBadge } from "@/features/dashboard/components/TagBadge";
import { annotations, readers, tagColors } from "@/features/dashboard/data/mock-dashboard";
import type { Annotation, AnnotationTag } from "@/features/dashboard/types";
import { cn } from "@/lib/utils";

const tags = Object.keys(tagColors) as AnnotationTag[];
const tagCounts: Record<AnnotationTag, number> = {
  Confusing: 6,
  "Pacing issue": 4,
  "Missing context": 3,
  "Strong line": 9,
  "Emotional impact": 2,
};

const chapterFilters = [
  { chapter: 2, count: 3 },
  { chapter: 3, count: 9 },
  { chapter: 4, count: 4 },
  { chapter: 5, count: 4 },
  { chapter: 6, count: 2 },
  { chapter: 7, count: 2 },
];

const tagStyles: Record<AnnotationTag, { color: string; background: string }> = {
  Confusing: { color: "#8B1A1A", background: "rgba(139,26,26,.10)" },
  "Pacing issue": { color: "#7A4800", background: "rgba(180,110,0,.10)" },
  "Missing context": { color: "#3B4A8A", background: "rgba(59,74,138,.10)" },
  "Strong line": { color: "#1E5C2E", background: "rgba(30,92,46,.10)" },
  "Emotional impact": { color: "#1A5C50", background: "rgba(26,92,80,.10)" },
};

export function FeedbackExplorer() {
  const [selectedTag, setSelectedTag] = useState<AnnotationTag | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [selectedReaderId, setSelectedReaderId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return annotations.filter((annotation) => {
      const matchesTag = selectedTag ? annotation.tag === selectedTag : true;
      const matchesChapter = selectedChapter ? annotation.chapter === selectedChapter : true;
      const matchesReader = selectedReaderId ? annotation.readerId === selectedReaderId : true;
      const matchesQuery = normalizedQuery
        ? `${annotation.comment} ${annotation.excerpt} ${annotation.chapterTitle}`.toLowerCase().includes(normalizedQuery)
        : true;
      return matchesTag && matchesChapter && matchesReader && matchesQuery;
    });
  }, [query, selectedChapter, selectedReaderId, selectedTag]);
  const annotationCount = selectedTag || selectedChapter || selectedReaderId || query.trim() ? filtered.length : 24;

  return (
    <div className="min-h-full md:grid md:h-full md:grid-cols-[210px_minmax(0,1fr)] md:overflow-hidden">
      <aside className="border-b border-foreground/10 bg-sidebar px-5 py-7 md:overflow-y-auto md:border-b-0 md:border-r">
        <FilterGroup label="Tag">
          {tags.map((tag) => (
            <button key={tag} type="button" onClick={() => setSelectedTag(selectedTag === tag ? null : tag)} className={cn("flex w-full items-center justify-between px-2 py-1.5 text-left text-xs transition-colors hover:bg-foreground/[0.04]", selectedTag === tag && "bg-foreground/[0.06] text-primary")}>
              <span>{tag}</span>
              <span className="font-mono text-[9px] text-muted-foreground">{tagCounts[tag]}</span>
            </button>
          ))}
        </FilterGroup>

        <FilterGroup label="Chapter">
          {chapterFilters.map(({ chapter, count }) => (
            <button
              key={chapter}
              type="button"
              aria-pressed={selectedChapter === chapter}
              onClick={() => setSelectedChapter(selectedChapter === chapter ? null : chapter)}
              className={cn(
                "flex w-full items-center justify-between px-2 py-1.5 text-left text-xs transition-colors hover:bg-foreground/[0.04]",
                selectedChapter === chapter && "bg-foreground/[0.06] text-primary",
              )}
            >
              <span>Ch {chapter}</span>
              <span className="font-mono text-[9px] text-muted-foreground">{count}</span>
            </button>
          ))}
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
              <span className="font-mono text-[9px] text-muted-foreground">{reader.annotations}</span>
            </button>
          ))}
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
          <span className="w-28 shrink-0 text-right font-mono text-[10px] text-muted-foreground">{annotationCount} annotations</span>
        </div>

        <TabsContent value="recent" className="m-0 md:flex-1 md:overflow-y-auto">
          <div className="divide-y divide-foreground/[0.08] px-5 sm:px-7">
            {filtered.map((annotation) => <AnnotationRow key={annotation.id} annotation={annotation} />)}
            {filtered.length === 0 ? <p className="py-16 text-center text-sm text-muted-foreground">No annotations match these filters.</p> : null}
          </div>
        </TabsContent>

        <TabsContent value="chapter" className="m-0 md:flex-1 md:overflow-y-auto">
          <div className="px-5 py-2 sm:px-7">
            {[...new Set(filtered.map((item) => item.chapter))].map((chapter) => (
              <section key={chapter} className="border-b border-foreground/10 py-5">
                <p className="mb-2 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Chapter {chapter}</p>
                {filtered.filter((item) => item.chapter === chapter).map((annotation) => <AnnotationRow key={annotation.id} annotation={annotation} compact />)}
              </section>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return <section className="mb-7"><p className="mb-3 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">{label}</p><div>{children}</div></section>;
}

function AnnotationRow({ annotation, compact = false }: { annotation: Annotation; compact?: boolean }) {
  const reader = readers.find((item) => item.id === annotation.readerId);
  const style = tagStyles[annotation.tag];

  return (
    <article className={cn("grid grid-cols-[30px_minmax(0,1fr)] gap-3 py-5", compact && "py-4")}>
      <span className="grid h-7 w-7 place-items-center rounded-full font-mono text-[9px] font-semibold text-white" style={{ backgroundColor: reader?.color }}>{reader?.initials}</span>
      <div className="min-w-0">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">{reader?.name}</span>
          <TagBadge tag={annotation.tag} />
          <span className="font-mono text-[9px] text-muted-foreground">Ch {annotation.chapter} — {annotation.chapterTitle}</span>
          <span className="ml-auto font-mono text-[9px] text-muted-foreground">{annotation.createdAt}</span>
        </div>
        <blockquote className="border-l-2 px-3 py-2 text-sm italic" style={{ borderLeftColor: style.color, backgroundColor: style.background }}>“{annotation.excerpt}”</blockquote>
        <p className="mt-2.5 text-sm leading-6 text-foreground/85">{annotation.comment}</p>
      </div>
    </article>
  );
}
