"use client";

import { ArrowRight, FileText, Trash2 } from "lucide-react";
import { DragEvent, FormEvent, ReactNode, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { AccountPlan } from "@/features/account/types";
import { useManuscriptDraft } from "@/features/manuscript/hooks/use-manuscript-draft";
import { useCreateManuscriptMutation, useUploadManuscriptSourceMutation } from "@/features/manuscript/hooks/use-manuscript-mutations";
import { useManuscriptGenres } from "@/features/manuscript/hooks/use-manuscripts";
import { getSourceDocumentError, importSourceDocument, sourceDocumentAccept } from "@/features/manuscript/lib/source-document";
import type { ManuscriptDraft, ManuscriptGenre, CreatedManuscript, ImportedManuscriptChapter } from "@/features/manuscript/types";
import { cn } from "@/lib/utils";
import { Heading } from "@/shared/ui/Heading";

type CreateManuscriptDialogProps = {
  children?: ReactNode;
  onCreated?: (manuscript: CreatedManuscript) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  accountPlan?: AccountPlan;
  initialSource?: { file: File; chapters: ImportedManuscriptChapter[] };
  pendingUploadId?: string;
};

export function CreateManuscriptDialog({
  children,
  onCreated,
  open: controlledOpen,
  onOpenChange,
  initialSource,
  pendingUploadId,
}: CreateManuscriptDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const editor = useManuscriptDraft(initialSource ? { title: getTitleFromFilename(initialSource.file.name), chapters: initialSource.chapters.length } : undefined);
  const createMutation = useCreateManuscriptMutation();
  const sourceMutation = useUploadManuscriptSourceMutation();
  const genresQuery = useManuscriptGenres(open);
  const [sourceFile, setSourceFile] = useState<File | null>(initialSource?.file ?? null);
  const [importedChapters, setImportedChapters] = useState<ImportedManuscriptChapter[] | null>(initialSource?.chapters ?? null);
  const [sourceImportError, setSourceImportError] = useState<string | null>(null);
  const [isParsingSource, setIsParsingSource] = useState(false);
  const sourceImportRun = useRef(0);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [finalizeError, setFinalizeError] = useState<string | null>(null);
  const [createdManuscript, setCreatedManuscript] = useState<CreatedManuscript | null>(null);
  function handleOpenChange(nextOpen: boolean) {
    if (controlledOpen === undefined) setInternalOpen(nextOpen);
    onOpenChange?.(nextOpen);
    if (!nextOpen) {
      editor.reset();
      createMutation.reset();
      sourceMutation.reset();
      setSourceFile(null);
      setImportedChapters(null);
      setSourceImportError(null);
      setIsParsingSource(false);
      sourceImportRun.current += 1;
      setCreatedManuscript(null);
    }
  }

  async function handleSourceChange(nextSourceFile: File | null) {
    const currentImportRun = sourceImportRun.current + 1;
    sourceImportRun.current = currentImportRun;
    sourceMutation.reset();
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

    editor.updateDraft({ title: getTitleFromFilename(nextSourceFile.name) });

    setIsParsingSource(true);
    try {
      const detectedChapters = await importSourceDocument(nextSourceFile);
      if (currentImportRun !== sourceImportRun.current) return;

      setImportedChapters(detectedChapters);
      editor.updateDraft({ chapters: detectedChapters.length });
    } catch (error) {
      if (currentImportRun !== sourceImportRun.current) return;

      setSourceFile(null);
      setSourceImportError(error instanceof Error ? error.message : "The source document could not be imported.");
    } finally {
      if (currentImportRun === sourceImportRun.current) setIsParsingSource(false);
    }
  }

  const isSaving = createMutation.isPending || sourceMutation.isPending || isFinalizing;
  const canSubmit = !!sourceFile && !!importedChapters?.length && !isParsingSource && !isSaving;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;
    setFinalizeError(null);
    try {
      const manuscript = createdManuscript ?? await createMutation.mutateAsync({
        draft: editor.draft,
        pendingUploadId,
        importedChapters: importedChapters ?? undefined,
      });
      setCreatedManuscript(manuscript);
      if (pendingUploadId) {
        setIsFinalizing(true);
        const response = await fetch(`/api/manuscript-uploads/${pendingUploadId}`, {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "complete" }),
        });
        if (!response.ok) throw new Error((await response.json()).error ?? "Could not save the manuscript source.");
      } else {
        await sourceMutation.mutateAsync({ file: sourceFile!, manuscriptVersionId: manuscript.manuscriptVersionId });
      }
      onCreated?.(manuscript);
      handleOpenChange(false);
    } catch (error) {
      if (pendingUploadId) setFinalizeError(error instanceof Error ? error.message : "Could not finish the import. Please try again.");
    } finally {
      setIsFinalizing(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { if (!isSaving) handleOpenChange(nextOpen); }}>
      {children ? <DialogTrigger asChild>{children}</DialogTrigger> : null}
      <DialogContent
        overlayClassName="bg-foreground/45 backdrop-blur-[4px]"
        className="flex max-h-[90vh] w-[calc(100%-2rem)] max-w-[560px] flex-col gap-0 overflow-hidden border-foreground/10 bg-card p-0 shadow-[0_24px_64px_rgba(28,24,18,0.18)] sm:rounded-none [&>button]:right-8 [&>button]:top-7 [&>button]:rounded-none"
      >
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <header className="border-b border-foreground/[0.08] px-8 pb-5 pt-7">
            <DialogTitle asChild><Heading level={2} size="workspace">Upload your manuscript</Heading></DialogTitle>
            <DialogDescription className="mt-1 text-xs leading-5 text-muted-foreground">
              Chapters are detected automatically. You can update the other details in Edit manuscript.
            </DialogDescription>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto px-8 py-6">
            <fieldset disabled={isSaving || !!createdManuscript} className="min-w-0 space-y-6">
              <fieldset disabled={!!pendingUploadId}><SourceDocumentUpload file={sourceFile} importedChapters={importedChapters} error={sourceImportError} isParsing={isParsingSource} onChange={handleSourceChange} /></fieldset>
              <GenreFields draft={editor.draft} genres={genresQuery.data ?? []} genresError={genresQuery.isError} genresLoading={genresQuery.isLoading} onChange={editor.updateDraft} />
              <ReaderNotes draft={editor.draft} onChange={editor.updateDraft} />
            </fieldset>
          </div>
          <footer className="flex items-center justify-end gap-3 border-t border-foreground/[0.08] bg-sidebar px-8 py-4">
            <Button type="button" variant="ghost" size="sm" disabled={isSaving} onClick={() => handleOpenChange(false)}>Cancel</Button>
            <Button type="submit" size="sm" disabled={!canSubmit} className="h-8 gap-2 px-5 text-xs">
              {isFinalizing ? "Saving manuscript" : sourceMutation.isPending ? "Uploading manuscript" : createMutation.isPending ? "Creating manuscript" : createdManuscript ? "Retry manuscript upload" : "Create manuscript"}
              <ArrowRight className="h-3 w-3" />
            </Button>
          </footer>
          {createMutation.isError || sourceMutation.isError || finalizeError ? (
            <p role="alert" className="border-t border-destructive/20 bg-destructive/5 px-8 py-3 text-xs text-destructive">
              {finalizeError ?? (sourceMutation.isError ? `Your manuscript was created, but its source file could not be uploaded. ${sourceMutation.error.message}` : createMutation.error?.message)}
            </p>
          ) : null}
        </form>
      </DialogContent>
    </Dialog>
  );
}

