"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  uploadManuscriptCover,
  uploadManuscriptSourceDocument,
  type UploadManuscriptCoverInput,
  type UploadManuscriptSourceInput,
} from "@/features/manuscript/api/manuscript-assets";
import {
  createManuscriptChapter,
  createManuscriptDraftVersion,
  createManuscript,
  deleteManuscriptChapter,
  deleteManuscript,
  updateManuscriptChapter,
  updateManuscriptSettings,
  updateAnnotationSeenStatus,
  updateChapterEditorialStatus,
  updateManuscriptDraftVersionTitle,
  type CreateManuscriptChapterInput,
  type UpdateManuscriptChapterInput,
  type UpdateManuscriptSettingsInput,
} from "@/features/manuscript/api/manuscripts";
import { manuscriptKeys } from "@/features/manuscript/query-keys";
import { dashboardKeys } from "@/features/dashboard/query-keys";
import { readerKeys } from "@/features/readers/query-keys";
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

export function useCreateManuscriptDraftVersionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createManuscriptDraftVersion,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: manuscriptKeys.all });
    },
  });
}

export function useUpdateManuscriptDraftVersionTitleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateManuscriptDraftVersionTitle,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: manuscriptKeys.all });
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

export function useUploadManuscriptSourceMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, UploadManuscriptSourceInput>({
    mutationFn: uploadManuscriptSourceDocument,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: manuscriptKeys.all,
      });
    },
  });
}

export function useUpdateManuscriptSettingsMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, UpdateManuscriptSettingsInput>({
    mutationFn: updateManuscriptSettings,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: manuscriptKeys.all,
      });
    },
  });
}

export function useDeleteManuscriptMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: deleteManuscript,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: manuscriptKeys.all,
      });
    },
  });
}

type CreateChapterVariables = CreateManuscriptChapterInput & {
  manuscriptId: string;
};

type UpdateChapterVariables = UpdateManuscriptChapterInput & {
  manuscriptId: string;
};

type DeleteChapterVariables = {
  chapterId: string;
  manuscriptId: string;
};

function useInvalidateManuscriptAfterChapterChange<TVariables extends { manuscriptId: string }>(
  mutationFn: (variables: TVariables) => Promise<void | string>,
) {
  const queryClient = useQueryClient();

  return useMutation<void | string, Error, TVariables>({
    mutationFn,
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: manuscriptKeys.detail(variables.manuscriptId),
        }),
        queryClient.invalidateQueries({
          queryKey: manuscriptKeys.list(),
        }),
        queryClient.invalidateQueries({
          queryKey: dashboardKeys.all,
        }),
        queryClient.invalidateQueries({
          queryKey: readerKeys.all,
        }),
      ]);
    },
  });
}

export function useCreateManuscriptChapterMutation() {
  return useInvalidateManuscriptAfterChapterChange<CreateChapterVariables>(
    ({ content, manuscriptVersionId, readerAssignmentIds, title }) => createManuscriptChapter({
      content,
      manuscriptVersionId,
      readerAssignmentIds,
      title,
    }),
  );
}

export function useUpdateManuscriptChapterMutation() {
  return useInvalidateManuscriptAfterChapterChange<UpdateChapterVariables>(
    ({ chapterId, content, title }) => updateManuscriptChapter({ chapterId, content, title }),
  );
}

export function useDeleteManuscriptChapterMutation() {
  return useInvalidateManuscriptAfterChapterChange<DeleteChapterVariables>(
    ({ chapterId }) => deleteManuscriptChapter(chapterId),
  );
}

type MutationContext = {
  previous: ManuscriptWorkspaceData | undefined;
};

type UpdateChapterStatusVariables = {
  chapterId: string;
  manuscriptId: string;
  manuscriptVersionId: string;
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
      const queryKey = manuscriptKeys.detail(
        variables.manuscriptId,
        variables.manuscriptVersionId,
      );
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
        manuscriptKeys.detail(variables.manuscriptId, variables.manuscriptVersionId),
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
  manuscriptVersionId: string;
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
      const queryKey = manuscriptKeys.detail(
        variables.manuscriptId,
        variables.manuscriptVersionId,
      );
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
        manuscriptKeys.detail(variables.manuscriptId, variables.manuscriptVersionId),
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
