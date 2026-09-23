import { createPublicMetadata } from "@/shared/config/seo";
import { BetaReaderSurveysPage } from "@/views/use-cases/BetaReaderSurveysPage";

export const metadata = createPublicMetadata({
  description: "Ask beta readers structured questions by chapter or manuscript and review survey responses alongside passage-level feedback in the same beta round.",
  pathname: "/use-cases/beta-reader-surveys",
  title: "Beta Reader Surveys & Questionnaires | BetaManuscript",
});

export default function Page() {
  return <BetaReaderSurveysPage />;
}
