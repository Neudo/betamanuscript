"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  uploadManuscriptCover,
  type UploadManuscriptCoverInput,
} from "@/features/manuscript/api/manuscript-assets";
import {
  createManuscript,
  updateAnnotationSeenStatus,
  updateChapterEditorialStatus,
} from "@/features/manuscript/api/manuscripts";
import { manuscriptKeys } from "@/features/manuscript/query-keys";
import type {
  ChapterEditorialStatus,
  ManuscriptWorkspaceData,
} from "@/features/manuscript/types";

export function useCreateManuscriptMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createManuscript,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: manuscriptKeys.list(),
      });
    },
  });
}

export function useUploadManuscriptCoverMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, UploadManuscriptCoverInput>({
    mutationFn: uploadManuscriptCover,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: manuscriptKeys.all,
      });
    },
  });
}

type MutationContext = {
  previous: ManuscriptWorkspaceData | undefined;
};

type UpdateChapterStatusVariables = {
  chapterId: string;
  manuscriptId: string;
  status: ChapterEditorialStatus;
};

export function useUpdateChapterStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    Error,
    UpdateChapterStatusVariables,
    MutationContext
  >({
    mutationFn: ({ chapterId, status }) =>
      updateChapterEditorialStatus({ chapterId, status }),
    onMutate: async (variables) => {
      const queryKey = manuscriptKeys.detail(variables.manuscriptId);
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<ManuscriptWorkspaceData>(queryKey);

      queryClient.setQueryData<ManuscriptWorkspaceData>(queryKey, (current) =>
        current
          ? {
            ...current,
            chapters: current.chapters.map((chapter) =>
              chapter.id === variables.chapterId
                ? { ...chapter, editorialStatus: variables.status }
                : chapter,
            ),
          }
          : current,
      );

      return { previous };
    },
    onError: (_error, variables, context) => {
      queryClient.setQueryData(
        manuscriptKeys.detail(variables.manuscriptId),
        context?.previous,
      );
    },
    onSettled: async (_data, _error, variables) => {
      await queryClient.invalidateQueries({
        queryKey: manuscriptKeys.detail(variables.manuscriptId),
      });
    },
  });
}

type UpdateAnnotationSeenVariables = {
  annotationId: string;
  isSeen: boolean;
  manuscriptId: string;
};

export function useUpdateAnnotationSeenMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    Error,
    UpdateAnnotationSeenVariables,
    MutationContext
  >({
    mutationFn: ({ annotationId, isSeen }) =>
      updateAnnotationSeenStatus({ annotationId, isSeen }),
    onMutate: async (variables) => {
      const queryKey = manuscriptKeys.detail(variables.manuscriptId);
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<ManuscriptWorkspaceData>(queryKey);

      queryClient.setQueryData<ManuscriptWorkspaceData>(queryKey, (current) =>
        current
          ? {
            ...current,
            chapters: current.chapters.map((chapter) => ({
              ...chapter,
              annotations: chapter.annotations.map((annotation) =>
                annotation.id === variables.annotationId
                  ? { ...annotation, isSeenByAuthor: variables.isSeen }
                  : annotation,
              ),
            })),
          }
          : current,
      );

      return { previous };
    },
    onError: (_error, variables, context) => {
      queryClient.setQueryData(
        manuscriptKeys.detail(variables.manuscriptId),
        context?.previous,
      );
    },
    onSettled: async (_data, _error, variables) => {
      await queryClient.invalidateQueries({
        queryKey: manuscriptKeys.detail(variables.manuscriptId),
      });
    },
  });
}
