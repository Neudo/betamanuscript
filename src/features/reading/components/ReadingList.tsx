import { ArrowRight, BookOpen, CalendarDays } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { readingList } from "@/features/dashboard/data/mock-dashboard";
import type { ReadingListItem } from "@/features/dashboard/types";

const sections: Array<{
  status: ReadingListItem["status"];
  title: string;
  statTitle: string;
}> = [
  { status: "reading", title: "Currently reading", statTitle: "Currently reading" },
  { status: "not-started", title: "Waiting to start", statTitle: "Not yet started" },
  { status: "finished", title: "Finished", statTitle: "Finished" },
];

export function ReadingList() {
  return (
    <div className="min-h-full">
      <header className="border-b border-foreground/10 px-5 py-5 sm:px-8">
        <p className="mb-1 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Reader</p>
        <h1 className="text-[28px] font-medium leading-tight tracking-normal">Reading list</h1>
      </header>

      <div className="max-w-[1100px] space-y-10 p-5 sm:p-8">
        <section className="grid gap-3 sm:grid-cols-3">
          {sections.map((section) => {
            const count = readingList.filter((item) => item.status === section.status).length;
            return (
              <div key={section.status} className="border border-foreground/10 bg-card p-5">
                <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">{section.statTitle}</p>
                <p className="mt-3 text-3xl font-normal">{count}</p>
              </div>
            );
          })}
        </section>

        {sections.map((section) => (
          <section key={section.status}>
            <div className="mb-4 flex items-center gap-3">
              <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{section.title}</h2>
              <span className="h-px flex-1 bg-border" />
            </div>
            <div className="space-y-4">
              {readingList.filter((item) => item.status === section.status).map((item) => (
                <ReadingCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function ReadingCard({ item }: { item: ReadingListItem }) {
  const progress = Math.round((item.chapter / item.totalChapters) * 100);

  return (
    <Card className="group relative overflow-hidden border-foreground/10 p-0 transition-colors hover:border-primary/35">
      <div className="absolute inset-y-0 left-0 w-1" style={{ backgroundColor: item.accent }} />
      <div className="grid gap-5 p-5 pl-7 sm:grid-cols-[78px_1fr] sm:p-6 sm:pl-8">
        <div
          className="flex aspect-[2/3] w-[78px] items-center justify-center text-white shadow-sm"
          style={{ backgroundColor: item.accent }}
        >
          <BookOpen className="h-5 w-5 opacity-60" strokeWidth={1.25} />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="font-display text-[26px] font-semibold leading-tight">{item.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">by {item.author}</p>
            </div>
            <Badge variant="outline" className="rounded-none font-mono text-[8px] uppercase">
              {item.status === "not-started" ? "Not started" : item.status}
            </Badge>
          </div>

          <p className="mt-4 font-mono text-[9px] leading-5 text-muted-foreground">
            {item.draft} · {item.genre} · {item.words}
          </p>
          {item.deadline ? (
            <p className="mt-1 flex items-center gap-1.5 text-[10px] text-muted-foreground"><CalendarDays className="h-3 w-3" />{item.deadline}</p>
          ) : null}
          <p className="mt-4 text-sm leading-6 text-foreground/80">{item.logline}</p>

          {item.status !== "not-started" ? (
            <div className="mt-5 flex items-center gap-3">
              <Progress value={progress} className="h-1.5 flex-1" />
              <span className="font-mono text-[9px] text-muted-foreground">Ch {item.chapter} of {item.totalChapters} · {progress}%</span>
            </div>
          ) : null}

          <blockquote className="mt-5 border-l-2 bg-background/70 px-4 py-3 text-xs leading-5 text-muted-foreground" style={{ borderLeftColor: `${item.accent}60` }}>
            <span className="mr-2 font-mono text-[8px] uppercase tracking-[0.16em] text-primary">Note</span>
            <span>{item.note}</span>
          </blockquote>

          <Link href={`/reader/${item.id}`} className="mt-5 inline-flex items-center gap-2 text-xs font-medium text-primary">
            {item.status === "not-started" ? "Start reading" : item.status === "finished" ? "Read again" : "Continue reading"}
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </Card>
  );
}
