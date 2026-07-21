"use client";

import { Check, FileUp, MessageSquareText, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { TagBadge } from "@/features/dashboard/components/TagBadge";
import { annotations as initialAnnotations, chapters as initialChapters, manuscript, readers } from "@/features/dashboard/data/mock-dashboard";
import type { ChapterStatus } from "@/features/dashboard/types";
import { cn } from "@/lib/utils";

const statusStyles: Record<ChapterStatus, string> = {
  Complete: "border-success/25 bg-success/10 text-success",
  "Needs work": "border-warning/25 bg-warning/10 text-warning",
  Draft: "border-foreground/10 bg-foreground/[0.04] text-muted-foreground",
};

const wordCountFormat = new Intl.NumberFormat("en-US");

export function ManuscriptWorkspace() {
  const [chapters, setChapters] = useState(initialChapters);
  const [selectedId, setSelectedId] = useState(initialChapters[0].id);
  const [readAnnotationIds, setReadAnnotationIds] = useState<Set<string>>(() => new Set());
  const selectedChapter = chapters.find((chapter) => chapter.id === selectedId) ?? chapters[0];
  const chapterAnnotations = useMemo(() => initialAnnotations.filter((annotation) => annotation.chapter === selectedChapter.number), [selectedChapter.number]);
  const completeCount = chapters.filter((chapter) => chapter.status === "Complete").length;
  const progress = Math.round((completeCount / chapters.length) * 100);

  function updateStatus(status: ChapterStatus) {
    setChapters((current) => current.map((chapter) => chapter.id === selectedChapter.id ? { ...chapter, status } : chapter));
  }

  function toggleAnnotationRead(id: string) {
    setReadAnnotationIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="grid min-h-[calc(100vh-3.5rem)] md:h-screen md:grid-cols-[280px_minmax(0,1fr)] md:overflow-hidden">
      <aside className="border-r border-foreground/10 bg-sidebar/70 md:flex md:min-h-0 md:flex-col">
        <div className="border-b border-foreground/10 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Manuscript</p>
              <p className="mt-2 text-sm font-medium leading-snug">{manuscript.sourceFile}</p>
              <p className="mt-1 font-mono text-[9px] text-muted-foreground">{wordCountFormat.format(manuscript.words)} words · {completeCount}/{chapters.length} complete</p>
            </div>
            <Button variant="link" size="sm" className="text-[10px]">Change</Button>
          </div>
        </div>

        <div className="border-b border-foreground/10 bg-card px-5 py-3">
          <div className="mb-2 flex items-center justify-between font-mono text-[9px] text-muted-foreground"><span>Progress</span><span>{progress}%</span></div>
          <Progress value={progress} className="h-1 rounded-none" />
        </div>

        <ScrollArea className="md:flex-1">
          <div className="divide-y divide-foreground/[0.08]">
            {chapters.map((chapter) => (
              <button key={chapter.id} type="button" onClick={() => setSelectedId(chapter.id)} className={cn("grid w-full grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-3 border-l-2 border-l-transparent px-4 py-4 text-left transition-colors hover:bg-foreground/[0.035]", selectedChapter.id === chapter.id && "border-l-primary bg-foreground/[0.055]")}>
                <span className="text-center font-mono text-[10px] text-muted-foreground">{chapter.number}</span>
                <span className="min-w-0">
                  <span className="block truncate text-xs font-medium">{chapter.title}</span>
                  <span className="mt-1 block font-mono text-[9px] text-muted-foreground">{wordCountFormat.format(chapter.words)} words · <MessageSquareText className="inline h-2.5 w-2.5" /> {chapter.annotations}</span>
                </span>
                <Badge variant="outline" className={cn("rounded-none font-mono text-[8px] uppercase", statusStyles[chapter.status])}>{chapter.status}</Badge>
              </button>
            ))}
          </div>
        </ScrollArea>

        <div className="border-t border-foreground/10 p-3">
          <Button variant="ghost" size="sm" className="w-full justify-start bg-transparent text-muted-foreground"><Plus className="h-3.5 w-3.5" />Add chapter</Button>
          <p className="mt-2 text-center font-mono text-[8px] text-muted-foreground">Chapters are detected automatically on import</p>
        </div>
      </aside>

      <section className="min-w-0 bg-background md:flex md:min-h-0 md:flex-col">
        <div className="flex min-h-16 flex-col gap-3 border-b border-foreground/10 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <span className="shrink-0 font-mono text-[9px] text-muted-foreground">Ch {selectedChapter.number}</span>
            <h1 className="truncate text-base font-medium">{selectedChapter.title}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-2 font-mono text-[9px] text-muted-foreground">{wordCountFormat.format(selectedChapter.words)} words</span>
            <AnnotationSheet annotations={chapterAnnotations} readIds={readAnnotationIds} onToggleRead={toggleAnnotationRead} count={selectedChapter.annotations} chapter={selectedChapter.number} />
            <Select value={selectedChapter.status} onValueChange={(value) => updateStatus(value as ChapterStatus)}>
              <SelectTrigger className={cn("h-9 w-[138px] rounded-none border-foreground/15 font-mono text-[10px]", statusStyles[selectedChapter.status])}><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="Complete">Complete</SelectItem><SelectItem value="Needs work">Needs work</SelectItem><SelectItem value="Draft">Draft</SelectItem></SelectContent>
            </Select>
          </div>
        </div>

        <ScrollArea className="md:flex-1">
          <article className="reader-copy mx-auto max-w-3xl px-5 py-10 sm:px-10 sm:py-14">
            <h2 className="font-display text-[42px] leading-none">{selectedChapter.title}</h2>
            <div className="mt-10 space-y-6 font-display text-[20px] leading-8 text-foreground/90 sm:text-[22px] sm:leading-9">
              {selectedChapter.content.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
            <div className="mt-12 flex flex-wrap gap-2 border-t border-foreground/10 pt-6">
              <Button variant="outline" size="sm"><FileUp className="h-3.5 w-3.5" />Replace manuscript</Button>
              <Button variant="ghost" size="sm" className="text-destructive"><Trash2 className="h-3.5 w-3.5" />Delete chapter</Button>
            </div>
          </article>
        </ScrollArea>
      </section>
    </div>
  );
}

function AnnotationSheet({ annotations, readIds, onToggleRead, count, chapter }: { annotations: typeof initialAnnotations; readIds: Set<string>; onToggleRead: (id: string) => void; count: number; chapter: number }) {
  return (
    <Sheet>
      <SheetTrigger asChild><Button variant="outline" size="sm"><MessageSquareText className="h-3.5 w-3.5" />{count} annotations{readIds.size > 0 ? <span className="text-success">· {readIds.size} read</span> : null}</Button></SheetTrigger>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader><SheetTitle className="text-[28px] font-medium">Chapter annotations</SheetTitle><SheetDescription>Comments tied to passages in chapter {chapter}.</SheetDescription></SheetHeader>
        <div className="mt-6 space-y-3">
          {annotations.length > 0 ? annotations.map((annotation) => {
            const reader = readers.find((item) => item.id === annotation.readerId);
            const isRead = readIds.has(annotation.id);
            return (
              <article key={annotation.id} className={cn("border border-foreground/10 p-4", isRead && "bg-muted/55 text-muted-foreground")}>
                <div className="flex items-center gap-3">
                  <span className={cn("grid h-8 w-8 place-items-center rounded-full text-xs text-white", isRead && "grayscale")} style={{ backgroundColor: reader?.color }}>{reader?.initials}</span>
                  <div className="min-w-0 flex-1"><p className="text-xs font-medium">{reader?.name}</p><TagBadge tag={annotation.tag} className={cn(isRead && "grayscale opacity-60")} /></div>
                  <span className="font-mono text-[9px] text-muted-foreground">{annotation.createdAt}</span>
                </div>
                <blockquote className={cn("mt-4 border-l-2 pl-3 text-sm leading-6", isRead && "line-through")} style={{ borderLeftColor: reader?.color }}>“{annotation.comment}”</blockquote>
                <Button variant="ghost" size="sm" className={cn("mt-3 px-0", isRead && "text-success")} onClick={() => onToggleRead(annotation.id)}><Check className="h-3.5 w-3.5" />{isRead ? "Read — undo" : "Mark as read"}</Button>
              </article>
            );
          }) : <div className="border border-dashed border-foreground/15 p-8 text-center text-sm text-muted-foreground">No annotations in this chapter yet.</div>}
        </div>
      </SheetContent>
    </Sheet>
  );
}
