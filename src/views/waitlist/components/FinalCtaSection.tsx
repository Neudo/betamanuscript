"use client";

import { Check } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { WaitlistForm } from "../../../features/waitlist";
import { Reveal } from "../../../shared/ui/motion";
import { INK, MONO, PAPER, SERIF, SANS, premiumEase } from "../../../shared/config/design-tokens";

export function FinalCtaSection() {
  const reduceMotion = useReducedMotion();

  return (
    <>
      {/* ── Final CTA ────────────────────────────────────────────────────────── */}
    <section
      id="cta"
      className="relative z-10 border-t"
      style={{ borderColor: "rgba(28,24,18,0.1)", background: INK }}
    >
      <div className="px-6 md:px-12 py-24 max-w-5xl mx-auto">
        <Reveal className="grid md:grid-cols-[1fr_420px] gap-16 items-start">
          <div>
            <div className="w-8 h-px mb-8" style={{ background: "rgba(245,240,232,0.25)" }} />
            <h2
              className="mb-5 leading-tight"
              style={{
                fontFamily: SERIF,
                fontSize: "clamp(2rem, 4vw, 3rem)",
                fontWeight: 400,
                color: PAPER,
                letterSpacing: "-0.02em",
              }}
            >
              Help shape a better beta reading workflow.
            </h2>
            <p
              className="text-base leading-relaxed mb-4 max-w-md"
              style={{ color: "rgba(245,240,232,0.65)", fontWeight: 300, lineHeight: 1.65 }}
            >
              I&apos;m currently talking with indie authors, book coaches, and editors to
              understand what actually hurts during beta reading.
            </p>
            <p
              className="text-sm leading-relaxed max-w-sm"
              style={{ color: "rgba(245,240,232,0.45)", fontWeight: 300 }}
            >
              If you join the waitlist, I&apos;ll follow up personally — not with a marketing
              sequence, but with one question about your workflow. You&apos;ll also receive
              a launch discount code when BetaQuill is released.
            </p>
            <div
              className="mt-12 pl-5 border-l"
              style={{ borderColor: "rgba(245,240,232,0.15)" }}
            >
              <p
                className="italic leading-relaxed"
                style={{
                  fontFamily: SERIF,
                  fontSize: "1.1rem",
                  color: "rgba(245,240,232,0.55)",
                }}
              >
                &ldquo;After my last beta round I had 47 Google Docs comment threads, three
                spreadsheets, and no idea which problems were real. I needed a way to
                separate signal from noise.&rdquo;
              </p>
              <div className="text-[10px] mt-3" style={{ fontFamily: MONO, color: "rgba(245,240,232,0.3)" }}>
                — An indie fantasy author who helped shape this product
              </div>
            </div>
          </div>

          <div className="pt-1">
            <div
              className="text-sm mb-4"
              style={{ color: "rgba(245,240,232,0.75)", fontFamily: SANS }}
            >
              Request early access
            </div>
            <WaitlistForm label="Get early access" dark={true} />
            <p className="text-[11px] mt-3" style={{ color: "rgba(245,240,232,0.28)", fontFamily: MONO }}>
              No cost during beta. Launch discount reserved. Unsubscribe anytime.
            </p>
            <div className="mt-10 space-y-4">
              {[
                "Your manuscript stays private — no public sharing",
                "Structured annotations, not open-ended comment threads",
                "Revision priorities built from reader frequency, not guesswork",
                "Designed for indie authors, not publishing houses",
              ].map((point, i) => (
                <motion.div
                  key={i}
                  className="flex items-start gap-3"
                  initial={reduceMotion ? false : { opacity: 0, x: -8 }}
                  whileInView={reduceMotion ? undefined : { opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.45, delay: i * 0.04, ease: premiumEase }}
                >
                  <Check size={11} strokeWidth={2.5} className="flex-shrink-0 mt-1" style={{ color: "rgba(245,240,232,0.35)" }} />
                  <span className="text-sm" style={{ color: "rgba(245,240,232,0.45)", lineHeight: 1.55 }}>
                    {point}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>


    </>
  );
}
