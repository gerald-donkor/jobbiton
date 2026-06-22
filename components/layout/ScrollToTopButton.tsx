"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

export function ScrollToTopButton() {
  const shouldReduceMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = () => {
      const scrollableHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      setIsVisible(window.scrollY > 520 && scrollableHeight > 760);
    };

    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    window.addEventListener("resize", updateVisibility);

    return () => {
      window.removeEventListener("scroll", updateVisibility);
      window.removeEventListener("resize", updateVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: shouldReduceMotion ? "auto" : "smooth",
    });
  };

  return (
    <AnimatePresence>
      {isVisible ? (
        <motion.button
          type="button"
          aria-label="Scroll to top"
          className="scroll-top-glass fixed bottom-5 right-5 z-50 flex size-12 items-center justify-center rounded-full text-accent transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:bottom-7 sm:right-7 sm:size-13"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 12, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.92 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.18, ease: "easeOut" }}
          onClick={scrollToTop}
        >
          <span className="scroll-top-glass-shine" aria-hidden="true" />
          <span className="scroll-top-arrow" aria-hidden="true" />
        </motion.button>
      ) : null}
    </AnimatePresence>
  );
}
