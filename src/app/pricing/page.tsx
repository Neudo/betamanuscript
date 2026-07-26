import type { Metadata } from "next";

import { PricingPage } from "@/views/pricing/PricingPage";

export const metadata: Metadata = {
  title: "Pricing for Authors | BetaManuscript",
  description:
    "Start beta reading for free, then upgrade to unlimited manuscripts, readers, surveys, exports, and advanced revision priorities.",
};

export default function Page() {
  return <PricingPage />;
}
