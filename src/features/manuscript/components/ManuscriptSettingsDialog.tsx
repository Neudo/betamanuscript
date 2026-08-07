"use client";

import { BookOpen, ImagePlus, Pencil, Settings2, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  type FormEvent,
  type ReactNode,
  type RefObject,
  useEffect,
  useRef,
  useState,
} from "react";

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
import { Checkbox } from "@/components/ui/checkbox";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import type { AccountPlan } from "@/features/account/types";
import { getCoverFileError } from "@/features/manuscript/api/manuscript-assets";
import { manuscriptWordCountOptions } from "@/features/manuscript/data/create-manuscript";
import {
  useDeleteManuscriptMutation,
  useUpdateManuscriptSettingsMutation,
  useUploadManuscriptCoverMutation,
} from "@/features/manuscript/hooks/use-manuscript-mutations";
import { useManuscriptGenres } from "@/features/manuscript/hooks/use-manuscripts";
import type { ManuscriptWorkspaceData, ManuscriptWordCountBand } from "@/features/manuscript/types";
import { cn } from "@/lib/utils";
import { Heading } from "@/shared/ui/Heading";

type ManuscriptSettingsDialogProps = {
  accountPlan?: AccountPlan;
  manuscript: ManuscriptWorkspaceData;
  onDeleted: () => void;
  triggerClassName?: string;
  triggerLabel?: string;
};

