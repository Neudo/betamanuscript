import { redirect } from "next/navigation";

import { getWorkspaceHome } from "@/features/account/domain/user-role";
import { getAuthenticatedAccount } from "@/features/account/server/get-authenticated-account";
import { createPublicMetadata } from "@/shared/config/seo";
import { site } from "@/shared/config/site";
import { WaitlistPage } from "../views/waitlist/WaitlistPage";

export const metadata = createPublicMetadata({
  description: site.defaultDescription,
  pathname: "/",
  title: site.defaultTitle,
});

export default async function Page() {
  const account = await getAuthenticatedAccount();

  if (account) {
    redirect(account.role === null ? "/onboarding" : getWorkspaceHome(account.role));
  }

  return <WaitlistPage />;
}
