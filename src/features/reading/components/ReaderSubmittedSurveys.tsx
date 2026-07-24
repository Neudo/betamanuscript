"use client";

import { LoaderCircle, PencilLine, Send } from "lucide-react";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type {
  ReaderSubmittedSurvey,
  ReaderSurveyAnswerValue,
} from "@/features/reading/api/reading";
import {
  hasReaderSurveyAnswer,
  ReaderSurveyQuestionField,
  serializeReaderSurveyAnswers,
} from "@/features/reading/components/ReaderSurveyQuestions";
import {
  useReaderSubmittedSurveys,
  useUpdateReaderSurveyResponse,
} from "@/features/reading/hooks/use-reading";

function formatSubmittedAt(value: string | null) {
  if (!value) return "Sent recently";
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatAnswer(
  survey: ReaderSubmittedSurvey,
  questionId: string,
) {
  const question = survey.questions.find((item) => item.id === questionId);
  const answer = survey.answers[questionId];
  if (!question || answer === undefined) return "No answer";

  if (question.type === "rating") return `${answer} / 5`;
  if (question.type === "yes-no") return answer ? "Yes" : "No";
  if (question.type === "multiple-choice") {
    const selectedOptionIds = Array.isArray(answer) ? answer : [];
    return question.options
      .filter((option) => selectedOptionIds.includes(option.id))
      .map((option) => option.label)
      .join(", ") || "No answer";
  }
  return String(answer);
}

export function ReaderSubmittedSurveys() {
  const surveysQuery = useReaderSubmittedSurveys();
  const surveys = surveysQuery.data ?? [];
  const [editingSurvey, setEditingSurvey] = useState<ReaderSubmittedSurvey | null>(null);

  return (
    <div className="min-h-full">
      <header className="border-b border-foreground/10 px-5 py-5 sm:px-8">
        <p className="mb-1 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Reader</p>
        <h1 className="text-[28px] font-medium leading-tight tracking-normal">Sent surveys</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Review the feedback you have shared with authors and update it while the survey is still open.
        </p>
      </header>

      <div className="max-w-[920px] space-y-4 p-5 sm:p-8">
        {surveysQuery.isLoading ? (
          <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
            <LoaderCircle className="h-4 w-4 animate-spin" /> Loading sent surveys…
          </div>
        ) : null}
        {surveysQuery.isError ? (
          <Alert variant="destructive"><AlertDescription>{surveysQuery.error.message}</AlertDescription></Alert>
        ) : null}

        {!surveysQuery.isLoading && !surveysQuery.isError && surveys.length === 0 ? (
          <Card className="border-dashed p-8 text-center">
            <Send className="mx-auto h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
            <h2 className="mt-4 text-lg font-medium">No sent surveys yet</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              When you submit feedback after reading, it will be available here.
            </p>
          </Card>
        ) : null}

        {surveys.map((survey) => (
          <Card key={survey.submissionId} className="border-foreground/10 p-0">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-foreground/10 p-5 sm:p-6">
              <div className="min-w-0">
                <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">{survey.manuscriptTitle}</p>
                <h2 className="mt-2 font-display text-[25px] font-semibold leading-tight">{survey.name}</h2>
                <p className="mt-2 text-xs text-muted-foreground">Sent {formatSubmittedAt(survey.submittedAt)}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="rounded-none font-mono text-[8px] uppercase">
                  {survey.canEdit ? "Open" : "Closed"}
                </Badge>
                {survey.canEdit ? (
                  <Button size="sm" onClick={() => setEditingSurvey(survey)}>
                    <PencilLine className="h-3.5 w-3.5" /> Edit answers
                  </Button>
                ) : null}
              </div>
            </div>

            <dl className="divide-y divide-foreground/10">
              {survey.questions.map((question, index) => (
                <div key={question.id} className="grid gap-2 p-5 sm:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] sm:gap-8 sm:px-6">
                  <dt className="text-sm leading-6 text-muted-foreground">
                    <span className="mr-2 font-mono text-[10px] text-muted-foreground/70">{String(index + 1).padStart(2, "0")}</span>
                    {question.prompt}
                  </dt>
                  <dd className="text-sm leading-6">{formatAnswer(survey, question.id)}</dd>
                </div>
              ))}
            </dl>
          </Card>
        ))}
      </div>

      <ReaderSubmittedSurveyDialog
        key={editingSurvey?.submissionId ?? "closed"}
        survey={editingSurvey}
        onOpenChange={(isOpen) => {
          if (!isOpen) setEditingSurvey(null);
        }}
      />
    </div>
  );
}

function ReaderSubmittedSurveyDialog({
  onOpenChange,
  survey,
}: {
  onOpenChange: (isOpen: boolean) => void;
  survey: ReaderSubmittedSurvey | null;
}) {
  const updateSurveyMutation = useUpdateReaderSurveyResponse();
  const [answers, setAnswers] = useState<Record<string, ReaderSurveyAnswerValue>>(() => survey?.answers ?? {});
  const [validationError, setValidationError] = useState<string | null>(null);

  function setAnswer(questionId: string, value: ReaderSurveyAnswerValue) {
    setAnswers((current) => ({ ...current, [questionId]: value }));
    setValidationError(null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!survey) return;

    const missingRequiredQuestion = survey.questions.find((question) => (
      question.required && !hasReaderSurveyAnswer(question, answers[question.id])
    ));
    if (missingRequiredQuestion) {
      setValidationError("Please answer every required question before saving.");
      return;
    }

    updateSurveyMutation.mutate(
      {
        answers: serializeReaderSurveyAnswers(survey.questions, answers),
        readerAssignmentId: survey.readerAssignmentId,
        surveyId: survey.surveyId,
      },
      {
        onError(error) {
          toast.error(error.message);
        },
        onSuccess() {
          toast.success("Survey answers updated.");
          onOpenChange(false);
        },
      },
    );
  }

  return (
    <Dialog
      open={Boolean(survey)}
      onOpenChange={(isOpen) => {
        if (!isOpen && updateSurveyMutation.isPending) return;
        onOpenChange(isOpen);
      }}
    >
      <DialogContent className="max-h-[min(760px,calc(100dvh-2rem))] max-w-xl gap-0 overflow-y-auto rounded-none border-foreground/15 bg-card p-0 shadow-2xl">
        {survey ? (
          <form onSubmit={handleSubmit}>
            <DialogHeader className="border-b border-foreground/10 px-5 py-5 sm:px-7">
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">Edit sent feedback</p>
              <DialogTitle className="pt-1 font-display text-[28px] font-semibold leading-tight">{survey.name}</DialogTitle>
              <DialogDescription className="pt-1 leading-6">
                Your updated answers will be shared with the author.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-7 px-5 py-6 sm:px-7">
              {survey.questions.map((question, index) => (
                <ReaderSurveyQuestionField
                  key={question.id}
                  answer={answers[question.id]}
                  idPrefix="submitted-survey-question"
                  index={index}
                  onChange={(value) => setAnswer(question.id, value)}
                  question={question}
                />
              ))}

              {validationError ? (
                <p role="alert" className="border-l-2 border-destructive pl-3 text-sm text-destructive">
                  {validationError}
                </p>
              ) : null}
            </div>

            <DialogFooter className="sticky bottom-0 border-t border-foreground/10 bg-card px-5 py-4 sm:px-7">
              <p className="mr-auto text-xs text-muted-foreground"><span aria-hidden="true">*</span> Required</p>
              <Button type="button" variant="ghost" disabled={updateSurveyMutation.isPending} onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateSurveyMutation.isPending}>
                {updateSurveyMutation.isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                {updateSurveyMutation.isPending ? "Saving…" : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
