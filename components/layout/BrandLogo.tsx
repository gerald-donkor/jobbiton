"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";

export function BrandLogo() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <Link
      href="/"
      aria-label="Jobbiton home"
      className="group inline-flex items-center gap-3 text-text-darkest transition-colors hover:text-accent"
    >
      <motion.span
        aria-hidden="true"
        className="brand-logo-mark"
        whileHover={shouldReduceMotion ? undefined : { rotate: -2, scale: 1.04 }}
        whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
        transition={{ type: "spring", stiffness: 420, damping: 24 }}
      >
        <span className="brand-logo-briefcase">
          <span className="brand-logo-handle" />
          <span className="brand-logo-latch" />
        </span>
        <span className="brand-logo-spark" />
      </motion.span>
      <span className="hidden text-[19px] font-bold leading-7 min-[380px]:inline">
        Jobbiton
      </span>
    </Link>
  );
}
