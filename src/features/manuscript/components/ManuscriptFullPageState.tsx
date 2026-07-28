"use client";

import { Plus } from "lucide-react";
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
    <ManuscriptFullPageState title="No manuscript yet">
      <CreateManuscriptDialog onCreated={onCreated}>
        <Button className="mt-5" size="sm">
          <Plus className="h-3.5 w-3.5" />
          Create manuscript
        </Button>
      </CreateManuscriptDialog>
    </ManuscriptFullPageState>
  );
}
