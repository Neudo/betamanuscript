import { createPublicMetadata } from "@/shared/config/seo";
import { site } from "@/shared/config/site";
import { WaitlistPage } from "../views/waitlist/WaitlistPage";

export const metadata = createPublicMetadata({
  description: site.defaultDescription,
  pathname: "/",
  title: site.defaultTitle,
});

export default function Page() {
  return <WaitlistPage />;
}
