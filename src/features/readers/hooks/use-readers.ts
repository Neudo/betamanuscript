"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getInviteableChapters,
  getManuscriptReaders,
  disablePublicReadingLink,
  enablePublicReadingLink,
  inviteReader,
  resendReaderInvitation,
  revokeReaderInvitation,
  setReaderChapterAccess,
  setReaderDraftAccess,
  reviewReaderPlaceRequest,
  updateReaderLimit,
} from "@/features/readers/api/readers";
import { readerKeys } from "@/features/readers/query-keys";
import { dashboardKeys } from "@/features/dashboard/query-keys";
import { manuscriptKeys } from "@/features/manuscript/query-keys";

function useInvalidateReaderData() {
  const queryClient = useQueryClient();

  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all }),
      queryClient.invalidateQueries({ queryKey: readerKeys.all }),
      queryClient.invalidateQueries({ queryKey: manuscriptKeys.all }),
    ]);
  };
}

export function useManuscriptReaders() {
  return useQuery({
    queryKey: readerKeys.manuscripts(),
    queryFn: getManuscriptReaders,
    staleTime: 30_000,
  });
}

export function useInviteableChapters(manuscriptId: string, enabled: boolean) {
  return useQuery({
    queryKey: readerKeys.inviteableChapters(manuscriptId),
    queryFn: () => getInviteableChapters(manuscriptId),
    enabled,
    staleTime: 30_000,
  });
}

export function useInviteReader() {
  const invalidate = useInvalidateReaderData();

  return useMutation({
    mutationFn: inviteReader,
    onSettled: invalidate,
  });
}

export function useResendReaderInvitation() {
  const invalidate = useInvalidateReaderData();

  return useMutation({
    mutationFn: resendReaderInvitation,
    onSettled: invalidate,
  });
}

export function useRevokeReaderInvitation() {
  const invalidate = useInvalidateReaderData();

  return useMutation({
    mutationFn: revokeReaderInvitation,
    onSettled: invalidate,
  });
}

export function useUpdateReaderLimit() {
  const invalidate = useInvalidateReaderData();

  return useMutation({
    mutationFn: updateReaderLimit,
    onSettled: invalidate,
  });
}

export function useSetReaderDraftAccess() {
  const invalidate = useInvalidateReaderData();

  return useMutation({
    mutationFn: setReaderDraftAccess,
    onSettled: invalidate,
  });
}

export function useSetReaderChapterAccess() {
  const invalidate = useInvalidateReaderData();

  return useMutation({
    mutationFn: setReaderChapterAccess,
    onSettled: invalidate,
  });
}

export function useEnablePublicReadingLink() {
  const invalidate = useInvalidateReaderData();

  return useMutation({
    mutationFn: enablePublicReadingLink,
    onSettled: invalidate,
  });
}

export function useDisablePublicReadingLink() {
  const invalidate = useInvalidateReaderData();

  return useMutation({
    mutationFn: disablePublicReadingLink,
    onSettled: invalidate,
  });
}

export function useReviewReaderPlaceRequest() {
  const invalidate = useInvalidateReaderData();

  return useMutation({
    mutationFn: reviewReaderPlaceRequest,
    onSettled: invalidate,
  });
}
