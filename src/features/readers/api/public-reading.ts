import type { ReaderAnnotationDraft } from "@/features/reading/api/reading";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export type PublicReaderAnnotationInput = ReaderAnnotationDraft & {
  accessLinkId: string;
  comment: string;
  tagId: string;
};

export async function createPublicReaderAnnotation({
  accessLinkId,
  chapterBlockId,
  chapterId,
  comment,
  contextAfter,
  contextBefore,
  quote,
  selectionEnd,
  selectionEndChapterBlockId,
  selectionEndOffset,
  selectionStart,
  tagId,
}: PublicReaderAnnotationInput) {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.rpc("create_public_reader_annotation", {
    p_chapter_block_id: chapterBlockId,
    p_chapter_id: chapterId,
    p_comment: comment,
    p_context_after: contextAfter,
    p_context_before: contextBefore,
    p_public_link_id: accessLinkId,
    p_quote: quote,
    p_selection_end: selectionEnd,
    p_selection_end_chapter_block_id: selectionEndChapterBlockId,
    p_selection_end_offset: selectionEndOffset,
    p_selection_start: selectionStart,
    p_tag_id: tagId,
  });

  if (error) throw new Error(error.message);
}

export async function createPublicReaderGeneralAnnotation({
  accessLinkId,
  chapterId,
  comment,
}: {
  accessLinkId: string;
  chapterId: string;
  comment: string;
}) {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.rpc("create_public_reader_general_annotation", {
    p_chapter_id: chapterId,
    p_comment: comment,
    p_public_link_id: accessLinkId,
  });

  if (error) throw new Error(error.message);
}

export async function createReaderPlaceRequest(accessLinkId: string) {
  const response = await fetch("/api/reader/place-requests", {
    body: JSON.stringify({ accessLinkId }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
  const payload = await response.json().catch(() => null) as {
    error?: string;
    ok?: boolean;
    request?: { requestId: string; status: string };
  } | null;

  if (!response.ok || !payload?.ok || !payload.request) {
    throw new Error(payload?.error ?? "The place request could not be created.");
  }

  return payload.request;
}
