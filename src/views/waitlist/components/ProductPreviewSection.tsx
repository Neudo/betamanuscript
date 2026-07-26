import { ProductMockup, TAGS, TagBadge, type TagKey } from "../../../features/product-preview";
import { SectionLabel } from "../../../shared/ui/SectionLabel";
import { Lift, Reveal } from "../../../shared/ui/motion";
import { BODY, CARD, INK, MONO, MUTED, OXBLOOD, PAPER, SANS, SERIF } from "../../../shared/config/design-tokens";
import Link from "next/link";

export function ProductPreviewSection() {
  return (
    <>
      {/* ── Product preview ───────────────────────────────────────────────────── */}
    <section
      className="relative z-10 border-t"
      style={{ borderColor: "rgba(28,24,18,0.1)" }}
    >
      <div className="px-6 md:px-12 py-20 max-w-5xl mx-auto">
        <Reveal>
          <SectionLabel>Product preview</SectionLabel>
        </Reveal>
        <Reveal delay={0.08} className="grid md:grid-cols-[280px_1fr] gap-12 items-start mb-8">
          <div>
            <h2
              className="mb-4 leading-snug"
              style={{
                fontFamily: SERIF,
                fontSize: "clamp(1.6rem, 2.5vw, 2.1rem)",
                fontWeight: 400,
                color: INK,
                letterSpacing: "-0.015em",
              }}
            >
              Structured feedback.
              <br />
              <em>Clear priorities.</em>
            </h2>
            <p className="text-sm leading-relaxed mb-5" style={{ color: "#6B6456" }}>
              Readers annotate directly in the text. You see which passages repeated across
              readers, what landed, and what needs work — all in one place.
            </p>
            <div className="space-y-2.5">
              {[
                { tag: "confusing" as TagKey },
                { tag: "strong" as TagKey },
                { tag: "pacing" as TagKey },
                { tag: "missing" as TagKey },
                { tag: "emotional" as TagKey },
              ].map(({ tag }) => (
                <div key={tag} className="flex items-center gap-2">
                  <TagBadge tag={tag} />
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            {/* Annotation examples — styled as real marked-up text */}
            <Lift
              className="p-6 border"
              style={{ borderColor: "rgba(28,24,18,0.12)", background: CARD }}
            >
              <div className="text-[9px] uppercase tracking-widest mb-4" style={{ fontFamily: MONO, color: MUTED }}>
                What readers see when they read
              </div>
              <p
                className="leading-[2] mb-1"
                style={{ fontFamily: SERIF, fontSize: "0.95rem", color: INK }}
              >
                The cartographer spread his maps across the table,{" "}
                <span style={{ background: TAGS.confusing.bg, borderBottom: `1.5px solid ${TAGS.confusing.color}`, padding: "0 2px" }}>
                  each one a different lie
                </span>
                <span className="text-[9px] ml-1 align-super" style={{ fontFamily: MONO, color: TAGS.confusing.color }}>3</span>
                . &ldquo;I mapped the world as it should be,&rdquo;{" "}
                <span style={{ background: TAGS.strong.bg, borderBottom: `1.5px solid ${TAGS.strong.color}`, padding: "0 2px" }}>
                  he said, his voice carrying the weight of thirty years
                </span>
                <span className="text-[9px] ml-1 align-super" style={{ fontFamily: MONO, color: TAGS.strong.color }}>4</span>
                .{" "}
                <span style={{ background: TAGS.pacing.bg, borderBottom: `1.5px solid ${TAGS.pacing.color}`, padding: "0 2px" }}>
                  The commission had seemed straightforward
                </span>
                <span className="text-[9px] ml-1 align-super" style={{ fontFamily: MONO, color: TAGS.pacing.color }}>2</span>
                {" "}enough when the guild first approached him.
              </p>
              <div className="flex gap-1.5 flex-wrap mt-3">
                {(Object.keys(TAGS) as TagKey[]).map((k) => <TagBadge key={k} tag={k} />)}
              </div>
            </Lift>

            {/* Revision priority summary */}
            <Lift
              className="p-6 border"
              style={{ borderColor: "rgba(28,24,18,0.12)", background: CARD }}
            >
              <div className="text-[9px] uppercase tracking-widest mb-4" style={{ fontFamily: MONO, color: MUTED }}>
                What you see in the revision dashboard
              </div>
              <div className="space-y-3">
                {[
                  { tag: "confusing" as TagKey, count: 18, note: "6 passages across Ch 3, 5, 7" },
                  { tag: "pacing" as TagKey, count: 11, note: "Guild intro and mid-chapter" },
                  { tag: "strong" as TagKey, count: 21, note: "Strongest response in the draft" },
                ].map((row) => (
                  <div key={row.tag}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <TagBadge tag={row.tag} />
                        <span className="text-[10px]" style={{ color: BODY }}>{row.note}</span>
                      </div>
                      <span className="text-[10px] font-medium" style={{ fontFamily: MONO, color: INK }}>{row.count}</span>
                    </div>
                    <div className="h-0.5" style={{ background: "rgba(28,24,18,0.08)" }}>
                      <div style={{ width: `${(row.count / 21) * 100}%`, height: "100%", background: TAGS[row.tag].bar, opacity: 0.65 }} />
                    </div>
                  </div>
                ))}
              </div>
            </Lift>
          </div>
        </Reveal>
        <ProductMockup />
        <Reveal delay={0.16} className="mt-10">
          <div className="flex flex-col items-center border-t pt-8 text-center" style={{ borderColor: "rgba(28,24,18,0.12)" }}>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center border px-6 py-3 text-sm font-medium transition-transform hover:-translate-y-0.5 hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8b1a1a]"
              style={{ background: OXBLOOD, borderColor: OXBLOOD, color: PAPER, fontFamily: SANS }}
            >
              Get started for free
            </Link>
          </div>
        </Reveal>
      </div>
    </section>


    </>
  );
}
