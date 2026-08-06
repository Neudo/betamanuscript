import { HydrationBoundary } from "@tanstack/react-query";

import { ReadersManager } from "@/features/readers/components/ReadersManager";
import { getAuthenticatedAccount } from "@/features/account/server/get-authenticated-account";
import { getReadersHydrationState } from "@/features/dashboard/server/get-readers-hydration-state";

export default async function ReadersPage() {
  const [account, state] = await Promise.all([
    getAuthenticatedAccount(),
    getReadersHydrationState(),
  ]);

  return (
    <HydrationBoundary state={state}>
      <ReadersManager accountPlan={account?.plan ?? "free"} />
    </HydrationBoundary>
  );
}
