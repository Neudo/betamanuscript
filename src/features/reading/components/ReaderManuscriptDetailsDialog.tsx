"use client";

import { BookOpen, CalendarDays, ExternalLink, Info, UserRound } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { socialPlatformLabels } from "@/features/account/domain/social-links";
import type { ReaderManuscriptListItem } from "@/features/reading/api/reading";
import { useReaderManuscriptDetails } from "@/features/reading/hooks/use-reading";
import { Heading } from "@/shared/ui/Heading";

function formatDeadline(value: string | null) {
  if (!value) return null;

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function initialsFromName(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "A";
}

export function ReaderManuscriptDetailsDialog({ manuscript }: { manuscript: ReaderManuscriptListItem }) {
  const [open, setOpen] = useState(false);
  const detailsQuery = useReaderManuscriptDetails(manuscript.assignmentId, open);
  const details = detailsQuery.data;
  const deadline = formatDeadline(details?.deadline ?? manuscript.deadline);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="rounded-none">
          <Info className="h-3.5 w-3.5" />
          Manuscript details
        </Button>
      </DialogTrigger>

      <DialogContent
        overlayClassName="bg-foreground/55 backdrop-blur-[3px]"
        className="flex h-[calc(100vh-2rem)] max-h-[900px] w-[calc(100%-2rem)] max-w-6xl flex-col gap-0 overflow-hidden rounded-none border-foreground/15 bg-card p-0 shadow-[0_24px_64px_rgba(28,24,18,0.24)] [&>button]:right-6 [&>button]:top-6 [&>button]:rounded-none"
      >
        <DialogHeader className="shrink-0 border-b border-foreground/10 px-6 pb-5 pt-6 sm:px-8 sm:pb-6 sm:pt-7">
          <p className="mb-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-primary-text">
            Manuscript details
          </p>
          <DialogTitle asChild>
            <Heading level={2} size="workspace" className="pr-10">
              {manuscript.title}
            </Heading>
          </DialogTitle>
          <DialogDescription className="sr-only">
            Details about this manuscript and its author.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {detailsQuery.isLoading ? (
            <div className="grid min-h-80 place-items-center px-6 text-sm text-muted-foreground">
              Loading manuscript details…
            </div>
          ) : null}

          {detailsQuery.isError ? (
            <div className="p-6 sm:p-8">
              <Alert variant="destructive">
                <AlertDescription>{detailsQuery.error.message}</AlertDescription>
              </Alert>
            </div>
          ) : null}

          {details ? (
            <div className="grid min-h-full lg:grid-cols-[minmax(280px,0.75fr)_minmax(0,1.25fr)]">
              <aside className="border-b border-foreground/10 bg-sidebar/40 p-6 sm:p-8 lg:border-b-0 lg:border-r">
                <div className="mx-auto max-w-[260px]">
                  <div className="relative aspect-[2/3] overflow-hidden border border-foreground/15 bg-muted text-muted-foreground shadow-[10px_12px_0_rgba(28,24,18,0.1)]">
                    {manuscript.coverUrl ? (
                      <Image
                        src={manuscript.coverUrl}
                        alt={`${manuscript.title} cover`}
                        fill
                        sizes="(min-width: 1024px) 260px, 55vw"
                        unoptimized
                        className="object-cover"
                      />
                    ) : (
                      <BookOpen className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 opacity-60" strokeWidth={1.2} />
                    )}
                  </div>
                  {details.genres.length > 0 ? (
                    <div className="mt-5 flex flex-wrap gap-1.5">
                      {details.genres.map((genre) => (
                        <Badge key={genre} variant="outline" className="rounded-none font-mono text-[9px] uppercase">
                          {genre}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                  {deadline ? (
                    <p className="mt-5 flex items-center gap-2 text-xs leading-5 text-muted-foreground">
                      <CalendarDays className="h-3.5 w-3.5 shrink-0 text-primary-text" />
                      Reading deadline: {deadline}
                    </p>
                  ) : null}
                </div>
              </aside>

              <div className="space-y-8 p-6 sm:p-8 lg:p-10">
                {details.logline ? (
                  <section aria-labelledby="manuscript-premise-heading">
                    <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-primary-text">Premise</p>
                    <Heading level={3} size="subsection" id="manuscript-premise-heading" className="mt-2">
                      {details.logline}
                    </Heading>
                  </section>
                ) : null}

                {details.authorNote ? (
                  <section className="border-l-2 border-primary/50 bg-background/70 px-5 py-4" aria-labelledby="author-note-heading">
                    <Heading level={3} size="label" id="author-note-heading">
                      Note from the author
                    </Heading>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground/80">{details.authorNote}</p>
                  </section>
                ) : null}

                {details.readerNote ? (
                  <section className="border border-foreground/10 bg-sidebar/30 p-5" aria-labelledby="reader-note-heading">
                    <Heading level={3} size="label" id="reader-note-heading">
                      Note for readers
                    </Heading>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground/80">{details.readerNote}</p>
                  </section>
                ) : null}

                {details.author ? (
                  <section className="border-t border-foreground/10 pt-8" aria-labelledby="author-heading">
                    <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-primary-text">Author</p>
                    <div className="mt-3 flex items-start gap-4">
                      <Avatar className="h-16 w-16 rounded-none border border-foreground/15">
                        {details.author.avatarUrl ? (
                          <AvatarImage src={details.author.avatarUrl} alt={`${details.author.displayName} profile photo`} className="object-cover" />
                        ) : null}
                        <AvatarFallback className="rounded-none bg-primary font-mono text-sm font-semibold text-primary-foreground">
                          {initialsFromName(details.author.displayName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 pt-1">
                        <Heading level={3} size="subsection" id="author-heading">
                          {details.author.displayName}
                        </Heading>
                        {details.author.website ? (
                          <a
                            href={details.author.website}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-primary-text underline-offset-4 hover:underline"
                          >
                            Website <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : null}
                      </div>
                    </div>

                    {details.author.bio ? (
                      <p className="mt-5 max-w-2xl whitespace-pre-wrap text-sm leading-7 text-foreground/80">{details.author.bio}</p>
                    ) : null}

                    {details.author.socialLinks.length > 0 ? (
                      <div className="mt-5 flex flex-wrap gap-2">
                        {details.author.socialLinks.map((socialLink) => (
                          <a
                            key={socialLink.platform}
                            href={socialLink.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 border border-foreground/15 px-3 py-2 text-xs font-medium text-foreground transition-colors hover:border-primary/50 hover:text-primary-text"
                          >
                            {socialPlatformLabels[socialLink.platform]}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ))}
                      </div>
                    ) : null}
                  </section>
                ) : (
                  <section className="flex items-center gap-3 border-t border-foreground/10 pt-8 text-sm text-muted-foreground">
                    <UserRound className="h-4 w-4" />
                    The author has chosen not to share a profile for this reading round.
                  </section>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
