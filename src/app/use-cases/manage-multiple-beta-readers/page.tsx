import { createPublicMetadata } from "@/shared/config/seo";
import { ManageMultipleBetaReadersPage } from "@/views/use-cases/ManageMultipleBetaReadersPage";

export const metadata = createPublicMetadata({
  description: "Manage multiple beta readers without juggling separate documents. Invite readers, track progress, collect private manuscript feedback, and identify recurring issues.",
  pathname: "/use-cases/manage-multiple-beta-readers",
  title: "Manage Multiple Beta Readers in One Place | BetaManuscript",
});

export default function Page() {
  return <ManageMultipleBetaReadersPage />;
}
