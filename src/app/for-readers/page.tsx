import type { Metadata } from "next";

import { ForReadersPage } from "@/views/for-readers/ForReadersPage";

export const metadata: Metadata = {
  title: "For Beta Readers: Read and Share Manuscript Feedback | BetaManuscript",
  description:
    "Open an author’s invitation, read their manuscript chapter by chapter, leave passage-level feedback, and answer beta reader surveys for free.",
};

export default function Page() {
  return <ForReadersPage />;
}
