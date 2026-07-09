import { FileText, ListChecks, MessageSquare, Tag } from "lucide-react";
import { SectionLabel } from "../../../shared/ui/SectionLabel";
import { Lift, Reveal } from "../../../shared/ui/motion";
import { CARD, FOREST, INK, MONO, MUTED, OXBLOOD, PAPER, SERIF } from "../../../shared/config/design-tokens";

export function FeaturesSection() {
  return (
    <>
      {/* ── Features ─────────────────────────────────────────────────────────── */}
    <section
      className="relative z-10 border-t"
      style={{ borderColor: "rgba(28,24,18,0.1)" }}
    >
      <div className="px-6 md:px-12 py-20 max-w-5xl mx-auto">
        <Reveal>
          <SectionLabel>Features</SectionLabel>
          <h2
            className="mb-12 max-w-xl"
            style={{
              fontFamily: SERIF,
              fontSize: "clamp(1.8rem, 3vw, 2.5rem)",
              fontWeight: 400,
              color: INK,
              letterSpacing: "-0.015em",
            }}
          >
            Built for authors who want signal,
            <em> not more noise.</em>
          </h2>
        </Reveal>
        <div className="grid sm:grid-cols-2 gap-px" style={{ background: "rgba(28,24,18,0.1)" }}>
          {[
            {
              Icon: MessageSquare,
              title: "Structured annotations",
              tag: "Core",
              detail:
                "Readers mark what works, what doesn't, and why — directly in the text. Every note is tied to a passage, a chapter, and a tag. No free-floating comments.",
            },
            {
              Icon: Tag,
              title: "Feedback tags",
              tag: "Core",
              detail:
                "Filter annotations by pacing, character, worldbuilding, prose, confusion, and more. See which categories appear most, and where in the manuscript.",
            },
            {
              Icon: FileText,
              title: "Reader surveys",
              tag: "Coming soon",
              detail:
                "Add end-of-chapter or end-of-book questions to collect structured responses alongside in-text notes. Set your own questions or use templates.",
            },
            {
              Icon: ListChecks,
              title: "Revision dashboard",
              tag: "Core",
              detail:
                "See repeated issues and strongest moments at a glance. Export a prioritized revision list based on reader frequency, not gut feeling.",
            },
          ].map((card, i) => (
            <Lift key={i} className="p-8" style={{ background: PAPER }}>
              <div className="flex items-start justify-between mb-5">
                <div
                  className="w-9 h-9 flex items-center justify-center border"
                  style={{ borderColor: "rgba(28,24,18,0.14)", background: CARD, color: OXBLOOD }}
                >
                  <card.Icon size={16} strokeWidth={1.5} />
                </div>
                <span
                  className="text-[9px] px-1.5 py-0.5 uppercase tracking-wide"
                  style={{
                    fontFamily: MONO,
                    background: card.tag === "Core" ? "rgba(44,62,45,0.1)" : "rgba(28,24,18,0.06)",
                    color: card.tag === "Core" ? FOREST : MUTED,
                  }}
                >
                  {card.tag}
                </span>
              </div>
              <h3
                className="mb-3"
                style={{ fontFamily: SERIF, fontSize: "1.15rem", fontWeight: 500, color: INK }}
              >
                {card.title}
              </h3>
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
