import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasExpectedUploadContent, PENDING_UPLOAD_BUCKET } from "@/features/manuscript/lib/pending-upload";
import { claimUpload, getUpload, requireSameOrigin, requireUploadCookie, UploadError, uploadErrorResponse } from "@/features/manuscript/server/pending-upload";

type Context = { params: Promise<{ id: string }> };
export const runtime = "nodejs";
export async function POST(request: Request, context: Context) {
  try {
    requireSameOrigin(request);
    const { id } = await context.params;
    const { action } = await request.json();
    if (!["ready", "resume", "complete"].includes(action)) throw new UploadError("Invalid upload action.");
    const admin = createSupabaseAdminClient();
    if (action === "ready") {
      const upload = await getUpload(id);
      await requireUploadCookie(upload);
      if (upload.state === "ready") return Response.json({ ok: true });
      if (upload.state !== "uploading") throw new UploadError("This manuscript has already been uploaded.");
      const { data: file, error } = await admin.storage.from(PENDING_UPLOAD_BUCKET).download(upload.storage_path);
      if (error) throw error;
      if (file.size !== upload.byte_size || !hasExpectedUploadContent(new Uint8Array(await file.slice(0,8192).arrayBuffer()), upload.original_filename)) {
        throw new UploadError("The uploaded file does not match its declared format or size.");
      }
      const { data, error: updateError } = await admin.from("pending_manuscript_uploads").update({ state: "ready" }).eq("id",id).eq("state","uploading").gt("expires_at",new Date().toISOString()).select("id").maybeSingle();
      if (updateError) throw updateError;
      if (!data) throw new UploadError("This upload has expired.",410);
      return Response.json({ ok: true });
    }
    const { data: { user } } = await (await createSupabaseServerClient()).auth.getUser();
    if (!user) throw new UploadError("Log in to retrieve your manuscript.",401);
    const upload = await claimUpload(id,user.id);
    if (action === "resume") {
      const { data, error } = await admin.storage.from(PENDING_UPLOAD_BUCKET).createSignedUrl(upload.storage_path, 60);
      if (error) throw error;
      return Response.json({ filename: upload.original_filename, mimeType: upload.mime_type, signedUrl: data.signedUrl, completed: upload.state === "completed", manuscriptId: upload.manuscript_id }, { headers: { "Cache-Control": "private, no-store" } });
    }
    if (action === "complete") {
      if (!upload.manuscript_version_id) throw new UploadError("Create the manuscript before saving its source.");
      const versionId = upload.manuscript_version_id;
      const extension = upload.original_filename.split(".").at(-1)!.toLowerCase();
      const destination = `${user.id}/${versionId}/source.${extension}`;
      const { data: asset, error } = await admin.from("manuscript_assets").select("id").eq("manuscript_version_id",versionId).eq("asset_kind","source_document").maybeSingle();
      if (error) throw error;
      if (!asset) {
        const { error: copyError } = await admin.storage.from(PENDING_UPLOAD_BUCKET).copy(upload.storage_path,destination,{ destinationBucket: "manuscript-sources" });
        if (copyError) {
          // A previous attempt may have copied the object before its response was lost.
          const { data: existing, error: infoError } = await admin.storage.from("manuscript-sources").info(destination);
          if (infoError || (existing?.size ?? existing?.metadata?.size) !== upload.byte_size) throw copyError;
        }
        const { error: insertError } = await admin.from("manuscript_assets").insert({
          asset_kind: "source_document", manuscript_version_id: versionId, byte_size: upload.byte_size,
          mime_type: upload.mime_type, original_filename: upload.original_filename, processing_status: "available",
          storage_bucket: "manuscript-sources", storage_path: destination,
        });
        if (insertError) {
          const { data: saved } = await admin.from("manuscript_assets").select("id").eq("manuscript_version_id",versionId).eq("asset_kind","source_document").eq("storage_path",destination).maybeSingle();
          if (!saved) throw insertError;
        }
      }
      const { error: updateError } = await admin.from("pending_manuscript_uploads").update({ state: "completed" }).eq("id",id).eq("owner_id",user.id).eq("state","claimed");
      if (updateError) throw updateError;
      return Response.json({ ok: true });
    }
    throw new UploadError("Invalid upload action.");
  } catch (error) { return uploadErrorResponse(error); }
}