type StepProps = {
  draft: ManuscriptDraft;
  onChange: (patch: Partial<ManuscriptDraft>) => void;
};

function GenreFields({
  draft,
  genres,
  genresError,
  genresLoading,
  onChange,
}: StepProps & {
  genres: ManuscriptGenre[];
  genresError: boolean;
  genresLoading: boolean;
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

    </div>
  );
}

function ReaderNotes({ draft, onChange }: StepProps) {
  return (
    <div className="space-y-5">
      <div>
        <FieldLabel htmlFor="reader-note">Note to readers</FieldLabel>
        <Textarea
          id="reader-note"
          value={draft.readerNote}
          onChange={(event) => onChange({ readerNote: event.target.value })}
          placeholder="e.g. Focus especially on whether the protagonist's motivations feel believable in the first three chapters."
          rows={4}
          maxLength={4000}
          className="min-h-[100px] resize-none rounded-none border-foreground/20 bg-background text-sm leading-6 shadow-none"
        />
        <p className="mt-1 font-mono text-[9px] text-muted-foreground">
          Included in the invitation email and visible on the reader portal.
        </p>
      </div>

      <div>
        <FieldLabel htmlFor="reader-closing-note">Closing note for readers</FieldLabel>
        <Textarea
          id="reader-closing-note"
          value={draft.readerClosingNote}
          onChange={(event) => onChange({ readerClosingNote: event.target.value })}
          placeholder="e.g. Thank you for reading. I would love to know which moments stayed with you."
          rows={4}
          maxLength={4000}
          className="min-h-[100px] resize-none rounded-none border-foreground/20 bg-background text-sm leading-6 shadow-none"
        />
        <p className="mt-1 font-mono text-[9px] text-muted-foreground">
          Optional. Shown on the final page after a reader finishes the manuscript.
        </p>
      </div>
    </div>
  );
}

