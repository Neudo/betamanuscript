import { describe, expect, it, vi } from "vitest";
import { cleanupUploads } from "../../../../supabase/functions/cleanup-manuscript-uploads/cleanup";

describe("temporary manuscript storage cleanup", () => {
  const uploads = [{ id: "test-upload", storage_path: "test-upload/source" }];
  it("deletes the actual object before its tracking row", async () => {
    const order: string[] = [];
    const takeBatch = vi.fn().mockResolvedValueOnce(uploads).mockResolvedValue([]);
    const deleted = await cleanupUploads({ takeBatch, removeObjects: async () => { order.push("storage"); }, removeRows: async () => { order.push("database"); } });
    expect(deleted).toBe(1);
    expect(order).toEqual(["storage", "database"]);
  });
  it("keeps tracking rows if storage deletion fails so the next hourly run can retry", async () => {
    const removeRows = vi.fn();
    await expect(cleanupUploads({ takeBatch: async () => uploads, removeObjects: async () => { throw new Error("Storage unavailable"); }, removeRows })).rejects.toThrow("Storage unavailable");
    expect(removeRows).not.toHaveBeenCalled();
  });
  it("bounds each run even when the backlog is large", async () => {
    const takeBatch = vi.fn().mockResolvedValue(uploads);
    expect(await cleanupUploads({ takeBatch, removeObjects: async () => {}, removeRows: async () => {} })).toBe(10);
    expect(takeBatch).toHaveBeenCalledTimes(10);
  });
});
