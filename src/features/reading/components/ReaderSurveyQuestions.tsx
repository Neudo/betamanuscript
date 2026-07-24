import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import type {
  ReaderSurveyAnswer,
  ReaderSurveyAnswerValue,
  ReaderSurveyQuestion,
} from "@/features/reading/api/reading";
import { cn } from "@/lib/utils";

export function ReaderSurveyQuestionField({
  answer,
  idPrefix,
  index,
  onChange,
  question,
}: {
  answer: ReaderSurveyAnswerValue | undefined;
  idPrefix: string;
  index: number;
  onChange: (value: ReaderSurveyAnswerValue) => void;
  question: ReaderSurveyQuestion;
}) {
  const fieldId = `${idPrefix}-${question.id}`;

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

export function hasReaderSurveyAnswer(
  question: ReaderSurveyQuestion,
  answer: ReaderSurveyAnswerValue | undefined,
) {
  if (answer === undefined) return false;
  if (question.type === "multiple-choice") return Array.isArray(answer) && answer.length > 0;
  return question.type !== "open-text" || String(answer).trim().length > 0;
}

export function serializeReaderSurveyAnswers(
  questions: ReaderSurveyQuestion[],
  answers: Record<string, ReaderSurveyAnswerValue>,
): ReaderSurveyAnswer[] {
  const serializedAnswers: ReaderSurveyAnswer[] = [];

  for (const question of questions) {
    const value = answers[question.id];
    if (!hasReaderSurveyAnswer(question, value)) continue;

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
