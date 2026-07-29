import { createPublicMetadata } from "@/shared/config/seo";
import { PricingPage } from "@/views/pricing/PricingPage";

export const metadata = createPublicMetadata({
  title: "Pricing for Authors | BetaManuscript",
  description:
    "Start beta reading for free, then upgrade for unlimited manuscripts, readers, surveys, and custom annotation tags.",
  pathname: "/pricing",
});

export default function Page() {
  return <PricingPage />;
}
