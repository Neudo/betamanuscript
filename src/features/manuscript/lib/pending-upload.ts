import { z } from "zod";

export const PENDING_UPLOAD_BUCKET = "pending-manuscripts";
export const PENDING_UPLOAD_COOKIE = "manuscript-upload";
export const PENDING_UPLOAD_MAX_AGE = 4 * 60 * 60;
export const uploadIdSchema = z.string().uuid();
export const uploadMetadataSchema = z.object({
  filename: z.string().trim().min(1).max(512).regex(/\.(docx|pdf|txt|md)$/i),
  size: z.number().int().min(1).max(20 * 1024 * 1024),
  captchaToken: z.string().min(1).max(2048),
});
export function pendingUploadPath(id: string) {
  return `/import-manuscript?upload=${encodeURIComponent(id)}`;
}
export function pendingUploadIdFromPath(path: string | null | undefined) {
  if (!path || !path.startsWith("/import-manuscript?")) return null;
  const parsed = uploadIdSchema.safeParse(new URLSearchParams(path.split("?")[1]).get("upload"));
  return parsed.success ? parsed.data : null;
}
export function uploadMimeType(filename: string) {
  switch (filename.split(".").at(-1)?.toLowerCase()) {
    case "pdf": return "application/pdf";
    case "docx": return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case "md": return "text/markdown";
    default: return "text/plain";
  }
}
export function hasExpectedUploadContent(bytes: Uint8Array, filename: string) {
  const extension = filename.split(".").at(-1)?.toLowerCase();
  if (extension === "pdf") return new TextDecoder().decode(bytes.slice(0, 5)) === "%PDF-";
  if (extension === "docx") return bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 3 && bytes[3] === 4;
  return bytes.length > 0 && !bytes.slice(0, 8192).includes(0);
}
