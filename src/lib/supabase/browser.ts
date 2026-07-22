import { createBrowserClient } from "@supabase/ssr";
import { getPublicSupabaseEnv } from "../env";
import type { Database } from "./database.types";

export function createSupabaseBrowserClient() {
  const env = getPublicSupabaseEnv();

  return createBrowserClient<Database>(
    env.url,
    env.publishableKey,
  );
}
