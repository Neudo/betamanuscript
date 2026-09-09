import { describe, expect, it } from "vitest";
import { hasExpectedUploadContent, pendingUploadIdFromPath, pendingUploadPath, uploadMetadataSchema, uploadMimeType } from "./pending-upload";

const id = "a289014e-c405-4ccd-9f3c-70a35ecf477c";
describe("pending manuscript upload boundary", () => {
  it("preserves only a valid upload destination through auth", () => {
    expect(pendingUploadIdFromPath(pendingUploadPath(id))).toBe(id);
    for (const path of [null, "/dashboard?upload="+id, "https://evil.test/import-manuscript?upload="+id, "/import-manuscript?upload=../secret"]) {
      expect(pendingUploadIdFromPath(path)).toBeNull();
    }
  });
  it("enforces supported names, nonempty files and the 20 MB limit", () => {
    const valid = { filename: "Draft.DOCX", size: 20*1024*1024, captchaToken: "verified" };
    expect(uploadMetadataSchema.safeParse(valid).success).toBe(true);
    for (const patch of [{ filename: "script.exe" }, { size: 0 }, { size: valid.size+1 }, { captchaToken: "" }]) {
      expect(uploadMetadataSchema.safeParse({ ...valid, ...patch }).success).toBe(false);
    }
    expect(uploadMimeType("Draft.DOCX")).toBe("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
  });
  it("rejects obvious binary files disguised as supported documents", () => {
    const bytes = (text: string) => new TextEncoder().encode(text);
    expect(hasExpectedUploadContent(bytes("%PDF-1.7"),"book.pdf")).toBe(true);
    expect(hasExpectedUploadContent(bytes("not a pdf"),"book.pdf")).toBe(false);
    expect(hasExpectedUploadContent(new Uint8Array([80,75,3,4]),"book.docx")).toBe(true);
    expect(hasExpectedUploadContent(bytes("not a zip"),"book.docx")).toBe(false);
    expect(hasExpectedUploadContent(bytes("Chapter 1\nA story."),"book.txt")).toBe(true);
    expect(hasExpectedUploadContent(new Uint8Array([1,0,2]),"book.md")).toBe(false);
  });
});
