"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { CARD, INK, MONO, MUTED, PAPER, SERIF, WARM, premiumEase } from "../../../shared/config/design-tokens";
import { PrioritiesPanel } from "./PrioritiesPanel";
import { ReaderPanel } from "./ReaderPanel";

// ─── Product mockup container ─────────────────────────────────────────────────

function ProductMockup() {
  const [tab, setTab] = useState<"reader" | "priorities">("reader");
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="overflow-hidden"
      style={{
        border: "1px solid rgba(28,24,18,0.14)",
        background: CARD,
        boxShadow: "0 16px 56px rgba(28,24,18,0.12), 0 2px 8px rgba(28,24,18,0.06)",
      }}
      initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.992 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.8, ease: premiumEase }}
    >
      {/* Browser chrome */}
      <div
        className="px-4 py-2.5 flex items-center gap-3 border-b"
        style={{ background: WARM, borderColor: "rgba(28,24,18,0.1)" }}
      >
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-2.5 h-2.5 rounded-full" style={{ background: "rgba(28,24,18,0.18)" }} />
          ))}
        </div>
        <div
          className="flex-1 px-3 py-0.5 text-[11px]"
          style={{ background: PAPER, border: "1px solid rgba(28,24,18,0.1)", color: MUTED, fontFamily: MONO }}
        >
          app.betamanuscript.com / manuscripts / the-last-cartographer / feedback
        </div>
      </div>

      {/* App toolbar */}
      <div
        className="px-5 py-2 flex items-center justify-between border-b"
        style={{ borderColor: "rgba(28,24,18,0.08)" }}
      >
        <div className="flex items-baseline gap-3">
          <span className="text-sm font-semibold" style={{ fontFamily: SERIF, color: INK }}>
            The Last Cartographer
          </span>
          <span className="text-[10px]" style={{ fontFamily: MONO, color: MUTED }}>
            Draft 2 · 9 chapters · 5 readers · 64 annotations
          </span>
        </div>
        <div className="flex items-center gap-1">
          {(["reader", "priorities"] as const).map((t) => (
            <motion.button
              key={t}
              onClick={() => setTab(t)}
              className="px-3 py-1 text-[10px] transition-colors cursor-pointer"
              whileHover={reduceMotion ? undefined : { y: -1 }}
              whileTap={reduceMotion ? undefined : { scale: 0.985 }}
              transition={{ duration: 0.24, ease: premiumEase }}
              style={{
                fontFamily: MONO,
                background: tab === t ? INK : "transparent",
                color: tab === t ? PAPER : MUTED,
                border: `1px solid ${tab === t ? INK : "rgba(28,24,18,0.15)"}`,
              }}
            >
              {t === "reader" ? "Reader view" : "Revision priorities"}
            </motion.button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={tab}
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
          transition={{ duration: 0.28, ease: premiumEase }}
        >
          {tab === "reader" ? <ReaderPanel /> : <PrioritiesPanel />}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}





export { ProductMockup };
