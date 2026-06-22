"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useReducedMotion,
} from "motion/react";
import { AppBackgroundEffects } from "@/components/loading/AppBackgroundEffects";
import { ScrollToTopButton } from "@/components/layout/ScrollToTopButton";

type PageTransitionProps = {
  children: ReactNode;
};

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative isolate min-h-full overflow-x-hidden">
        <AppBackgroundEffects />
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={pathname}
            initial={
              shouldReduceMotion
                ? false
                : { opacity: 0 }
            }
            animate={{ opacity: 1 }}
            exit={
              shouldReduceMotion
                ? { opacity: 1 }
                : { opacity: 0 }
            }
            transition={{
              duration: shouldReduceMotion ? 0 : 0.38,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative z-10 flex min-h-full flex-col"
          >
            {children}
          </motion.div>
        </AnimatePresence>
        <ScrollToTopButton />
      </div>
    </MotionConfig>
  );
}
