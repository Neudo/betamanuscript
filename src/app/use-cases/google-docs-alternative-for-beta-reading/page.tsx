import { createPublicMetadata } from "@/shared/config/seo";
import { GoogleDocsAlternativePage } from "@/views/use-cases/GoogleDocsAlternativePage";

export const metadata = createPublicMetadata({
  description: "Looking for a Google Docs alternative for beta reading? Keep reader feedback separate, track progress, run surveys, and review recurring issues in one workspace.",
  pathname: "/use-cases/google-docs-alternative-for-beta-reading",
  title: "Google Docs Alternative for Beta Reading | BetaManuscript",
});

export default function Page() {
  return <GoogleDocsAlternativePage />;
}
