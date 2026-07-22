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
import {
  manuscriptGenres,
  manuscriptWizardSteps,
  manuscriptWordCounts,
} from "@/features/manuscript/data/create-manuscript";
import { useCreateManuscript } from "@/features/manuscript/hooks/use-create-manuscript";
import type {
  ManuscriptAccessMode,
  ManuscriptDraft,
} from "@/features/manuscript/types";
import { cn } from "@/lib/utils";

type CreateManuscriptDialogProps = {
  children: ReactNode;
  onCreate: (draft: ManuscriptDraft) => void;
};

export function CreateManuscriptDialog({
  children,
  onCreate,
}: CreateManuscriptDialogProps) {
  const [open, setOpen] = useState(false);
  const editor = useCreateManuscript();
  const stepTitle =
    editor.step === "info"
      ? "Tell us about the book"
      : editor.step === "structure"
        ? "Manuscript structure"
        : "Beta reader settings";

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) editor.reset();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (editor.step !== "readers") {
      if (editor.canContinue) editor.nextStep();
      return;
    }

    onCreate(editor.draft);
    setOpen(false);
    editor.reset();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
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
              <BookInfoStep draft={editor.draft} onChange={editor.updateDraft} />
            ) : null}
            {editor.step === "structure" ? (
              <StructureStep draft={editor.draft} onChange={editor.updateDraft} />
            ) : null}
            {editor.step === "readers" ? (
              <ReaderSettingsStep
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
                disabled={!editor.canContinue}
                className={cn(
                  "h-8 gap-2 px-5 text-xs",
                  editor.step !== "readers" && "bg-foreground text-background hover:bg-foreground/90",
                )}
              >
                {editor.step === "readers" ? "Create manuscript" : "Continue"}
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          </footer>
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

function BookInfoStep({ draft, onChange }: StepProps) {
  function toggleGenre(genre: string) {
    onChange({
      genres: draft.genres.includes(genre)
        ? draft.genres.filter((item) => item !== genre)
        : [...draft.genres, genre],
    });
  }

  return (
    <div className="space-y-5">
      <CoverUpload value={draft.coverDataUrl} onChange={(coverDataUrl) => onChange({ coverDataUrl })} />

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
          {manuscriptGenres.map((genre, index) => {
            const selected = draft.genres.includes(genre);

            return (
              <Label
                key={genre}
                htmlFor={`manuscript-genre-${index}`}
                className={cn(
                  "relative cursor-pointer border border-foreground/20 px-2.5 py-1.5 text-[11px] font-normal text-foreground/75",
                  selected && "border-foreground bg-foreground text-background",
                )}
              >
                <Checkbox
                  id={`manuscript-genre-${index}`}
                  checked={selected}
                  onCheckedChange={() => toggleGenre(genre)}
                  className="sr-only"
                />
                {genre}
              </Label>
            );
          })}
        </div>
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

function StructureStep({ draft, onChange }: StepProps) {
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
        <RadioGroup value={draft.wordCount} onValueChange={(wordCount) => onChange({ wordCount })} className="flex flex-wrap gap-2">
          {manuscriptWordCounts.map((wordCount) => (
            <Label
              key={wordCount}
              htmlFor={`word-count-${wordCount}`}
              className={cn(
                "relative cursor-pointer border border-foreground/20 px-3 py-2 text-[11px] font-normal text-foreground/75",
                draft.wordCount === wordCount && "border-foreground bg-foreground text-background",
              )}
            >
              <RadioGroupItem id={`word-count-${wordCount}`} value={wordCount} className="sr-only" />
              {wordCount}
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
        {draft.coverDataUrl ? (
          <Image src={draft.coverDataUrl} alt="Cover preview" width={36} height={50} unoptimized className="h-[50px] w-9 shrink-0 object-cover" />
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
            {draft.wordCount ? ` · ${draft.wordCount}` : ""}
            {draft.genres.length > 0 ? ` · ${draft.genres.join(", ")}` : ""}
          </p>
        </div>
      </div>
    </div>
  );
}

function ReaderSettingsStep({
  draft,
  onChange,
  onChangePlan,
}: StepProps & { onChangePlan: () => void }) {
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
            max={5}
            value={draft.maxReaders}
            onChange={(event) => onChange({ maxReaders: Math.max(1, Math.min(5, Number(event.target.value))) })}
            className="h-10 w-20 rounded-none border-foreground/20 bg-background px-3 text-center font-mono text-sm font-normal shadow-none"
          />
          <span className="text-[11px] text-muted-foreground">readers</span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
          <p className="font-mono text-[9px] text-muted-foreground">
            Your free plan supports up to 5 readers.
          </p>
          <Button asChild variant="link" size="sm" className="h-auto px-0 py-0 text-[10px]">
            <Link href="/dashboard/settings?section=plan" onClick={onChangePlan}>
              Change plan for unlimited readers
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </Button>
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

function CoverUpload({ value, onChange }: { value: string | null; onChange: (value: string | null) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function readFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Choose a JPG, PNG or WEBP image.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      onChange(typeof event.target?.result === "string" ? event.target.result : null);
      setError(null);
    };
    reader.readAsDataURL(file);
  }

  function handleDrop(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) readFile(file);
  }

  return (
    <div>
      <FieldLabel htmlFor="cover-upload">Cover image</FieldLabel>
      <input
        ref={inputRef}
        id="cover-upload"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) readFile(file);
        }}
      />

      {value ? (
        <div className="flex items-start gap-4">
          <Image src={value} alt="Cover preview" width={80} height={112} unoptimized className="h-28 w-20 shrink-0 border border-foreground/15 object-cover shadow-[2px_3px_8px_rgba(28,24,18,0.12)]" />
          <div className="flex flex-col gap-2 pt-1">
            <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()} className="h-auto rounded-none px-3 py-1.5 text-[11px]">
              <ImagePlus className="h-3 w-3" />Replace
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)} className="h-auto justify-start px-3 py-1.5 text-[11px] text-muted-foreground">
              <Trash2 className="h-3 w-3" />Remove
            </Button>
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
          <span className="font-mono text-[9px]">JPG, PNG, WEBP - recommended 2:3 ratio</span>
        </button>
      )}
      {error ? <p className="mt-1 font-mono text-[9px] text-primary">{error}</p> : null}
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
      {children}{required ? <span className="text-primary"> *</span> : null}
    </Label>
  );
}
