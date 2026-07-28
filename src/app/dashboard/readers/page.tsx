import { ReadersManager } from "@/features/readers/components/ReadersManager";
import { getAuthenticatedAccount } from "@/features/account/server/get-authenticated-account";

export default async function ReadersPage() {
  const account = await getAuthenticatedAccount();

  return <ReadersManager accountPlan={account?.plan ?? "free"} />;
}
