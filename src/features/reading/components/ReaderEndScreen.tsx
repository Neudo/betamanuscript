import { BookCheck, RotateCcw } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

type ReaderEndScreenProps = {
  closingNote: string | null;
  manuscriptTitle: string;
  onReadAgain: () => void;
};

export function ReaderEndScreen({
  closingNote,
  manuscriptTitle,
  onReadAgain,
}: ReaderEndScreenProps) {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-2xl items-center px-5 py-12 sm:px-10">
      <section className="w-full border border-foreground/10 bg-card px-7 py-10 text-center shadow-sm sm:px-12 sm:py-14">
        <BookCheck className="mx-auto h-7 w-7 text-success" aria-hidden="true" />
        <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Reading complete
        </p>
        <h1 className="mt-3 font-display text-5xl font-semibold leading-none">The end</h1>
        <p className="mx-auto mt-6 max-w-md text-sm leading-7 text-muted-foreground">
          You&apos;ve reached the end of <span className="font-medium text-foreground">{manuscriptTitle}</span>.
          Thank you for taking the time to read it and share your perspective.
        </p>

        {closingNote ? (
          <div className="mt-10 border-y border-foreground/10 py-7 text-left">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              A note from the author
            </p>
            <p className="mt-4 whitespace-pre-wrap font-display text-lg leading-8 text-foreground/90">
              {closingNote}
            </p>
          </div>
        ) : null}

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Button asChild variant="outline" className="rounded-none">
            <Link href="/reader">Back to reading list</Link>
          </Button>
          <Button type="button" variant="ghost" onClick={onReadAgain} className="rounded-none">
            <RotateCcw className="h-3.5 w-3.5" />
            Read again
          </Button>
        </div>
      </section>
    </main>
  );
}
