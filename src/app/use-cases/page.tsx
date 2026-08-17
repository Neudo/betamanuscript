import { createPublicMetadata } from "@/shared/config/seo";
import { UseCasesHubPage } from "@/views/use-cases/UseCasesHubPage";

export const metadata = createPublicMetadata({
  description: "See how authors use BetaManuscript to manage multiple beta readers, organize manuscript feedback, and turn reader reactions into clearer revision priorities.",
  pathname: "/use-cases",
  title: "Beta Reading Use Cases for Authors | BetaManuscript",
});

export default function Page() {
  return <UseCasesHubPage />;
}
