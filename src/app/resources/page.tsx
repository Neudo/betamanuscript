import { createPublicMetadata } from "@/shared/config/seo";
import { ResourcesPage } from "@/views/resources/ResourcesPage";

export const metadata = createPublicMetadata({
  description: "Copy a free fantasy beta reader questionnaire, with a short chapter check-in and end-of-book questions about pacing, worldbuilding, and reveals.",
  pathname: "/resources",
  title: "Fantasy Beta Reader Questionnaire (Free Template) | BetaManuscript",
});

export default function Page() {
  return <ResourcesPage />;
}
