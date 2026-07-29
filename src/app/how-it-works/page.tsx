import { createPublicMetadata } from "@/shared/config/seo";
import { HowItWorksPage } from "@/views/how-it-works/HowItWorksPage";

export const metadata = createPublicMetadata({
  title: "How BetaManuscript Works | Beta Reader Feedback",
  description:
    "See how BetaManuscript helps authors invite beta readers, collect passage-level feedback, recognize recurring issues, and plan clearer manuscript revisions.",
  pathname: "/how-it-works",
});

export default function Page() {
  return <HowItWorksPage />;
}
