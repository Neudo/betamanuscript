"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { INK, SANS, premiumEase } from "../../../shared/config/design-tokens";

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
      <Link href="/" className="flex items-center" aria-label="BetaManuscript home">
        <Image
          src="/logo-full.svg"
          alt="BetaManuscript"
          width={303}
          height={90}
          priority
          className="h-8 w-auto"
        />
      </Link>
      <Link
        href="/pricing"
        className="absolute left-1/2 hidden -translate-x-1/2 text-xs transition-colors hover:opacity-65 md:block"
        style={{ color: INK, fontFamily: SANS }}
      >
        Pricing
      </Link>
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
