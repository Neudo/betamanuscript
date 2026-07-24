"use client";

import { ArrowLeft, ArrowRight, LoaderCircle } from "lucide-react";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type {
  ReaderDueSurvey,
  ReaderSurveyAnswer,
  ReaderSurveyAnswerValue,
} from "@/features/reading/api/reading";
import {
  hasReaderSurveyAnswer,
  ReaderSurveyQuestionField,
  serializeReaderSurveyAnswers,
} from "@/features/reading/components/ReaderSurveyQuestions";

export function ReaderSurveyDialog({
  isSubmitting,
  onDefer,
  onSubmit,
  position,
  survey,
  total,
}: {
  isSubmitting: boolean;
  onDefer: () => void;
  onSubmit: (answers: ReaderSurveyAnswer[]) => void;
  position: number;
  survey: ReaderDueSurvey;
  total: number;
}) {
  const [answers, setAnswers] = useState<Record<string, ReaderSurveyAnswerValue>>({});
  const [validationError, setValidationError] = useState<string | null>(null);
  const [view, setView] = useState<"invitation" | "form">("invitation");

  function setAnswer(questionId: string, value: ReaderSurveyAnswerValue) {
    setAnswers((current) => ({ ...current, [questionId]: value }));
    setValidationError(null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const missingRequiredQuestion = survey.questions.find((question) => (
      question.required && !hasReaderSurveyAnswer(question, answers[question.id])
    ));
    if (missingRequiredQuestion) {
      setValidationError("Please answer every required question before continuing.");
      return;
    }

    onSubmit(serializeReaderSurveyAnswers(survey.questions, answers));
  }

  return (
    <Dialog
      open
      onOpenChange={(isOpen) => {
        if (!isOpen && !isSubmitting) onDefer();
      }}
    >
      <DialogContent
        className="max-h-[min(760px,calc(100dvh-2rem))] max-w-xl gap-0 overflow-y-auto rounded-none border-foreground/15 bg-card p-0 shadow-2xl"
      >
        {view === "invitation" ? (
          <>
            <DialogHeader className="border-b border-foreground/10 px-5 py-5 sm:px-7">
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                {total > 1 ? `${total} feedback requests waiting` : "Feedback request"}
              </p>
              <DialogTitle className="pt-1 font-display text-[28px] font-semibold leading-tight">
                {survey.name}
              </DialogTitle>
              <DialogDescription className="pt-1 leading-6">
                The author has a few questions about your reading. Would you like to answer now?
              </DialogDescription>
            </DialogHeader>

            <div className="px-5 py-6 sm:px-7">
              <p className="max-w-md text-sm leading-6 text-muted-foreground">
                You can return to it later from the feedback button in the reading header.
              </p>
            </div>

            <DialogFooter className="border-t border-foreground/10 bg-card px-5 py-4 sm:px-7">
              <Button type="button" variant="ghost" onClick={onDefer}>
                Later
              </Button>
              <Button type="button" onClick={() => setView("form")}>
                Answer now <ArrowRight className="h-4 w-4" />
              </Button>
            </DialogFooter>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogHeader className="border-b border-foreground/10 px-5 py-5 sm:px-7">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="-ml-2 w-fit"
                onClick={() => setView("invitation")}
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Decide later
              </Button>
              <p className="pt-3 font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                {total > 1 ? `Feedback ${position} of ${total}` : "Reader feedback"}
              </p>
              <DialogTitle className="pt-1 font-display text-[28px] font-semibold leading-tight">
                {survey.name}
              </DialogTitle>
              <DialogDescription className="pt-1 leading-6">
                Share your impression while this chapter is still fresh. Your answers will be shared with the author.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-7 px-5 py-6 sm:px-7">
              {survey.questions.map((question, index) => (
                <ReaderSurveyQuestionField
                  key={question.id}
                  answer={answers[question.id]}
                  idPrefix="reader-survey-question"
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
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                {isSubmitting ? "Sending…" : "Send feedback"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
