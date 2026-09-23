import { createPublicMetadata } from "@/shared/config/seo";
import { TrackBetaReaderProgressPage } from "@/views/use-cases/TrackBetaReaderProgressPage";

export const metadata = createPublicMetadata({
  description: "See which beta readers have started, completed their round, and left feedback without chasing readers for updates.",
  pathname: "/use-cases/track-beta-reader-progress",
  title: "Track Beta Reader Progress | BetaManuscript",
});

export default function Page() {
  return <TrackBetaReaderProgressPage />;
}
