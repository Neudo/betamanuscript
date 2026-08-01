"use client";

import { Check, ChevronDown, CopyPlus, LoaderCircle, Pencil } from "lucide-react";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useCreateManuscriptDraftVersionMutation,
  useUpdateManuscriptDraftVersionTitleMutation,
} from "@/features/manuscript/hooks/use-manuscript-mutations";
import type { ManuscriptWorkspaceVersion } from "@/features/manuscript/types";
import { cn } from "@/lib/utils";

type DraftVersionSwitcherProps = {
  activeVersionId: string | null;
  className?: string;
  onVersionChange: (versionId: string) => void;
  versions: ManuscriptWorkspaceVersion[];
};

export function DraftVersionSwitcher({
  activeVersionId,
  className,
  onVersionChange,
  versions,
}: DraftVersionSwitcherProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const createDraftVersion = useCreateManuscriptDraftVersionMutation();
  const renameDraftVersion = useUpdateManuscriptDraftVersionTitleMutation();
  const activeVersion = versions.find((version) => version.id === activeVersionId) ?? null;

  async function handleCreateDraftVersion() {
    if (!activeVersion) return;

    try {
      const created = await createDraftVersion.mutateAsync(activeVersion.id);
      setIsCreateDialogOpen(false);
      onVersionChange(created.manuscriptVersionId);
      toast.success("New draft created.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create a new draft version.");
    }
  }

  function openRenameDialog() {
    setDraftTitle(activeVersion?.title ?? "");
    setIsRenameDialogOpen(true);
  }

  async function handleRenameDraftVersion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeVersion) return;

    try {
      await renameDraftVersion.mutateAsync({
        manuscriptVersionId: activeVersion.id,
        title: draftTitle,
      });
      setIsRenameDialogOpen(false);
      toast.success("Draft renamed.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to rename this draft.");
    }
  }

  if (!activeVersion) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn(
              "h-8 max-w-full justify-between gap-2 rounded-none border-foreground/15 bg-background px-2.5 text-[11px] font-medium",
              className,
            )}
            aria-label="Choose draft version"
          >
            <span className="truncate">Draft {activeVersion.number} · {activeVersion.title}</span>
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          sideOffset={6}
          className="min-w-52 rounded-none border-foreground/10 bg-card p-1 shadow-[0_12px_32px_rgba(28,24,18,0.14)]"
        >
          <DropdownMenuLabel className="px-2 pb-1 pt-2 font-mono text-[9px] font-normal uppercase tracking-widest text-muted-foreground">
            Draft versions
          </DropdownMenuLabel>
          {versions.map((version) => {
            const isActive = version.id === activeVersion.id;

            return (
              <DropdownMenuItem
                key={version.id}
                onSelect={() => onVersionChange(version.id)}
                className="rounded-none px-2 py-2.5 text-xs focus:bg-foreground/[0.05]"
              >
                <span className="min-w-0 flex-1">
                  <span className="block font-medium">{version.title}</span>
                  <span className="mt-0.5 block truncate font-mono text-[9px] text-muted-foreground">Draft {version.number}</span>
                </span>
                <Check
                  className={cn("h-3.5 w-3.5 text-primary-text", !isActive && "invisible")}
                  aria-hidden="true"
                />
              </DropdownMenuItem>
            );
          })}
          <DropdownMenuSeparator className="bg-foreground/10" />
          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
              openRenameDialog();
            }}
            className="cursor-pointer rounded-none px-2 py-2.5 text-xs font-medium focus:bg-foreground/[0.05]"
          >
            <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
            Rename draft
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-foreground/10" />
          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
              setIsCreateDialogOpen(true);
            }}
            className="cursor-pointer rounded-none px-2 py-2.5 text-xs font-medium focus:bg-foreground/[0.05]"
          >
            <CopyPlus className="h-3.5 w-3.5" strokeWidth={1.5} />
            New draft version
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          if (!createDraftVersion.isPending) setIsCreateDialogOpen(open);
        }}
      >
        <AlertDialogContent className="rounded-none border-foreground/15 bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Create a new draft version?</AlertDialogTitle>
            <AlertDialogDescription className="leading-6">
              This creates a new editable version from Draft {activeVersion.number}, including its chapters and reading-round settings. Reader feedback, invitations, progress, and surveys stay with the original draft.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={createDraftVersion.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={createDraftVersion.isPending}
              onClick={(event) => {
                event.preventDefault();
                void handleCreateDraftVersion();
              }}
            >
              {createDraftVersion.isPending ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : null}
              {createDraftVersion.isPending ? "Creating…" : "Create draft"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={isRenameDialogOpen}
        onOpenChange={(open) => {
          if (!renameDraftVersion.isPending) setIsRenameDialogOpen(open);
        }}
      >
        <DialogContent className="rounded-none border-foreground/15 bg-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rename Draft {activeVersion.number}</DialogTitle>
            <DialogDescription>
              This name is shown wherever readers and authors choose a draft.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-5" onSubmit={handleRenameDraftVersion}>
            <div className="space-y-2">
              <Label htmlFor="draft-title">Draft title</Label>
              <Input
                id="draft-title"
                value={draftTitle}
                onChange={(event) => setDraftTitle(event.target.value)}
                maxLength={300}
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsRenameDialogOpen(false)} disabled={renameDraftVersion.isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={!draftTitle.trim() || renameDraftVersion.isPending}>
                {renameDraftVersion.isPending ? "Saving…" : "Save title"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
