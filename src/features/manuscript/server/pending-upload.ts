import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { PENDING_UPLOAD_COOKIE, uploadIdSchema } from "../lib/pending-upload";

export class UploadError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}
export function digestUploadToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
export async function getUpload(id: string) {
  if (!uploadIdSchema.safeParse(id).success) throw new UploadError("Invalid manuscript upload.", 404);
  const { data, error } = await createSupabaseAdminClient().from("pending_manuscript_uploads").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  if (!data || data.state === "deleting" || (!data.owner_id && Date.parse(data.expires_at) <= Date.now())) {
    throw new UploadError("This upload has expired or is no longer available. Please drop your manuscript again.", 410);
  }
  return data;
}
export async function requireUploadCookie(upload: Awaited<ReturnType<typeof getUpload>>) {
  const value = (await cookies()).get(PENDING_UPLOAD_COOKIE)?.value;
  const [id, secret] = value?.split(".") ?? [];
  if (id !== upload.id || !secret || !/^[A-Za-z0-9_-]{43}$/.test(secret)) throw new UploadError("This upload belongs to another browser or account.", 403);
  const digest = digestUploadToken(secret);
  if (!timingSafeEqual(Buffer.from(digest), Buffer.from(upload.token_digest))) throw new UploadError("This upload belongs to another browser or account.", 403);
  return digest;
}
export async function claimUpload(id: string, ownerId: string) {
  const upload = await getUpload(id);
  if (upload.owner_id === ownerId) return upload;
  if (upload.owner_id) throw new UploadError("This upload belongs to another account.", 403);
  const digest = await requireUploadCookie(upload);
  const { data, error } = await createSupabaseAdminClient().rpc("claim_manuscript_upload", { p_id: id, p_digest: digest, p_owner: ownerId });
  if (error) throw error;
  if (!data) {
    const current = await getUpload(id);
    if (current.owner_id === ownerId) return current;
    throw new UploadError("This upload is no longer available.", 410);
  }
  return { ...upload, owner_id: ownerId, state: "claimed" };
}
export function uploadErrorResponse(error: unknown) {
  if (!(error instanceof UploadError)) console.error("Manuscript upload failed", error);
  return Response.json({ error: error instanceof UploadError ? error.message : "The manuscript could not be saved. Please try again." }, { status: error instanceof UploadError ? error.status : 500, headers: { "Cache-Control": "private, no-store" } });
}
export function requireSameOrigin(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) throw new UploadError("Invalid request origin.", 403);
}
