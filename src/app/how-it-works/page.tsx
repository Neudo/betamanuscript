import type { Metadata } from "next";

import { HowItWorksPage } from "@/views/how-it-works/HowItWorksPage";

export const metadata: Metadata = {
  title: "How BetaManuscript Works | Beta Reader Feedback",
  description:
    "See how BetaManuscript helps authors invite beta readers, collect passage-level feedback, recognize recurring issues, and plan clearer manuscript revisions.",
};

export default function Page() {
  return <HowItWorksPage />;
}
