"use client";

import { CSSProperties, ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { premiumEase } from "../config/design-tokens";

function Reveal({
  children,
  className,
  delay = 0,
  amount = 0.22,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  amount?: number;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 18, filter: "blur(5px)" }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount }}
      transition={{ duration: 0.72, delay, ease: premiumEase }}
    >
      {children}
    </motion.div>
  );
}

function Lift({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      style={style}
      whileHover={
        reduceMotion
          ? undefined
          : {
              y: -3,
              boxShadow:
                "0 18px 48px rgba(28,24,18,0.10), 0 2px 8px rgba(28,24,18,0.05)",
            }
      }
      transition={{ duration: 0.32, ease: premiumEase }}
    >
      {children}
    </motion.div>
  );
}

export { Lift, Reveal };

