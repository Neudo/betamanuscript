"use client";

import { ArrowLeft, ArrowRight, LoaderCircle } from "lucide-react";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import type {
  ReaderDueSurvey,
  ReaderSurveyAnswer,
  ReaderSurveyQuestion,
} from "@/features/reading/api/reading";
import { cn } from "@/lib/utils";

type SurveyAnswerValue = boolean | number | string | string[];

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
  const [answers, setAnswers] = useState<Record<string, SurveyAnswerValue>>({});
  const [validationError, setValidationError] = useState<string | null>(null);
  const [view, setView] = useState<"invitation" | "form">("invitation");

  function setAnswer(questionId: string, value: SurveyAnswerValue) {
    setAnswers((current) => ({ ...current, [questionId]: value }));
    setValidationError(null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const missingRequiredQuestion = survey.questions.find((question) => (
      question.required && !hasAnswer(question, answers[question.id])
    ));
    if (missingRequiredQuestion) {
      setValidationError("Please answer every required question before continuing.");
      return;
    }

    onSubmit(serializeAnswers(survey.questions, answers));
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
                <SurveyQuestionField
                  key={question.id}
                  answer={answers[question.id]}
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

function SurveyQuestionField({
  answer,
  index,
  onChange,
  question,
}: {
  answer: SurveyAnswerValue | undefined;
  index: number;
  onChange: (value: SurveyAnswerValue) => void;
  question: ReaderSurveyQuestion;
}) {
  const fieldId = `reader-survey-question-${question.id}`;

  return (
    <fieldset>
      <legend className="flex items-start gap-2 text-sm font-medium leading-6">
        <span className="mt-0.5 font-mono text-[10px] font-normal text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
        <span>{question.prompt}{question.required ? <span className="ml-1 text-destructive" aria-label="Required">*</span> : null}</span>
      </legend>

      <div className="mt-3 pl-6">
        {question.type === "rating" ? (
          <div className="max-w-sm">
            <div className="grid grid-cols-5 gap-2" aria-label={`Rate: ${question.prompt}`}>
              {[1, 2, 3, 4, 5].map((rating) => (
                <Button
                  key={rating}
                  type="button"
                  variant={answer === rating ? "default" : "outline"}
                  className="h-10 rounded-none"
                  onClick={() => onChange(rating)}
                  aria-pressed={answer === rating}
                >
                  {rating}
                </Button>
              ))}
            </div>
            <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
              <span>Not at all</span>
              <span>Very much</span>
            </div>
          </div>
        ) : null}

        {question.type === "yes-no" ? (
          <RadioGroup
            value={typeof answer === "boolean" ? String(answer) : undefined}
            onValueChange={(value) => onChange(value === "true")}
            className="grid max-w-sm grid-cols-2 gap-2"
          >
            {[{ label: "Yes", value: "true" }, { label: "No", value: "false" }].map((option) => (
              <Label
                key={option.value}
                htmlFor={`${fieldId}-${option.value}`}
                className={cn(
                  "flex cursor-pointer items-center gap-2 border border-foreground/15 px-3 py-2.5 text-sm font-normal transition-colors hover:bg-muted/45",
                  String(answer) === option.value && "border-primary bg-primary/5",
                )}
              >
                <RadioGroupItem id={`${fieldId}-${option.value}`} value={option.value} />
                {option.label}
              </Label>
            ))}
          </RadioGroup>
        ) : null}

        {question.type === "multiple-choice" ? (
          <div className="space-y-2">
            {question.options.map((option) => (
              <Label
                key={option.id}
                htmlFor={`${fieldId}-${option.id}`}
                className={cn(
                  "flex cursor-pointer items-center gap-2 border border-foreground/15 px-3 py-2.5 text-sm font-normal transition-colors hover:bg-muted/45",
                  Array.isArray(answer) && answer.includes(option.id) && "border-primary bg-primary/5",
                )}
              >
                <Checkbox
                  id={`${fieldId}-${option.id}`}
                  checked={Array.isArray(answer) && answer.includes(option.id)}
                  onCheckedChange={(isChecked) => {
                    const selectedOptionIds = Array.isArray(answer) ? answer : [];
                    onChange(
                      isChecked
                        ? [...selectedOptionIds, option.id]
                        : selectedOptionIds.filter((selectedOptionId) => selectedOptionId !== option.id),
                    );
                  }}
                />
                {option.label}
              </Label>
            ))}
          </div>
        ) : null}

        {question.type === "open-text" ? (
          <Textarea
            id={fieldId}
            maxLength={10_000}
            value={typeof answer === "string" ? answer : ""}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Write your feedback…"
            className="min-h-28 resize-y rounded-none border-foreground/15 bg-background"
          />
        ) : null}
      </div>
    </fieldset>
  );
}

function hasAnswer(question: ReaderSurveyQuestion, answer: SurveyAnswerValue | undefined) {
  if (answer === undefined) return false;
  if (question.type === "multiple-choice") return Array.isArray(answer) && answer.length > 0;
  return question.type !== "open-text" || String(answer).trim().length > 0;
}

function serializeAnswers(
  questions: ReaderSurveyQuestion[],
  answers: Record<string, SurveyAnswerValue>,
): ReaderSurveyAnswer[] {
  const serializedAnswers: ReaderSurveyAnswer[] = [];

  for (const question of questions) {
    const value = answers[question.id];
    if (!hasAnswer(question, value)) continue;

    if (question.type === "rating") {
      serializedAnswers.push({ questionId: question.id, numberValue: value as number });
      continue;
    }
    if (question.type === "yes-no") {
      serializedAnswers.push({ questionId: question.id, booleanValue: value as boolean });
      continue;
    }
    if (question.type === "multiple-choice") {
      serializedAnswers.push({ questionId: question.id, selectedOptionIds: value as string[] });
      continue;
    }

    serializedAnswers.push({ questionId: question.id, textValue: (value as string).trim() });
  }

  return serializedAnswers;
}