export function ManuscriptSettingsDialog({
  accountPlan = "free",
  manuscript,
  onDeleted,
  triggerClassName,
  triggerLabel,
}: ManuscriptSettingsDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [title, setTitle] = useState(manuscript.title);
  const [logline, setLogline] = useState(manuscript.version?.logline ?? "");
  const [genreSlugs, setGenreSlugs] = useState(manuscript.genreSlugs);
  const [wordCountBand, setWordCountBand] = useState<ManuscriptWordCountBand | "">(
    manuscript.version?.estimatedWordCountBand ?? "",
  );
  const [hasReadingDeadline, setHasReadingDeadline] = useState(Boolean(manuscript.readerDeadline));
  const [readerDeadline, setReaderDeadline] = useState(manuscript.readerDeadline ?? "");
  const [maxReaders, setMaxReaders] = useState(manuscript.maxReaders);
  const [readerNote, setReaderNote] = useState(manuscript.readerNote ?? "");
  const [readerClosingNote, setReaderClosingNote] = useState(manuscript.readerClosingNote ?? "");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverError, setCoverError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const coverPreviewUrl = useCoverPreviewUrl(coverFile);
  const genresQuery = useManuscriptGenres(isOpen);
  const updateSettings = useUpdateManuscriptSettingsMutation();
  const uploadCover = useUploadManuscriptCoverMutation();
  const deleteManuscript = useDeleteManuscriptMutation();
  const hasProPlan = accountPlan === "pro";
  const isPending = updateSettings.isPending || uploadCover.isPending || deleteManuscript.isPending;

  function resetForm() {
    setTitle(manuscript.title);
    setLogline(manuscript.version?.logline ?? "");
    setGenreSlugs(manuscript.genreSlugs);
    setWordCountBand(manuscript.version?.estimatedWordCountBand ?? "");
    setHasReadingDeadline(Boolean(manuscript.readerDeadline));
    setReaderDeadline(manuscript.readerDeadline ?? "");
    setMaxReaders(manuscript.maxReaders);
    setReaderNote(manuscript.readerNote ?? "");
    setReaderClosingNote(manuscript.readerClosingNote ?? "");
    setCoverFile(null);
    setCoverError(null);
    setFormError(null);
    setDeleteError(null);
  }

  function handleOpenChange(nextIsOpen: boolean) {
    if (isPending) return;

    if (nextIsOpen) resetForm();
    setIsOpen(nextIsOpen);
  }

  function toggleGenre(genreSlug: string) {
    setGenreSlugs((currentGenres) => (
      currentGenres.includes(genreSlug)
        ? currentGenres.filter((item) => item !== genreSlug)
        : [...currentGenres, genreSlug]
    ));
  }

  function selectCover(nextFile: File) {
    const validationError = getCoverFileError(nextFile);
    if (validationError) {
      setCoverError(validationError);
      return;
    }

    setCoverError(null);
    setCoverFile(nextFile);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedTitle = title.trim();
    if (!normalizedTitle) {
      setFormError("A manuscript title is required.");
      return;
    }

    if (!manuscript.version) {
      setFormError("Select a draft before editing its settings.");
      return;
    }

    setFormError(null);

    try {
      await updateSettings.mutateAsync({
        estimatedWordCountBand: wordCountBand || null,
        genreSlugs,
        logline,
        maxReaders,
        manuscriptId: manuscript.id,
        manuscriptVersionId: manuscript.version.id,
        readerClosingNote,
        readerDeadline: hasReadingDeadline ? readerDeadline : null,
        readerNote,
        title: normalizedTitle,
      });

      if (coverFile) {
        await uploadCover.mutateAsync({
          file: coverFile,
          manuscriptVersionId: manuscript.version.id,
        });
      }

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
          variant={triggerLabel ? "outline" : "ghost"}
          size={triggerLabel ? "sm" : "icon"}
          className={cn(
            "shrink-0 rounded-none",
            triggerLabel
              ? "h-8 justify-start border-foreground/15 bg-background/50 px-2.5 text-[11px]"
              : "h-7 w-7 text-muted-foreground hover:text-foreground",
            triggerClassName,
          )}
          aria-label="Open manuscript settings"
        >
          {triggerLabel ? <Pencil className="h-3.5 w-3.5" /> : <Settings2 className="h-3.5 w-3.5" />}
          {triggerLabel}
        </Button>
      </DialogTrigger>

      <DialogContent className="flex max-h-[90vh] w-[calc(100%-2rem)] max-w-[620px] flex-col gap-0 overflow-hidden rounded-none border-foreground/15 bg-card p-0 shadow-[0_24px_64px_rgba(28,24,18,0.18)] [&>button]:right-7 [&>button]:top-7">
        <DialogHeader className="border-b border-foreground/[0.08] px-8 pb-5 pt-7">
          <p className="mb-1.5 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
            Draft {manuscript.version?.number ?? "—"}
          </p>
          <DialogTitle asChild>
            <Heading level={2} size="subsection" className="tracking-normal">Edit manuscript</Heading>
          </DialogTitle>
          <DialogDescription className="mt-1 max-w-lg text-sm leading-6">
            Update the book details and the beta reader experience for this draft.
          </DialogDescription>
        </DialogHeader>

        <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
          <div className="min-h-0 flex-1 overflow-y-auto px-8 py-6">
            <section aria-label="Book information" className="space-y-5">
              <SectionLabel>Book info</SectionLabel>

              <CoverField
                coverFile={coverFile}
                coverPreviewUrl={coverPreviewUrl}
                currentCoverUrl={manuscript.coverUrl}
                disabled={isPending}
                inputRef={coverInputRef}
                onClearSelection={() => setCoverFile(null)}
                onSelect={selectCover}
              />
              {coverError ? <p role="alert" className="-mt-3 text-xs text-destructive">{coverError}</p> : null}

              <div>
                <FieldLabel htmlFor="manuscript-settings-title" required>Title</FieldLabel>
                <Input
                  id="manuscript-settings-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  disabled={isPending}
                  maxLength={300}
                  required
                  className="h-10 rounded-none border-foreground/20 bg-background px-3 text-sm font-normal shadow-none"
                />
              </div>

              <div>
                <FieldLabel htmlFor="manuscript-settings-logline">One-line premise</FieldLabel>
                <Textarea
                  id="manuscript-settings-logline"
                  value={logline}
                  onChange={(event) => setLogline(event.target.value)}
                  disabled={isPending}
                  maxLength={2000}
                  rows={3}
                  placeholder="What should readers know before they begin?"
                  className="min-h-[76px] resize-none rounded-none border-foreground/20 bg-background text-sm leading-6 shadow-none"
                />
                <p className="mt-1 font-mono text-[9px] text-muted-foreground">
                  Shown to beta readers when they receive the invitation.
                </p>
              </div>

              <fieldset>
                <legend className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Genres
                </legend>
                <div className="flex flex-wrap gap-1.5">
                  {(genresQuery.data ?? []).map((genre, index) => {
                    const selected = genreSlugs.includes(genre.slug);

                    return (
                      <Label
                        key={genre.slug}
                        htmlFor={`manuscript-settings-genre-${index}`}
                        className={cn(
                          "relative cursor-pointer border border-foreground/20 px-2.5 py-1.5 text-[11px] font-normal text-foreground/75",
                          selected && "border-foreground bg-foreground text-background",
                        )}
                      >
                        <Checkbox
                          id={`manuscript-settings-genre-${index}`}
                          checked={selected}
                          disabled={isPending}
                          onCheckedChange={() => toggleGenre(genre.slug)}
                          className="sr-only"
                        />
                        {genre.label}
                      </Label>
                    );
                  })}
                </div>
                {genresQuery.isLoading ? <p className="mt-2 text-[11px] text-muted-foreground">Loading genres…</p> : null}
                {genresQuery.isError ? <p className="mt-2 text-[11px] text-destructive">Genres could not be loaded.</p> : null}
              </fieldset>
            </section>

            <section aria-label="Manuscript structure" className="mt-8 border-t border-foreground/[0.08] pt-6">
              <SectionLabel>Structure</SectionLabel>

              <div className="mb-5 flex items-center justify-between border border-foreground/10 bg-sidebar/35 px-4 py-3">
                <div>
                  <p className="text-[11px] font-medium">{manuscript.chapters.length} chapters in this draft</p>
                  <p className="mt-1 font-mono text-[9px] text-muted-foreground">
                    Chapter content and order are managed separately to protect reader feedback.
                  </p>
                </div>
                <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Draft {manuscript.version?.number}</span>
              </div>

              <fieldset>
                <legend className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Approximate word count
                </legend>
                <RadioGroup
                  value={wordCountBand}
                  onValueChange={(value) => setWordCountBand(value as ManuscriptWordCountBand | "")}
                  disabled={isPending}
                  className="flex flex-wrap gap-2"
                >
                  <Label
                    htmlFor="manuscript-settings-word-count-none"
                    className={cn(
                      "relative cursor-pointer border border-foreground/20 px-3 py-2 text-[11px] font-normal text-foreground/75",
                      !wordCountBand && "border-foreground bg-foreground text-background",
                    )}
                  >
                    <RadioGroupItem id="manuscript-settings-word-count-none" value="" className="sr-only" />
                    Not set
                  </Label>
                  {manuscriptWordCountOptions.map((wordCount) => (
                    <Label
                      key={wordCount.value}
                      htmlFor={`manuscript-settings-word-count-${wordCount.value}`}
                      className={cn(
                        "relative cursor-pointer border border-foreground/20 px-3 py-2 text-[11px] font-normal text-foreground/75",
                        wordCountBand === wordCount.value && "border-foreground bg-foreground text-background",
                      )}
                    >
                      <RadioGroupItem
                        id={`manuscript-settings-word-count-${wordCount.value}`}
                        value={wordCount.value}
                        className="sr-only"
                      />
                      {wordCount.label}
                    </Label>
                  ))}
                </RadioGroup>
              </fieldset>

              <div className="mt-5 border border-foreground/10 bg-sidebar/30 p-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="manuscript-settings-enable-reading-deadline"
                    checked={hasReadingDeadline}
                    disabled={isPending}
                    onCheckedChange={(checked) => {
                      const enabled = checked === true;
                      setHasReadingDeadline(enabled);
                      if (!enabled) setReaderDeadline("");
                    }}
                    className="mt-0.5"
                  />
                  <div>
                    <Label htmlFor="manuscript-settings-enable-reading-deadline" className="cursor-pointer text-[11px] font-medium">
                      Set a reading deadline
                    </Label>
                    <p className="mt-1 font-mono text-[9px] leading-4 text-muted-foreground">
                      It gives readers a target date but never blocks access after that date.
                    </p>
                  </div>
                </div>
                {hasReadingDeadline ? (
                  <div className="mt-4 border-t border-foreground/10 pt-4">
                    <FieldLabel htmlFor="manuscript-settings-reading-deadline" required>Target date</FieldLabel>
                    <Input
                      id="manuscript-settings-reading-deadline"
                      type="date"
                      required
                      value={readerDeadline}
                      onChange={(event) => setReaderDeadline(event.target.value)}
                      disabled={isPending}
                      className="h-10 w-auto rounded-none border-foreground/20 bg-background px-3 text-sm font-normal shadow-none"
                    />
                  </div>
                ) : null}
              </div>
            </section>

            <section aria-label="Beta reader settings" className="mt-8 border-t border-foreground/[0.08] pt-6">
              <SectionLabel>Beta readers</SectionLabel>

              <div>
                <FieldLabel htmlFor="manuscript-settings-maximum-readers">Maximum beta readers</FieldLabel>
                <div className="flex items-center gap-2">
                  <Input
                    id="manuscript-settings-maximum-readers"
                    type="number"
                    min={1}
                    max={hasProPlan ? undefined : 5}
                    value={maxReaders}
                    onChange={(event) => {
                      const nextValue = Math.max(1, Number(event.target.value));
                      setMaxReaders(hasProPlan ? nextValue : Math.min(5, nextValue));
                    }}
                    disabled={isPending}
                    className="h-10 w-20 rounded-none border-foreground/20 bg-background px-3 text-center font-mono text-sm font-normal shadow-none"
                  />
                  <span className="text-[11px] text-muted-foreground">readers</span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <p className="font-mono text-[9px] text-muted-foreground">
                    {hasProPlan ? "Your Pro plan supports unlimited readers." : "Your free plan supports up to 5 readers."}
                  </p>
                  {!hasProPlan ? (
                    <Button asChild variant="link" size="sm" className="h-auto px-0 py-0 text-[10px]">
                      <Link href="/dashboard/settings?section=plan" onClick={() => setIsOpen(false)}>
                        Change plan for unlimited readers
                      </Link>
                    </Button>
                  ) : null}
                </div>
              </div>

              <div className="mt-5">
                <FieldLabel htmlFor="manuscript-settings-reader-note">Note to readers</FieldLabel>
                <Textarea
                  id="manuscript-settings-reader-note"
                  value={readerNote}
                  onChange={(event) => setReaderNote(event.target.value)}
                  disabled={isPending}
                  maxLength={4000}
                  rows={4}
                  placeholder="What should readers focus on while they read?"
                  className="min-h-[100px] resize-none rounded-none border-foreground/20 bg-background text-sm leading-6 shadow-none"
                />
                <p className="mt-1 font-mono text-[9px] text-muted-foreground">
                  Included in the invitation email and visible in the reader workspace.
                </p>
              </div>

              <div className="mt-5">
                <FieldLabel htmlFor="manuscript-settings-closing-note">Closing note for readers</FieldLabel>
                <Textarea
                  id="manuscript-settings-closing-note"
                  value={readerClosingNote}
                  onChange={(event) => setReaderClosingNote(event.target.value)}
                  disabled={isPending}
                  maxLength={4000}
                  rows={4}
                  placeholder="Thank readers after the final chapter."
                  className="min-h-[100px] resize-none rounded-none border-foreground/20 bg-background text-sm leading-6 shadow-none"
                />
                <p className="mt-1 font-mono text-[9px] text-muted-foreground">
                  Optional. Shown on the final page after a reader finishes the manuscript.
                </p>
              </div>
            </section>

            <section aria-label="Danger zone" className="mt-8 border-t border-destructive/25 pt-6">
              <SectionLabel className="text-destructive">Danger zone</SectionLabel>
              <p className="text-sm leading-6 text-muted-foreground">
                Permanently delete this manuscript, its drafts, reader feedback, and uploaded files.
              </p>
              {deleteError ? <p role="alert" className="mt-3 text-sm text-destructive">{deleteError}</p> : null}
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
            </section>
          </div>

          {formError ? (
            <p role="alert" className="border-t border-destructive/20 bg-destructive/5 px-8 py-3 text-xs text-destructive">
              {formError}
            </p>
          ) : null}

          <DialogFooter className="border-t border-foreground/[0.08] bg-sidebar px-8 py-4 sm:justify-between">
            <p className="font-mono text-[9px] text-muted-foreground">
              {coverFile ? "Your new cover will be saved with these changes." : "Changes apply to this draft only."}
            </p>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isPending}
                onClick={() => setIsOpen(false)}
                className="h-auto px-0 text-[11px] text-muted-foreground hover:bg-transparent hover:text-foreground"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending || genresQuery.isLoading} className="rounded-none">
                {updateSettings.isPending ? "Saving…" : uploadCover.isPending ? "Uploading cover…" : "Save changes"}
              </Button>
            </div>
          </DialogFooter>
        </form>

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
              <AlertDialogCancel disabled={deleteManuscript.isPending}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                disabled={deleteManuscript.isPending}
                onClick={(event) => {
                  event.preventDefault();
                  void handleDelete();
                }}
                className="rounded-none bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleteManuscript.isPending ? "Deleting…" : "Delete manuscript"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
}

