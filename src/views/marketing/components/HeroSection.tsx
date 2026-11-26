import { PublicManuscriptDropzone } from "@/features/manuscript/components/PublicManuscriptDropzone";
import { BODY, INK, SERIF } from "../../../shared/config/design-tokens";
import { Heading } from "@/shared/ui/Heading";

export function HeroSection() {
  return (
    <section
      className="relative z-10 mx-auto max-w-4xl px-6 pb-28 pt-20 md:px-12"
    >
      <div className="max-w-2xl">
        <Heading
          level={1}
          className="mb-6 leading-[1.08]"
          style={{
            fontFamily: SERIF,
            fontSize: "clamp(2.6rem, 5.5vw, 4.2rem)",
            fontWeight: 400,
            color: INK,
            letterSpacing: "-0.02em",
          }}
        >
          Turn beta reader feedback into{" "}
          <em>clearer revisions.</em>
        </Heading>
        <p
          className="text-lg leading-relaxed"
          style={{ color: BODY, fontWeight: 300, lineHeight: 1.65 }}
        >
          BetaManuscript is a beta reading platform for authors to manage readers, collect
          private annotations, and review chapter surveys in one place.
        </p>
      </div>
      <div className="max-w-[46rem]">
        <PublicManuscriptDropzone />
      </div>
    </section>
  );
}
