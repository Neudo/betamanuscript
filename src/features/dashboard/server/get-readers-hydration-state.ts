import "server-only";

import { dehydrate, QueryClient } from "@tanstack/react-query";

import { getManuscriptReadersWithClient } from "@/features/readers/api/readers";
import { readerKeys } from "@/features/readers/query-keys";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getReadersHydrationState() {
  const supabase = await createSupabaseServerClient();
  const queryClient = new QueryClient();
  const manuscripts = await getManuscriptReadersWithClient(supabase);

  queryClient.setQueryData(readerKeys.manuscripts(), manuscripts);

  return dehydrate(queryClient);
}