function SourceDocumentUpload({
  file,
  importedChapters,
  error,
  isParsing,
  onChange,
}: {
  file: File | null;
  importedChapters: ImportedManuscriptChapter[] | null;
  error: string | null;
  isParsing: boolean;
  onChange: (file: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function handleDrop(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    setDragging(false);
    const nextFile = event.dataTransfer.files[0];
    if (nextFile) onChange(nextFile);
  }

  return (
    <div>
      <FieldLabel htmlFor="source-document-upload" required>Manuscript</FieldLabel>
      <input
        ref={inputRef}
        id="source-document-upload"
        type="file"
        accept={sourceDocumentAccept}
        className="sr-only"
        onChange={(event) => {
          const nextFile = event.target.files?.[0];
          event.target.value = "";
          if (nextFile) onChange(nextFile);
        }}
      />

      {file ? (
        <div className="flex items-start gap-3 border border-foreground/15 bg-sidebar/40 p-3">
          <div className="grid h-10 w-8 shrink-0 place-items-center border border-foreground/10 bg-background">
            <FileText className="h-4 w-4 text-muted-foreground" strokeWidth={1.25} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium">{file.name}</p>
            <p className="mt-1 font-mono text-[9px] text-muted-foreground">
              {isParsing
                ? "Detecting chapters…"
                : importedChapters
                  ? `${importedChapters.length} chapter${importedChapters.length === 1 ? "" : "s"} detected automatically`
                  : "Ready to import"}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isParsing}
                onClick={() => inputRef.current?.click()}
                className="h-auto rounded-none px-3 py-1.5 text-[11px]"
              >
                Replace
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isParsing}
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
            "flex min-h-28 w-full flex-col items-center justify-center gap-2 border border-dashed border-foreground/25 px-4 py-4 text-muted-foreground transition-colors",
            dragging && "border-foreground bg-foreground/[0.03] text-foreground",
          )}
        >
          <FileText className="h-5 w-5 text-foreground" strokeWidth={1.25} />
          <span className="text-center text-xs font-medium text-foreground">
            Upload your manuscript file
          </span>
          <span className="text-center text-[11px] leading-5">
            Drag and drop a file here, or click to choose one.
          </span>
          <span className="text-center font-mono text-[9px]">
            DOCX, PDF, TXT, Markdown · max 20 MB · chapters detected automatically
          </span>
        </button>
      )}
      {error ? <p className="mt-1 font-mono text-[9px] text-destructive">{error}</p> : null}
    </div>
  );
}

function getTitleFromFilename(filename: string) {
  const basename = filename.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim();
  return basename.slice(0, 300) || "Untitled manuscript";
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
