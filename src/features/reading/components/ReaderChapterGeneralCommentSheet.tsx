"use client";

import { MessageSquarePlus, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import type { ReaderChapterGeneralComment } from "@/features/reading/api/reading";
import {
  useDeleteReaderChapterGeneralComment,
  useUpsertReaderChapterGeneralComment,
} from "@/features/reading/hooks/use-reading";

type ReaderChapterGeneralCommentSheetProps = {
  chapterId: string;
  chapterPosition: number;
  chapterTitle: string;
  generalComment: ReaderChapterGeneralComment | null;
  initialComment?: string;
  initialDisplayName?: string;
  onAuthenticationRequired?: (input: {
    chapterId: string;
    comment: string;
    displayName: string;
  }) => Promise<void>;
  onClose: () => void;
  onSaveGeneralAnnotation?: (input: { chapterId: string; comment: string }) => Promise<void>;
  readerAssignmentId: string;
};

export function ReaderChapterGeneralCommentSheet({
  chapterId,
  chapterPosition,
  chapterTitle,
  generalComment,
  initialComment,
  initialDisplayName,
  onAuthenticationRequired,
  onClose,
  onSaveGeneralAnnotation,
  readerAssignmentId,
}: ReaderChapterGeneralCommentSheetProps) {
  const upsertGeneralComment = useUpsertReaderChapterGeneralComment();
  const deleteGeneralComment = useDeleteReaderChapterGeneralComment();
  const [comment, setComment] = useState(generalComment?.comment ?? initialComment ?? "");
  const [displayName, setDisplayName] = useState(initialDisplayName ?? "");
  const [isExternalSaving, setIsExternalSaving] = useState(false);
  const isEditing = Boolean(generalComment);
  const isPending = upsertGeneralComment.isPending || deleteGeneralComment.isPending || isExternalSaving;
  const requiresDisplayName = !isEditing && Boolean(onAuthenticationRequired);
  const normalizedDisplayName = displayName.trim();

  function saveGeneralComment() {
    const input = { chapterId, comment };

    if (!isEditing && onAuthenticationRequired) {
      setIsExternalSaving(true);
      void onAuthenticationRequired({ ...input, displayName: normalizedDisplayName })
        .catch((error: unknown) => {
          toast.error(error instanceof Error ? error.message : "Your feedback could not be saved.");
        })
        .finally(() => setIsExternalSaving(false));
      return;
    }

    if (!isEditing && onSaveGeneralAnnotation) {
      setIsExternalSaving(true);
      void onSaveGeneralAnnotation(input)
        .then(() => {
          toast.success("General annotation saved.");
          onClose();
        })
        .catch((error: unknown) => {
          toast.error(error instanceof Error ? error.message : "The general annotation could not be saved.");
        })
        .finally(() => setIsExternalSaving(false));
      return;
    }

    upsertGeneralComment.mutate(
      { ...input, readerAssignmentId },
      {
        onError(error) {
          toast.error(error.message);
        },
        onSuccess() {
          toast.success(isEditing ? "General annotation updated." : "General annotation saved.");
          onClose();
        },
      },
    );
  }

  function deleteGeneralCommentFromSheet() {
    if (!generalComment) return;

    deleteGeneralComment.mutate(generalComment.id, {
      onError(error) {
        toast.error(error.message);
      },
      onSuccess() {
        toast.success("General annotation deleted.");
        onClose();
      },
    });
  }

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full p-0 sm:max-w-md">
        <ScrollArea className="h-full">
          <div className="p-6">
            <SheetHeader>
              <div className="flex items-center gap-2 text-primary-text">
                {isEditing ? <Pencil className="h-4 w-4" /> : <MessageSquarePlus className="h-4 w-4" />}
                <span className="font-mono text-[9px] uppercase tracking-[0.2em]">
                  {isEditing ? "Edit general annotation" : "General annotation"}
                </span>
              </div>
              <SheetTitle className="pt-2 text-[28px] font-medium">
                About Chapter {chapterPosition}
              </SheetTitle>
              <SheetDescription>
                {chapterTitle}. Share the overall reaction you had to this chapter, rather than feedback on one passage.
              </SheetDescription>
            </SheetHeader>

            <div className="mt-7 space-y-6">
              {requiresDisplayName ? (
                <div className="space-y-2">
                  <Label htmlFor="reader-general-annotation-display-name" className="text-xs">
                    Your name
                  </Label>
                  <Input
                    id="reader-general-annotation-display-name"
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
                    maxLength={80}
                    minLength={2}
                    autoComplete="name"
                    placeholder="How the author should see you"
                    className="border-foreground/15 bg-card"
                    disabled={isPending}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Required so the author can attribute this feedback.
                  </p>
                </div>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="reader-chapter-general-comment" className="text-xs">
                  Your general annotation
                </Label>
                <Textarea
                  id="reader-chapter-general-comment"
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  maxLength={4000}
                  placeholder="What stayed with you after this chapter?"
                  className="min-h-44 border-foreground/15 bg-card text-sm leading-6"
                  disabled={isPending}
                />
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-foreground/10 pt-5">
                {generalComment ? (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" disabled={isPending}>
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete this general annotation?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Your chapter-level annotation will be removed. This cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Keep annotation</AlertDialogCancel>
                        <AlertDialogAction onClick={deleteGeneralCommentFromSheet} disabled={isPending}>
                          Delete annotation
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                ) : <span />}
                <Button
                  onClick={saveGeneralComment}
                  disabled={isPending || !comment.trim() || (requiresDisplayName && normalizedDisplayName.length < 2)}
                >
                  {isPending ? "Saving…" : isEditing ? "Save changes" : "Save comment"}
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
