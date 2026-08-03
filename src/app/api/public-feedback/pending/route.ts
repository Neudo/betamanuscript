import { z } from "zod";

import {
  createPendingPublicFeedbackToken,
  hashPendingPublicFeedbackToken,
} from "@/features/reading/server/pending-public-feedback";
import { publicReadingFingerprint } from "@/features/reading/server/public-reading";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const uuid = z.string().uuid();
const displayName = z.string().trim().min(2).max(80);

const annotationDraftSchema = z.object({
  chapterBlockId: uuid,
  chapterId: uuid,
  contextAfter: z.string().max(1000).nullable(),
  contextBefore: z.string().max(1000).nullable(),
  quote: z.string().min(1).max(10_000),
  selectionEnd: z.number().int().nonnegative(),
  selectionEndChapterBlockId: uuid.nullable(),
  selectionEndOffset: z.number().int().nonnegative().nullable(),
  selectionStart: z.number().int().nonnegative(),
});

const requestSchema = z.discriminatedUnion("kind", [
  z.object({
    accessLinkId: uuid,
    comment: z.string().max(4000),
    displayName,
    draft: annotationDraftSchema,
    kind: z.literal("annotation"),
    tagId: uuid,
  }),
  z.object({
    accessLinkId: uuid,
    chapterId: uuid,
    comment: z.string().trim().min(1).max(4000),
    displayName,
    kind: z.literal("general"),
  }),
]);

function errorResponse(message: string, status: number) {
  return Response.json(
    { error: message, ok: false },
    { headers: { "Cache-Control": "private, no-store" }, status },
  );
}

export async function POST(request: Request) {
  const parsedBody = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsedBody.success) {
    return errorResponse("Feedback content is invalid.", 400);
  }

  const input = parsedBody.data;
  const token = createPendingPublicFeedbackToken();
  const fingerprintHash = publicReadingFingerprint({
    forwardedFor: request.headers.get("x-forwarded-for"),
    realIp: request.headers.get("x-real-ip"),
    userAgent: request.headers.get("user-agent"),
  });
  const admin = createSupabaseAdminClient();
  const { error } = await admin.rpc("create_pending_public_feedback", {
    p_chapter_block_id: input.kind === "annotation" ? input.draft.chapterBlockId : null,
    p_chapter_id: input.kind === "annotation" ? input.draft.chapterId : input.chapterId,
    p_comment: input.comment,
    p_context_after: input.kind === "annotation" ? input.draft.contextAfter : null,
    p_context_before: input.kind === "annotation" ? input.draft.contextBefore : null,
    p_display_name: input.displayName,
    p_fingerprint_hash: fingerprintHash,
    p_kind: input.kind,
    p_public_link_id: input.accessLinkId,
    p_quote: input.kind === "annotation" ? input.draft.quote : null,
    p_selection_end: input.kind === "annotation" ? input.draft.selectionEnd : null,
    p_selection_end_chapter_block_id: input.kind === "annotation" ? input.draft.selectionEndChapterBlockId : null,
    p_selection_end_offset: input.kind === "annotation" ? input.draft.selectionEndOffset : null,
    p_selection_start: input.kind === "annotation" ? input.draft.selectionStart : null,
    p_tag_id: input.kind === "annotation" ? input.tagId : null,
    p_token_digest: hashPendingPublicFeedbackToken(token),
  });

  if (error) {
    return errorResponse(error.message, 400);
  }

  return Response.json(
    { ok: true, token },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
