import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { verifyTurnstileToken } from "@/features/account/server/verify-turnstile";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { PENDING_UPLOAD_BUCKET, PENDING_UPLOAD_COOKIE, PENDING_UPLOAD_MAX_AGE, uploadMetadataSchema, uploadMimeType } from "@/features/manuscript/lib/pending-upload";
import { digestUploadToken, requireSameOrigin, UploadError, uploadErrorResponse } from "@/features/manuscript/server/pending-upload";

export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    const parsed = uploadMetadataSchema.safeParse(await request.json());
    if (!parsed.success) throw new UploadError("Choose a DOCX, PDF, TXT or Markdown file up to 20 MB.");
    const { filename, size, captchaToken } = parsed.data;
    if (!await verifyTurnstileToken({ request, token: captchaToken })) throw new UploadError("Verification failed. Please try again.", 403);
    const token = randomBytes(32).toString("base64url");
    // Prefer the hosting platform's overwritten header over client-supplied forwarding headers.
    const ip = request.headers.get("x-vercel-forwarded-for") ?? request.headers.get("x-real-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const fingerprint = createHash("sha256").update(`${process.env.TURNSTILE_SECRET}:${ip}`).digest("hex");
    const admin = createSupabaseAdminClient();
    const { data: id, error } = await admin.rpc("reserve_manuscript_upload", { p_filename: filename, p_size: size, p_mime: uploadMimeType(filename), p_token_digest: digestUploadToken(token), p_fingerprint: fingerprint });
    if (error) throw error;
    if (!id) throw new UploadError("Too many uploads. Please try again in an hour.", 429);
    const { data: signed, error: signingError } = await admin.storage.from(PENDING_UPLOAD_BUCKET).createSignedUploadUrl(`${id}/source`);
    if (signingError) throw signingError;
    const response = NextResponse.json({ id, signedUrl: signed.signedUrl, mimeType: uploadMimeType(filename) }, { headers: { "Cache-Control": "private, no-store" } });
    response.cookies.set(PENDING_UPLOAD_COOKIE, `${id}.${token}`, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: PENDING_UPLOAD_MAX_AGE });
    return response;
  } catch (error) { return uploadErrorResponse(error); }
}
