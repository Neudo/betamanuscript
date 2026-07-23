"use client";

import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  ImagePlus,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  DragEvent,
  FormEvent,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import type { AccountPlan } from "@/features/account/types";
import { getCoverFileError } from "@/features/manuscript/api/manuscript-assets";
import {
  manuscriptWizardSteps,
  manuscriptWordCountOptions,
} from "@/features/manuscript/data/create-manuscript";
import { useManuscriptDraft } from "@/features/manuscript/hooks/use-manuscript-draft";
import {
  useCreateManuscriptMutation,
  useUploadManuscriptCoverMutation,
} from "@/features/manuscript/hooks/use-manuscript-mutations";
import { useManuscriptGenres } from "@/features/manuscript/hooks/use-manuscripts";
import type {
  ManuscriptAccessMode,
  ManuscriptDraft,
  ManuscriptGenre,
  CreatedManuscript,
} from "@/features/manuscript/types";
import { cn } from "@/lib/utils";

type CreateManuscriptDialogProps = {
  children?: ReactNode;
  onCreated?: (manuscript: CreatedManuscript) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  accountPlan?: AccountPlan;
};

export function CreateManuscriptDialog({
  children,
  onCreated,
  open: controlledOpen,
  onOpenChange,
  accountPlan = "free",
}: CreateManuscriptDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const editor = useManuscriptDraft();
  const createMutation = useCreateManuscriptMutation();
  const coverMutation = useUploadManuscriptCoverMutation();
  const genresQuery = useManuscriptGenres(open);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [createdManuscript, setCreatedManuscript] = useState<CreatedManuscript | null>(null);
  const stepTitle =
    editor.step === "info"
      ? "Tell us about the book"
      : editor.step === "structure"
        ? "Manuscript structure"
        : "Beta reader settings";

  function handleOpenChange(nextOpen: boolean) {
    if (controlledOpen === undefined) setInternalOpen(nextOpen);
    onOpenChange?.(nextOpen);
    if (!nextOpen) {
      editor.reset();
      createMutation.reset();
      coverMutation.reset();
      setCoverFile(null);
      setCreatedManuscript(null);
    }
  }

  function handleCoverChange(nextCoverFile: File | null) {
    setCoverFile(nextCoverFile);
    coverMutation.reset();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (editor.step !== "readers") {
      if (editor.canContinue) editor.nextStep();
      return;
    }

    try {
      const manuscript = createdManuscript ?? await createMutation.mutateAsync(editor.draft);
      setCreatedManuscript(manuscript);

      if (coverFile) {
        await coverMutation.mutateAsync({
          file: coverFile,
          manuscriptVersionId: manuscript.manuscriptVersionId,
        });
      }

      onCreated?.(manuscript);
      handleOpenChange(false);
    } catch {
      // The mutation state renders the database error beneath the form.
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {children ? <DialogTrigger asChild>{children}</DialogTrigger> : null}
      <DialogContent
        overlayClassName="bg-foreground/45 backdrop-blur-[4px]"
        className="flex max-h-[90vh] w-[calc(100%-2rem)] max-w-[560px] flex-col gap-0 overflow-hidden border-foreground/10 bg-card p-0 shadow-[0_24px_64px_rgba(28,24,18,0.18)] sm:rounded-none [&>button]:right-8 [&>button]:top-7 [&>button]:rounded-none"
      >
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <header className="border-b border-foreground/[0.08] px-8 pb-5 pt-7">
            <p className="mb-1.5 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
              New manuscript
            </p>
            <DialogTitle className="text-lg font-semibold tracking-normal">
              {stepTitle}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Create a manuscript and configure its reader access.
            </DialogDescription>
          </header>

          <StepIndicator currentStep={editor.step} />

          <div className="min-h-0 flex-1 overflow-y-auto px-8 py-6">
            {editor.step === "info" ? (
              <BookInfoStep
                draft={editor.draft}
                genres={genresQuery.data ?? []}
                genresError={genresQuery.isError}
                genresLoading={genresQuery.isLoading}
                coverFile={coverFile}
                onChange={editor.updateDraft}
                onCoverChange={handleCoverChange}
              />
            ) : null}
            {editor.step === "structure" ? (
              <StructureStep
                draft={editor.draft}
                genres={genresQuery.data ?? []}
                coverFile={coverFile}
                onChange={editor.updateDraft}
              />
            ) : null}
            {editor.step === "readers" ? (
              <ReaderSettingsStep
                accountPlan={accountPlan}
                draft={editor.draft}
                onChange={editor.updateDraft}
                onChangePlan={() => handleOpenChange(false)}
              />
            ) : null}
          </div>

          <footer className="flex items-center justify-between border-t border-foreground/[0.08] bg-sidebar px-8 py-4">
            <div>
              {editor.stepIndex > 0 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={editor.previousStep}
                  className="h-auto px-0 text-[11px] text-muted-foreground hover:bg-transparent hover:text-foreground"
                >
                  ← Back
                </Button>
              ) : null}
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleOpenChange(false)}
                className="h-auto px-0 text-[11px] text-muted-foreground hover:bg-transparent hover:text-foreground"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={
                  !editor.canContinue ||
                  (editor.step === "readers" && (createMutation.isPending || coverMutation.isPending))
                }
                className={cn(
                  "h-8 gap-2 px-5 text-xs",
                  editor.step !== "readers" && "bg-foreground text-background hover:bg-foreground/90",
                )}
              >
                {editor.step === "readers" && (createMutation.isPending || coverMutation.isPending)
                  ? coverMutation.isPending
                    ? "Uploading cover"
                    : "Creating manuscript"
                  : editor.step === "readers"
                    ? createdManuscript
                      ? coverFile
                        ? "Retry cover upload"
                        : "Finish manuscript"
                      : "Create manuscript"
                    : "Continue"}
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          </footer>
          {createMutation.isError || coverMutation.isError ? (
            <p className="border-t border-destructive/20 bg-destructive/5 px-8 py-3 text-xs text-destructive">
              {coverMutation.isError
                ? `Your manuscript was created, but its cover could not be uploaded. ${coverMutation.error.message}`
                : createMutation.error?.message}
            </p>
          ) : null}
        </form>
      </DialogContent>
    </Dialog>
  );
}

