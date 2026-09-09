import { cleanupUploads } from "./cleanup.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.110.2";

Deno.serve(async (request: Request) => {
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const token = request.headers.get("x-cleanup-token");
  if (!token || !/^[0-9a-f]{64}$/.test(token)) return new Response("Unauthorized", { status: 401 });
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: authorized, error: authError } = await admin.rpc("authorize_manuscript_upload_cleanup", { p_token: token });
  if (authError || !authorized) return new Response("Unauthorized", { status: 401 });

  try {
    const deleted = await cleanupUploads({
      async takeBatch() {
        const { data, error } = await admin.rpc("take_expired_manuscript_uploads");
        if (error) throw error;
        return data ?? [];
      },
      async removeObjects(paths) {
        const { error } = await admin.storage.from("pending-manuscripts").remove(paths);
        if (error) throw error;
      },
      async removeRows(ids) {
        const { error } = await admin.from("pending_manuscript_uploads").delete().in("id", ids).eq("state", "deleting");
        if (error) throw error;
      },
    });
    return Response.json({ deleted });
  } catch (error) {
    console.error("Manuscript cleanup failed", error);
    return Response.json({ error: "Cleanup failed; remaining files will be retried." }, { status: 500 });
  }
});
