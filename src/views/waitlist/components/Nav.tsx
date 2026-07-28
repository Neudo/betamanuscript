"use client";

import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { INK, SANS, premiumEase } from "../../../shared/config/design-tokens";
import { BrandLogo } from "@/components/BrandLogo";

export function Nav() {
  const reduceMotion = useReducedMotion();

  return (
    <>
      {/* Nav */}
    <motion.nav
      className="sticky top-0 z-20 flex items-center justify-between border-b px-6 py-4 md:px-12"
      style={{ borderColor: "rgba(28,24,18,0.1)", background: "rgba(245,240,232,0.94)", backdropFilter: "blur(8px)" }}
      initial={reduceMotion ? false : { opacity: 0, y: -10 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: premiumEase }}
    >
      <BrandLogo href="/" priority imageClassName="h-8" />
      <div
        className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-6 text-xs md:flex"
        style={{ color: INK, fontFamily: SANS }}
      >
        <Link href="/how-it-works" className="transition-colors hover:opacity-65">
          How it works
        </Link>
        <Link href="/for-readers" className="transition-colors hover:opacity-65">
          For readers
        </Link>
        <Link href="/pricing" className="transition-colors hover:opacity-65">
          Pricing
        </Link>
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
