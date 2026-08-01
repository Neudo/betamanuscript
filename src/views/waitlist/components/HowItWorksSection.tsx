import { BarChart2, ChevronRight, Upload, Users } from "lucide-react";
import { SectionLabel } from "../../../shared/ui/SectionLabel";
import { Lift, Reveal } from "../../../shared/ui/motion";
import { INK, MONO, MUTED, OXBLOOD_TEXT, PAPER, SERIF, WARM } from "../../../shared/config/design-tokens";
import { Heading } from "@/shared/ui/Heading";

export function HowItWorksSection() {
  return (
    <>
      {/* ── How it works ─────────────────────────────────────────────────────── */}
    <section
      className="relative z-10 border-t"
      style={{ borderColor: "hsl(var(--ink) / 0.1)", background: WARM }}
    >
      <div className="px-6 md:px-12 py-20 max-w-5xl mx-auto">
        <Reveal>
          <SectionLabel>How it works</SectionLabel>
          <Heading
            level={2}
            className="mb-14"
            style={{
              fontFamily: SERIF,
              fontSize: "clamp(1.8rem, 3vw, 2.5rem)",
              fontWeight: 400,
              color: INK,
              letterSpacing: "-0.015em",
            }}
          >
            Three steps to a cleaner beta round.
          </Heading>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-12">
          {[
            {
              num: "01",
              Icon: Upload,
              title: "Add your manuscript by chapter",
              detail:
                "Paste or upload your draft. Organize it by chapter so readers move through it in order and feedback is always tied to a specific location.",
            },
            {
              num: "02",
              Icon: Users,
              title: "Invite your beta readers",
              detail:
                "Send invites by email. Readers open their personal invitation, then sign in to read and annotate in their browser.",
            },
            {
              num: "03",
              Icon: BarChart2,
              title: "Review tagged feedback, surveys, and recurring notes",
              detail:
                "Review annotations by tag and chapter. Notice recurring feedback across readers and decide what to revise next.",
            },
          ].map((step, i) => (
            <Lift key={i} className="relative p-4">
              <div className="text-[10px] mb-4" style={{ fontFamily: MONO, color: MUTED }}>
                {step.num}
              </div>
              <div
                className="w-9 h-9 flex items-center justify-center mb-5 border"
                style={{ borderColor: "hsl(var(--ink) / 0.15)", background: PAPER, color: OXBLOOD_TEXT }}
              >
                <step.Icon size={16} strokeWidth={1.5} />
              </div>
              <Heading
                level={3}
                className="mb-3"
                style={{ fontFamily: SERIF, fontSize: "1.15rem", fontWeight: 500, color: INK }}
              >
                {step.title}
              </Heading>
              <p className="text-sm leading-relaxed" style={{ color: "hsl(var(--body))" }}>
                {step.detail}
              </p>
              {i < 2 && (
                <div
                  className="hidden md:block absolute top-5 -right-7"
                  style={{ color: "hsl(var(--ink) / 0.2)" }}
                >
                  <ChevronRight size={13} />
                </div>
              )}
            </Lift>
          ))}
        </div>
      </div>
    </section>


    </>
  );
}
