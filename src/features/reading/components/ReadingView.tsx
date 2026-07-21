"use client";

import { ArrowLeft, ArrowRight, Check, ChevronLeft, MessageSquarePlus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { chapters, tagColors } from "@/features/dashboard/data/mock-dashboard";
import type { AnnotationTag } from "@/features/dashboard/types";

const tags = Object.keys(tagColors) as AnnotationTag[];

export function ReadingView() {
  const [chapterIndex, setChapterIndex] = useState(0);
  const [activeParagraph, setActiveParagraph] = useState<number | null>(null);
  const [selectedTag, setSelectedTag] = useState<AnnotationTag>("Confusing");
  const [note, setNote] = useState("");
  const [savedAnnotations, setSavedAnnotations] = useState<Record<number, AnnotationTag>>({
    1: "Strong line",
  });
  const chapter = chapters[chapterIndex];
  const progress = ((chapterIndex + 1) / chapters.length) * 100;

  function saveAnnotation() {
    if (activeParagraph === null) return;
    setSavedAnnotations((current) => ({ ...current, [activeParagraph]: selectedTag }));
    setActiveParagraph(null);
    setNote("");
  }

  return (
    <div className="relative min-h-full bg-surface">
      <Progress value={progress} className="sticky top-0 z-20 h-0.5 rounded-none" />

      <header className="sticky top-0.5 z-10 border-b border-foreground/10 bg-surface px-4 py-2 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <Link href="/reader" className="flex items-center gap-1 text-xs text-muted-foreground"><ChevronLeft className="h-3.5 w-3.5" />Reading list</Link>
            <span className="h-7 w-px bg-foreground/10" />
            <p className="text-sm font-medium">The Last Cartographer <span className="ml-1 font-normal text-muted-foreground">by Jo Harper</span></p>
          </div>
          <Select value={String(chapterIndex)} onValueChange={(value) => setChapterIndex(Number(value))}>
            <SelectTrigger className="h-9 w-[260px] rounded-none border-foreground/15 bg-card text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {chapters.map((item, index) => (
                <SelectItem key={item.id} value={String(index)}>Ch {item.number}: {item.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      <article className="reader-copy mx-auto max-w-[760px] px-5 py-12 sm:px-10 sm:py-16">
        <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">Chapter {chapter.number}</p>
        <h1 className="mt-4 font-display text-[42px] font-semibold leading-none">{chapter.title}</h1>
        <div className="mt-12 space-y-7 font-display text-[21px] leading-9 text-foreground/90 sm:text-[23px] sm:leading-10">
          {chapter.content.map((paragraph, index) => {
            const savedTag = savedAnnotations[index];
            return (
              <div key={paragraph} className="group relative pr-11 sm:pr-0">
                {savedTag ? (
                  <span className="absolute -left-4 inset-y-1 w-0.5 bg-primary sm:-left-7" title={savedTag} />
                ) : null}
                <p>{paragraph}</p>
                <Button
                  variant="outline"
                  size="icon-sm"
                  className={cn(
                    "absolute -right-1 top-1/2 -translate-y-1/2 bg-card opacity-100 shadow-sm transition-opacity sm:-right-12 sm:opacity-0 sm:group-hover:opacity-100",
                    savedTag && "border-primary text-primary sm:opacity-100",
                  )}
                  onClick={() => setActiveParagraph(index)}
                  aria-label={`Annotate paragraph ${index + 1}`}
                >
                  {savedTag ? <Check className="h-3.5 w-3.5" /> : <MessageSquarePlus className="h-3.5 w-3.5" />}
                </Button>
              </div>
            );
          })}
        </div>

        <nav className="mt-14 flex items-center justify-between border-t pt-6" aria-label="Chapter navigation">
          <Button variant="ghost" size="sm" disabled={chapterIndex === 0} onClick={() => setChapterIndex((current) => Math.max(0, current - 1))}>
            <ArrowLeft className="h-3.5 w-3.5" />Previous chapter
          </Button>
          <span className="font-mono text-[9px] text-muted-foreground">{chapterIndex + 1} / {chapters.length}</span>
          <Button size="sm" onClick={() => setChapterIndex((current) => Math.min(chapters.length - 1, current + 1))}>
            {chapterIndex === chapters.length - 1 ? "Mark as finished" : "Next chapter"}
            {chapterIndex === chapters.length - 1 ? <Check className="h-3.5 w-3.5" /> : <ArrowRight className="h-3.5 w-3.5" />}
          </Button>
        </nav>
      </article>

      <Sheet open={activeParagraph !== null} onOpenChange={(open) => { if (!open) setActiveParagraph(null); }}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="font-display text-3xl">Add annotation</SheetTitle>
            <SheetDescription>Tag the passage, then add context if it helps the writer.</SheetDescription>
          </SheetHeader>
          {activeParagraph !== null ? (
            <div className="mt-6 space-y-6">
              <blockquote className="border-l-2 border-primary/40 bg-muted/40 p-4 text-sm italic leading-6 text-muted-foreground">
                “{chapter.content[activeParagraph]}”
              </blockquote>
              <RadioGroup value={selectedTag} onValueChange={(value) => setSelectedTag(value as AnnotationTag)} className="grid grid-cols-2 gap-2">
                {tags.map((tag) => (
                  <Label key={tag} htmlFor={`annotation-${tag}`} className={cn("flex cursor-pointer items-center gap-2 border p-3 text-xs", selectedTag === tag && "border-primary bg-primary/[0.04]")}>
                    <RadioGroupItem id={`annotation-${tag}`} value={tag} />{tag}
                  </Label>
                ))}
              </RadioGroup>
              <div className="space-y-2">
                <Label htmlFor="annotation-note">Optional note</Label>
                <Textarea id="annotation-note" value={note} onChange={(event) => setNote(event.target.value)} placeholder="What made this passage stand out?" />
              </div>
              <Button className="w-full" onClick={saveAnnotation}>Save annotation</Button>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
