import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import {
  getSourceDocumentError,
  getSourceDocumentMetadata,
} from "@/features/manuscript/lib/source-document";
import {
  COVER_IMAGE_MIME_TYPE,
  optimizeCoverImage,
} from "@/features/manuscript/lib/cover-image";

export const MANUSCRIPT_COVERS_BUCKET = "manuscript-covers";
export const MANUSCRIPT_SOURCES_BUCKET = "manuscript-sources";
export const MAX_COVER_FILE_SIZE_BYTES = 5 * 1024 * 1024;

const supportedCoverMimeTypes = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

export type CoverImageMimeType = keyof typeof supportedCoverMimeTypes;

export function getCoverFileError(file: File) {
  if (!(file.type in supportedCoverMimeTypes)) {
    return "Choose a JPG, PNG, or WEBP image.";
  }

  if (file.size > MAX_COVER_FILE_SIZE_BYTES) {
    return "The cover image must be 5 MB or smaller.";
  }

  const filename = file.name.trim();
  if (!filename || filename.length > 512) {
    return "Choose an image with a filename shorter than 513 characters.";
  }

  return null;
}

export type UploadManuscriptCoverInput = {
  file: File;
  manuscriptVersionId: string;
};

export type UploadManuscriptSourceInput = {
  file: File;
  manuscriptVersionId: string;
};

export async function uploadManuscriptCover({
  file,
  manuscriptVersionId,
}: UploadManuscriptCoverInput) {
  const validationError = getCoverFileError(file);
  if (validationError) throw new Error(validationError);
  const originalFilename = file.name.trim();

  const supabase = createSupabaseBrowserClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Authentication is required to upload a cover image.");
  }

  const optimizedCover = await optimizeCoverImage(file);
  const storagePath = `${user.id}/${manuscriptVersionId}/cover.webp`;
  const { data: existingAsset, error: existingAssetError } = await supabase
    .from("manuscript_assets")
    .select("id, storage_path")
    .eq("manuscript_version_id", manuscriptVersionId)
    .eq("asset_kind", "cover")
    .maybeSingle();

  if (existingAssetError) throw new Error(existingAssetError.message);

  const { data: uploadedObject, error: uploadError } = await supabase.storage
    .from(MANUSCRIPT_COVERS_BUCKET)
    .upload(storagePath, optimizedCover, {
      cacheControl: "31536000",
      contentType: COVER_IMAGE_MIME_TYPE,
      upsert: Boolean(existingAsset),
    });

  if (uploadError) throw new Error(uploadError.message);

  const asset = {
    byte_size: optimizedCover.size,
    mime_type: COVER_IMAGE_MIME_TYPE,
    original_filename: originalFilename,
    processing_status: "available" as const,
    storage_bucket: MANUSCRIPT_COVERS_BUCKET,
    storage_path: uploadedObject.path,
  };
  const { error: assetError } = existingAsset
    ? await supabase
      .from("manuscript_assets")
      .update(asset)
      .eq("id", existingAsset.id)
    : await supabase
      .from("manuscript_assets")
      .insert({
        asset_kind: "cover",
        manuscript_version_id: manuscriptVersionId,
        ...asset,
      });

  if (!assetError) {
    if (existingAsset && existingAsset.storage_path !== uploadedObject.path) {
      const { error: cleanupError } = await supabase.storage
        .from(MANUSCRIPT_COVERS_BUCKET)
        .remove([existingAsset.storage_path]);

      if (cleanupError) {
        throw new Error(`The cover was updated, but the previous image could not be removed. ${cleanupError.message}`);
      }
    }

    return;
  }

  const { error: cleanupError } = await supabase.storage
    .from(MANUSCRIPT_COVERS_BUCKET)
    .remove([uploadedObject.path]);

  if (cleanupError) {
    throw new Error(`${assetError.message} The uploaded file could not be cleaned up.`);
  }

  throw new Error(assetError.message);
}

export async function uploadManuscriptSourceDocument({
  file,
  manuscriptVersionId,
}: UploadManuscriptSourceInput) {
  const validationError = getSourceDocumentError(file);
  if (validationError) throw new Error(validationError);

  const metadata = getSourceDocumentMetadata(file);
  if (!metadata) throw new Error("The source document format is not supported.");

  const supabase = createSupabaseBrowserClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Authentication is required to upload a source document.");
  }

  const storagePath = `${user.id}/${manuscriptVersionId}/source.${metadata.extension}`;
  const { data: existingAsset, error: existingAssetError } = await supabase
    .from("manuscript_assets")
    .select("id")
    .eq("manuscript_version_id", manuscriptVersionId)
    .eq("asset_kind", "source_document")
    .maybeSingle();

  if (existingAssetError) throw new Error(existingAssetError.message);
  if (existingAsset) return;

  const { data: uploadedObject, error: uploadError } = await supabase.storage
    .from(MANUSCRIPT_SOURCES_BUCKET)
    .upload(storagePath, file, {
      cacheControl: "31536000",
      contentType: metadata.mimeType,
      upsert: false,
    });

  if (uploadError) throw new Error(uploadError.message);

  const { error: assetError } = await supabase
    .from("manuscript_assets")
    .insert({
      asset_kind: "source_document",
      byte_size: file.size,
      manuscript_version_id: manuscriptVersionId,
      mime_type: metadata.mimeType,
      original_filename: file.name.trim(),
      processing_status: "available",
      storage_bucket: MANUSCRIPT_SOURCES_BUCKET,
      storage_path: uploadedObject.path,
    });

  if (!assetError) return;

  const { error: cleanupError } = await supabase.storage
    .from(MANUSCRIPT_SOURCES_BUCKET)
    .remove([uploadedObject.path]);

  if (cleanupError) {
    throw new Error(`${assetError.message} The uploaded file could not be cleaned up.`);
  }

  throw new Error(assetError.message);
}
