"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

type PageTransitionProps = {
  children: ReactNode;
};

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={
          shouldReduceMotion
            ? false
            : { opacity: 0, y: 18, scale: 0.992, filter: "blur(8px)" }
        }
        animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
        exit={
          shouldReduceMotion
            ? { opacity: 1 }
            : { opacity: 0, y: -10, scale: 0.996, filter: "blur(4px)" }
        }
        transition={{
          duration: shouldReduceMotion ? 0 : 0.38,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="flex min-h-full flex-col"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
