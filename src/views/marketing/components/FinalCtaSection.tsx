import { Check } from "lucide-react";
import Link from "next/link";
import { INVERSE_BACKGROUND, INVERSE_FOREGROUND, INVERSE_MUTED, MONO, OXBLOOD, SERIF, SANS } from "../../../shared/config/design-tokens";
import { Heading } from "@/shared/ui/Heading";

export function FinalCtaSection() {
  return (
    <>
      {/* ── Final CTA ────────────────────────────────────────────────────────── */}
    <section
      id="cta"
      className="relative z-10 border-t"
      style={{ borderColor: "hsl(var(--border) / 0.72)", background: INVERSE_BACKGROUND }}
    >
      <div className="px-6 md:px-12 py-24 max-w-5xl mx-auto">
        <div className="grid md:grid-cols-[1fr_420px] gap-16 items-start">
          <div>
            <div className="w-8 h-px mb-8" style={{ background: "hsl(var(--inverse-foreground) / 0.25)" }} />
            <Heading
              level={2}
              className="mb-5 leading-tight"
              style={{
                fontFamily: SERIF,
                fontSize: "clamp(2rem, 4vw, 3rem)",
                fontWeight: 400,
                color: INVERSE_FOREGROUND,
                letterSpacing: "-0.02em",
              }}
            >
              Bring clarity to your next beta reading round.
            </Heading>
            <p
              className="text-base leading-relaxed mb-4 max-w-md"
              style={{ color: INVERSE_MUTED, fontWeight: 300, lineHeight: 1.65 }}
            >
              Organize your manuscript, invite the readers you trust, and keep their feedback
              connected to the passages that need your attention.
            </p>
            <p
              className="text-sm leading-relaxed max-w-sm"
              style={{ color: INVERSE_MUTED, fontWeight: 300 }}
            >
              Review tagged annotations by chapter and category, notice the patterns across
              readers, and move into revision with a clearer sense of what matters.
            </p>
            <div
              className="mt-12 pl-5 border-l"
              style={{ borderColor: "hsl(var(--inverse-foreground) / 0.15)" }}
            >
              <p
                className="italic leading-relaxed"
                style={{
                  fontFamily: SERIF,
                  fontSize: "1.1rem",
                  color: INVERSE_MUTED,
                }}
              >
                &ldquo;After my last beta round I had 47 Google Docs comment threads, three
                spreadsheets, and no idea which problems were real. I needed a way to
                separate signal from noise.&rdquo;
              </p>
              <div className="text-[10px] mt-3" style={{ fontFamily: MONO, color: INVERSE_MUTED }}>
                — An indie fantasy author who helped shape this product
              </div>
            </div>
          </div>

          <div className="pt-1">
            <div
              className="text-sm mb-4"
              style={{ color: INVERSE_MUTED, fontFamily: SANS }}
            >
              Start your workspace
            </div>
            <Link
              href="/signup"
              className="inline-flex w-full items-center justify-center border px-6 py-3 text-sm font-medium editorial-action hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              style={{ background: INVERSE_FOREGROUND, borderColor: INVERSE_FOREGROUND, color: OXBLOOD, fontFamily: SANS }}
            >
              Start for free
            </Link>
            <p className="text-[11px] mt-3" style={{ color: INVERSE_MUTED, fontFamily: MONO }}>
              Free to start • No credit card required • Cancel anytime
            </p>
            <div className="mt-10 space-y-4">
              {[
                "Private invitations by default. Enable a shareable reading page for a specific round.",
                "Structured annotations, not open-ended comment threads",
                "Reader feedback patterns, organized in one workspace",
                "Designed for indie authors, not publishing houses",
              ].map((point, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3"
                >
                  <Check size={11} strokeWidth={2.5} className="flex-shrink-0 mt-1" style={{ color: INVERSE_MUTED }} />
                  <span className="text-sm" style={{ color: INVERSE_MUTED, lineHeight: 1.55 }}>
                    {point}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>


    </>
  );
}
