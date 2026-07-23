"use client";

import { Check, ChevronDown, ChevronUp, Copy, LoaderCircle, Plus } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";

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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/features/dashboard/components/PageHeader";
import { SurveyQuestionEditor } from "@/features/surveys/components/SurveyQuestionEditor";
import {
  useCreateSurvey,
  useManuscriptSurveys,
  useSaveSurvey,
  useUpdateSurveyStatus,
} from "@/features/surveys/hooks/use-surveys";
import { useSurveyEditor } from "@/features/surveys/hooks/use-survey-editor";
import type {
  ManuscriptSurvey,
  SurveyChapter,
  SurveyDelivery,
  SurveyQuestion,
  SurveyStatus,
} from "@/features/surveys/types";
import { useManuscripts } from "@/features/manuscript/hooks/use-manuscripts";
import { cn } from "@/lib/utils";

const statusStyles = {
  active: "bg-emerald-900/10 text-emerald-900",
  closed: "bg-foreground/[0.06] text-muted-foreground",
  draft: "bg-amber-900/10 text-amber-900",
};

export function SurveysWorkspace() {
  const searchParams = useSearchParams();
  const selectedManuscriptId = searchParams.get("manuscriptId");
  const manuscriptsQuery = useManuscripts();
  const manuscriptId = selectedManuscriptId ?? manuscriptsQuery.data?.[0]?.id ?? null;
  const surveysQuery = useManuscriptSurveys(manuscriptId);
  const [selectedSurveyId, setSelectedSurveyId] = useState<string | null>(null);
  const [expandedSurveyId, setExpandedSurveyId] = useState<string | null>(null);
  const createSurveyMutation = useCreateSurvey(manuscriptId);

  const data = surveysQuery.data;
  const chapters = data?.chapters ?? [];
  const surveys = data?.surveys ?? [];
  const selectedSurvey = surveys.find((survey) => survey.id === selectedSurveyId)
    ?? surveys[0]
    ?? null;

  function createNewSurvey({
    delivery,
    name,
    questions = [createDefaultQuestion()],
  }: {
    delivery: SurveyDelivery;
    name: string;
    questions?: SurveyQuestion[];
  }) {
    if (!data?.readingRoundId) return;

    createSurveyMutation.mutate(
      {
        delivery,
        name,
        questions,
        readingRoundId: data.readingRoundId,
      },
      {
        onError: (error) => toast.error(error.message),
        onSuccess: (survey) => {
          setExpandedSurveyId(survey.id);
          setSelectedSurveyId(survey.id);
          toast.success("Survey created.");
        },
      },
    );
  }

  function duplicateSurvey(survey: ManuscriptSurvey) {
    createNewSurvey({
      delivery: survey.delivery,
      name: `${survey.name} copy`,
      questions: survey.questions.map((question) => ({
        ...question,
        id: createTemporaryId("question"),
        options: question.options.map((option) => ({
          ...option,
          id: createTemporaryId("option"),
        })),
      })),
    });
  }

  const isLoading = surveysQuery.isPending
    || (!manuscriptId && manuscriptsQuery.isPending);
  const error = surveysQuery.error ?? manuscriptsQuery.error;

  return (
    <div className="min-h-full">
      <PageHeader
        eyebrow="Surveys"
        title="Reader surveys"
        actions={(
          <NewSurveyDialog
            chapters={chapters}
            disabled={!data?.readingRoundId}
            isCreating={createSurveyMutation.isPending}
            onCreate={createNewSurvey}
          />
        )}
      />

      <div className="max-w-[1100px] p-5 sm:p-8">
        <p className="mb-6 max-w-4xl text-sm leading-6 text-muted-foreground">
          Surveys are shown to readers automatically - at the end of a chapter or after they finish the manuscript. Use them alongside annotations to collect structured, high-level feedback.
        </p>

        {isLoading ? (
          <div className="grid min-h-64 place-items-center border border-foreground/10 bg-card">
            <LoaderCircle className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <p className="py-16 text-center text-sm text-muted-foreground">Unable to load surveys. Please refresh the page.</p>
        ) : !manuscriptId ? (
          <EmptyState message="Create a manuscript before setting up reader surveys." />
        ) : !data?.readingRoundId ? (
          <EmptyState message="This manuscript does not have a reading round yet." />
        ) : !selectedSurvey ? (
          <EmptyState message="No surveys yet. Create one to collect structured feedback from readers." />
        ) : (
          <>
            {surveys.length > 1 ? (
              <div className="mb-4 max-w-sm space-y-2">
                <Label htmlFor="survey-picker" className="font-mono text-[8px] uppercase tracking-widest text-muted-foreground">Survey</Label>
                <Select value={selectedSurvey.id} onValueChange={setSelectedSurveyId}>
                  <SelectTrigger id="survey-picker" className="rounded-none border-foreground/15 bg-card shadow-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {surveys.map((survey) => (
                      <SelectItem key={survey.id} value={survey.id}>{survey.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}

            <SurveyEditor
              key={selectedSurvey.id}
              chapters={chapters}
              defaultExpanded={expandedSurveyId === selectedSurvey.id}
              isDuplicating={createSurveyMutation.isPending}
              manuscriptId={manuscriptId}
              onDuplicate={() => duplicateSurvey(selectedSurvey)}
              survey={selectedSurvey}
            />
          </>
        )}
      </div>
    </div>
  );
}

function SurveyEditor({
  chapters,
  defaultExpanded,
  isDuplicating,
  manuscriptId,
  onDuplicate,
  survey,
}: {
  chapters: SurveyChapter[];
  defaultExpanded: boolean;
  isDuplicating: boolean;
  manuscriptId: string;
  onDuplicate: () => void;
  survey: ManuscriptSurvey;
}) {
  const editor = useSurveyEditor(survey);
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [showValidation, setShowValidation] = useState(false);
  const saveSurveyMutation = useSaveSurvey(manuscriptId);
  const statusMutation = useUpdateSurveyStatus(manuscriptId);
  const isReadOnly = editor.survey.responseCount > 0;
  const selectedChapter = chapters.find((chapter) => chapter.id === editor.survey.delivery.chapterId);
  const deliverySummary = editor.survey.delivery.scope === "manuscript"
    ? "End of book"
    : selectedChapter
      ? `After Ch ${selectedChapter.position}`
      : "Specific chapter";

  function updateDelivery(scope: SurveyDelivery["scope"]) {
    editor.updateSurvey({
      delivery: {
        chapterId: scope === "chapter"
          ? editor.survey.delivery.chapterId ?? chapters[0]?.id ?? null
          : null,
        scope,
      },
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setShowValidation(true);
    if (editor.validationError || isReadOnly) return;

    saveSurveyMutation.mutate(editor.survey, {
      onError: (error) => toast.error(error.message),
      onSuccess: (savedSurvey) => {
        editor.markSaved(savedSurvey);
        setShowValidation(false);
        toast.success("Survey changes saved.");
      },
    });
  }

  function changeStatus() {
    const nextStatus = nextSurveyStatus(editor.survey.status);
    statusMutation.mutate(
      { status: nextStatus, surveyId: editor.survey.id },
      {
        onError: (error) => toast.error(error.message),
        onSuccess: () => {
          editor.markSaved({ ...editor.survey, status: nextStatus });
          toast.success(nextStatus === "active" ? "Survey activated." : "Survey closed.");
        },
      },
    );
  }

  return (
    <section className="border border-foreground/10 bg-card">
      <div className="flex items-center justify-between gap-4 px-5 py-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <Label htmlFor="survey-title" className="sr-only">Survey name</Label>
            <Input
              id="survey-title"
              value={editor.survey.name}
              onChange={(event) => editor.updateSurvey({ name: event.target.value })}
              disabled={isReadOnly}
              className="h-auto max-w-md rounded-none border-0 bg-transparent p-0 text-base font-medium shadow-none focus-visible:ring-0 disabled:cursor-not-allowed"
            />
            <p className={cn("px-2 py-1 font-mono text-[9px] uppercase", statusStyles[editor.survey.status])}>
              {editor.survey.status}
            </p>
          </div>
          <p className="mt-1 font-mono text-[10px] text-muted-foreground">
            {deliverySummary} · {editor.survey.questions.length} questions · {editor.survey.responseCount} responses
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="-mr-2 shrink-0 text-muted-foreground"
          aria-label={isExpanded ? "Collapse survey" : "Expand survey"}
          aria-controls="survey-editor"
          aria-expanded={isExpanded}
          onClick={() => setIsExpanded((current) => !current)}
        >
          {isExpanded ? <ChevronUp className="h-4 w-4" strokeWidth={1.5} /> : <ChevronDown className="h-4 w-4" strokeWidth={1.5} />}
        </Button>
      </div>

      {isExpanded ? (
        <Tabs id="survey-editor" defaultValue="questions">
          <div className="flex items-center justify-between border-y border-foreground/10 bg-sidebar/70 px-5">
            <TabsList className="h-11 rounded-none bg-transparent p-0">
              <TabsTrigger value="questions" className="h-11 rounded-none border-b-2 border-transparent px-0 pr-8 text-xs data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">Questions</TabsTrigger>
              <TabsTrigger value="responses" className="h-11 rounded-none border-b-2 border-transparent px-0 text-xs text-muted-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">Responses ({editor.survey.responseCount})</TabsTrigger>
            </TabsList>
            <Button type="button" variant="ghost" size="icon-sm" aria-label="Duplicate survey" disabled={isDuplicating} onClick={onDuplicate}>
              <Copy className="h-3.5 w-3.5" strokeWidth={1.5} />
            </Button>
          </div>

          <TabsContent value="questions" className="m-0">
            <form onSubmit={handleSubmit} noValidate>
              <fieldset disabled={isReadOnly} className="border-b border-foreground/10 px-5 py-4">
                <legend className="mb-3 pt-4 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Send after</legend>
                <RadioGroup
                  value={editor.survey.delivery.scope}
                  onValueChange={(value) => updateDelivery(value as SurveyDelivery["scope"])}
                  className="flex flex-wrap gap-2"
                >
                  <Label htmlFor="delivery-manuscript" className={cn("cursor-pointer border border-foreground/15 px-3 py-2 text-xs font-normal", editor.survey.delivery.scope === "manuscript" && "border-foreground bg-foreground text-background")}>
                    <RadioGroupItem id="delivery-manuscript" value="manuscript" className="sr-only" />
                    Full manuscript
                  </Label>
                  <Label htmlFor="delivery-chapter" className={cn("cursor-pointer border border-foreground/15 px-3 py-2 text-xs font-normal", editor.survey.delivery.scope === "chapter" && "border-foreground bg-foreground text-background")}>
                    <RadioGroupItem id="delivery-chapter" value="chapter" className="sr-only" />
                    Specific chapter
                  </Label>
                </RadioGroup>

                {editor.survey.delivery.scope === "chapter" ? (
                  <div className="mt-4 max-w-sm space-y-2">
                    <Label htmlFor="survey-chapter" className="font-mono text-[8px] uppercase tracking-widest text-muted-foreground">Chapter</Label>
                    <Select value={editor.survey.delivery.chapterId ?? undefined} onValueChange={(chapterId) => editor.updateSurvey({ delivery: { chapterId, scope: "chapter" } })}>
                      <SelectTrigger id="survey-chapter" className="rounded-none border-foreground/15 bg-transparent shadow-none"><SelectValue placeholder="Choose a chapter" /></SelectTrigger>
                      <SelectContent>
                        {chapters.map((chapter) => <SelectItem key={chapter.id} value={chapter.id}>Ch {chapter.position}: {chapter.title}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                ) : null}
              </fieldset>

              {isReadOnly ? <p className="border-b border-foreground/10 px-5 py-3 font-mono text-[10px] text-muted-foreground">Questions are locked once readers have responded. Duplicate this survey to revise it.</p> : null}

              <div className="divide-y divide-foreground/[0.08]">
                {editor.survey.questions.map((question) => (
                  <SurveyQuestionEditor
                    key={question.id}
                    question={question}
                    canRemove={editor.survey.questions.length > 1}
                    isReadOnly={isReadOnly}
                    onChange={(patch) => editor.updateQuestion(question.id, patch)}
                    onTypeChange={(type) => editor.changeQuestionType(question.id, type)}
                    onOptionChange={(optionIndex, value) => editor.updateOption(question.id, optionIndex, value)}
                    onAddOption={() => editor.addOption(question.id)}
                    onRemoveOption={(optionIndex) => editor.removeOption(question.id, optionIndex)}
                    onRemove={() => editor.removeQuestion(question.id)}
                  />
                ))}
              </div>

              {!isReadOnly ? <Button type="button" variant="ghost" size="sm" className="m-4 text-muted-foreground" onClick={editor.addQuestion}><Plus className="h-3.5 w-3.5" />Add question</Button> : null}

              <div className="flex flex-col gap-4 border-t border-foreground/10 bg-sidebar/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div aria-live="polite">
                  {showValidation && editor.validationError ? (
                    <p className="font-mono text-[10px] text-primary">{editor.validationError}</p>
                  ) : editor.lastSavedAt && !editor.isDirty ? (
                    <p className="flex items-center gap-2 font-mono text-[10px] text-emerald-900"><Check className="h-3.5 w-3.5" />Changes saved</p>
                  ) : (
                    <p className="font-mono text-[10px] text-muted-foreground">{editor.isDirty ? "Unsaved changes" : `${editor.survey.status} - linked to this manuscript`}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="ghost" size="sm" className="text-muted-foreground" disabled={statusMutation.isPending} onClick={changeStatus}>{statusActionLabel(editor.survey.status)}</Button>
                  {!isReadOnly ? <Button type="submit" size="sm" disabled={!editor.isDirty || saveSurveyMutation.isPending}>{saveSurveyMutation.isPending ? "Saving…" : "Save changes"}</Button> : null}
                </div>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="responses" className="m-0 p-5">
            {editor.survey.responses.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-3">
                {editor.survey.responses.map((response) => (
                  <div key={response.id} className="border border-foreground/10 p-4">
                    <p className="text-xs font-medium">{response.readerName}</p>
                    <p className="mt-2 font-mono text-[9px] text-muted-foreground">{formatResponseDate(response.submittedAt)}</p>
                  </div>
                ))}
              </div>
            ) : <p className="py-10 text-center text-sm text-muted-foreground">No responses yet.</p>}
          </TabsContent>
        </Tabs>
      ) : null}
    </section>
  );
}

function NewSurveyDialog({
  chapters,
  disabled,
  isCreating,
  onCreate,
}: {
  chapters: SurveyChapter[];
  disabled: boolean;
  isCreating: boolean;
  onCreate: (input: { delivery: SurveyDelivery; name: string }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [scope, setScope] = useState<SurveyDelivery["scope"]>("manuscript");
  const [chapterId, setChapterId] = useState("");

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen && !chapterId) setChapterId(chapters[0]?.id ?? "");
  }

  function handleScopeChange(nextScope: SurveyDelivery["scope"]) {
    setScope(nextScope);
    if (nextScope === "chapter" && !chapterId) setChapterId(chapters[0]?.id ?? "");
  }

  function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) return;

    onCreate({
      delivery: {
        chapterId: scope === "chapter" ? chapterId || null : null,
        scope,
      },
      name: name.trim(),
    });
    setName("");
    setScope("manuscript");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild><Button size="sm" disabled={disabled}><Plus className="h-3.5 w-3.5" />New survey</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl font-medium">New survey</DialogTitle>
          <DialogDescription>Choose when readers should receive it.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4 pt-3" onSubmit={handleCreate}>
          <div className="space-y-2">
            <Label htmlFor="survey-name">Name</Label>
            <Input id="survey-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Chapter check-in" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-survey-delivery">Send after</Label>
            <Select value={scope} onValueChange={(value) => handleScopeChange(value as SurveyDelivery["scope"])}>
              <SelectTrigger id="new-survey-delivery"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="manuscript">Full manuscript</SelectItem>
                <SelectItem value="chapter">Specific chapter</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {scope === "chapter" ? (
            <div className="space-y-2">
              <Label htmlFor="new-survey-chapter">Chapter</Label>
              <Select value={chapterId} onValueChange={setChapterId}>
                <SelectTrigger id="new-survey-chapter"><SelectValue placeholder="Choose a chapter" /></SelectTrigger>
                <SelectContent>{chapters.map((chapter) => <SelectItem key={chapter.id} value={chapter.id}>Ch {chapter.position}: {chapter.title}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          ) : null}
          <Button type="submit" className="w-full" disabled={isCreating || !name.trim() || (scope === "chapter" && !chapterId)}>{isCreating ? "Creating…" : "Create survey"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EmptyState({ message }: { message: string }) {
  return <div className="grid min-h-64 place-items-center border border-dashed border-foreground/15 bg-card px-6 text-center text-sm text-muted-foreground">{message}</div>;
}

function createDefaultQuestion(): SurveyQuestion {
  return {
    id: createTemporaryId("question"),
    options: [],
    prompt: "Untitled question",
    required: false,
    type: "open-text",
  };
}

function createTemporaryId(prefix: string) {
  const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${id}`;
}

function nextSurveyStatus(status: SurveyStatus): SurveyStatus {
  return status === "closed" ? "active" : status === "draft" ? "active" : "closed";
}

function statusActionLabel(status: SurveyStatus) {
  return status === "closed" ? "Reopen survey" : status === "draft" ? "Activate survey" : "Close survey";
}

function formatResponseDate(submittedAt: string | null) {
  if (!submittedAt) return "Submitted";

  const differenceInDays = Math.floor((Date.now() - new Date(submittedAt).getTime()) / 86_400_000);
  if (differenceInDays <= 0) return "Submitted today";
  if (differenceInDays === 1) return "Submitted yesterday";
  return `Submitted ${differenceInDays}d ago`;
}
