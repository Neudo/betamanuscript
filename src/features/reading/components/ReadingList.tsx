"use client";

import { ArrowRight, BookOpen, CalendarDays } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { ReaderManuscriptListItem } from "@/features/reading/api/reading";
import { useReaderManuscripts } from "@/features/reading/hooks/use-reading";
import { Heading } from "@/shared/ui/Heading";

const sections: Array<{
  status: ReaderManuscriptListItem["status"];
  title: string;
  statTitle: string;
}> = [
  { status: "reading", title: "Currently reading", statTitle: "Currently reading" },
  { status: "not-started", title: "Waiting to start", statTitle: "Not yet started" },
  { status: "finished", title: "Finished", statTitle: "Finished" },
];

type ReaderManuscriptBook = {
  drafts: ReaderManuscriptListItem[];
  id: string;
  selectedDraft: ReaderManuscriptListItem;
};

const readingStatusPriority: Record<ReaderManuscriptListItem["status"], number> = {
  reading: 0,
  "not-started": 1,
  finished: 2,
};

function formatDeadline(value: string | null) {
  if (!value) return null;
  return new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
}

function compareDrafts(left: ReaderManuscriptListItem, right: ReaderManuscriptListItem) {
  return readingStatusPriority[left.status] - readingStatusPriority[right.status]
    || right.versionNumber - left.versionNumber;
}

function groupManuscriptsByBook(
  manuscripts: ReaderManuscriptListItem[],
): ReaderManuscriptBook[] {
  const draftsByBook = new Map<string, Map<string, ReaderManuscriptListItem>>();

  for (const manuscript of manuscripts) {
    const drafts = draftsByBook.get(manuscript.id) ?? new Map<string, ReaderManuscriptListItem>();
    const existingDraft = drafts.get(manuscript.versionId);

    if (!existingDraft || compareDrafts(manuscript, existingDraft) < 0) {
      drafts.set(manuscript.versionId, manuscript);
    }

    draftsByBook.set(manuscript.id, drafts);
  }

  return [...draftsByBook.entries()]
    .map(([id, drafts]) => {
      const sortedDrafts = [...drafts.values()].sort(compareDrafts);

      return {
        drafts: sortedDrafts,
        id,
        selectedDraft: sortedDrafts[0],
      };
    })
    .sort((left, right) => compareDrafts(left.selectedDraft, right.selectedDraft));
}

export function ReadingList() {
  const manuscriptsQuery = useReaderManuscripts();
  const manuscripts = manuscriptsQuery.data ?? [];
  const books = groupManuscriptsByBook(manuscripts);

  return (
    <div className="min-h-full">
      <header className="border-b border-foreground/10 px-5 py-5 sm:px-8">
        <p className="mb-1 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Reader</p>
        <Heading level={1} size="workspace">Reading list</Heading>
      </header>

      <div className="max-w-[1100px] space-y-10 p-5 sm:p-8">
        {manuscriptsQuery.isLoading ? <p className="text-sm text-muted-foreground">Loading your manuscripts…</p> : null}
        {manuscriptsQuery.isError ? (
          <Alert variant="destructive"><AlertDescription>{manuscriptsQuery.error.message}</AlertDescription></Alert>
        ) : null}

        {!manuscriptsQuery.isLoading && !manuscriptsQuery.isError && books.length === 0 ? (
          <Card className="border-dashed p-8 text-center">
            <BookOpen className="mx-auto h-5 w-5 text-muted-foreground" />
            <Heading level={2} size="subsection" className="mt-4">No manuscript yet</Heading>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              When an author invites you and you accept, the manuscript will appear here.
            </p>
          </Card>
        ) : null}

        {books.length > 0 ? (
          <>
            <section className="grid gap-3 sm:grid-cols-3">
              {sections.map((section) => (
                <div key={section.status} className="border border-foreground/10 bg-card p-5">
                  <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">{section.statTitle}</p>
                  <p className="mt-3 text-3xl font-normal">{books.filter((book) => book.selectedDraft.status === section.status).length}</p>
                </div>
              ))}
            </section>

            {sections.map((section) => {
              const bookItems = books.filter((book) => book.selectedDraft.status === section.status);
              if (bookItems.length === 0) return null;

              return (
                <section key={section.status}>
                  <div className="mb-4 flex items-center gap-3">
                    <Heading level={2} size="label" tone="muted">{section.title}</Heading>
                    <span className="h-px flex-1 bg-border" />
                  </div>
                  <div className="space-y-4">
                    {bookItems.map((book) => <ReadingCard key={book.id} book={book} />)}
                  </div>
                </section>
              );
            })}
          </>
        ) : null}
      </div>
    </div>
  );
}

