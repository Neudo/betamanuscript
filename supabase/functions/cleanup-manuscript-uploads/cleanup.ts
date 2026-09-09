type Upload = { id: string; storage_path: string };
type CleanupStorage = {
  takeBatch: () => Promise<Upload[]>;
  removeObjects: (paths: string[]) => Promise<void>;
  removeRows: (ids: string[]) => Promise<void>;
};

export async function cleanupUploads(storage: CleanupStorage) {
  let deleted = 0;
  for (let batch = 0; batch < 10; batch++) {
    const uploads = await storage.takeBatch();
    if (!uploads.length) break;
    // Never forget the database records until Storage confirms physical deletion.
    await storage.removeObjects(uploads.map((upload) => upload.storage_path));
    await storage.removeRows(uploads.map((upload) => upload.id));
    deleted += uploads.length;
  }
  return deleted;
}
