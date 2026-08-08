import "server-only";

import { dehydrate, type QueryKey, QueryClient } from "@tanstack/react-query";
import type { SupabaseClient } from "@supabase/supabase-js";

import { getManuscriptsWithClient } from "@/features/manuscript/api/manuscripts";
import { findManuscriptByReference } from "@/features/manuscript/lib/manuscript-url";
import { manuscriptKeys } from "@/features/manuscript/query-keys";
import type { ManuscriptSummary } from "@/features/manuscript/types";
import type { Database } from "@/lib/supabase/database.types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ManuscriptScopedHydrationInput<TData> = {
  getData: (
    client: SupabaseClient<Database>,
    manuscriptId: string,
    manuscriptVersionId: string | null,
  ) => Promise<TData>;
  getQueryKey: (manuscriptId: string, manuscriptVersionId: string | null) => QueryKey;
  manuscriptId: string | null;
  manuscriptReference?: string | null;
  manuscriptVersionId: string | null;
  resolveManuscriptId?: (
    manuscripts: ManuscriptSummary[],
    requestedManuscriptId: string | null,
  ) => string | null;
};

/**
 * Primes the two queries every manuscript-scoped dashboard page needs: the
 * manuscript list used to resolve the selection, then that selection's data.
 */
export async function getManuscriptScopedHydrationState<TData>({
  getData,
  getQueryKey,
  manuscriptId: requestedManuscriptId,
  manuscriptReference,
  manuscriptVersionId,
  resolveManuscriptId,
}: ManuscriptScopedHydrationInput<TData>) {
  const supabase = await createSupabaseServerClient();
  const queryClient = new QueryClient();
  const manuscriptsPromise = getManuscriptsWithClient(supabase);
  const requestedDataPromise = requestedManuscriptId && !manuscriptReference && !resolveManuscriptId
    ? getData(supabase, requestedManuscriptId, manuscriptVersionId)
    : null;
  const manuscripts = await manuscriptsPromise;
  const resolvedManuscriptId = manuscriptReference
    ? findManuscriptByReference(manuscripts, manuscriptReference)?.id ?? null
    : requestedManuscriptId;
  const manuscriptId = resolveManuscriptId
    ? resolveManuscriptId(manuscripts, resolvedManuscriptId)
    : resolvedManuscriptId ?? manuscripts[0]?.id ?? null;

  queryClient.setQueryData(manuscriptKeys.list(), manuscripts);

  if (manuscriptId) {
    const data = requestedDataPromise
      ? await requestedDataPromise
      : await getData(supabase, manuscriptId, manuscriptVersionId);

    queryClient.setQueryData(getQueryKey(manuscriptId, manuscriptVersionId), data);
  }

  return dehydrate(queryClient);
}