function StepIndicator({ currentStep }: { currentStep: string }) {
  const currentIndex = manuscriptWizardSteps.findIndex((step) => step.id === currentStep);

  return (
    <ol className="flex items-center overflow-x-auto border-b border-foreground/[0.06] bg-sidebar px-8 py-4">
      {manuscriptWizardSteps.map((step, index) => {
        const complete = index < currentIndex;
        const current = index === currentIndex;

        return (
          <li key={step.id} className="flex items-center" aria-current={current ? "step" : undefined}>
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  "grid h-5 w-5 shrink-0 place-items-center border border-foreground/20 font-mono text-[9px] font-semibold text-muted-foreground",
                  current && "border-foreground bg-foreground text-background",
                  complete && "border-success bg-success text-background",
                )}
              >
                {complete ? "✓" : index + 1}
              </span>
              <span className={cn("whitespace-nowrap text-[10px] text-muted-foreground", current && "text-foreground")}>
                {step.label}
              </span>
            </div>
            {index < manuscriptWizardSteps.length - 1 ? (
              <span className={cn("mx-3 h-px w-8 shrink-0 bg-foreground/10", complete && "bg-success/30")} />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

type StepProps = {
  draft: ManuscriptDraft;
  onChange: (patch: Partial<ManuscriptDraft>) => void;
};

function BookInfoStep({
  draft,
  genres,
  genresError,
  genresLoading,
  coverFile,
  onChange,
  onCoverChange,
}: StepProps & {
  genres: ManuscriptGenre[];
  genresError: boolean;
  genresLoading: boolean;
  coverFile: File | null;
  onCoverChange: (file: File | null) => void;
}) {
  function toggleGenre(genreSlug: string) {
    onChange({
      genreSlugs: draft.genreSlugs.includes(genreSlug)
        ? draft.genreSlugs.filter((item) => item !== genreSlug)
        : [...draft.genreSlugs, genreSlug],
    });
  }

  return (
    <div className="space-y-5">
      <CoverUpload file={coverFile} onChange={onCoverChange} />

      <div>
        <FieldLabel htmlFor="manuscript-title" required>Title</FieldLabel>
        <Input
          id="manuscript-title"
          value={draft.title}
          onChange={(event) => onChange({ title: event.target.value })}
          placeholder="e.g. The Last Cartographer"
          autoFocus
          className="h-10 rounded-none border-foreground/20 bg-background px-3 text-sm font-normal shadow-none"
        />
      </div>

      <div>
        <FieldLabel htmlFor="manuscript-logline">One-line premise</FieldLabel>
        <Textarea
          id="manuscript-logline"
          value={draft.logline}
          onChange={(event) => onChange({ logline: event.target.value })}
          placeholder="A cartographer discovers that the maps she draws reshape reality - and someone is trying to stop her."
          rows={3}
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
          {genres.map((genre, index) => {
            const selected = draft.genreSlugs.includes(genre.slug);

            return (
              <Label
                key={genre.slug}
                htmlFor={`manuscript-genre-${index}`}
                className={cn(
                  "relative cursor-pointer border border-foreground/20 px-2.5 py-1.5 text-[11px] font-normal text-foreground/75",
                  selected && "border-foreground bg-foreground text-background",
                )}
              >
                <Checkbox
                  id={`manuscript-genre-${index}`}
                  checked={selected}
                  onCheckedChange={() => toggleGenre(genre.slug)}
                  className="sr-only"
                />
                {genre.label}
              </Label>
            );
          })}
        </div>
        {genresLoading ? <p className="mt-2 text-[11px] text-muted-foreground">Loading genres…</p> : null}
        {genresError ? <p className="mt-2 text-[11px] text-destructive">Genres could not be loaded.</p> : null}
      </fieldset>

      <div>
        <FieldLabel>Draft number</FieldLabel>
        <RadioGroup value={String(draft.draftNumber)} onValueChange={(value) => onChange({ draftNumber: Number(value) })} className="flex gap-1.5">
          {[1, 2, 3, 4].map((number) => (
            <Label
              key={number}
              htmlFor={`draft-${number}`}
              className={cn(
                "relative grid h-10 w-10 cursor-pointer place-items-center border border-foreground/20 font-mono text-sm font-normal text-foreground/75",
                draft.draftNumber === number && "border-foreground bg-foreground text-background",
              )}
            >
              <RadioGroupItem id={`draft-${number}`} value={String(number)} className="sr-only" />
              {number}
            </Label>
          ))}
        </RadioGroup>
      </div>
    </div>
  );
}

function StructureStep({
  draft,
  genres,
  coverFile,
  onChange,
}: StepProps & {
  genres: ManuscriptGenre[];
  coverFile: File | null;
}) {
  const coverPreviewUrl = useCoverPreviewUrl(coverFile);

  return (
    <div className="space-y-5">
      <div>
        <FieldLabel htmlFor="manuscript-chapters" required>Number of chapters</FieldLabel>
        <div className="flex items-center gap-2">
          <Input
            id="manuscript-chapters"
            type="number"
            min={1}
            max={200}
            value={draft.chapters}
            onChange={(event) => onChange({ chapters: Math.max(1, Math.min(200, Number(event.target.value))) })}
            className="h-10 w-20 rounded-none border-foreground/20 bg-background px-3 text-center font-mono text-sm font-normal shadow-none"
          />
          <span className="text-[11px] text-muted-foreground">chapters</span>
        </div>
        <p className="mt-1.5 font-mono text-[9px] text-muted-foreground">
          You can always adjust this after creating the manuscript.
        </p>
      </div>

      <div>
        <FieldLabel>Approximate word count</FieldLabel>
        <RadioGroup
          value={draft.wordCountBand}
          onValueChange={(wordCountBand) => onChange({ wordCountBand: wordCountBand as ManuscriptDraft["wordCountBand"] })}
          className="flex flex-wrap gap-2"
        >
          {manuscriptWordCountOptions.map((wordCount) => (
            <Label
              key={wordCount.value}
              htmlFor={`word-count-${wordCount.value}`}
              className={cn(
                "relative cursor-pointer border border-foreground/20 px-3 py-2 text-[11px] font-normal text-foreground/75",
                draft.wordCountBand === wordCount.value && "border-foreground bg-foreground text-background",
              )}
            >
              <RadioGroupItem id={`word-count-${wordCount.value}`} value={wordCount.value} className="sr-only" />
              {wordCount.label}
            </Label>
          ))}
        </RadioGroup>
      </div>

      <div>
        <FieldLabel htmlFor="reading-deadline">Reading deadline</FieldLabel>
        <Input
          id="reading-deadline"
          type="date"
          value={draft.deadline}
          onChange={(event) => onChange({ deadline: event.target.value })}
          className="h-10 w-auto rounded-none border-foreground/20 bg-background px-3 text-sm font-normal shadow-none"
        />
        <p className="mt-1.5 font-mono text-[9px] text-muted-foreground">
          Optional. Shown to readers in their invitation.
        </p>
      </div>

      <div className="flex items-center gap-4 border border-foreground/10 bg-sidebar/40 p-4">
        {coverPreviewUrl ? (
          <Image
            src={coverPreviewUrl}
            alt="Cover preview"
            width={36}
            height={50}
            unoptimized
            className="h-[50px] w-9 shrink-0 border border-foreground/10 object-cover"
          />
        ) : (
          <div className="grid h-[50px] w-9 shrink-0 place-items-center border border-foreground/10 bg-foreground/[0.07]">
            <BookOpen className="h-3 w-3 text-muted-foreground" strokeWidth={1.25} />
          </div>
        )}
        <div>
          <p className="mb-1.5 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Manuscript preview</p>
          <p className="mb-1 text-sm font-medium">{draft.title || "Untitled"}</p>
          <p className="font-mono text-[9px] text-muted-foreground">
            Draft {draft.draftNumber} · {draft.chapters} ch
            {draft.wordCountBand
              ? ` · ${manuscriptWordCountOptions.find((option) => option.value === draft.wordCountBand)?.label}`
              : ""}
            {draft.genreSlugs.length > 0
              ? ` · ${draft.genreSlugs
                .map((slug) => genres.find((genre) => genre.slug === slug)?.label)
                .filter(Boolean)
                .join(", ")}`
              : ""}
          </p>
        </div>
      </div>
    </div>
  );
}

function ReaderSettingsStep({
  accountPlan,
  draft,
  onChange,
  onChangePlan,
}: StepProps & { accountPlan: AccountPlan; onChangePlan: () => void }) {
  const hasProPlan = accountPlan === "pro";
  const accessOptions: Array<{ id: ManuscriptAccessMode; label: string; description: string }> = [
    { id: "invite", label: "Invite only", description: "You send invitations manually" },
    { id: "open", label: "Open sign-up", description: "Anyone with the link can join" },
  ];

  return (
    <div className="space-y-5">
      <div>
        <FieldLabel htmlFor="maximum-readers">Maximum beta readers</FieldLabel>
        <div className="flex items-center gap-2">
          <Input
            id="maximum-readers"
            type="number"
            min={1}
            max={hasProPlan ? undefined : 5}
            value={draft.maxReaders}
            onChange={(event) => {
              const nextValue = Math.max(1, Number(event.target.value));
              onChange({ maxReaders: hasProPlan ? nextValue : Math.min(5, nextValue) });
            }}
            className="h-10 w-20 rounded-none border-foreground/20 bg-background px-3 text-center font-mono text-sm font-normal shadow-none"
          />
          <span className="text-[11px] text-muted-foreground">readers</span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
          <p className="font-mono text-[9px] text-muted-foreground">
            {hasProPlan
              ? "Your Pro plan supports unlimited readers."
              : "Your free plan supports up to 5 readers."}
          </p>
          {!hasProPlan ? <Button asChild variant="link" size="sm" className="h-auto px-0 py-0 text-[10px]">
            <Link href="/dashboard/settings?section=plan" onClick={onChangePlan}>
              Change plan for unlimited readers
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </Button> : null}
        </div>
      </div>

      <div>
        <FieldLabel>Access</FieldLabel>
        <RadioGroup value={draft.accessMode} onValueChange={(value) => onChange({ accessMode: value as ManuscriptAccessMode })} className="grid gap-2 sm:grid-cols-2">
          {accessOptions.map((option) => (
            <Label
              key={option.id}
              htmlFor={`access-${option.id}`}
              className={cn(
                "cursor-pointer border border-foreground/20 px-3 py-3 font-normal",
                draft.accessMode === option.id && "border-foreground bg-foreground/[0.05]",
              )}
            >
              <span className="mb-1 flex items-center gap-1.5 text-[11px] font-medium">
                <RadioGroupItem id={`access-${option.id}`} value={option.id} className="h-3.5 w-3.5 shadow-none" />
                {option.label}
              </span>
              <span className="block pl-5 font-mono text-[9px] text-muted-foreground">{option.description}</span>
            </Label>
          ))}
        </RadioGroup>
      </div>

      <div>
        <FieldLabel htmlFor="reader-note">Note to readers</FieldLabel>
        <Textarea
          id="reader-note"
          value={draft.readerNote}
          onChange={(event) => onChange({ readerNote: event.target.value })}
          placeholder="e.g. Focus especially on whether the protagonist's motivations feel believable in the first three chapters."
          rows={4}
          className="min-h-[100px] resize-none rounded-none border-foreground/20 bg-background text-sm leading-6 shadow-none"
        />
        <p className="mt-1 font-mono text-[9px] text-muted-foreground">
          Included in the invitation email and visible on the reader portal.
        </p>
      </div>
    </div>
  );
}

function CoverUpload({
  file,
  onChange,
}: {
  file: File | null;
  onChange: (file: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const previewUrl = useCoverPreviewUrl(file);

  function selectFile(nextFile: File) {
    const validationError = getCoverFileError(nextFile);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    onChange(nextFile);
  }

  function handleDrop(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    setDragging(false);
    const nextFile = event.dataTransfer.files[0];
    if (nextFile) selectFile(nextFile);
  }

  return (
    <div>
      <FieldLabel htmlFor="cover-upload">Book cover</FieldLabel>
      <input
        ref={inputRef}
        id="cover-upload"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(event) => {
          const nextFile = event.target.files?.[0];
          event.target.value = "";
          if (nextFile) selectFile(nextFile);
        }}
      />

      {file && previewUrl ? (
        <div className="flex items-start gap-4">
          <Image
            src={previewUrl}
            alt="Cover preview"
            width={80}
            height={112}
            unoptimized
            className="h-28 w-20 shrink-0 border border-foreground/15 object-cover shadow-[2px_3px_8px_rgba(28,24,18,0.12)]"
          />
          <div className="min-w-0 pt-1">
            <p className="truncate text-xs font-medium">{file.name}</p>
            <p className="mt-1 font-mono text-[9px] text-muted-foreground">
              {formatFileSize(file.size)} · Uploads when the manuscript is created
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => inputRef.current?.click()}
                className="h-auto rounded-none px-3 py-1.5 text-[11px]"
              >
                <ImagePlus className="h-3 w-3" />
                Replace
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onChange(null)}
                className="h-auto px-3 py-1.5 text-[11px] text-muted-foreground"
              >
                <Trash2 className="h-3 w-3" />
                Remove
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={cn(
            "flex h-28 w-full flex-col items-center justify-center gap-2 border border-dashed border-foreground/25 text-muted-foreground transition-colors",
            dragging && "border-foreground bg-foreground/[0.03] text-foreground",
          )}
        >
          <ImagePlus className="h-[18px] w-[18px]" strokeWidth={1.25} />
          <span className="text-center text-[11px]">
            Drop an image or <span className="underline">browse</span>
          </span>
          <span className="font-mono text-[9px]">JPG, PNG, WEBP · max 5 MB · recommended 2:3 ratio</span>
        </button>
      )}
      {error ? <p className="mt-1 font-mono text-[9px] text-destructive">{error}</p> : null}
    </div>
  );
}

function useCoverPreviewUrl(file: File | null) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) return;

    let active = true;
    const reader = new FileReader();
    reader.onload = () => {
      if (active && typeof reader.result === "string") {
        setPreviewUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);

    return () => {
      active = false;
      reader.abort();
    };
  }, [file]);

  return file ? previewUrl : null;
}

function formatFileSize(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(bytes < 1024 * 1024 ? 1 : 0)} MB`;
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
      {children}{required ? <span className="text-primary"> *</span> : null}
    </Label>
  );
}
