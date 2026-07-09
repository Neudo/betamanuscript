"use client";

import { motion, useReducedMotion } from "motion/react";
import { WaitlistForm } from "../../../features/waitlist";
import { TagBadge, type TagKey } from "../../../features/product-preview";
import { BODY, CARD, INK, MONO, MUTED, SERIF, premiumEase } from "../../../shared/config/design-tokens";

export function HeroSection() {
  const reduceMotion = useReducedMotion();

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
    <motion.section
      className="relative z-10 px-6 md:px-12 pt-20 pb-28 max-w-5xl mx-auto"
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={reduceMotion ? undefined : { opacity: 1 }}
      transition={{ duration: 0.55, ease: premiumEase }}
    >
      <div className="grid md:grid-cols-[1fr_380px] gap-16 items-start">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 18, filter: "blur(4px)" }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.82, delay: 0.08, ease: premiumEase }}
        >
          <h1
            className="mb-6 leading-[1.08]"
            style={{
              fontFamily: SERIF,
              fontSize: "clamp(2.6rem, 5.5vw, 4.2rem)",
              fontWeight: 400,
              color: INK,
              letterSpacing: "-0.02em",
            }}
          >
            Turn beta reader feedback into clear{" "}
            <em>revision priorities.</em>
          </h1>
          <p
            className="text-lg mb-2 leading-relaxed max-w-lg"
            style={{ color: BODY, fontWeight: 300, lineHeight: 1.65 }}
          >
            Invite readers, collect structured annotations, spot repeated issues, and understand
            what works before you publish.
          </p>
          
          <div className="max-w-md">
            <WaitlistForm label="Join the waitlist" />
            <p className="text-[11px] mt-3" style={{ color: MUTED, fontFamily: MONO }}>
              Early access, launch discount code, and no spam.
            </p>
          </div>
        </motion.div>

        {/* Right: annotated preview card */}
        <motion.div
          className="hidden md:block"
          initial={reduceMotion ? false : { opacity: 0, y: 22, scale: 0.99 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.82, delay: 0.2, ease: premiumEase }}
        >
          <div
            className="p-5 border"
            style={{ borderColor: "rgba(28,24,18,0.12)", background: CARD }}
          >
            <div className="text-[9px] uppercase tracking-widest mb-3" style={{ fontFamily: MONO, color: MUTED }}>
              Annotation summary — Chapter 3
            </div>
            <div className="space-y-2.5 mb-5">
              {[
                { tag: "confusing" as TagKey, n: 18, note: "Scattered across 6 passages" },
                { tag: "pacing" as TagKey, n: 11, note: "Guild intro and mid-scene" },
                { tag: "missing" as TagKey, n: 9, note: "Context gaps before reveals" },
                { tag: "strong" as TagKey, n: 21, note: "Strongest response in draft" },
              ].map((row) => (
                <div key={row.tag} className="flex items-center justify-between gap-3">
                  <TagBadge tag={row.tag} />
                  <span className="text-[10px] flex-1" style={{ color: BODY }}>{row.note}</span>
                  <span className="text-[10px] font-medium" style={{ fontFamily: MONO, color: INK }}>{row.n}</span>
                </div>
              ))}
            </div>
            <div
              className="pt-4 border-t"
              style={{ borderColor: "rgba(28,24,18,0.08)" }}
            >
              <div className="text-[9px] uppercase tracking-widest mb-2" style={{ fontFamily: MONO, color: MUTED }}>
                Top revision note
              </div>
              <p
                className="text-[12px] leading-relaxed italic"
                style={{ fontFamily: SERIF, color: BODY }}
              >
                &ldquo;The guild confrontation scene loses clarity mid-way. Three readers flagged confusion at the same passage.&rdquo;
              </p>
              <div className="mt-2 text-[9px]" style={{ fontFamily: MONO, color: MUTED }}>
                — generated from 18 reader annotations
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>


    </>
  );
}
