"use client";

import { Settings2, Trash2 } from "lucide-react";
import { type FormEvent, useState } from "react";

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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  useDeleteManuscriptMutation,
  useUpdateManuscriptSettingsMutation,
} from "@/features/manuscript/hooks/use-manuscript-mutations";

type ManuscriptSettingsDialogProps = {
  manuscript: {
    id: string;
    title: string;
    version: {
      id: string;
      logline: string | null;
      number: number;
      title: string;
    } | null;
  };
  onDeleted: () => void;
};

export function ManuscriptSettingsDialog({
  manuscript,
  onDeleted,
}: ManuscriptSettingsDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [title, setTitle] = useState(manuscript.title);
  const [logline, setLogline] = useState(manuscript.version?.logline ?? "");
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const updateSettings = useUpdateManuscriptSettingsMutation();
  const deleteManuscript = useDeleteManuscriptMutation();

  const isPending = updateSettings.isPending || deleteManuscript.isPending;

  function handleOpenChange(nextIsOpen: boolean) {
    if (isPending) return;

    if (nextIsOpen) {
      setTitle(manuscript.title);
      setLogline(manuscript.version?.logline ?? "");
      setFormError(null);
      setDeleteError(null);
    }

    setIsOpen(nextIsOpen);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedTitle = title.trim();
    if (!normalizedTitle) {
      setFormError("A manuscript title is required.");
      return;
    }

    setFormError(null);

    try {
      await updateSettings.mutateAsync({
        logline,
        manuscriptId: manuscript.id,
        title: normalizedTitle,
      });
      setIsOpen(false);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Unable to save the manuscript.");
    }
  }

  async function handleDelete() {
    setDeleteError(null);

    try {
      await deleteManuscript.mutateAsync(manuscript.id);
      setIsDeleteDialogOpen(false);
      setIsOpen(false);
      onDeleted();
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : "Unable to delete the manuscript.",
      );
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0 rounded-none text-muted-foreground hover:text-foreground"
          aria-label="Open manuscript settings"
        >
          <Settings2 className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md rounded-none border-foreground/15 bg-card p-5">
        <DialogHeader>
          <DialogTitle>Manuscript settings</DialogTitle>
          <DialogDescription className="leading-6">
            Update this manuscript&apos;s current draft details.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="manuscript-settings-title"
              className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
            >
              Title
            </label>
            <Input
              id="manuscript-settings-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              disabled={isPending}
              maxLength={300}
              required
              className="mt-2 h-10 rounded-none border-foreground/20 bg-background px-3 text-sm font-normal shadow-none"
            />
          </div>

          <div>
            <label
              htmlFor="manuscript-settings-logline"
              className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
            >
              One-line premise
            </label>
            <Textarea
              id="manuscript-settings-logline"
              value={logline}
              onChange={(event) => setLogline(event.target.value)}
              disabled={isPending}
              maxLength={2000}
              rows={3}
              className="mt-2 min-h-[76px] resize-none rounded-none border-foreground/20 bg-background text-sm leading-6 shadow-none"
            />
          </div>

          {formError ? (
            <p role="alert" className="text-sm text-destructive">{formError}</p>
          ) : null}

          <DialogFooter>
            <Button type="submit" disabled={isPending} className="rounded-none">
              {updateSettings.isPending ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>

        <div className="border-t border-destructive/25 pt-5">
          <p className="text-sm font-medium text-destructive">Danger zone</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Permanently delete this manuscript, its drafts, reader feedback, and uploaded files.
          </p>
          {deleteError ? (
            <p role="alert" className="mt-3 text-sm text-destructive">{deleteError}</p>
          ) : null}
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => setIsDeleteDialogOpen(true)}
            className="mt-4 rounded-none border-destructive/35 text-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete manuscript
          </Button>
        </div>

        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={(nextIsOpen) => {
            if (!deleteManuscript.isPending) setIsDeleteDialogOpen(nextIsOpen);
          }}
        >
          <AlertDialogContent className="rounded-none border-destructive/25 bg-card">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this manuscript?</AlertDialogTitle>
              <AlertDialogDescription>
                This cannot be undone. All versions, chapters, reader feedback, and uploaded
                files will be permanently deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleteManuscript.isPending}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                disabled={deleteManuscript.isPending}
                onClick={(event) => {
                  event.preventDefault();
                  void handleDelete();
                }}
              >
                {deleteManuscript.isPending ? "Deleting…" : "Delete permanently"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
}
