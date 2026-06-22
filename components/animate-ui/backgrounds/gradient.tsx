"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import { cn } from "@/lib/utils";

// Adapted from Animate UI Gradient Background:
// https://github.com/imskyleen/animate-ui/tree/main/apps/www/registry/components/backgrounds/gradient
type GradientBackgroundProps = HTMLMotionProps<"div">;

function GradientBackground({
  className,
  transition = { duration: 15, ease: "easeInOut", repeat: Infinity },
  ...props
}: GradientBackgroundProps) {
  return (
    <motion.div
      data-slot="gradient-background"
      className={cn(
        "size-full bg-[linear-gradient(135deg,color-mix(in_srgb,var(--color-background)_52%,var(--color-accent)_48%),color-mix(in_srgb,var(--color-background)_76%,var(--color-surface)_24%)_38%,color-mix(in_srgb,var(--color-background)_50%,var(--color-info)_50%))] bg-[length:400%_400%]",
        className,
      )}
      animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
      transition={transition}
      {...props}
    />
  );
}

export { GradientBackground, type GradientBackgroundProps };
