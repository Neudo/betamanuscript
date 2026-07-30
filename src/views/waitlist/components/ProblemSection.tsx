import { Lift, Reveal } from "../../../shared/ui/motion";
import { SectionLabel } from "../../../shared/ui/SectionLabel";
import { INK, OXBLOOD, SERIF, WARM } from "../../../shared/config/design-tokens";
import { Heading } from "@/shared/ui/Heading";

export function ProblemSection() {
  return (
    <>
      {/* ── Problem ──────────────────────────────────────────────────────────── */}
    <section
      className="relative z-10 border-t"
      style={{ borderColor: "rgba(28,24,18,0.1)", background: WARM }}
    >
      <div className="px-6 md:px-12 py-20 max-w-5xl mx-auto">
        <Reveal>
          <SectionLabel>The problem</SectionLabel>
          <Heading
            level={2}
            className="mb-4 max-w-2xl"
            style={{
              fontFamily: SERIF,
              fontSize: "clamp(1.8rem, 3vw, 2.5rem)",
              fontWeight: 400,
              color: INK,
              letterSpacing: "-0.015em",
            }}
          >
            Most beta reading rounds generate noise,
            <br />
            <em>not clarity.</em>
          </Heading>
          <p className="mb-12 max-w-xl text-sm leading-6 md:text-base" style={{ color: "#6B6456" }}>
            No AI-generated ideas or rewrites. Just human reader reactions, with you in control of every creative decision.
          </p>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-px" style={{ background: "rgba(28,24,18,0.1)" }}>
          {[
            {
              glyph: "§",
              title: "Google Docs comments get messy fast",
              detail:
                "Threads collapse, notes get buried, and unresolved comments pile up with no way to see what actually mattered to more than one reader.",
            },
            {
              glyph: "¶",
              title: "Feedback is scattered across Discord, email, forms, and notes",
              detail:
                "You spend hours pulling responses together from five different places before you can even start to see what's working and what isn't.",
            },
            {
              glyph: "†",
              title: "It's hard to know which issues actually matter",
              detail:
                "One reader's pet peeve is not the same as a structural problem. Without aggregation, everything looks equally urgent — and nothing gets fixed.",
            },
          ].map((card, i) => (
            <Lift key={i} className="p-8" style={{ background: WARM }}>
              <div
                className="text-2xl mb-5"
                style={{ fontFamily: SERIF, color: OXBLOOD, opacity: 0.55 }}
              >
                {card.glyph}
              </div>
              <Heading
                level={3}
                className="mb-3 leading-snug"
                style={{ fontFamily: SERIF, fontSize: "1.1rem", fontWeight: 500, color: INK }}
              >
                {card.title}
              </Heading>
              <p className="text-sm leading-relaxed" style={{ color: "#6B6456" }}>
                {card.detail}
              </p>
            </Lift>
          ))}
        </div>
      </div>
    </section>


    </>
  );
}
