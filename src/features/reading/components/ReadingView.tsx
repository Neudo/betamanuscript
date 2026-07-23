"use client";

import { ArrowLeft, ArrowRight, Check, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCompleteReaderChapter, useReaderManuscript } from "@/features/reading/hooks/use-reading";

export function ReadingView({ manuscriptId }: { manuscriptId: string }) {
  const manuscriptQuery = useReaderManuscript(manuscriptId);
  const completeChapterMutation = useCompleteReaderChapter();
  const [chapterIndex, setChapterIndex] = useState(0);
  const manuscript = manuscriptQuery.data;
  const chapters = manuscript?.chapters ?? [];
  const currentChapterIndex = Math.min(chapterIndex, Math.max(0, chapters.length - 1));
  const chapter = chapters[currentChapterIndex];

  if (manuscriptQuery.isLoading) {
    return <div className="p-8 text-sm text-muted-foreground">Loading manuscript…</div>;
  }

  if (manuscriptQuery.isError) {
    return <div className="p-8"><Alert variant="destructive"><AlertDescription>{manuscriptQuery.error.message}</AlertDescription></Alert></div>;
  }

  if (!manuscript || !chapter) {
    return (
      <div className="p-8">
        <Alert><AlertDescription>This manuscript is unavailable or has no readable chapters yet.</AlertDescription></Alert>
      </div>
    );
  }

  const progress = (currentChapterIndex + 1) / chapters.length * 100;
  const readerAssignmentId = manuscript.assignmentId;

  function completeAndContinue() {
    completeChapterMutation.mutate(
      { chapterId: chapter.id, readerAssignmentId },
      {
        onSuccess() {
          if (currentChapterIndex < chapters.length - 1) {
            setChapterIndex((current) => current + 1);
          }
        },
      },
    );
  }

  return (
    <div className="relative min-h-full bg-surface">
      <Progress value={progress} className="sticky top-0 z-20 h-0.5 rounded-none" />

      <header className="sticky top-0.5 z-10 border-b border-foreground/10 bg-surface px-4 py-2 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <Link href="/reader" className="flex items-center gap-1 text-xs text-muted-foreground"><ChevronLeft className="h-3.5 w-3.5" />Reading list</Link>
            <span className="h-7 w-px bg-foreground/10" />
            <p className="text-sm font-medium">{manuscript.title}</p>
          </div>
          <Select value={String(currentChapterIndex)} onValueChange={(value) => setChapterIndex(Number(value))}>
            <SelectTrigger className="h-9 w-[260px] rounded-none border-foreground/15 bg-card text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {chapters.map((item, index) => (
                <SelectItem key={item.id} value={String(index)}>Ch {item.position}: {item.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      <article className="reader-copy mx-auto max-w-[760px] px-5 py-12 sm:px-10 sm:py-16">
        <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">Chapter {chapter.position}</p>
        <h1 className="mt-4 font-display text-[42px] font-semibold leading-none">{chapter.title}</h1>
        <div className="mt-12 space-y-7 font-display text-[21px] leading-9 text-foreground/90 sm:text-[23px] sm:leading-10">
          {chapter.blocks.length > 0 ? chapter.blocks.map((block) => (
            <p key={block.id}>{block.content}</p>
          )) : <p className="text-muted-foreground">This chapter has no text yet.</p>}
        </div>

        {completeChapterMutation.isError ? (
          <Alert variant="destructive" className="mt-8"><AlertDescription>{completeChapterMutation.error.message}</AlertDescription></Alert>
        ) : null}

        <nav className="mt-14 flex items-center justify-between border-t pt-6" aria-label="Chapter navigation">
          <Button variant="ghost" size="sm" disabled={currentChapterIndex === 0} onClick={() => setChapterIndex((current) => Math.max(0, current - 1))}>
            <ArrowLeft className="h-3.5 w-3.5" />Previous chapter
          </Button>
          <span className="font-mono text-[9px] text-muted-foreground">{currentChapterIndex + 1} / {chapters.length}</span>
          <Button size="sm" onClick={completeAndContinue} disabled={completeChapterMutation.isPending}>
            {completeChapterMutation.isPending
              ? "Saving…"
              : currentChapterIndex === chapters.length - 1
                ? "Mark chapter complete"
                : "Complete & next"}
            {currentChapterIndex === chapters.length - 1 ? <Check className="h-3.5 w-3.5" /> : <ArrowRight className="h-3.5 w-3.5" />}
          </Button>
        </nav>
      </article>
    </div>
  );
}
