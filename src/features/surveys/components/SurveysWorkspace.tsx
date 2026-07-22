"use client";

import { Check, ChevronUp, Copy, Plus } from "lucide-react";
import { FormEvent, useState } from "react";

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
import { chapters } from "@/features/dashboard/data/mock-dashboard";
import { SurveyQuestionEditor } from "@/features/surveys/components/SurveyQuestionEditor";
import { createSurvey, initialSurvey } from "@/features/surveys/data/mock-survey";
import { useSurveyEditor } from "@/features/surveys/hooks/use-survey-editor";
import type { ManuscriptSurvey, SurveyDelivery } from "@/features/surveys/types";
import { cn } from "@/lib/utils";

const statusStyles = {
  active: "bg-emerald-900/10 text-emerald-900",
  closed: "bg-foreground/[0.06] text-muted-foreground",
  draft: "bg-amber-900/10 text-amber-900",
};

export function SurveysWorkspace() {
  const editor = useSurveyEditor(initialSurvey);
  const [showValidation, setShowValidation] = useState(false);
  const selectedChapter = chapters.find((chapter) => chapter.id === editor.survey.delivery.chapterId);
  const deliverySummary =
    editor.survey.delivery.scope === "manuscript"
      ? "End of book"
      : selectedChapter
        ? `After Ch ${selectedChapter.number}`
        : "Specific chapter";

  function updateDelivery(scope: SurveyDelivery["scope"]) {
    editor.updateSurvey({
      delivery: {
        scope,
        chapterId:
          scope === "chapter"
            ? editor.survey.delivery.chapterId ?? chapters[0]?.id ?? null
            : null,
      },
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setShowValidation(true);
    if (editor.saveSurvey()) setShowValidation(false);
  }

  function handleCreate(survey: ManuscriptSurvey) {
    editor.replaceSurvey(survey);
    setShowValidation(false);
  }

  return (
    <div className="min-h-full">
      <PageHeader
        eyebrow="Surveys"
        title="Reader surveys"
        actions={<NewSurveyDialog onCreate={handleCreate} />}
      />

      <div className="max-w-[1100px] p-5 sm:p-8">
        <p className="mb-6 max-w-4xl text-sm leading-6 text-muted-foreground">
          Surveys are shown to readers automatically - at the end of a chapter or after they finish the manuscript. Use them alongside annotations to collect structured, high-level feedback.
        </p>

        <section className="border border-foreground/10 bg-card">
          <div className="flex items-center justify-between gap-4 px-5 py-4">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <Label htmlFor="survey-title" className="sr-only">Survey name</Label>
                <Input
                  id="survey-title"
                  value={editor.survey.name}
                  onChange={(event) => editor.updateSurvey({ name: event.target.value })}
                  className="h-auto max-w-md rounded-none border-0 bg-transparent p-0 text-base font-medium shadow-none focus-visible:ring-0"
                />
                <p className={cn("px-2 py-1 font-mono text-[9px] uppercase", statusStyles[editor.survey.status])}>
                  {editor.survey.status}
                </p>
              </div>
              <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                {deliverySummary} · {editor.survey.questions.length} questions · {editor.survey.responseCount} responses
              </p>
            </div>
            <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />
          </div>

          <Tabs defaultValue="questions">
            <div className="flex items-center justify-between border-y border-foreground/10 bg-sidebar/70 px-5">
              <TabsList className="h-11 rounded-none bg-transparent p-0">
                <TabsTrigger value="questions" className="h-11 rounded-none border-b-2 border-transparent px-0 pr-8 text-xs data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">Questions</TabsTrigger>
                <TabsTrigger value="responses" className="h-11 rounded-none border-b-2 border-transparent px-0 text-xs text-muted-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">Responses ({editor.survey.responseCount})</TabsTrigger>
              </TabsList>
              <Button type="button" variant="ghost" size="icon-sm" aria-label="Duplicate survey" onClick={editor.duplicateSurvey}>
                <Copy className="h-3.5 w-3.5" strokeWidth={1.5} />
              </Button>
            </div>

            <TabsContent value="questions" className="m-0">
              <form onSubmit={handleSubmit} noValidate>
                <fieldset className="border-b border-foreground/10 px-5 py-4">
                  <legend className="mb-3 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Send after</legend>
                  <RadioGroup
                    value={editor.survey.delivery.scope}
                    onValueChange={(value) => updateDelivery(value as SurveyDelivery["scope"])}
                    className="flex flex-wrap gap-2"
                  >
                    <Label
                      htmlFor="delivery-manuscript"
                      className={cn(
                        "cursor-pointer border border-foreground/15 px-3 py-2 text-xs font-normal",
                        editor.survey.delivery.scope === "manuscript" && "border-foreground bg-foreground text-background",
                      )}
                    >
                      <RadioGroupItem id="delivery-manuscript" value="manuscript" className="sr-only" />
                      Full manuscript
                    </Label>
                    <Label
                      htmlFor="delivery-chapter"
                      className={cn(
                        "cursor-pointer border border-foreground/15 px-3 py-2 text-xs font-normal",
                        editor.survey.delivery.scope === "chapter" && "border-foreground bg-foreground text-background",
                      )}
                    >
                      <RadioGroupItem id="delivery-chapter" value="chapter" className="sr-only" />
                      Specific chapter
                    </Label>
                  </RadioGroup>

                  {editor.survey.delivery.scope === "chapter" ? (
                    <div className="mt-4 max-w-sm space-y-2">
                      <Label htmlFor="survey-chapter" className="font-mono text-[8px] uppercase tracking-widest text-muted-foreground">
                        Chapter
                      </Label>
                      <Select
                        value={editor.survey.delivery.chapterId ?? undefined}
                        onValueChange={(chapterId) => editor.updateSurvey({
                          delivery: { scope: "chapter", chapterId },
                        })}
                      >
                        <SelectTrigger id="survey-chapter" className="rounded-none border-foreground/15 bg-transparent shadow-none">
                          <SelectValue placeholder="Choose a chapter" />
                        </SelectTrigger>
                        <SelectContent>
                          {chapters.map((chapter) => (
                            <SelectItem key={chapter.id} value={chapter.id}>
                              Ch {chapter.number}: {chapter.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : null}
                </fieldset>

                <div className="divide-y divide-foreground/[0.08]">
                  {editor.survey.questions.map((question) => (
                    <SurveyQuestionEditor
                      key={question.id}
                      question={question}
                      canRemove={editor.survey.questions.length > 1}
                      onChange={(patch) => editor.updateQuestion(question.id, patch)}
                      onTypeChange={(type) => editor.changeQuestionType(question.id, type)}
                      onOptionChange={(optionIndex, value) => editor.updateOption(question.id, optionIndex, value)}
                      onAddOption={() => editor.addOption(question.id)}
                      onRemoveOption={(optionIndex) => editor.removeOption(question.id, optionIndex)}
                      onRemove={() => editor.removeQuestion(question.id)}
                    />
                  ))}
                </div>

                <Button type="button" variant="ghost" size="sm" className="m-4 text-muted-foreground" onClick={editor.addQuestion}>
                  <Plus className="h-3.5 w-3.5" />
                  Add question
                </Button>

                <div className="flex flex-col gap-4 border-t border-foreground/10 bg-sidebar/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div aria-live="polite">
                    {showValidation && editor.validationError ? (
                      <p className="font-mono text-[10px] text-primary">{editor.validationError}</p>
                    ) : editor.lastSavedAt && !editor.isDirty ? (
                      <p className="flex items-center gap-2 font-mono text-[10px] text-emerald-900">
                        <Check className="h-3.5 w-3.5" />Changes saved
                      </p>
                    ) : (
                      <p className="font-mono text-[10px] text-muted-foreground">
                        {editor.isDirty ? "Unsaved changes" : `${editor.survey.status} - linked to this manuscript`}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground"
                      onClick={() => editor.updateSurvey({ status: editor.survey.status === "closed" ? "active" : "closed" })}
                    >
                      {editor.survey.status === "closed" ? "Reopen survey" : "Close survey"}
                    </Button>
                    <Button type="submit" size="sm" disabled={!editor.isDirty}>
                      Save changes
                    </Button>
                  </div>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="responses" className="m-0 p-5">
              {editor.survey.responseCount > 0 ? (
                <div className="grid gap-3 sm:grid-cols-3">
                  {["Priya N.", "Sarah K.", "Marcus R."].slice(0, editor.survey.responseCount).map((name, index) => (
                    <div key={name} className="border border-foreground/10 p-4">
                      <p className="text-xs font-medium">{name}</p>
                      <p className="mt-2 font-mono text-[9px] text-muted-foreground">Submitted {index + 1}d ago</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-10 text-center text-sm text-muted-foreground">No responses yet.</p>
              )}
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </div>
  );
}

function NewSurveyDialog({ onCreate }: { onCreate: (survey: ManuscriptSurvey) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [scope, setScope] = useState<SurveyDelivery["scope"]>("manuscript");
  const [chapterId, setChapterId] = useState(chapters[0]?.id ?? "");

  function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) return;
    onCreate(createSurvey({
      name,
      delivery: {
        scope,
        chapterId: scope === "chapter" ? chapterId || null : null,
      },
    }));
    setName("");
    setScope("manuscript");
    setChapterId(chapters[0]?.id ?? "");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><Plus className="h-3.5 w-3.5" />New survey</Button>
      </DialogTrigger>
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
            <Select value={scope} onValueChange={(value) => setScope(value as SurveyDelivery["scope"])}>
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
                <SelectContent>
                  {chapters.map((chapter) => (
                    <SelectItem key={chapter.id} value={chapter.id}>Ch {chapter.number}: {chapter.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}
          <Button type="submit" className="w-full" disabled={!name.trim() || (scope === "chapter" && !chapterId)}>
            Create survey
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
