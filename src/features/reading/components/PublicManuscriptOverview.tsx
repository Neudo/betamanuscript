import { ArrowRight, CalendarDays, ExternalLink, UserRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { socialPlatformLabels } from "@/features/account/domain/social-links";
import type { PublicReaderManuscript } from "@/features/reading/server/public-reading";
import { cn } from "@/lib/utils";
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

export function PublicManuscriptOverview({ manuscript }: { manuscript: PublicReaderManuscript }) {
  const deadline = formatDeadline(manuscript.deadline);
  const readingHref = `/read/${manuscript.accessLinkId}/reading`;

  return (
    <main className="min-h-full bg-surface">
      <header className="border-b border-foreground/10 px-5 py-5 sm:px-8">
        <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">Shared reading</p>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
        <article className="overflow-hidden border border-foreground/10 bg-card">
          <div className={cn("grid", manuscript.coverUrl && "lg:grid-cols-[minmax(250px,0.72fr)_minmax(0,1.28fr)]")}>
            {manuscript.coverUrl ? (
              <aside className="border-b border-foreground/10 bg-sidebar/40 p-6 sm:p-8 lg:border-b-0 lg:border-r lg:p-10">
                <div className="mx-auto max-w-[280px]">
                  <div className="relative aspect-[2/3] overflow-hidden border border-foreground/15 bg-primary text-primary-foreground shadow-[10px_12px_0_rgba(28,24,18,0.1)]">
                    <Image
                      src={manuscript.coverUrl}
                      alt={`${manuscript.title} cover`}
                      fill
                      sizes="(min-width: 1024px) 280px, 68vw"
                      unoptimized
                      className="object-cover"
                    />
                  </div>

                  {manuscript.genres.length > 0 ? (
                    <div className="mt-5 flex flex-wrap gap-1.5">
                      {manuscript.genres.map((genre) => (
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
            ) : null}

            <div className="space-y-8 p-6 sm:p-8 lg:p-10">
              <section>
                <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-primary-text">Draft {manuscript.versionNumber}</p>
                <Heading level={1} size="display" className="mt-3 max-w-3xl">{manuscript.title}</Heading>
                {manuscript.logline ? (
                  <p className="mt-5 max-w-3xl text-base leading-7 text-foreground/80">{manuscript.logline}</p>
                ) : null}
                {!manuscript.coverUrl && (manuscript.genres.length > 0 || deadline) ? (
                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    {manuscript.genres.map((genre) => (
                      <Badge key={genre} variant="outline" className="rounded-none font-mono text-[9px] uppercase">
                        {genre}
                      </Badge>
                    ))}
                    {deadline ? (
                      <p className="flex items-center gap-2 text-xs leading-5 text-muted-foreground">
                        <CalendarDays className="h-3.5 w-3.5 shrink-0 text-primary-text" />
                        Reading deadline: {deadline}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </section>

              {manuscript.authorNote ? (
                <section className="border-l-2 border-primary/50 bg-background/70 px-5 py-4" aria-labelledby="public-author-note-heading">
                  <Heading level={2} size="label" id="public-author-note-heading">Note from the author</Heading>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground/80">{manuscript.authorNote}</p>
                </section>
              ) : null}

              {manuscript.readerNote ? (
                <section className="border border-foreground/10 bg-sidebar/30 p-5" aria-labelledby="public-reader-note-heading">
                  <Heading level={2} size="label" id="public-reader-note-heading">Note for readers</Heading>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground/80">{manuscript.readerNote}</p>
                </section>
              ) : null}

              {manuscript.author ? (
                <section className="border-t border-foreground/10 pt-8" aria-labelledby="public-author-heading">
                  <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-primary-text">Author</p>
                  <div className="mt-3 flex items-start gap-4">
                    <div className="relative grid h-16 w-16 shrink-0 place-items-center overflow-hidden border border-foreground/15 bg-primary font-mono text-sm font-semibold text-primary-foreground">
                      {manuscript.author.avatarUrl ? (
                        <Image
                          src={manuscript.author.avatarUrl}
                          alt={`${manuscript.author.displayName} profile photo`}
                          fill
                          sizes="64px"
                          unoptimized
                          className="object-cover"
                        />
                      ) : initialsFromName(manuscript.author.displayName)}
                    </div>
                    <div className="min-w-0 pt-1">
                      <Heading level={2} size="subsection" id="public-author-heading">
                        {manuscript.author.displayName}
                      </Heading>
                      {manuscript.author.website ? (
                        <a
                          href={manuscript.author.website}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-primary-text underline-offset-4 hover:underline"
                        >
                          Website <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : null}
                    </div>
                  </div>

                  {manuscript.author.bio ? (
                    <p className="mt-5 max-w-3xl whitespace-pre-wrap text-sm leading-7 text-foreground/80">{manuscript.author.bio}</p>
                  ) : null}

                  {manuscript.author.socialLinks.length > 0 ? (
                    <div className="mt-5 flex flex-wrap gap-2">
                      {manuscript.author.socialLinks.map((socialLink) => (
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
              ) : null}

              <div className="border-t border-foreground/10 pt-6">
                <Button asChild size="lg" className="rounded-none">
                  <Link href={readingHref}>
                    Start reading <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <p className="mt-3 flex items-center gap-2 text-xs leading-5 text-muted-foreground">
                  <UserRound className="h-3.5 w-3.5 shrink-0" />
                  Reading is open. You only need an account when you save feedback.
                </p>
              </div>
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}
