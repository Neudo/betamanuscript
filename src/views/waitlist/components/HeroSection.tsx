"use client";

import { motion, useReducedMotion } from "motion/react";
import { PublicManuscriptDropzone } from "@/features/manuscript/components/PublicManuscriptDropzone";
import { BODY, INK, SERIF, premiumEase } from "../../../shared/config/design-tokens";
import { Heading } from "@/shared/ui/Heading";

export function HeroSection() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      className="relative z-10 mx-auto max-w-4xl px-6 pb-28 pt-20 md:px-12"
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={reduceMotion ? undefined : { opacity: 1 }}
      transition={{ duration: 0.55, ease: premiumEase }}
    >
      <motion.div
        className="max-w-2xl"
        initial={reduceMotion ? false : { opacity: 0, y: 18, filter: "blur(4px)" }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.82, delay: 0.08, ease: premiumEase }}
      >
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
          Invite readers, collect structured annotations, spot repeated issues, and understand
          what works before you publish.
        </p>
      </motion.div>
      <motion.div
        className="max-w-[46rem]"
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.72, delay: 0.18, ease: premiumEase }}
      >
        <PublicManuscriptDropzone />
      </motion.div>
    </motion.section>
  );
}
