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

const sections: Array<{
  status: ReaderManuscriptListItem["status"];
  title: string;
  statTitle: string;
}> = [
  { status: "reading", title: "Currently reading", statTitle: "Currently reading" },
  { status: "not-started", title: "Waiting to start", statTitle: "Not yet started" },
  { status: "finished", title: "Finished", statTitle: "Finished" },
];

function formatDeadline(value: string | null) {
  if (!value) return null;
  return new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
}

export function ReadingList() {
  const manuscriptsQuery = useReaderManuscripts();
  const manuscripts = manuscriptsQuery.data ?? [];

  return (
    <div className="min-h-full">
      <header className="border-b border-foreground/10 px-5 py-5 sm:px-8">
        <p className="mb-1 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Reader</p>
        <h1 className="text-[28px] font-medium leading-tight tracking-normal">Reading list</h1>
      </header>

      <div className="max-w-[1100px] space-y-10 p-5 sm:p-8">
        {manuscriptsQuery.isLoading ? <p className="text-sm text-muted-foreground">Loading your manuscripts…</p> : null}
        {manuscriptsQuery.isError ? (
          <Alert variant="destructive"><AlertDescription>{manuscriptsQuery.error.message}</AlertDescription></Alert>
        ) : null}

        {!manuscriptsQuery.isLoading && !manuscriptsQuery.isError && manuscripts.length === 0 ? (
          <Card className="border-dashed p-8 text-center">
            <BookOpen className="mx-auto h-5 w-5 text-muted-foreground" />
            <h2 className="mt-4 text-lg font-medium">No manuscript yet</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              When an author invites you and you accept, the manuscript will appear here.
            </p>
          </Card>
        ) : null}

        {manuscripts.length > 0 ? (
          <>
            <section className="grid gap-3 sm:grid-cols-3">
              {sections.map((section) => (
                <div key={section.status} className="border border-foreground/10 bg-card p-5">
                  <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">{section.statTitle}</p>
                  <p className="mt-3 text-3xl font-normal">{manuscripts.filter((item) => item.status === section.status).length}</p>
                </div>
              ))}
            </section>

            {sections.map((section) => {
              const items = manuscripts.filter((item) => item.status === section.status);
              if (items.length === 0) return null;

              return (
                <section key={section.status}>
                  <div className="mb-4 flex items-center gap-3">
                    <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{section.title}</h2>
                    <span className="h-px flex-1 bg-border" />
                  </div>
                  <div className="space-y-4">
                    {items.map((item) => <ReadingCard key={item.assignmentId} item={item} />)}
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

function ReadingCard({ item }: { item: ReaderManuscriptListItem }) {
  const progress = item.totalChapters > 0
    ? Math.round((item.completedChapters / item.totalChapters) * 100)
    : 0;
  const deadline = formatDeadline(item.deadline);
  const readingHref = item.status === "reading" && item.latestChapterId
    ? `/reader/${item.id}?chapter=${item.latestChapterId}`
    : item.status === "finished"
      ? `/reader/${item.id}?reread=1`
    : `/reader/${item.id}`;

  return (
    <Card className="group relative overflow-hidden border-foreground/10 p-0 transition-colors hover:border-primary/35">
      <div className="absolute inset-y-0 left-0 w-1 bg-primary" />
      <div className="grid gap-5 p-5 pl-7 sm:grid-cols-[78px_1fr] sm:p-6 sm:pl-8">
        <div className="relative flex aspect-[2/3] w-[78px] items-center justify-center overflow-hidden bg-primary text-primary-foreground shadow-sm">
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
              <h3 className="font-display text-[26px] font-semibold leading-tight">{item.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">Draft {item.versionNumber}</p>
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
              <span className="mr-2 font-mono text-[8px] uppercase tracking-[0.16em] text-primary">Note</span>
              <span>{item.note}</span>
            </blockquote>
          ) : null}

          <Link href={readingHref} className="mt-5 inline-flex items-center gap-2 text-xs font-medium text-primary">
            {item.status === "not-started" ? "Start reading" : item.status === "finished" ? "Read again" : "Continue reading"}
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </Card>
  );
}
