import { createPublicMetadata } from "@/shared/config/seo";
import { OrganizeBetaReaderFeedbackPage } from "@/views/use-cases/OrganizeBetaReaderFeedbackPage";

export const metadata = createPublicMetadata({
  description: "Keep beta reader annotations, surveys, chapters, and feedback categories organized so you can identify recurring issues and prioritize manuscript revisions.",
  pathname: "/use-cases/organize-beta-reader-feedback",
  title: "Organize Beta Reader Feedback Before You Revise | BetaManuscript",
});

export default function Page() {
  return <OrganizeBetaReaderFeedbackPage />;
}
