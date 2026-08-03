"use client";

import { MessageSquarePlus, Pencil, Quote, Tags, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { getAnnotationTagColor } from "@/features/annotations/lib/tag-colors";
import type {
  ReaderAnnotation,
  ReaderAnnotationDraft,
  ReaderAnnotationTag,
} from "@/features/reading/api/reading";
import {
  useCreateReaderAnnotation,
  useDeleteReaderAnnotation,
  useReaderAnnotationTags,
  useUpdateReaderAnnotation,
} from "@/features/reading/hooks/use-reading";

type ReaderAnnotationSheetProps = {
  annotation?: ReaderAnnotation;
  draft?: ReaderAnnotationDraft;
  initialComment?: string;
  initialDisplayName?: string;
  initialTagId?: string;
  onAuthenticationRequired?: (input: ReaderAnnotationDraft & {
    comment: string;
    displayName: string;
    tagId: string;
  }) => void;
  onClose: () => void;
  onCreateAnnotation?: (input: ReaderAnnotationDraft & { comment: string; tagId: string }) => Promise<void>;
  readerAssignmentId: string;
  tags?: ReaderAnnotationTag[];
};

export function ReaderAnnotationSheet({
  annotation,
  draft,
  initialComment,
  initialDisplayName,
  initialTagId,
  onAuthenticationRequired,
  onClose,
  onCreateAnnotation,
  readerAssignmentId,
  tags: providedTags,
}: ReaderAnnotationSheetProps) {
  const isEditing = Boolean(annotation);
  const tagsQuery = useReaderAnnotationTags(readerAssignmentId, !providedTags);
  const createAnnotation = useCreateReaderAnnotation();
  const updateAnnotation = useUpdateReaderAnnotation();
  const deleteAnnotation = useDeleteReaderAnnotation();
  const [tagId, setTagId] = useState(annotation?.tag.id ?? initialTagId ?? "");
  const [comment, setComment] = useState(annotation?.comment ?? initialComment ?? "");
  const [displayName, setDisplayName] = useState(initialDisplayName ?? "");
  const [isExternalSaving, setIsExternalSaving] = useState(false);
  const tags = providedTags ?? tagsQuery.data ?? [];
  const selectedTagId = tagId || tags[0]?.id || "";
  const quote = annotation?.quote ?? draft?.quote ?? "";
  const isPending = createAnnotation.isPending || updateAnnotation.isPending || deleteAnnotation.isPending || isExternalSaving;
  const requiresDisplayName = !annotation && Boolean(onAuthenticationRequired);
  const normalizedDisplayName = displayName.trim();

  useEffect(() => {
    if (tagsQuery.isError) toast.error(tagsQuery.error.message);
  }, [tagsQuery.error, tagsQuery.isError]);

  function saveAnnotation() {
    if (!selectedTagId) return;

    if (annotation) {
      updateAnnotation.mutate(
        {
          annotationId: annotation.id,
          comment,
          tagId: selectedTagId,
        },
        {
          onError(error) {
            toast.error(error.message);
          },
          onSuccess() {
            toast.success("Annotation updated.");
            onClose();
          },
        },
      );
      return;
    }

    if (!draft) return;

    const input = {
      ...draft,
      comment,
      tagId: selectedTagId,
    };

    if (onAuthenticationRequired) {
      onAuthenticationRequired({
        ...input,
        displayName: normalizedDisplayName,
      });
      return;
    }

    if (onCreateAnnotation) {
      setIsExternalSaving(true);
      void onCreateAnnotation(input)
        .then(() => {
          toast.success("Annotation saved.");
          onClose();
        })
        .catch((error: unknown) => {
          toast.error(error instanceof Error ? error.message : "The annotation could not be saved.");
        })
        .finally(() => setIsExternalSaving(false));
      return;
    }

    createAnnotation.mutate(
      {
        ...input,
        readerAssignmentId,
      },
      {
        onError(error) {
          toast.error(error.message);
        },
        onSuccess() {
          toast.success("Annotation saved.");
          onClose();
        },
      },
    );
  }

  function deleteAnnotationFromSheet() {
    if (!annotation) return;

    deleteAnnotation.mutate(annotation.id, {
      onError(error) {
        toast.error(error.message);
      },
      onSuccess() {
        toast.success("Annotation deleted.");
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
                  {isEditing ? "Edit annotation" : "New annotation"}
                </span>
              </div>
              <SheetTitle className="pt-2 text-[28px] font-medium">
                {isEditing ? "Refine your feedback" : "Add feedback"}
              </SheetTitle>
              <SheetDescription>
                One tag per annotation keeps feedback easy to scan for the author.
              </SheetDescription>
            </SheetHeader>

            <div className="mt-7 space-y-6">
              <div className="border-l-2 border-primary/50 bg-muted/45 px-4 py-3">
                <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                  <Quote className="h-3 w-3" />
                  Selected passage
                </div>
                <blockquote className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground/85">“{quote}”</blockquote>
              </div>

              {requiresDisplayName ? (
                <div className="space-y-2">
                  <Label htmlFor="reader-annotation-display-name" className="text-xs">
                    Your name
                  </Label>
                  <Input
                    id="reader-annotation-display-name"
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
                <Label htmlFor="reader-annotation-tag" className="flex items-center gap-2 text-xs">
                  <Tags className="h-3.5 w-3.5" />
                  Tag
                </Label>
                <Select value={selectedTagId} onValueChange={setTagId} disabled={(!providedTags && tagsQuery.isLoading) || isPending}>
                  <SelectTrigger id="reader-annotation-tag" className="border-foreground/15 bg-card">
                    <SelectValue placeholder="Choose a tag" />
                  </SelectTrigger>
                  <SelectContent>
                    {tags.map((tag) => (
                      <SelectItem key={tag.id} value={tag.id}>
                        <span className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: getAnnotationTagColor(tag) }} />
                          {tag.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reader-annotation-comment" className="text-xs">Comment <span className="text-muted-foreground">(optional)</span></Label>
                <Textarea
                  id="reader-annotation-comment"
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  maxLength={4000}
                  placeholder="What worked, what was unclear, or what made you pause?"
                  className="min-h-36 border-foreground/15 bg-card text-sm leading-6"
                  disabled={isPending}
                />
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-foreground/10 pt-5">
                {annotation ? (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" disabled={isPending}>
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete this annotation?</AlertDialogTitle>
                        <AlertDialogDescription>
                          The highlighted passage and your comment will be removed. This cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Keep annotation</AlertDialogCancel>
                        <AlertDialogAction onClick={deleteAnnotationFromSheet} disabled={isPending}>
                          Delete annotation
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                ) : <span />}
                <Button
                  onClick={saveAnnotation}
                  disabled={isPending || !selectedTagId || (requiresDisplayName && normalizedDisplayName.length < 2)}
                >
                  {isPending ? "Saving…" : isEditing ? "Save changes" : "Save annotation"}
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
