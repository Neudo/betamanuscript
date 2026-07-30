"use client";

import { type FormEvent, useState } from "react";
import { Mail, UserPlus } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useInviteableChapters, useInviteReader } from "@/features/readers/hooks/use-readers";

type InviteReaderDialogProps = {
  manuscriptId: string;
  triggerVariant?: ButtonProps["variant"];
};

export function InviteReaderDialog({
  manuscriptId,
  triggerVariant = "outline",
}: InviteReaderDialogProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [personalNote, setPersonalNote] = useState("");
  const [readingScope, setReadingScope] = useState<"all" | "selected">("all");
  const [selectedChapterIds, setSelectedChapterIds] = useState<Set<string>>(new Set());
  const [hasCustomChapterSelection, setHasCustomChapterSelection] = useState(false);
  const [selectionError, setSelectionError] = useState<string | null>(null);
  const inviteMutation = useInviteReader();
  const chaptersQuery = useInviteableChapters(manuscriptId, open);
  const chapters = chaptersQuery.data ?? [];
  const chapterIds = chapters.map((chapter) => chapter.id);
  const selectedChapterCount = readingScope === "all"
    ? chapters.length
    : hasCustomChapterSelection ? selectedChapterIds.size : chapters.length;

  function resetForm() {
    setEmail("");
    setPersonalNote("");
    setReadingScope("all");
    setSelectedChapterIds(new Set());
    setHasCustomChapterSelection(false);
    setSelectionError(null);
    inviteMutation.reset();
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) resetForm();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSelectionError(null);

    const selectedIds = readingScope === "all" || !hasCustomChapterSelection
      ? chapterIds
      : [...selectedChapterIds];

    if (selectedIds.length === 0) {
      setSelectionError("Choose at least one chapter for this reader.");
      return;
    }

    inviteMutation.mutate(
      {
        chapterIds: selectedIds,
        manuscriptId,
        personalNote,
        recipientEmail: email,
      },
      {
        onSuccess() {
          setOpen(false);
          resetForm();
        },
      },
    );
  }

  function handleReadingScopeChange(value: "all" | "selected") {
    setReadingScope(value);
    setSelectionError(null);
  }

  function toggleChapter(chapterId: string, checked: boolean) {
    setSelectionError(null);
    setHasCustomChapterSelection(true);
    setSelectedChapterIds((current) => {
      const next = new Set(hasCustomChapterSelection ? current : chapterIds);
      if (checked) next.add(chapterId);
      else next.delete(chapterId);
      return next;
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant={triggerVariant}
          className={triggerVariant === "outline" ? "border-primary text-primary" : undefined}
        >
          <UserPlus className="h-3.5 w-3.5" />
          Invite reader
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-hidden rounded-none border-foreground/15 bg-card p-0 sm:max-w-xl">
        <DialogHeader className="border-b border-foreground/10 px-6 pb-5 pt-6">
          <p className="mb-1 font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">Reader invitation</p>
          <DialogTitle className="text-2xl font-medium">Invite a reader</DialogTitle>
          <DialogDescription className="mt-2 max-w-md leading-6">
            Invite them to read the whole draft or focus their feedback on selected chapters.
          </DialogDescription>
        </DialogHeader>
        <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit} noValidate>
          <ScrollArea className="max-h-[calc(100vh-15rem)] sm:max-h-[440px]">
            <div className="space-y-6 px-6 py-5">
              <div className="space-y-2">
                <Label htmlFor="reader-email">Email address</Label>
                <Input
                  id="reader-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="reader@example.com"
                  autoComplete="email"
                  required
                />
              </div>

              <fieldset className="space-y-3">
                <div className="flex items-baseline justify-between gap-4">
                  <div>
                    <legend className="text-sm font-medium">Reading scope</legend>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Choose what this reader can focus on in this draft.
                    </p>
                  </div>
                  {chapters.length > 0 ? (
                    <span className="shrink-0 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                      {selectedChapterCount} / {chapters.length} chapters
                    </span>
                  ) : null}
                </div>

                {chaptersQuery.isLoading ? (
                  <div className="border border-dashed border-foreground/15 px-4 py-5 text-xs text-muted-foreground">
                    Loading chapters…
                  </div>
                ) : chaptersQuery.error ? (
                  <Alert variant="destructive">
                    <AlertDescription>Chapters could not be loaded. Please try again before sending this invitation.</AlertDescription>
                  </Alert>
                ) : chapters.length === 0 ? (
                  <div className="border border-dashed border-foreground/15 px-4 py-5 text-xs leading-5 text-muted-foreground">
                    Add at least one chapter before inviting a reader.
                  </div>
                ) : (
                  <RadioGroup
                    value={readingScope}
                    onValueChange={(value) => handleReadingScopeChange(value as "all" | "selected")}
                    className="gap-2"
                  >
                    <label
                      htmlFor="reader-scope-all"
                      className="flex cursor-pointer items-start gap-3 border border-foreground/15 bg-background px-4 py-3 transition-colors hover:border-foreground/35"
                    >
                      <RadioGroupItem id="reader-scope-all" value="all" className="mt-0.5" />
                      <span className="min-w-0">
                        <span className="block text-sm font-medium">All chapters</span>
                        <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">
                          Give context across the complete draft.
                        </span>
                      </span>
                    </label>
                    <label
                      htmlFor="reader-scope-selected"
                      className="flex cursor-pointer items-start gap-3 border border-foreground/15 bg-background px-4 py-3 transition-colors hover:border-foreground/35"
                    >
                      <RadioGroupItem id="reader-scope-selected" value="selected" className="mt-0.5" />
                      <span className="min-w-0">
                        <span className="block text-sm font-medium">Selected chapters</span>
                        <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">
                          Ask for focused feedback on a scene, arc, or excerpt.
                        </span>
                      </span>
                    </label>
                  </RadioGroup>
                )}

                {readingScope === "selected" && chapters.length > 0 ? (
                  <div className="border border-foreground/15">
                    <div className="flex items-center justify-between gap-3 border-b border-foreground/10 bg-muted/30 px-4 py-2.5">
                      <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Chapter selection</span>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectionError(null);
                            setHasCustomChapterSelection(true);
                            setSelectedChapterIds(new Set(chapterIds));
                          }}
                          className="text-[10px] font-medium text-primary underline-offset-4 hover:underline"
                        >
                          Select all
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectionError(null);
                            setHasCustomChapterSelection(true);
                            setSelectedChapterIds(new Set());
                          }}
                          className="text-[10px] font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                    <div className="divide-y divide-foreground/[0.08]">
                      {chapters.map((chapter) => {
                        const inputId = `reader-chapter-${chapter.id}`;
                        const checked = hasCustomChapterSelection
                          ? selectedChapterIds.has(chapter.id)
                          : true;

                        return (
                          <label
                            key={chapter.id}
                            htmlFor={inputId}
                            className="flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/35"
                          >
                            <Checkbox
                              id={inputId}
                              checked={checked}
                              onCheckedChange={(value) => toggleChapter(chapter.id, value === true)}
                            />
                            <span className="flex min-w-0 items-center gap-2">
                              <span className="grid h-6 w-6 shrink-0 place-items-center border border-foreground/10 font-mono text-[9px] text-muted-foreground">
                                {chapter.position}
                              </span>
                              <span className="truncate text-sm">{chapter.title}</span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </fieldset>

              <div className="space-y-2">
                <Label htmlFor="reader-note">Personal note <span className="text-muted-foreground">(optional)</span></Label>
                <Textarea
                  id="reader-note"
                  value={personalNote}
                  onChange={(event) => setPersonalNote(event.target.value)}
                  placeholder="A quick note about the feedback that would help..."
                  maxLength={4000}
                />
              </div>

              {selectionError ? (
                <Alert>
                  <AlertDescription>{selectionError}</AlertDescription>
                </Alert>
              ) : null}
              {inviteMutation.isError ? (
                <Alert variant="destructive">
                  <AlertDescription>{inviteMutation.error.message}</AlertDescription>
                </Alert>
              ) : null}
            </div>
          </ScrollArea>
          <div className="border-t border-foreground/10 bg-card px-6 py-4">
            <Button
              className="w-full"
              type="submit"
              disabled={inviteMutation.isPending || chaptersQuery.isPending || chaptersQuery.isError || chapters.length === 0 || !email.trim()}
            >
              <Mail className="h-4 w-4" />
              {inviteMutation.isPending ? "Sending invitation..." : "Send invitation"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
