"use client";

import {
  ArrowLeft,
  BookOpen,
  FilePlus2,
  PencilLine,
  Trash2,
} from "lucide-react";
import { FormEvent, useState } from "react";

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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateManuscriptChapterMutation,
  useDeleteManuscriptChapterMutation,
  useUpdateManuscriptChapterMutation,
} from "@/features/manuscript/hooks/use-manuscript-mutations";
import type {
  ManuscriptWorkspaceChapter,
  ManuscriptWorkspaceData,
} from "@/features/manuscript/types";

type ChapterManagerDialogProps = {
  manuscript: ManuscriptWorkspaceData;
  onChapterSelected: (chapterId: string) => void;
};

type EditingChapter = ManuscriptWorkspaceChapter | "new" | null;

const wordCountFormat = new Intl.NumberFormat("en-US");

export function ChapterManagerDialog({
  manuscript,
  onChapterSelected,
}: ChapterManagerDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<EditingChapter>(null);
  const [chapterToDelete, setChapterToDelete] = useState<ManuscriptWorkspaceChapter | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const createChapter = useCreateManuscriptChapterMutation();
  const updateChapter = useUpdateManuscriptChapterMutation();
  const deleteChapter = useDeleteManuscriptChapterMutation();
  const isSaving = createChapter.isPending || updateChapter.isPending;
  const isBusy = isSaving || deleteChapter.isPending;
  const mutationError = createChapter.error ?? updateChapter.error ?? deleteChapter.error;

  function resetEditor() {
    setEditingChapter(null);
    setTitle("");
    setContent("");
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && isBusy) return;

    setIsOpen(nextOpen);
    if (!nextOpen) {
      resetEditor();
      setChapterToDelete(null);
      createChapter.reset();
      updateChapter.reset();
      deleteChapter.reset();
    }
  }

  function startCreatingChapter() {
    createChapter.reset();
    updateChapter.reset();
    setTitle(`Chapter ${manuscript.chapters.length + 1}`);
    setContent("");
    setEditingChapter("new");
  }

  function startEditingChapter(chapter: ManuscriptWorkspaceChapter) {
    createChapter.reset();
    updateChapter.reset();
    setTitle(chapter.title);
    setContent(chapter.blocks.map((block) => block.content).join("\n\n"));
    setEditingChapter(chapter);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingChapter || !title.trim()) return;

    try {
      if (editingChapter === "new") {
        if (!manuscript.version) return;

        const chapterId = await createChapter.mutateAsync({
          content,
          manuscriptId: manuscript.id,
          manuscriptVersionId: manuscript.version.id,
          title,
        });
        if (typeof chapterId === "string") onChapterSelected(chapterId);
      } else {
        await updateChapter.mutateAsync({
          chapterId: editingChapter.id,
          content,
          manuscriptId: manuscript.id,
          title,
        });
        onChapterSelected(editingChapter.id);
      }

      resetEditor();
    } catch {
      // The mutation state renders the database error beside the editor.
    }
  }

  async function handleDelete() {
    if (!chapterToDelete) return;

    const deletedIndex = manuscript.chapters.findIndex((chapter) => chapter.id === chapterToDelete.id);
    const nextChapter = manuscript.chapters[deletedIndex + 1] ?? manuscript.chapters[deletedIndex - 1];
    try {
      await deleteChapter.mutateAsync({
        chapterId: chapterToDelete.id,
        manuscriptId: manuscript.id,
      });
      if (nextChapter) onChapterSelected(nextChapter.id);
      setChapterToDelete(null);
      if (editingChapter !== "new" && editingChapter?.id === chapterToDelete.id) resetEditor();
    } catch {
      // The mutation state renders the database error beneath the chapter list.
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="rounded-none">
          <PencilLine className="h-3.5 w-3.5" />
          Manage chapters
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto rounded-none border-foreground/15 bg-card p-6">
        {editingChapter ? (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={isSaving}
                  onClick={resetEditor}
                  className="h-8 w-8 rounded-none"
                  aria-label="Back to chapter list"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <DialogTitle>{editingChapter === "new" ? "Add a chapter" : "Edit chapter"}</DialogTitle>
                  <DialogDescription className="mt-1 leading-6">
                    Separate paragraphs with a blank line. Your readers will see each paragraph in its own block.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="mt-6 space-y-5">
              <div>
                <Label htmlFor="chapter-title" className="mb-1.5 block text-xs font-medium">Chapter title</Label>
                <Input
                  id="chapter-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  maxLength={500}
                  required
                  autoFocus
                  className="rounded-none border-foreground/20 bg-background shadow-none"
                />
              </div>
              <div>
                <Label htmlFor="chapter-content" className="mb-1.5 block text-xs font-medium">Chapter content</Label>
                <Textarea
                  id="chapter-content"
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  placeholder="Paste or write the chapter text here."
                  rows={14}
                  className="min-h-72 resize-y rounded-none border-foreground/20 bg-background font-serif text-base leading-7 shadow-none"
                />
                <p className="mt-1.5 font-mono text-[9px] text-muted-foreground">
                  You can leave this empty and add the text later.
                </p>
              </div>
            </div>

            {mutationError ? <p className="mt-4 text-xs text-destructive">{mutationError.message}</p> : null}

            <DialogFooter className="mt-6 gap-2 sm:gap-2">
              <Button type="button" variant="outline" disabled={isSaving} onClick={resetEditor} className="rounded-none">
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving || !title.trim()} className="rounded-none">
                {isSaving ? "Saving…" : editingChapter === "new" ? "Add chapter" : "Save chapter"}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Manage chapters</DialogTitle>
              <DialogDescription className="leading-6">
                Add, edit, or remove chapters before this draft is shared with readers. Once reader access opens, create a new manuscript version to protect their feedback.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-6 divide-y divide-foreground/10 border-y border-foreground/10">
              {manuscript.chapters.length > 0 ? manuscript.chapters.map((chapter) => (
                <div key={chapter.id} className="flex items-center gap-3 py-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center bg-foreground/[0.05] font-mono text-[9px] text-muted-foreground">
                    {chapter.position}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium">{chapter.title}</p>
                    <p className="mt-1 font-mono text-[9px] text-muted-foreground">
                      {wordCountFormat.format(chapter.wordCount)} words
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => startEditingChapter(chapter)}
                      className="h-8 w-8 rounded-none"
                      aria-label={`Edit ${chapter.title}`}
                    >
                      <PencilLine className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setChapterToDelete(chapter)}
                      className="h-8 w-8 rounded-none text-destructive hover:bg-destructive/10 hover:text-destructive"
                      aria-label={`Remove ${chapter.title}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )) : (
                <div className="flex flex-col items-center px-5 py-10 text-center">
                  <BookOpen className="h-5 w-5 text-muted-foreground" strokeWidth={1.25} />
                  <p className="mt-3 text-sm font-medium">No chapters yet</p>
                  <p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
                    Add the first chapter to start shaping this draft.
                  </p>
                </div>
              )}
            </div>

            {mutationError ? <p className="mt-4 text-xs text-destructive">{mutationError.message}</p> : null}

            <DialogFooter className="mt-6">
              <Button type="button" onClick={startCreatingChapter} className="rounded-none">
                <FilePlus2 className="h-3.5 w-3.5" />
                Add chapter
              </Button>
            </DialogFooter>
          </>
        )}

        <AlertDialog open={Boolean(chapterToDelete)} onOpenChange={(open) => {
          if (!deleteChapter.isPending && !open) setChapterToDelete(null);
        }}>
          <AlertDialogContent className="rounded-none border-destructive/25 bg-card">
            <AlertDialogHeader>
              <AlertDialogTitle>Remove this chapter?</AlertDialogTitle>
              <AlertDialogDescription>
                This removes “{chapterToDelete?.title}” and its text. You cannot undo this action.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleteChapter.isPending}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                disabled={deleteChapter.isPending}
                onClick={(event) => {
                  event.preventDefault();
                  void handleDelete();
                }}
                className="rounded-none bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleteChapter.isPending ? "Removing…" : "Remove chapter"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
}
