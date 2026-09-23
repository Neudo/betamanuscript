import { createPublicMetadata } from "@/shared/config/seo";
import { ShareManuscriptWithBetaReadersPage } from "@/views/use-cases/ShareManuscriptWithBetaReadersPage";

export const metadata = createPublicMetadata({
  description: "Share your manuscript with beta readers using private invitations or a reading link, then keep progress and feedback connected to the same beta round.",
  pathname: "/use-cases/share-manuscript-with-beta-readers",
  title: "Share a Manuscript with Beta Readers | BetaManuscript",
});

export default function Page() {
  return <ShareManuscriptWithBetaReadersPage />;
}
