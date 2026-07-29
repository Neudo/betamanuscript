import { FileText, ListChecks, MessageSquare, Tag } from "lucide-react";
import { SectionLabel } from "../../../shared/ui/SectionLabel";
import { Lift, Reveal } from "../../../shared/ui/motion";
import { CARD, OXBLOOD, PAPER } from "../../../shared/config/design-tokens";
import { Heading } from "@/shared/ui/Heading";

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
          <Heading level={2} size="page" className="mb-12 max-w-xl">
            Built for authors who want signal,
            <em> not more noise.</em>
          </Heading>
        </Reveal>
        <div className="grid sm:grid-cols-2 gap-px" style={{ background: "rgba(28,24,18,0.1)" }}>
          {[
            {
              Icon: MessageSquare,
              title: "Structured annotations",
              detail:
                "Readers mark what works, what doesn't, and why — directly in the text. Every note is tied to a passage, a chapter, and a tag. No free-floating comments.",
            },
            {
              Icon: Tag,
              title: "Feedback tags",
              detail:
                "Filter annotations by pacing, character, worldbuilding, prose, confusion, and more. See which categories appear most, and where in the manuscript.",
            },
            {
              Icon: FileText,
              title: "Reader surveys",
              detail:
                "Add end-of-chapter or end-of-book questions to collect structured responses alongside in-text notes. Set your own questions or use templates.",
            },
            {
              Icon: ListChecks,
              title: "Revision dashboard",
              detail:
                "Review annotations by tag and chapter, so recurring feedback is easier to assess when you revise.",
            },
          ].map((card, i) => (
            <Lift key={i} className="p-8" style={{ background: PAPER }}>
              <div className="mb-5">
                <div
                  className="w-9 h-9 flex items-center justify-center border"
                  style={{ borderColor: "rgba(28,24,18,0.14)", background: CARD, color: OXBLOOD }}
                >
                  <card.Icon size={16} strokeWidth={1.5} />
                </div>
              </div>
              <Heading level={3} size="feature" className="mb-3">
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
