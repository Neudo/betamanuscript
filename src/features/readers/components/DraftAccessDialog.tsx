"use client";

import { ListChecks, SlidersHorizontal } from "lucide-react";
import { Fragment, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ManagedDraft, ManagedReader } from "@/features/readers/api/readers";

type ChapterAccessChange = {
  chapterIds: string[];
  readerAssignmentId: string;
};

type DraftAccessDialogProps = {
  drafts: ManagedDraft[];
  isUpdatingChapterAccess: boolean;
  isUpdatingDraftAccess: boolean;
  onAccessChange: (input: {
    enabled: boolean;
    manuscriptVersionId: string;
    readerProfileId: string;
  }) => void;
  onChapterAccessChange: (input: ChapterAccessChange, options: { onSuccess: () => void }) => void;
  reader: ManagedReader;
};

export function DraftAccessDialog({
  drafts,
  isUpdatingChapterAccess,
  isUpdatingDraftAccess,
  onAccessChange,
  onChapterAccessChange,
  reader,
}: DraftAccessDialogProps) {
  const [open, setOpen] = useState(false);
  const [chapterSelections, setChapterSelections] = useState<Record<string, Set<string>>>({});
  const accessibleDraftIds = new Set(reader.accessibleDraftIds);
  const firstDraftId = drafts.reduce<ManagedDraft | null>((firstDraft, draft) => (
    !firstDraft || draft.number < firstDraft.number ? draft : firstDraft
  ), null)?.id ?? null;

  if (!reader.readerProfileId) {
    return <span className="text-xs text-muted-foreground">After acceptance</span>;
  }

  function resetChapterSelections() {
    setChapterSelections({});
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) resetChapterSelections();
  }

  function getSelectedChapterIds(draft: ManagedDraft) {
    const savedAccess = reader.chapterAccessByDraftId[draft.id];
    return chapterSelections[draft.id] ?? new Set(savedAccess?.chapterIds ?? []);
  }

  function updateChapterSelection(
    draft: ManagedDraft,
    update: (current: Set<string>) => Set<string>,
  ) {
    setChapterSelections((current) => ({
      ...current,
      [draft.id]: update(new Set(current[draft.id] ?? reader.chapterAccessByDraftId[draft.id]?.chapterIds ?? [])),
    }));
  }

  function toggleChapter(draft: ManagedDraft, chapterId: string, checked: boolean) {
    updateChapterSelection(draft, (current) => {
      if (checked) current.add(chapterId);
      else current.delete(chapterId);
      return current;
    });
  }

  function saveChapterSelection(draft: ManagedDraft) {
    const chapterAccess = reader.chapterAccessByDraftId[draft.id];
    const selectedChapterIds = getSelectedChapterIds(draft);
    if (!chapterAccess || selectedChapterIds.size === 0) return;

    onChapterAccessChange(
      {
        chapterIds: draft.chapters
          .map((chapter) => chapter.id)
          .filter((chapterId) => selectedChapterIds.has(chapterId)),
        readerAssignmentId: chapterAccess.readerAssignmentId,
      },
      {
        onSuccess() {
          setChapterSelections((current) => {
            const remaining = { ...current };
            delete remaining[draft.id];
            return remaining;
          });
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" className="h-8 gap-1.5 px-2 text-xs">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          {reader.accessibleDraftIds.length} / {drafts.length} drafts
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto rounded-none border-foreground/15 bg-card sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Draft access</DialogTitle>
          <DialogDescription>
            Choose which drafts {reader.name ?? reader.email} can read, then refine chapter access independently for each draft.
          </DialogDescription>
        </DialogHeader>
        <div className="border border-foreground/10">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-mono text-[9px] uppercase tracking-widest">Content</TableHead>
                <TableHead className="w-28 text-right font-mono text-[9px] uppercase tracking-widest">Access</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {drafts.map((draft) => {
                const hasDraftAccess = accessibleDraftIds.has(draft.id);
                const chapterAccess = reader.chapterAccessByDraftId[draft.id];
                const selectedChapterIds = getSelectedChapterIds(draft);
                const isFirstDraft = draft.id === firstDraftId;
                const switchId = `reader-${reader.id}-draft-${draft.id}`;

                return (
                  <Fragment key={draft.id}>
                    <TableRow>
                      <TableCell>
                        <label htmlFor={switchId} className="block min-w-0 cursor-pointer">
                          <span className="block truncate text-sm font-medium">{draft.title}</span>
                          <span className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                            Draft {draft.number} · {draft.chapters.length} chapters
                          </span>
                        </label>
                      </TableCell>
                      <TableCell className="text-right">
                        <Switch
                          id={switchId}
                          checked={hasDraftAccess}
                          disabled={isUpdatingDraftAccess || isFirstDraft || !draft.hasActiveReadingRound}
                          onCheckedChange={(enabled) => onAccessChange({
                            enabled,
                            manuscriptVersionId: draft.id,
                            readerProfileId: reader.readerProfileId!,
                          })}
                          aria-label={isFirstDraft
                            ? `Access to ${draft.title} is always enabled`
                            : `Allow access to ${draft.title}`}
                        />
                      </TableCell>
                    </TableRow>
                    {!draft.hasActiveReadingRound ? (
                      <TableRow className="bg-muted/[0.12] hover:bg-muted/[0.12]">
                        <TableCell colSpan={2} className="py-3 text-xs text-muted-foreground">
                          This draft has no active reading round yet.
                        </TableCell>
                      </TableRow>
                    ) : !hasDraftAccess ? (
                      <TableRow className="bg-muted/[0.12] hover:bg-muted/[0.12]">
                        <TableCell colSpan={2} className="py-3 text-xs text-muted-foreground">
                          Enable this draft to choose which chapters the reader can open.
                        </TableCell>
                      </TableRow>
                    ) : !chapterAccess ? (
                      <TableRow className="bg-muted/[0.12] hover:bg-muted/[0.12]">
                        <TableCell colSpan={2} className="py-3 text-xs text-muted-foreground">
                          Chapter access is being prepared for this draft.
                        </TableCell>
                      </TableRow>
                    ) : draft.chapters.length === 0 ? (
                      <TableRow className="bg-muted/[0.12] hover:bg-muted/[0.12]">
                        <TableCell colSpan={2} className="py-3 text-xs text-muted-foreground">
                          No chapters have been added to this draft yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      <>
                        <TableRow className="bg-muted/[0.16] hover:bg-muted/[0.16]">
                          <TableCell colSpan={2} className="p-0">
                            <div className="flex flex-wrap items-center justify-between gap-3 border-y border-foreground/10 px-4 py-2.5">
                              <span className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                                <ListChecks className="h-3.5 w-3.5 text-primary" />
                                {selectedChapterIds.size} / {draft.chapters.length} chapters
                              </span>
                              <div className="flex items-center gap-3">
                                <button
                                  type="button"
                                  disabled={isUpdatingChapterAccess}
                                  onClick={() => updateChapterSelection(
                                    draft,
                                    () => new Set(draft.chapters.map((chapter) => chapter.id)),
                                  )}
                                  className="text-[10px] font-medium text-primary underline-offset-4 hover:underline disabled:pointer-events-none disabled:opacity-50"
                                >
                                  Select all
                                </button>
                                <button
                                  type="button"
                                  disabled={isUpdatingChapterAccess}
                                  onClick={() => updateChapterSelection(draft, () => new Set())}
                                  className="text-[10px] font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline disabled:pointer-events-none disabled:opacity-50"
                                >
                                  Unselect all
                                </button>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                        {draft.chapters.map((chapter) => {
                          const inputId = `reader-${reader.id}-draft-${draft.id}-chapter-${chapter.id}`;
                          const checked = selectedChapterIds.has(chapter.id);

                          return (
                            <TableRow key={chapter.id} className="hover:bg-muted/20">
                              <TableCell>
                                <label htmlFor={inputId} className="flex cursor-pointer items-center gap-2">
                                  <span className="grid h-6 w-6 shrink-0 place-items-center border border-foreground/10 font-mono text-[9px] text-muted-foreground">
                                    {chapter.position}
                                  </span>
                                  <span className="truncate text-sm">{chapter.title}</span>
                                </label>
                              </TableCell>
                              <TableCell className="text-right">
                                <Checkbox
                                  id={inputId}
                                  checked={checked}
                                  disabled={isUpdatingChapterAccess}
                                  onCheckedChange={(value) => toggleChapter(draft, chapter.id, value === true)}
                                  aria-label={`Allow access to ${chapter.title}`}
                                />
                              </TableCell>
                            </TableRow>
                          );
                        })}
                        <TableRow className="bg-muted/[0.12] hover:bg-muted/[0.12]">
                          <TableCell colSpan={2} className="py-3">
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => saveChapterSelection(draft)}
                              disabled={isUpdatingChapterAccess || selectedChapterIds.size === 0}
                            >
                              {isUpdatingChapterAccess ? "Saving access…" : "Save"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      </>
                    )}
                  </Fragment>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
