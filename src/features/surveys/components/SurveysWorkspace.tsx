"use client";

import { Check, ChevronDown, ChevronUp, Copy, LoaderCircle, Plus, Trash2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { type FormEvent, type ReactNode, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import type { AccountPlan } from "@/features/account/types";
import { PageHeader } from "@/features/dashboard/components/PageHeader";
import { NoManuscriptState } from "@/features/manuscript/components/ManuscriptFullPageState";
import { PlanRequiredDialog } from "@/features/manuscript/components/PlanRequiredDialog";
import { SurveyQuestionEditor } from "@/features/surveys/components/SurveyQuestionEditor";
import {
  useCreateSurvey,
  useCloneSurveys,
  useDeleteSurvey,
  useManuscriptSurveys,
  useSaveSurvey,
  useUpdateSurveyStatus,
} from "@/features/surveys/hooks/use-surveys";
import { useSurveyEditor } from "@/features/surveys/hooks/use-survey-editor";
import type {
  ManuscriptSurvey,
  SurveyChapter,
  SurveyCloneSource,
  SurveyDelivery,
  SurveyQuestion,
  SurveyStatus,
} from "@/features/surveys/types";
import { useManuscripts } from "@/features/manuscript/hooks/use-manuscripts";
import { cn } from "@/lib/utils";

const statusStyles = {
  active: "bg-success/10 text-foreground",
  closed: "bg-foreground/[0.06] text-muted-foreground",
  draft: "bg-primary/10 text-primary-text",
};

const FREE_SURVEY_LIMIT = 2;

export function SurveysWorkspace({ accountPlan }: { accountPlan: AccountPlan }) {
  const searchParams = useSearchParams();
  const selectedManuscriptId = searchParams.get("manuscriptId");
  const selectedVersionId = searchParams.get("versionId");
  const manuscriptsQuery = useManuscripts();
  const manuscripts = manuscriptsQuery.data ?? [];
  const selectedManuscript = manuscripts.find((manuscript) => manuscript.id === selectedManuscriptId);
  const manuscriptId = selectedManuscript?.id ?? manuscripts[0]?.id ?? null;
  const surveysQuery = useManuscriptSurveys(manuscriptId, selectedVersionId);
  const [expandedSurveyId, setExpandedSurveyId] = useState<string | null>(null);
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const createSurveyMutation = useCreateSurvey(manuscriptId, selectedVersionId);
  const cloneSurveysMutation = useCloneSurveys(manuscriptId, selectedVersionId);
  const deleteSurveyMutation = useDeleteSurvey(manuscriptId, selectedVersionId);

  const data = surveysQuery.data;
  const chapters = data?.chapters ?? [];
  const surveys = data?.surveys ?? [];
  const hasReachedSurveyLimit = accountPlan === "free" && (data?.surveyCount ?? 0) >= FREE_SURVEY_LIMIT;
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
    if (hasReachedSurveyLimit) {
      setPlanDialogOpen(true);
      return;
    }

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

  const isLoading = manuscriptsQuery.isPending || (Boolean(manuscriptId) && surveysQuery.isPending);
  const error = manuscriptsQuery.error ?? (manuscriptId ? surveysQuery.error : null);

  if (!isLoading && !error && manuscripts.length === 0) return <NoManuscriptState />;

  return (
    <div className="min-h-full">
      <PageHeader
        eyebrow="Surveys"
        title="Reader surveys"
        actions={(
          <div className="flex flex-wrap items-center gap-2">
            {data?.otherDraftSurveys.length ? (
              <CloneSurveysDialog
                isCloning={cloneSurveysMutation.isPending}
                limitReached={hasReachedSurveyLimit}
                onClone={(sourceSurveyIds) => cloneSurveysMutation.mutate(
                  {
                    sourceSurveyIds,
                    targetManuscriptVersionId: data.manuscriptVersionId,
                  },
                  {
                    onError: (error) => toast.error(error.message),
                    onSuccess: (surveyIds) => {
                      setExpandedSurveyId(surveyIds[0] ?? null);
                      toast.success(`${surveyIds.length} survey${surveyIds.length === 1 ? "" : "s"} cloned as drafts.`);
                    },
                  },
                )}
                onUpgrade={() => setPlanDialogOpen(true)}
                sourceSurveys={data.otherDraftSurveys}
              />
            ) : null}
            <NewSurveyDialog
              chapters={chapters}
              disabled={!data?.readingRoundId}
              isCreating={createSurveyMutation.isPending}
              limitReached={hasReachedSurveyLimit}
              onCreate={createNewSurvey}
              onUpgrade={() => setPlanDialogOpen(true)}
            />
          </div>
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
        ) : !data?.readingRoundId ? (
          <EmptyState message="This manuscript does not have a reading round yet." />
        ) : surveys.length === 0 ? (
          <EmptyState message="No surveys yet. Create one to collect structured feedback from readers." />
        ) : (
          <div className="space-y-4">
            {surveys.map((survey) => (
              <SurveyEditor
                key={survey.id}
                chapters={chapters}
                defaultExpanded={expandedSurveyId === survey.id}
                isDeleting={deleteSurveyMutation.isPending}
                hasReachedSurveyLimit={hasReachedSurveyLimit}
                isDuplicating={createSurveyMutation.isPending}
                manuscriptId={manuscriptId}
                manuscriptVersionId={selectedVersionId}
                onDelete={() => deleteSurveyMutation.mutate(survey.id, {
                  onError: (error) => toast.error(error.message),
                  onSuccess: () => toast.success("Survey deleted."),
                })}
                onDuplicate={() => duplicateSurvey(survey)}
                onUpgrade={() => setPlanDialogOpen(true)}
                survey={survey}
              />
            ))}
          </div>
        )}
      </div>
      <PlanRequiredDialog
        description="Your free plan includes two surveys per active manuscript. Upgrade to Pro to create as many as you need."
        open={planDialogOpen}
        onOpenChange={setPlanDialogOpen}
        title="Add unlimited surveys"
      />
    </div>
  );
}

function CloneSurveysDialog({
  isCloning,
  limitReached,
  onClone,
  onUpgrade,
  sourceSurveys,
}: {
  isCloning: boolean;
  limitReached: boolean;
  onClone: (sourceSurveyIds: string[]) => void;
  onUpgrade: () => void;
  sourceSurveys: SurveyCloneSource[];
}) {
  const [open, setOpen] = useState(false);
  const [selectedSurveyIds, setSelectedSurveyIds] = useState<Set<string>>(new Set());
  const surveysByDraft = new Map<string, SurveyCloneSource[]>();
  const sourceDraftNumbers = [...new Set(sourceSurveys.map((survey) => survey.sourceVersionNumber))];
  const cloneButtonLabel = sourceDraftNumbers.length === 1
    ? `Clone surveys from Draft ${sourceDraftNumbers[0]}`
    : "Clone surveys";

  for (const survey of sourceSurveys) {
    const draftKey = `${survey.sourceVersionNumber}:${survey.sourceVersionId}`;
    const surveys = surveysByDraft.get(draftKey) ?? [];
    surveys.push(survey);
    surveysByDraft.set(draftKey, surveys);
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) setSelectedSurveyIds(new Set());
  }

  function toggleSurvey(surveyId: string, checked: boolean) {
    setSelectedSurveyIds((current) => {
      const next = new Set(current);
      if (checked) next.add(surveyId);
      else next.delete(surveyId);
      return next;
    });
  }

  function handleClone(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (selectedSurveyIds.size === 0) return;

    onClone([...selectedSurveyIds]);
    setOpen(false);
    setSelectedSurveyIds(new Set());
  }

  if (limitReached) {
    return (
      <Button type="button" size="sm" variant="outline" onClick={onUpgrade}>
        <Copy className="h-3.5 w-3.5" />
        {cloneButtonLabel}
        <span className="ml-1 font-mono text-[8px] uppercase tracking-widest">Pro</span>
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline">
          <Copy className="h-3.5 w-3.5" />
          {cloneButtonLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-medium">Clone surveys</DialogTitle>
          <DialogDescription>
            Choose surveys from another draft. Questions and answer options are copied as new drafts; reader responses are not.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-5 pt-2" onSubmit={handleClone}>
          <div className="max-h-[min(50vh,380px)] space-y-5 overflow-y-auto pr-1">
            {[...surveysByDraft.values()].map((draftSurveys) => {
              const draft = draftSurveys[0];
              return (
                <fieldset key={draft.sourceVersionId} className="space-y-2">
                  <legend className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                    Draft {draft.sourceVersionNumber} · {draft.sourceVersionTitle}
                  </legend>
                  <div className="divide-y divide-foreground/[0.08] border border-foreground/10">
                    {draftSurveys.map((survey) => {
                      const checkboxId = `clone-survey-${survey.id}`;
                      return (
                        <Label
                          key={survey.id}
                          htmlFor={checkboxId}
                          className="flex cursor-pointer items-start gap-3 px-4 py-3 text-sm font-normal"
                        >
                          <Checkbox
                            id={checkboxId}
                            checked={selectedSurveyIds.has(survey.id)}
                            onCheckedChange={(checked) => toggleSurvey(survey.id, checked === true)}
                          />
                          <span className="min-w-0">
                            <span className="block font-medium">{survey.name}</span>
                            <span className="mt-0.5 block text-xs text-muted-foreground">
                              {survey.delivery.scope === "chapter" ? "After a chapter" : "After the full manuscript"}
                            </span>
                          </span>
                        </Label>
                      );
                    })}
                  </div>
                </fieldset>
              );
            })}
          </div>
          <Button type="submit" className="w-full" disabled={isCloning || selectedSurveyIds.size === 0}>
            <Copy className="h-4 w-4" />
            {isCloning
              ? "Cloning…"
              : selectedSurveyIds.size === 0
                ? "Choose surveys to clone"
                : `Clone ${selectedSurveyIds.size} survey${selectedSurveyIds.size === 1 ? "" : "s"}`}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SurveyEditor({
  chapters,
  defaultExpanded,
  hasReachedSurveyLimit,
  isDeleting,
  isDuplicating,
  manuscriptId,
  manuscriptVersionId,
  onDelete,
  onDuplicate,
  onUpgrade,
  survey,
}: {
  chapters: SurveyChapter[];
  defaultExpanded: boolean;
  hasReachedSurveyLimit: boolean;
  isDeleting: boolean;
  isDuplicating: boolean;
  manuscriptId: string;
  manuscriptVersionId: string | null;
  onDelete: () => void;
  onDuplicate: () => void;
  onUpgrade: () => void;
  survey: ManuscriptSurvey;
}) {
  const editor = useSurveyEditor(survey);
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [showValidation, setShowValidation] = useState(false);
  const saveSurveyMutation = useSaveSurvey(manuscriptId, manuscriptVersionId);
  const statusMutation = useUpdateSurveyStatus(manuscriptId, manuscriptVersionId);
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
        <div className="flex shrink-0 items-center gap-1">
          {editor.survey.status === "draft" ? (
            <Button
              type="button"
              size="sm"
              disabled={editor.isDirty || statusMutation.isPending}
              onClick={changeStatus}
            >
              {statusMutation.isPending ? "Activating…" : "Activate survey"}
            </Button>
          ) : null}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground hover:text-destructive"
                aria-label={`Delete ${editor.survey.name}`}
                disabled={isDeleting}
              >
                <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-none border-destructive/25 bg-card">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete “{editor.survey.name}”?</AlertDialogTitle>
                <AlertDialogDescription>
                  This permanently deletes the survey, its questions, and all reader responses.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={isDeleting}
                  onClick={onDelete}
                >
                  {isDeleting ? "Deleting…" : "Delete survey"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="-mr-2 text-muted-foreground"
            aria-label={isExpanded ? "Collapse survey" : "Expand survey"}
            aria-controls="survey-editor"
            aria-expanded={isExpanded}
            onClick={() => setIsExpanded((current) => !current)}
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" strokeWidth={1.5} /> : <ChevronDown className="h-4 w-4" strokeWidth={1.5} />}
          </Button>
        </div>
      </div>

      {isExpanded ? (
        <Tabs id="survey-editor" defaultValue="questions">
          <div className="flex items-center justify-between border-y border-foreground/10 bg-sidebar/70 px-5">
            <TabsList className="h-11 rounded-none bg-transparent p-0">
              <TabsTrigger value="questions" className="h-11 rounded-none border-b-2 border-transparent px-0 pr-8 text-xs data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">Questions</TabsTrigger>
              <TabsTrigger value="responses" className="h-11 rounded-none border-b-2 border-transparent px-0 text-xs text-muted-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">Responses ({editor.survey.responseCount})</TabsTrigger>
            </TabsList>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={hasReachedSurveyLimit ? "Upgrade to duplicate a survey" : "Duplicate survey"}
              disabled={isDuplicating}
              onClick={hasReachedSurveyLimit ? onUpgrade : onDuplicate}
            >
              <Copy className="h-3.5 w-3.5" strokeWidth={1.5} />
            </Button>
          </div>

          <TabsContent value="questions" className="m-0">
            <form onSubmit={handleSubmit} noValidate>
              <fieldset disabled={isReadOnly} className="border-b border-foreground/10 px-5 py-4">
                <legend className="sr-only">Send after</legend>
                <div className="flex flex-wrap items-center gap-3">
                  <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Send after</p>
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
                    <div className="min-w-52 flex-1 sm:max-w-sm">
                      <Label htmlFor="survey-chapter" className="sr-only">Chapter</Label>
                      <Select value={editor.survey.delivery.chapterId ?? undefined} onValueChange={(chapterId) => editor.updateSurvey({ delivery: { chapterId, scope: "chapter" } })}>
                        <SelectTrigger id="survey-chapter" className="rounded-none border-foreground/15 bg-transparent shadow-none"><SelectValue placeholder="Choose a chapter" /></SelectTrigger>
                        <SelectContent>
                          {chapters.map((chapter) => <SelectItem key={chapter.id} value={chapter.id}>Ch {chapter.position}: {chapter.title}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : null}
                </div>
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
                    <p className="font-mono text-[10px] text-primary-text">{editor.validationError}</p>
                  ) : editor.lastSavedAt && !editor.isDirty ? (
                    <p className="flex items-center gap-2 font-mono text-[10px] text-foreground"><Check className="h-3.5 w-3.5 text-success" />Changes saved</p>
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
              <div className="grid gap-4">
                {editor.survey.responses.map((response) => (
                  <article key={response.id} className="border border-foreground/10 bg-background/40">
                    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-foreground/10 px-4 py-3">
                      <p className="text-sm font-medium">{response.readerName}</p>
                      <p className="font-mono text-[9px] text-muted-foreground">{formatResponseDate(response.submittedAt)}</p>
                    </header>
                    {response.answers.length > 0 ? (
                      <dl className="divide-y divide-foreground/[0.08]">
                        {response.answers.map((answer) => (
                          <div key={answer.questionId} className="grid gap-2 px-4 py-4 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] sm:gap-8">
                            <dt className="text-xs leading-5 text-muted-foreground">{answer.questionPrompt}</dt>
                            <dd className="min-w-0 text-sm leading-6 text-foreground">
                              <ResponseAnswerValue answer={answer} />
                            </dd>
                          </div>
                        ))}
                      </dl>
                    ) : (
                      <p className="px-4 py-5 text-sm text-muted-foreground">No answers were provided.</p>
                    )}
                  </article>
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
  limitReached,
  onCreate,
  onUpgrade,
}: {
  chapters: SurveyChapter[];
  disabled: boolean;
  isCreating: boolean;
  limitReached: boolean;
  onCreate: (input: { delivery: SurveyDelivery; name: string }) => void;
  onUpgrade: () => void;
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

  if (limitReached) {
    return (
      <Button type="button" size="sm" disabled={disabled} onClick={onUpgrade}>
        <Plus className="h-3.5 w-3.5" />
        New survey
        <span className="ml-1 font-mono text-[8px] uppercase tracking-widest">Pro</span>
      </Button>
    );
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

function EmptyState({
  children,
  message,
}: {
  children?: ReactNode;
  message: string;
}) {
  return (
    <div className="grid min-h-64 place-items-center border border-dashed border-foreground/15 bg-card px-6 text-center text-sm text-muted-foreground">
      <div>
        <p>{message}</p>
        {children}
      </div>
    </div>
  );
}

function ResponseAnswerValue({
  answer,
}: {
  answer: ManuscriptSurvey["responses"][number]["answers"][number];
}) {
  if (answer.type === "open-text") {
    return <p className="whitespace-pre-wrap border-l-2 border-primary/40 pl-3 text-foreground/90">{answer.values.join("\n")}</p>;
  }

  if (answer.type === "multiple-choice") {
    return (
      <div className="flex flex-wrap gap-2">
        {answer.values.map((value) => (
          <Badge key={value} variant="outline" className="rounded-none border-foreground/20 px-2 py-0.5 font-mono text-[10px] font-normal">
            {value}
          </Badge>
        ))}
      </div>
    );
  }

  return <span className="font-medium">{answer.values.join(", ")}</span>;
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
