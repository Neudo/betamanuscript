"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  completeReaderChapter,
  createReaderAnnotation,
  deleteReaderAnnotation,
  getReaderAnnotationTags,
  getReaderManuscript,
  getReaderManuscripts,
  updateReaderAnnotation,
} from "@/features/reading/api/reading";

export const readingKeys = {
  all: ["reader-manuscripts"] as const,
  detail: (manuscriptId: string) => [...readingKeys.all, "detail", manuscriptId] as const,
  list: () => [...readingKeys.all, "list"] as const,
  tags: () => [...readingKeys.all, "annotation-tags"] as const,
};

export function useReaderManuscripts() {
  return useQuery({
    queryKey: readingKeys.list(),
    queryFn: getReaderManuscripts,
    staleTime: 30_000,
  });
}

export function useReaderManuscript(manuscriptId: string) {
  return useQuery({
    queryKey: readingKeys.detail(manuscriptId),
    queryFn: () => getReaderManuscript(manuscriptId),
    enabled: Boolean(manuscriptId),
    staleTime: 30_000,
  });
}

export function useReaderAnnotationTags() {
  return useQuery({
    queryKey: readingKeys.tags(),
    queryFn: getReaderAnnotationTags,
    staleTime: 5 * 60_000,
  });
}

export function useCompleteReaderChapter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: completeReaderChapter,
    async onSuccess() {
      await queryClient.invalidateQueries({ queryKey: readingKeys.all });
    },
  });
}

export function useCreateReaderAnnotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createReaderAnnotation,
    async onSuccess() {
      await queryClient.invalidateQueries({ queryKey: readingKeys.all });
    },
  });
}

export function useUpdateReaderAnnotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateReaderAnnotation,
    async onSuccess() {
      await queryClient.invalidateQueries({ queryKey: readingKeys.all });
    },
  });
}

export function useDeleteReaderAnnotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteReaderAnnotation,
    async onSuccess() {
      await queryClient.invalidateQueries({ queryKey: readingKeys.all });
    },
  });
}
