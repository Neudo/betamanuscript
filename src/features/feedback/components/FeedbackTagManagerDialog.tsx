"use client";

import { Plus, SlidersHorizontal, Trash2 } from "lucide-react";
import { FormEvent, useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ManuscriptAnnotationTag } from "@/features/feedback/api/feedback-tags";
import {
  useCreateManuscriptAnnotationTag,
  useManuscriptAnnotationTags,
  useSetManuscriptAnnotationTagActive,
  useUpdateManuscriptAnnotationTagColor,
} from "@/features/feedback/hooks/use-feedback-tags";

type FeedbackTagManagerDialogProps = {
  manuscriptId: string | null;
};

export function FeedbackTagManagerDialog({ manuscriptId }: FeedbackTagManagerDialogProps) {
  const [open, setOpen] = useState(false);
  const tagsQuery = useManuscriptAnnotationTags(manuscriptId);
  const createTag = useCreateManuscriptAnnotationTag();
  const updateColor = useUpdateManuscriptAnnotationTagColor();
  const setTagActive = useSetManuscriptAnnotationTagActive();
  const [label, setLabel] = useState("");
  const [color, setColor] = useState("#3B4A8A");
  const tags = tagsQuery.data ?? [];
  const isMutating = createTag.isPending || updateColor.isPending || setTagActive.isPending;

  function addTag(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!manuscriptId) return;

    createTag.mutate(
      { color, label, manuscriptId },
      {
        onError(error) {
          toast.error(error.message);
        },
        onSuccess() {
          setLabel("");
          setColor("#3B4A8A");
          toast.success("Feedback tag added.");
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="-mr-2 text-muted-foreground hover:text-foreground"
          disabled={!manuscriptId}
          aria-label="Manage feedback tags"
          title="Manage feedback tags"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[min(760px,calc(100dvh-2rem))] max-w-xl overflow-y-auto p-0">
        <DialogHeader className="border-b border-foreground/10 px-6 py-5">
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">Feedback setup</p>
          <DialogTitle className="pt-1 text-2xl font-medium">Manage feedback tags</DialogTitle>
          <DialogDescription className="max-w-lg pt-1 leading-6">
            Tags are specific to this manuscript. Removing one hides it from readers while preserving existing feedback.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 px-6 py-5">
          <form onSubmit={addTag} className="border border-foreground/10 bg-muted/25 p-4">
            <div className="mb-3 flex items-center gap-2">
              <Plus className="h-3.5 w-3.5 text-primary" />
              <h3 className="text-sm font-medium">Add a tag</h3>
            </div>
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_118px_auto] sm:items-end">
              <div className="space-y-1.5">
                <Label htmlFor="new-feedback-tag" className="text-xs">Tag name</Label>
                <Input
                  id="new-feedback-tag"
                  value={label}
                  onChange={(event) => setLabel(event.target.value)}
                  placeholder="e.g. Dialogue"
                  maxLength={80}
                  disabled={isMutating}
                  className="h-9 border-foreground/15 bg-card text-xs"
                />
              </div>
              <ColorField id="new-feedback-tag-color" value={color} onChange={setColor} disabled={isMutating} />
              <Button type="submit" size="sm" disabled={isMutating || !label.trim()}>
                Add tag
              </Button>
            </div>
          </form>

          <section>
            <div className="mb-3 flex items-center justify-between gap-4">
              <h3 className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">All tags</h3>
              <span className="font-mono text-[9px] text-muted-foreground">{tags.length} total</span>
            </div>
            {tagsQuery.isLoading ? <p className="py-7 text-center text-xs text-muted-foreground">Loading tags…</p> : null}
            {tagsQuery.isError ? <p className="py-7 text-center text-xs text-destructive">Unable to load tags.</p> : null}
            {!tagsQuery.isLoading && !tagsQuery.isError && tags.length === 0 ? (
              <p className="py-7 text-center text-xs text-muted-foreground">Add the first feedback tag for this manuscript.</p>
            ) : null}
            {tags.length > 0 ? (
              <div className="divide-y divide-foreground/[0.08] border-y border-foreground/[0.08]">
                {tags.map((tag) => (
                  <TagRow
                    key={`${tag.id}:${tag.color}`}
                    tag={tag}
                    disabled={isMutating}
                    onSaveColor={(nextColor) => updateColor.mutate(
                      { color: nextColor, manuscriptId: tag.manuscriptId, tagId: tag.id },
                      {
                        onError(error) { toast.error(error.message); },
                        onSuccess() { toast.success("Tag color updated."); },
                      },
                    )}
                    onSetActive={(isActive) => setTagActive.mutate(
                      { isActive, manuscriptId: tag.manuscriptId, tagId: tag.id },
                      {
                        onError(error) { toast.error(error.message); },
                        onSuccess() { toast.success(isActive ? "Tag restored." : "Tag removed from reader choices."); },
                      },
                    )}
                  />
                ))}
              </div>
            ) : null}
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TagRow({
  disabled,
  onSaveColor,
  onSetActive,
  tag,
}: {
  disabled: boolean;
  onSaveColor: (color: string) => void;
  onSetActive: (isActive: boolean) => void;
  tag: ManuscriptAnnotationTag;
}) {
  const [color, setColor] = useState(tag.color);

  return (
    <div className="flex flex-wrap items-center gap-3 py-3.5">
      <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: tag.color }} aria-hidden />
      <div className="min-w-28 flex-1">
        <p className="text-sm font-medium">{tag.label}</p>
        <p className="font-mono text-[9px] uppercase tracking-wide text-muted-foreground">{tag.isActive ? "Active" : "Removed"}</p>
      </div>
      <ColorField id={`feedback-tag-color-${tag.id}`} value={color} onChange={setColor} disabled={disabled || !tag.isActive} compact />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled || !tag.isActive || color === tag.color}
        onClick={() => onSaveColor(color)}
      >
        Save color
      </Button>
      {tag.isActive ? (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button type="button" variant="ghost" size="icon-sm" disabled={disabled} aria-label={`Remove ${tag.label}`} title="Remove tag">
              <Trash2 className="h-3.5 w-3.5 text-destructive" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove “{tag.label}”?</AlertDialogTitle>
              <AlertDialogDescription>
                Readers will no longer be able to choose this tag. Existing annotations remain readable and keep their original tag.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => onSetActive(false)}>Remove tag</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : (
        <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={() => onSetActive(true)}>
          Restore
        </Button>
      )}
    </div>
  );
}

function ColorField({
  compact = false,
  disabled,
  id,
  onChange,
  value,
}: {
  compact?: boolean;
  disabled: boolean;
  id: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <div className={compact ? "flex items-center" : "space-y-1.5"}>
      {!compact ? <Label htmlFor={id} className="text-xs">Color</Label> : null}
      <label className="flex h-9 items-center gap-2 border border-foreground/15 bg-card px-2" htmlFor={id}>
        <input
          id={id}
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value.toUpperCase())}
          disabled={disabled}
          className="h-5 w-5 cursor-pointer border-0 bg-transparent p-0 disabled:cursor-not-allowed"
        />
        {!compact ? <span className="font-mono text-[10px] text-muted-foreground">{value}</span> : <span className="sr-only">Tag color</span>}
      </label>
    </div>
  );
}
