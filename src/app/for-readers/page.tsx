import { createPublicMetadata } from "@/shared/config/seo";
import { ForReadersPage } from "@/views/for-readers/ForReadersPage";

export const metadata = createPublicMetadata({
  title: "For Beta Readers: Read and Share Manuscript Feedback | BetaManuscript",
  description:
    "Open an author’s invitation, read their manuscript chapter by chapter, leave passage-level feedback, and answer beta reader surveys for free.",
  pathname: "/for-readers",
});

export default function Page() {
  return <ForReadersPage />;
}
