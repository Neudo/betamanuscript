import { ReadingView } from "@/features/reading/components/ReadingView";

type ReadingPageProps = {
  params: Promise<{ manuscriptId: string }>;
};

export default async function ReadingPage({ params }: ReadingPageProps) {
  const { manuscriptId: manuscriptReference } = await params;

  return <ReadingView manuscriptReference={manuscriptReference} />;
}
