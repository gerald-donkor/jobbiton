"use client";

import { useReducedMotion } from "motion/react";
import { GradientBackground } from "@/components/animate-ui/backgrounds/gradient";
import { HexagonBackground } from "@/components/animate-ui/backgrounds/hexagon";
import { StarsBackground } from "@/components/animate-ui/backgrounds/stars";

export function AppBackgroundEffects() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className="app-background-effects pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <GradientBackground
        className="app-background-gradient absolute inset-0"
        transition={{
          duration: shouldReduceMotion ? 0 : 18,
          ease: "easeInOut",
          repeat: shouldReduceMotion ? 0 : Infinity,
        }}
      />
      <StarsBackground
        className="app-background-stars absolute inset-0 bg-transparent"
        factor={0.032}
        pointerEvents={false}
        speed={shouldReduceMotion ? 100000 : 70}
        starColor="var(--app-background-star-color)"
      />
      <HexagonBackground
        className="app-background-hex app-background-hex-primary absolute right-[-140px] top-[-70px] h-[760px] w-[760px] bg-transparent"
        hexagonMargin={4}
        hexagonSize={82}
        hexagonProps={{
          className: "app-background-hex-cell",
        }}
      />
      <HexagonBackground
        className="app-background-hex app-background-hex-secondary absolute bottom-[-240px] left-[-220px] h-[780px] w-[780px] bg-transparent"
        hexagonMargin={5}
        hexagonSize={96}
        hexagonProps={{
          className: "app-background-hex-cell",
        }}
      />
    </div>
  );
}
