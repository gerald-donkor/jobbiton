"use client";

import type { ReactNode } from "react";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";

type ScrollFloatDirection = "up" | "down" | "left" | "right";

type ScrollFloatProps = {
  children: ReactNode;
  className?: string;
  direction?: ScrollFloatDirection;
  intensity?: number;
  scale?: boolean;
};

export function ScrollFloat({
  children,
  className = "",
  direction = "up",
  intensity = 34,
  scale = false,
}: ScrollFloatProps) {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const easedProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    mass: 0.35,
  });
  const horizontal = direction === "left" || direction === "right";
  const start = direction === "left" || direction === "up" ? intensity : -intensity;
  const end = direction === "left" || direction === "up" ? -intensity : intensity;
  const movement = useTransform(easedProgress, [0, 1], [start, end]);
  const scaleValue = useTransform(easedProgress, [0, 0.5, 1], [0.98, 1, 0.99]);
  const opacity = useTransform(easedProgress, [0, 0.14, 0.86, 1], [0.78, 1, 1, 0.84]);

  return (
    <motion.div
      ref={ref}
      className={className}
      style={
        shouldReduceMotion
          ? undefined
          : {
              opacity,
              scale: scale ? scaleValue : undefined,
              x: horizontal ? movement : undefined,
              y: horizontal ? undefined : movement,
            }
      }
    >
      {children}
    </motion.div>
  );
}

export function ScrollProgressBand() {
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 34,
    mass: 0.35,
  });

  if (shouldReduceMotion) {
    return null;
  }

  return (
    <div aria-hidden="true" className="sticky top-0 z-20 h-px w-full bg-border">
      <motion.div
        className="h-px origin-left bg-accent"
        style={{ scaleX }}
      />
    </div>
  );
}
