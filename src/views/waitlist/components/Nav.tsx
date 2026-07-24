"use client";

import { BookOpen } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { INK, OXBLOOD, SANS, SERIF, premiumEase } from "../../../shared/config/design-tokens";

export function Nav() {
  const reduceMotion = useReducedMotion();

  return (
    <>
      {/* Nav */}
    <motion.nav
      className="sticky top-0 z-20 border-b px-6 md:px-12 py-4 flex items-center justify-between"
      style={{ borderColor: "rgba(28,24,18,0.1)", background: "rgba(245,240,232,0.94)", backdropFilter: "blur(8px)" }}
      initial={reduceMotion ? false : { opacity: 0, y: -10 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: premiumEase }}
    >
      <div className="flex items-center gap-2.5">
        <BookOpen size={16} strokeWidth={1.5} style={{ color: OXBLOOD }} />
        <span className="text-base font-semibold" style={{ fontFamily: SERIF, color: INK }}>
          BetaManuscript
        </span>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <Link
          href="/login"
          className="text-xs transition-colors hover:opacity-65 sm:text-sm"
          style={{ color: INK, fontFamily: SANS }}
        >
          Log in
        </Link>
        <Link
          href="/signup"
          className="border px-3 py-2 text-xs transition-colors hover:bg-black/[0.04] sm:px-4 sm:text-sm"
          style={{ borderColor: "rgba(28,24,18,0.2)", color: INK, fontFamily: SANS }}
        >
          Start for free
        </Link>
      </div>
    </motion.nav>


    </>
  );
}
