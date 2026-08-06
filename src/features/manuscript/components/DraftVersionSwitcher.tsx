"use client";

import {
  Check,
  ChevronDown,
  CopyPlus,
  FileText,
  LoaderCircle,
  Pencil,
  Trash2,
} from "lucide-react";
import { type FormEvent, useRef, useState } from "react";
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
  useDeleteManuscriptDraftVersionMutation,
  useUpdateManuscriptDraftVersionTitleMutation,
  useUploadManuscriptSourceMutation,
} from "@/features/manuscript/hooks/use-manuscript-mutations";
import {
  getSourceDocumentError,
  importSourceDocument,
  sourceDocumentAccept,
} from "@/features/manuscript/lib/source-document";
import type {
  CreatedManuscriptDraftVersion,
  ImportedManuscriptChapter,
  ManuscriptWorkspaceVersion,
} from "@/features/manuscript/types";
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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [importedChapters, setImportedChapters] = useState<ImportedManuscriptChapter[] | null>(null);
  const [sourceImportError, setSourceImportError] = useState<string | null>(null);
  const [isParsingSource, setIsParsingSource] = useState(false);
  const [createdDraft, setCreatedDraft] = useState<CreatedManuscriptDraftVersion | null>(null);
  const sourceInputRef = useRef<HTMLInputElement>(null);
  const sourceImportRun = useRef(0);
  const createDraftVersion = useCreateManuscriptDraftVersionMutation();
  const deleteDraftVersion = useDeleteManuscriptDraftVersionMutation();
  const renameDraftVersion = useUpdateManuscriptDraftVersionTitleMutation();
  const uploadSource = useUploadManuscriptSourceMutation();
  const activeVersion = versions.find((version) => version.id === activeVersionId) ?? null;
  const isCreatingDraft = createDraftVersion.isPending || uploadSource.isPending;

  function resetCreateDraftDialog() {
    sourceImportRun.current += 1;
    createDraftVersion.reset();
    uploadSource.reset();
    setSourceFile(null);
    setImportedChapters(null);
    setSourceImportError(null);
    setIsParsingSource(false);
    setCreatedDraft(null);
  }

  function openCreateDraftDialog() {
    resetCreateDraftDialog();
    setIsCreateDialogOpen(true);
  }

  async function handleSourceChange(nextSourceFile: File | null) {
    if (createdDraft) return;

    const currentImportRun = sourceImportRun.current + 1;
    sourceImportRun.current = currentImportRun;
    uploadSource.reset();
    setSourceImportError(null);
    setSourceFile(nextSourceFile);
    setImportedChapters(null);

    if (!nextSourceFile) {
      setIsParsingSource(false);
      return;
    }

    const validationError = getSourceDocumentError(nextSourceFile);
    if (validationError) {
      setSourceFile(null);
      setSourceImportError(validationError);
      setIsParsingSource(false);
      return;
    }

    setIsParsingSource(true);
    try {
      const detectedChapters = await importSourceDocument(nextSourceFile);
      if (currentImportRun !== sourceImportRun.current) return;

      setImportedChapters(detectedChapters);
    } catch (error) {
      if (currentImportRun !== sourceImportRun.current) return;

      setSourceFile(null);
      setSourceImportError(error instanceof Error ? error.message : "The source document could not be imported.");
    } finally {
      if (currentImportRun === sourceImportRun.current) setIsParsingSource(false);
    }
  }

  async function handleCreateDraftVersion() {
    if (!activeVersion || isParsingSource || (sourceFile && !importedChapters)) return;

    try {
      const draft = createdDraft ?? await createDraftVersion.mutateAsync({
        importedChapters: importedChapters ?? undefined,
        sourceVersionId: activeVersion.id,
      });
      setCreatedDraft(draft);

      if (sourceFile) {
        await uploadSource.mutateAsync({
          file: sourceFile,
          manuscriptVersionId: draft.manuscriptVersionId,
        });
      }

      setIsCreateDialogOpen(false);
      resetCreateDraftDialog();
      onVersionChange(draft.manuscriptVersionId);
      toast.success("New draft created.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create a new draft version.");
    }
  }

  async function handleDeleteDraftVersion() {
    if (!activeVersion) return;

    const nextVersion = versions.find((version) => version.id !== activeVersion.id);
    if (!nextVersion) {
      toast.error("A manuscript must keep one draft. Delete the manuscript instead.");
      return;
    }

    try {
      await deleteDraftVersion.mutateAsync(activeVersion.id);
      setIsDeleteDialogOpen(false);
      onVersionChange(nextVersion.id);
      toast.success("Draft deleted.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete this draft.");
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
          <DropdownMenuItem
            disabled={versions.length < 2}
            onSelect={(event) => {
              event.preventDefault();
              setIsDeleteDialogOpen(true);
            }}
            className="cursor-pointer rounded-none px-2 py-2.5 text-xs font-medium text-destructive focus:bg-destructive/10 focus:text-destructive"
            title={versions.length < 2 ? "A manuscript must keep one draft." : undefined}
          >
            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
            Delete draft
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-foreground/10" />
          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
              openCreateDraftDialog();
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
          if (!isCreatingDraft) {
            setIsCreateDialogOpen(open);
            if (!open) resetCreateDraftDialog();
          }
        }}
      >
        <AlertDialogContent className="rounded-none border-foreground/15 bg-card sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Create a new draft version?</AlertDialogTitle>
            <AlertDialogDescription className="leading-6">
              This creates a new editable version from Draft {activeVersion.number}, including its reading-round settings. Reader feedback, invitations, progress, and surveys stay with the original draft.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-2">
            <Label htmlFor="draft-source-document">
              Source manuscript <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <input
              ref={sourceInputRef}
              id="draft-source-document"
              type="file"
              accept={sourceDocumentAccept}
              className="sr-only"
              disabled={Boolean(createdDraft)}
              onChange={(event) => {
                const nextFile = event.target.files?.[0];
                event.target.value = "";
                if (nextFile) void handleSourceChange(nextFile);
              }}
            />

            {sourceFile ? (
              <div className="flex items-start gap-3 border border-foreground/15 bg-sidebar/40 p-3">
                <div className="grid h-10 w-8 shrink-0 place-items-center border border-foreground/10 bg-background">
                  <FileText className="h-4 w-4 text-muted-foreground" strokeWidth={1.25} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium">{sourceFile.name}</p>
                  <p className="mt-1 font-mono text-[9px] text-muted-foreground">
                    {isParsingSource
                      ? "Detecting chapters…"
                      : importedChapters
                        ? `${importedChapters.length} chapter${importedChapters.length === 1 ? "" : "s"} detected automatically`
                        : "Ready to import"}
                  </p>
                  {createdDraft ? (
                    <p className="mt-2 text-[11px] leading-5 text-muted-foreground">
                      The draft is ready. Retry to finish uploading its source file.
                    </p>
                  ) : (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isParsingSource}
                        onClick={() => sourceInputRef.current?.click()}
                        className="h-auto rounded-none px-3 py-1.5 text-[11px]"
                      >
                        Replace
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={isParsingSource}
                        onClick={() => void handleSourceChange(null)}
                        className="h-auto px-3 py-1.5 text-[11px] text-muted-foreground"
                      >
                        <Trash2 className="h-3 w-3" />
                        Remove
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                disabled={Boolean(createdDraft)}
                onClick={() => sourceInputRef.current?.click()}
                className="h-auto w-full justify-start rounded-none border-dashed px-3 py-3 text-left text-xs"
              >
                <FileText className="h-4 w-4" strokeWidth={1.25} />
                Upload DOCX, PDF, TXT, or Markdown file
              </Button>
            )}
            <p className="text-[11px] leading-5 text-muted-foreground">
              An uploaded file replaces the copied chapter text in this draft. DOCX, PDF, TXT, and Markdown up to 20 MB are supported.
            </p>
            {sourceImportError ? <p className="text-xs text-destructive">{sourceImportError}</p> : null}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCreatingDraft}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isCreatingDraft || isParsingSource || Boolean(sourceFile && !importedChapters)}
              onClick={(event) => {
                event.preventDefault();
                void handleCreateDraftVersion();
              }}
            >
              {isCreatingDraft ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : null}
              {isCreatingDraft ? "Creating…" : createdDraft ? "Retry upload" : "Create draft"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          if (!deleteDraftVersion.isPending) setIsDeleteDialogOpen(open);
        }}
      >
        <AlertDialogContent className="rounded-none border-destructive/25 bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Draft {activeVersion.number}?</AlertDialogTitle>
            <AlertDialogDescription className="leading-6">
              This cannot be undone. Its chapters, reader feedback, surveys, invitations, and uploaded files will be permanently deleted. Other drafts stay available.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteDraftVersion.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteDraftVersion.isPending}
              onClick={(event) => {
                event.preventDefault();
                void handleDeleteDraftVersion();
              }}
              className="rounded-none bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteDraftVersion.isPending ? "Deleting…" : "Delete draft"}
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