function ReadingCard({ book }: { book: ReaderManuscriptBook }) {
  const item = book.selectedDraft;
  const progress = item.totalChapters > 0
    ? Math.round((item.completedChapters / item.totalChapters) * 100)
    : 0;
  const deadline = formatDeadline(item.deadline);
  const readingParams = new URLSearchParams({ version: item.versionId });
  if (item.status === "reading" && item.latestChapterId) {
    readingParams.set("chapter", item.latestChapterId);
  } else if (item.status === "finished") {
    readingParams.set("reread", "1");
  }
  const readingHref = `/reader/${item.id}?${readingParams.toString()}`;

  return (
    <Card className="group relative overflow-hidden border-foreground/10 p-0 transition-colors hover:border-primary/35">
      <div className="absolute inset-y-0 left-0 w-1 bg-primary" />
      <div className="grid gap-5 p-5 pl-7 sm:grid-cols-[78px_1fr] sm:p-6 sm:pl-8">
        <div className="relative flex h-[117px] w-[78px] shrink-0 items-center justify-center overflow-hidden bg-primary text-primary-foreground shadow-sm">
          {item.coverUrl ? (
            <Image
              src={item.coverUrl}
              alt={`${item.title} cover`}
              fill
              sizes="78px"
              unoptimized
              className="object-cover"
            />
          ) : <BookOpen className="h-5 w-5 opacity-60" strokeWidth={1.25} />}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <Heading level={3}>{item.title}</Heading>
              <p className="mt-1 text-xs text-muted-foreground">
                Draft {item.versionNumber}{book.drafts.length > 1 ? ` of ${book.drafts.length}` : ""}
              </p>
            </div>
            <Badge variant="outline" className="rounded-none font-mono text-[8px] uppercase">
              {item.status === "not-started" ? "Not started" : item.status}
            </Badge>
          </div>

          {deadline ? (
            <p className="mt-4 flex items-center gap-1.5 text-[10px] text-muted-foreground"><CalendarDays className="h-3 w-3" />Deadline {deadline}</p>
          ) : null}
          {item.logline ? <p className="mt-4 text-sm leading-6 text-foreground/80">{item.logline}</p> : null}

          {item.status !== "not-started" ? (
            <div className="mt-5 flex items-center gap-3">
              <Progress value={progress} className="h-1.5 flex-1" />
              <span className="font-mono text-[9px] text-muted-foreground">Ch {item.completedChapters} of {item.totalChapters} · {progress}%</span>
            </div>
          ) : null}

          {item.note ? (
            <blockquote className="mt-5 border-l-2 border-primary/40 bg-background/70 px-4 py-3 text-xs leading-5 text-muted-foreground">
              <span className="mr-2 font-mono text-[8px] uppercase tracking-[0.16em] text-primary-text">Note</span>
              <span>{item.note}</span>
            </blockquote>
          ) : null}

          <Link href={readingHref} className="mt-5 inline-flex items-center gap-2 text-xs font-medium text-primary-text">
            {item.status === "not-started" ? "Start reading" : item.status === "finished" ? "Read again" : "Continue reading"}
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </Card>
  );
}
