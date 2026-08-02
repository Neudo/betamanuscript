"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  archiveFeedback,
  deleteArchivedFeedback,
  getManuscriptFeedback,
  updateFeedbackSeenStatus,
} from "@/features/feedback/api/feedback";
import { feedbackKeys } from "@/features/feedback/query-keys";
import type { FeedbackAnnotation } from "@/features/feedback/types";
import { manuscriptKeys } from "@/features/manuscript/query-keys";

export function useManuscriptFeedback(
  manuscriptId: string | null,
  manuscriptVersionId: string | null = null,
) {
  return useQuery({
    queryKey: feedbackKeys.manuscript(manuscriptId ?? "none", manuscriptVersionId),
    queryFn: () => getManuscriptFeedback(manuscriptId!, manuscriptVersionId),
    enabled: Boolean(manuscriptId),
    staleTime: 30_000,
  });
}

type UpdateFeedbackSeenVariables = {
  feedbackId: string;
  isSeen: boolean;
  kind: FeedbackAnnotation["kind"];
  manuscriptId: string;
  manuscriptVersionId: string | null;
};

type UpdateFeedbackSeenContext = {
  previous: FeedbackAnnotation[] | undefined;
};

export function useUpdateFeedbackSeenMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, UpdateFeedbackSeenVariables, UpdateFeedbackSeenContext>({
    mutationFn: ({ feedbackId, isSeen, kind }) => updateFeedbackSeenStatus({ feedbackId, isSeen, kind }),
    onMutate: async (variables) => {
      const queryKey = feedbackKeys.manuscript(
        variables.manuscriptId,
        variables.manuscriptVersionId,
      );
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<FeedbackAnnotation[]>(queryKey);

      queryClient.setQueryData<FeedbackAnnotation[]>(queryKey, (current) => (
        current?.map((annotation) => (
          annotation.id === variables.feedbackId && annotation.kind === variables.kind
            ? { ...annotation, isSeenByAuthor: variables.isSeen }
            : annotation
        ))
      ));

      return { previous };
    },
    onError: (_error, variables, context) => {
      queryClient.setQueryData(
        feedbackKeys.manuscript(variables.manuscriptId, variables.manuscriptVersionId),
        context?.previous,
      );
    },
    onSettled: async (_data, _error, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: feedbackKeys.manuscript(variables.manuscriptId, variables.manuscriptVersionId),
        }),
        queryClient.invalidateQueries({ queryKey: manuscriptKeys.detail(variables.manuscriptId) }),
      ]);
    },
  });
}

type DeleteArchivedFeedbackVariables = {
  feedbackId: string;
  kind: FeedbackAnnotation["kind"];
  manuscriptId: string;
  manuscriptVersionId: string | null;
};

type ArchiveFeedbackVariables = {
  feedbackId: string;
  kind: FeedbackAnnotation["kind"];
  manuscriptId: string;
  manuscriptVersionId: string | null;
};

export function useArchiveFeedbackMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, ArchiveFeedbackVariables, UpdateFeedbackSeenContext>({
    mutationFn: ({ feedbackId, kind }) => archiveFeedback({ feedbackId, kind }),
    onMutate: async (variables) => {
      const queryKey = feedbackKeys.manuscript(
        variables.manuscriptId,
        variables.manuscriptVersionId,
      );
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<FeedbackAnnotation[]>(queryKey);
      const archivedAt = new Date().toISOString();

      queryClient.setQueryData<FeedbackAnnotation[]>(queryKey, (current) => (
        current?.map((annotation) => (
          annotation.id === variables.feedbackId && annotation.kind === variables.kind
            ? { ...annotation, archivedAt, archivedReason: "manually_archived" }
            : annotation
        ))
      ));

      return { previous };
    },
    onError: (_error, variables, context) => {
      queryClient.setQueryData(
        feedbackKeys.manuscript(variables.manuscriptId, variables.manuscriptVersionId),
        context?.previous,
      );
    },
    onSettled: async (_data, _error, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: feedbackKeys.manuscript(variables.manuscriptId, variables.manuscriptVersionId),
        }),
        queryClient.invalidateQueries({ queryKey: manuscriptKeys.detail(variables.manuscriptId) }),
      ]);
    },
  });
}

export function useDeleteArchivedFeedbackMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, DeleteArchivedFeedbackVariables, UpdateFeedbackSeenContext>({
    mutationFn: ({ feedbackId, kind }) => deleteArchivedFeedback({ feedbackId, kind }),
    onMutate: async (variables) => {
      const queryKey = feedbackKeys.manuscript(
        variables.manuscriptId,
        variables.manuscriptVersionId,
      );
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<FeedbackAnnotation[]>(queryKey);

      queryClient.setQueryData<FeedbackAnnotation[]>(queryKey, (current) => (
        current?.filter((annotation) => (
          annotation.id !== variables.feedbackId || annotation.kind !== variables.kind
        ))
      ));

      return { previous };
    },
    onError: (_error, variables, context) => {
      queryClient.setQueryData(
        feedbackKeys.manuscript(variables.manuscriptId, variables.manuscriptVersionId),
        context?.previous,
      );
    },
    onSettled: async (_data, _error, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: feedbackKeys.manuscript(variables.manuscriptId, variables.manuscriptVersionId),
        }),
        queryClient.invalidateQueries({ queryKey: manuscriptKeys.detail(variables.manuscriptId) }),
      ]);
    },
  });
}
