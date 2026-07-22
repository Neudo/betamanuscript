"use client";

import { useCallback, useMemo, useState } from "react";

import { createId } from "@/features/surveys/data/mock-survey";
import type {
  ManuscriptSurvey,
  SurveyQuestionPatch,
  SurveyQuestionType,
} from "@/features/surveys/types";

const defaultMultipleChoiceOptions = ["Option 1", "Option 2"];

export function useSurveyEditor(initialValue: ManuscriptSurvey) {
  const [survey, setSurvey] = useState(initialValue);
  const [savedSurvey, setSavedSurvey] = useState(initialValue);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  const isDirty = useMemo(
    () => JSON.stringify(survey) !== JSON.stringify(savedSurvey),
    [savedSurvey, survey],
  );
  const validationError = useMemo(() => validateSurvey(survey), [survey]);

  const updateSurvey = useCallback((patch: Partial<ManuscriptSurvey>) => {
    setSurvey((current) => ({ ...current, ...patch }));
  }, []);

  const updateQuestion = useCallback((questionId: string, patch: SurveyQuestionPatch) => {
    setSurvey((current) => ({
      ...current,
      questions: current.questions.map((question) =>
        question.id === questionId ? { ...question, ...patch } : question,
      ),
    }));
  }, []);

  const changeQuestionType = useCallback((questionId: string, type: SurveyQuestionType) => {
    setSurvey((current) => ({
      ...current,
      questions: current.questions.map((question) => {
        if (question.id !== questionId) return question;
        return {
          ...question,
          type,
          options:
            type === "multiple-choice"
              ? question.options.length >= 2
                ? question.options
                : defaultMultipleChoiceOptions
              : [],
        };
      }),
    }));
  }, []);

  const updateOption = useCallback((questionId: string, optionIndex: number, value: string) => {
    setSurvey((current) => ({
      ...current,
      questions: current.questions.map((question) =>
        question.id === questionId
          ? {
              ...question,
              options: question.options.map((option, index) =>
                index === optionIndex ? value : option,
              ),
            }
          : question,
      ),
    }));
  }, []);

  const addOption = useCallback((questionId: string) => {
    setSurvey((current) => ({
      ...current,
      questions: current.questions.map((question) =>
        question.id === questionId
          ? { ...question, options: [...question.options, `Option ${question.options.length + 1}`] }
          : question,
      ),
    }));
  }, []);

  const removeOption = useCallback((questionId: string, optionIndex: number) => {
    setSurvey((current) => ({
      ...current,
      questions: current.questions.map((question) =>
        question.id === questionId && question.options.length > 2
          ? { ...question, options: question.options.filter((_, index) => index !== optionIndex) }
          : question,
      ),
    }));
  }, []);

  const addQuestion = useCallback(() => {
    setSurvey((current) => ({
      ...current,
      questions: [
        ...current.questions,
        {
          id: createId("question"),
          prompt: "Untitled question",
          type: "open-text",
          required: false,
          options: [],
        },
      ],
    }));
  }, []);

  const removeQuestion = useCallback((questionId: string) => {
    setSurvey((current) => {
      if (current.questions.length === 1) return current;
      return {
        ...current,
        questions: current.questions.filter((question) => question.id !== questionId),
      };
    });
  }, []);

  const saveSurvey = useCallback(() => {
    if (validateSurvey(survey)) return false;
    setSavedSurvey(survey);
    setLastSavedAt(new Date());
    return true;
  }, [survey]);

  const replaceSurvey = useCallback((nextSurvey: ManuscriptSurvey) => {
    setSurvey(nextSurvey);
    setSavedSurvey(nextSurvey);
    setLastSavedAt(null);
  }, []);

  const duplicateSurvey = useCallback(() => {
    const duplicated: ManuscriptSurvey = {
      ...survey,
      id: createId("survey"),
      name: `${survey.name} copy`,
      status: "draft",
      responseCount: 0,
      questions: survey.questions.map((question) => ({
        ...question,
        id: createId("question"),
        options: [...question.options],
      })),
    };
    replaceSurvey(duplicated);
  }, [replaceSurvey, survey]);

  return {
    survey,
    isDirty,
    lastSavedAt,
    validationError,
    updateSurvey,
    updateQuestion,
    changeQuestionType,
    updateOption,
    addOption,
    removeOption,
    addQuestion,
    removeQuestion,
    saveSurvey,
    replaceSurvey,
    duplicateSurvey,
  };
}

function validateSurvey(survey: ManuscriptSurvey) {
  if (!survey.name.trim()) return "Give the survey a name before saving.";
  if (survey.delivery.scope === "chapter" && !survey.delivery.chapterId) {
    return "Choose the chapter that should trigger this survey.";
  }
  if (survey.questions.some((question) => !question.prompt.trim())) {
    return "Every question needs text before saving.";
  }
  if (
    survey.questions.some(
      (question) =>
        question.type === "multiple-choice" &&
        (question.options.length < 2 || question.options.some((option) => !option.trim())),
    )
  ) {
    return "Multiple-choice questions need at least two named options.";
  }
  return null;
}
