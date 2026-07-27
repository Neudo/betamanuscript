"use client";

import { Check, MessageSquarePlus, MousePointer2, X } from "lucide-react";

import { Button } from "@/components/ui/button";

type ReaderAnnotationGuideProps = {
  onDismiss: () => void;
};

export function ReaderAnnotationGuide({ onDismiss }: ReaderAnnotationGuideProps) {
  return (
    <aside
      className="relative mt-8 select-none overflow-hidden border border-primary/20 bg-primary/[0.045] px-5 py-5 sm:px-6"
      aria-labelledby="reader-annotation-guide-title"
    >

      <div className="relative flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
            <MousePointer2 className="h-4 w-4" aria-hidden="true" />
          </div>
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-primary">A quick note before you begin</p>
            <h2 id="reader-annotation-guide-title" className="mt-1 font-display text-xl font-semibold leading-tight">
              Leave feedback as you read
            </h2>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="-mr-2 -mt-1 shrink-0 text-muted-foreground"
          onClick={onDismiss}
          aria-label="Dismiss feedback instructions"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>

      <div className="relative mt-5 grid gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] sm:gap-7">
        <div className="border-l-2 border-primary/60 bg-card/70 px-4 py-3.5 text-[15px] leading-6 text-foreground/80">
          <span className="bg-primary/20 px-0.5 text-foreground">A passage that made you pause</span>
          <span className="text-muted-foreground"> can become useful feedback for the author.</span>
        </div>

        <ol className="space-y-3 text-sm leading-5 text-foreground/80">
          <li className="flex gap-3">
            <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full border border-primary/35 font-mono text-[9px] text-primary">1</span>
            <span><strong className="font-medium text-foreground">Select a passage</strong> that sparked a reaction — even across paragraphs.</span>
          </li>
          <li className="flex gap-3">
            <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full border border-primary/35 font-mono text-[9px] text-primary">2</span>
            <span><strong className="font-medium text-foreground">Choose a tag</strong> and add a comment in the panel that opens.</span>
          </li>
        </ol>
      </div>

      <div className="relative mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-primary/15 pt-4">
        <p className="text-xs leading-5 text-muted-foreground">
          On a phone, press and hold the text, then adjust the selection handles.
        </p>
        <Button type="button" variant="ghost" size="sm" className="-mr-2 text-primary" onClick={onDismiss}>
          <Check className="h-3.5 w-3.5" aria-hidden="true" />
          I&apos;m ready
        </Button>
      </div>
    </aside>
  );
}
