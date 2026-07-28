import type { Metadata } from "next";

import { ForReadersPage } from "@/views/for-readers/ForReadersPage";

export const metadata: Metadata = {
  title: "For Beta Readers | BetaManuscript",
  description:
    "Learn how to read a manuscript, leave passage-level feedback, and keep track of your beta reading with BetaManuscript.",
};

export default function Page() {
  return <ForReadersPage />;
}
