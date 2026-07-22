"use client";

import {
  CheckSquare,
  List,
  Plus,
  Star,
  ToggleLeft,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type {
  SurveyQuestion,
  SurveyQuestionPatch,
  SurveyQuestionType,
} from "@/features/surveys/types";

const questionTypeLabels: Record<SurveyQuestionType, string> = {
  rating: "Rating 1-5",
  "yes-no": "Yes / No",
  "multiple-choice": "Multiple choice",
  "open-text": "Open text",
};

type SurveyQuestionEditorProps = {
  question: SurveyQuestion;
  canRemove: boolean;
  onChange: (patch: SurveyQuestionPatch) => void;
  onTypeChange: (type: SurveyQuestionType) => void;
  onOptionChange: (optionIndex: number, value: string) => void;
  onAddOption: () => void;
  onRemoveOption: (optionIndex: number) => void;
  onRemove: () => void;
};

export function SurveyQuestionEditor({
  question,
  canRemove,
  onChange,
  onTypeChange,
  onOptionChange,
  onAddOption,
  onRemoveOption,
  onRemove,
}: SurveyQuestionEditorProps) {
  const [previewValue, setPreviewValue] = useState("");
  const [previewText, setPreviewText] = useState("");
  const Icon =
    question.type === "rating"
      ? Star
      : question.type === "yes-no"
        ? ToggleLeft
        : question.type === "multiple-choice"
          ? CheckSquare
          : List;

  return (
    <div className="grid gap-4 px-5 py-5 lg:grid-cols-[20px_minmax(0,1fr)_190px]">
      <Icon className="mt-3 h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />

      <div className="min-w-0">
        <Label htmlFor={`${question.id}-prompt`} className="sr-only">
          Question text
        </Label>
        <Textarea
          id={`${question.id}-prompt`}
          value={question.prompt}
          onChange={(event) => onChange({ prompt: event.target.value })}
          className="min-h-11 resize-y rounded-none border-foreground/10 bg-transparent px-3 py-2 text-sm shadow-none"
        />

        <div className="mt-3">
          {question.type === "rating" ? (
            <RadioGroup
              value={previewValue}
              onValueChange={setPreviewValue}
              className="flex flex-wrap gap-2"
              aria-label="Rating response"
            >
              {[1, 2, 3, 4, 5].map((value) => (
                <Label
                  key={value}
                  htmlFor={`${question.id}-rating-${value}`}
                  className="flex cursor-pointer items-center gap-2 border border-foreground/15 px-2.5 py-1.5 font-mono text-[9px]"
                >
                  <RadioGroupItem id={`${question.id}-rating-${value}`} value={String(value)} />
                  {value}
                </Label>
              ))}
            </RadioGroup>
          ) : null}

          {question.type === "yes-no" ? (
            <RadioGroup
              value={previewValue}
              onValueChange={setPreviewValue}
              className="flex gap-2"
              aria-label="Yes or no response"
            >
              {["Yes", "No"].map((value) => (
                <Label
                  key={value}
                  htmlFor={`${question.id}-${value.toLowerCase()}`}
                  className="flex cursor-pointer items-center gap-2 border border-foreground/15 px-3 py-1.5 font-mono text-[9px]"
                >
                  <RadioGroupItem id={`${question.id}-${value.toLowerCase()}`} value={value.toLowerCase()} />
                  {value}
                </Label>
              ))}
            </RadioGroup>
          ) : null}

          {question.type === "multiple-choice" ? (
            <div className="space-y-2">
              {question.options.map((option, optionIndex) => (
                <div key={`${question.id}-${optionIndex}`} className="flex items-center gap-2">
                  <Checkbox aria-label={`Preview option ${optionIndex + 1}`} />
                  <Input
                    value={option}
                    onChange={(event) => onOptionChange(optionIndex, event.target.value)}
                    aria-label={`Option ${optionIndex + 1}`}
                    className="h-8 rounded-none border-foreground/15 bg-transparent px-2.5 font-mono text-[10px] font-normal shadow-none"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={question.options.length <= 2}
                    onClick={() => onRemoveOption(optionIndex)}
                    aria-label={`Remove option ${optionIndex + 1}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="ghost" size="sm" onClick={onAddOption} className="text-muted-foreground">
                <Plus className="h-3.5 w-3.5" />
                Add option
              </Button>
            </div>
          ) : null}

          {question.type === "open-text" ? (
            <Textarea
              value={previewText}
              onChange={(event) => setPreviewText(event.target.value)}
              placeholder="Reader response"
              aria-label="Open text response"
              className="min-h-20 rounded-none border-foreground/15 bg-transparent text-sm shadow-none"
            />
          ) : null}
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor={`${question.id}-type`} className="font-mono text-[8px] uppercase tracking-widest text-muted-foreground">
            Answer type
          </Label>
          <Select value={question.type} onValueChange={(value) => onTypeChange(value as SurveyQuestionType)}>
            <SelectTrigger id={`${question.id}-type`} className="h-9 rounded-none border-foreground/15 bg-transparent text-xs shadow-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(questionTypeLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between gap-3">
          <Label htmlFor={`${question.id}-required`} className="text-xs font-normal">
            Required
          </Label>
          <Switch
            id={`${question.id}-required`}
            checked={question.required}
            onCheckedChange={(required) => onChange({ required })}
          />
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={!canRemove}
          onClick={onRemove}
          className="w-full justify-start text-muted-foreground"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Remove question
        </Button>
      </div>
    </div>
  );
}
