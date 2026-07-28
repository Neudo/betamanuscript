"use client";

import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import type { ManagedDraft, ManagedReader } from "@/features/readers/api/readers";

type DraftAccessDialogProps = {
  drafts: ManagedDraft[];
  isUpdating: boolean;
  onAccessChange: (input: {
    enabled: boolean;
    manuscriptVersionId: string;
    readerProfileId: string;
  }) => void;
  reader: ManagedReader;
};

export function DraftAccessDialog({
  drafts,
  isUpdating,
  onAccessChange,
  reader,
}: DraftAccessDialogProps) {
  const [open, setOpen] = useState(false);
  const accessibleDraftIds = new Set(reader.accessibleDraftIds);
  const firstDraftId = drafts.reduce<ManagedDraft | null>((firstDraft, draft) => (
    !firstDraft || draft.number < firstDraft.number ? draft : firstDraft
  ), null)?.id ?? null;

  if (!reader.readerProfileId) {
    return <span className="text-xs text-muted-foreground">After acceptance</span>;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" className="h-8 gap-1.5 px-2 text-xs">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          {reader.accessibleDraftIds.length} of {drafts.length}
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-none border-foreground/15 bg-card sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Draft access</DialogTitle>
          <DialogDescription>
            Choose which draft versions {reader.name ?? reader.email} can read. New readers start with access to Draft 1 only.
          </DialogDescription>
        </DialogHeader>
        <div className="divide-y divide-foreground/10 border-y border-foreground/10">
          {drafts.map((draft) => {
            const checked = accessibleDraftIds.has(draft.id);
            const isFirstDraft = draft.id === firstDraftId;
            const switchId = `reader-${reader.id}-draft-${draft.id}`;

            return (
              <div key={draft.id} className="flex items-center justify-between gap-4 py-3">
                <label htmlFor={switchId} className="min-w-0 cursor-pointer">
                  <span className="block truncate text-sm font-medium">{draft.title}</span>
                  <span className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Draft {draft.number}
                  </span>
                </label>
                <Switch
                  id={switchId}
                  checked={checked}
                  disabled={isUpdating || isFirstDraft}
                  onCheckedChange={(enabled) => onAccessChange({
                    enabled,
                    manuscriptVersionId: draft.id,
                    readerProfileId: reader.readerProfileId!,
                  })}
                  aria-label={isFirstDraft
                    ? `Access to ${draft.title} is always enabled`
                    : `Allow access to ${draft.title}`}
                />
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
