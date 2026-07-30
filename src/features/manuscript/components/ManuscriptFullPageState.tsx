"use client";

import { ArrowRight, BookOpen, ClipboardList, UserPlus } from "lucide-react";
import { type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { CreateManuscriptDialog } from "@/features/manuscript/components/CreateManuscriptDialog";
import type { CreatedManuscript } from "@/features/manuscript/types";
import { Heading } from "@/shared/ui/Heading";

type ManuscriptFullPageStateProps = {
  children?: ReactNode;
  description?: string;
  title: string;
};

export function ManuscriptFullPageState({
  children,
  description,
  title,
}: ManuscriptFullPageStateProps) {
  return (
    <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center bg-background px-6 text-center">
      <div className="max-w-sm">
        <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
          Manuscript workspace
        </p>
        <Heading level={1} size="subsection" className="mt-3">{title}</Heading>
        {description ? (
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
        ) : null}
        {children}
      </div>
    </div>
  );
}

export function NoManuscriptState({
  onCreated,
}: {
  onCreated?: (manuscript: CreatedManuscript) => void;
}) {
  return (
    <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center bg-background px-5 py-8 sm:px-8">
      <section className="w-full max-w-3xl border border-foreground/10 bg-card" aria-labelledby="writer-onboarding-title">
        <div className="border-b border-foreground/10 bg-sidebar/55 px-5 py-6 sm:px-8 sm:py-7">
          <p className="font-mono text-[9px] uppercase tracking-widest text-primary">Get started</p>
          <Heading id="writer-onboarding-title" level={1} size="workspace" className="mt-2">
            Set up your first reading round
          </Heading>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            Start with the manuscript, then decide who reads it and which questions will guide their feedback.
          </p>
        </div>

        <ol className="divide-y divide-foreground/10">
          <li className="grid gap-4 px-5 py-5 sm:grid-cols-[32px_minmax(0,1fr)_auto] sm:items-start sm:px-8">
            <span className="grid h-8 w-8 place-items-center bg-foreground font-mono text-[10px] text-background">01</span>
            <div>
              <Heading level={2} size="subsection">Create a manuscript</Heading>
              <p className="mt-1.5 max-w-lg text-xs leading-5 text-muted-foreground">
                Import a draft or start with a blank chapter structure. This is where every future draft and reading round lives.
              </p>
            </div>
            <CreateManuscriptDialog onCreated={onCreated}>
              <Button size="sm" className="w-full justify-center rounded-none sm:w-auto">
                Create manuscript
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </CreateManuscriptDialog>
          </li>

          <li className="grid gap-4 px-5 py-5 sm:grid-cols-[32px_minmax(0,1fr)_auto] sm:items-start sm:px-8">
            <span className="grid h-8 w-8 place-items-center border border-foreground/15 font-mono text-[10px] text-muted-foreground">02</span>
            <div>
              <Heading level={2} size="subsection">Invite beta readers</Heading>
              <p className="mt-1.5 max-w-lg text-xs leading-5 text-muted-foreground">
                Once the manuscript is ready, invite readers and choose the drafts and chapters each person can access.
              </p>
            </div>
            <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-muted-foreground sm:justify-self-end">
              <UserPlus className="h-3.5 w-3.5" />
              Next
            </span>
          </li>

          <li className="grid gap-4 px-5 py-5 sm:grid-cols-[32px_minmax(0,1fr)_auto] sm:items-start sm:px-8">
            <span className="grid h-8 w-8 place-items-center border border-foreground/15 font-mono text-[10px] text-muted-foreground">03</span>
            <div>
              <Heading level={2} size="subsection">Create a survey</Heading>
              <p className="mt-1.5 max-w-lg text-xs leading-5 text-muted-foreground">
                Optionally add focused questions after a chapter or the full manuscript to complement passage-level feedback.
              </p>
            </div>
            <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-muted-foreground sm:justify-self-end">
              <ClipboardList className="h-3.5 w-3.5" />
              Optional
            </span>
          </li>
        </ol>

        <div className="flex items-center gap-2 border-t border-foreground/10 bg-muted/[0.16] px-5 py-3 font-mono text-[9px] uppercase tracking-widest text-muted-foreground sm:px-8">
          <BookOpen className="h-3.5 w-3.5 text-primary" />
          Your manuscript remains the source of truth for every draft.
        </div>
      </section>
    </div>
  );
}