function CoverField({
  coverFile,
  coverPreviewUrl,
  currentCoverUrl,
  disabled,
  inputRef,
  onClearSelection,
  onSelect,
}: {
  coverFile: File | null;
  coverPreviewUrl: string | null;
  currentCoverUrl: string | null;
  disabled: boolean;
  inputRef: RefObject<HTMLInputElement | null>;
  onClearSelection: () => void;
  onSelect: (file: File) => void;
}) {
  const coverUrl = coverPreviewUrl ?? currentCoverUrl;

  return (
    <div>
      <FieldLabel htmlFor="manuscript-settings-cover">Book cover</FieldLabel>
      <input
        ref={inputRef}
        id="manuscript-settings-cover"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(event) => {
          const nextFile = event.target.files?.[0];
          event.target.value = "";
          if (nextFile) onSelect(nextFile);
        }}
      />

      <div className="flex items-start gap-4 border border-foreground/10 bg-sidebar/30 p-3">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt="Cover preview"
            width={64}
            height={90}
            unoptimized
            className="h-[90px] w-16 shrink-0 border border-foreground/15 object-cover shadow-[2px_3px_8px_rgba(28,24,18,0.12)]"
          />
        ) : (
          <div className="grid h-[90px] w-16 shrink-0 place-items-center border border-dashed border-foreground/20 bg-background text-muted-foreground">
            <BookOpen className="h-4 w-4" strokeWidth={1.25} />
          </div>
        )}
        <div className="min-w-0 pt-0.5">
          <p className="text-xs font-medium">
            {coverFile ? coverFile.name : currentCoverUrl ? "Current cover" : "No cover uploaded"}
          </p>
          <p className="mt-1 font-mono text-[9px] leading-4 text-muted-foreground">
            {coverFile ? "Optimized to WebP before replacing the current image." : "JPG, PNG, WEBP · max 5 MB · optimized before upload"}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled}
              onClick={() => inputRef.current?.click()}
              className="h-auto rounded-none px-3 py-1.5 text-[11px]"
            >
              <ImagePlus className="h-3 w-3" />
              {coverUrl ? "Replace" : "Upload cover"}
            </Button>
            {coverFile ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={disabled}
                onClick={onClearSelection}
                className="h-auto px-3 py-1.5 text-[11px] text-muted-foreground"
              >
                Undo
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function FieldLabel({
  children,
  required = false,
  htmlFor,
}: {
  children: ReactNode;
  required?: boolean;
  htmlFor?: string;
}) {
  return (
    <Label htmlFor={htmlFor} className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
      {children}{required ? <span className="text-primary-text"> *</span> : null}
    </Label>
  );
}

function SectionLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("mb-5 font-mono text-[9px] uppercase tracking-widest text-muted-foreground", className)}>
      {children}
    </p>
  );
}

function useCoverPreviewUrl(file: File | null) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    let active = true;
    const reader = new FileReader();
    reader.onload = () => {
      if (active && typeof reader.result === "string") setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);

    return () => {
      active = false;
      reader.abort();
    };
  }, [file]);

  return previewUrl;
}
