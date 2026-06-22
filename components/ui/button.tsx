"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { HTMLMotionProps } from "motion/react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "nav";
type ButtonSize = "sm" | "md" | "lg" | "icon";

type ButtonProps = Omit<HTMLMotionProps<"button">, "children"> & {
  children: ReactNode;
  loading?: boolean;
  loadingLabel?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-accent-foreground shadow-[0_8px_18px_color-mix(in_srgb,var(--color-accent)_24%,transparent)] hover:bg-accent-dark",
  secondary:
    "border border-border bg-surface text-text-primary shadow-[0_1px_2px_color-mix(in_srgb,var(--color-overlay)_5%,transparent)] hover:border-accent hover:text-accent",
  ghost:
    "bg-transparent text-text-secondary hover:bg-surface-secondary hover:text-text-primary",
  nav: "bg-transparent text-text-secondary hover:text-accent",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-[13px]",
  md: "h-10 px-4 text-[14px]",
  lg: "h-11 px-5 text-[14px]",
  icon: "size-9 p-0 text-[14px]",
};

export function Button({
  children,
  className = "",
  loading = false,
  loadingLabel,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.button
      type={type}
      whileTap={shouldReduceMotion || props.disabled ? undefined : { scale: 0.97 }}
      animate={
        loading && !shouldReduceMotion
          ? {
              scale: [1, 1.012, 1],
              boxShadow: [
                "0 0 0 color-mix(in_srgb,var(--color-accent)_0%,transparent)",
                "0 0 18px color-mix(in_srgb,var(--color-accent)_28%,transparent)",
                "0 0 0 color-mix(in_srgb,var(--color-accent)_0%,transparent)",
              ],
            }
          : { scale: 1 }
      }
      transition={
        loading && !shouldReduceMotion
          ? { duration: 1.15, repeat: Infinity, ease: "easeInOut" }
          : { duration: 0.16 }
      }
      className={`relative inline-flex max-w-full items-center justify-center gap-2 overflow-hidden whitespace-normal rounded-md text-center font-medium leading-5 transition disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {loading && !shouldReduceMotion ? (
        <motion.span
          aria-hidden="true"
          className="absolute inset-y-0 -left-1/2 w-1/2 bg-[linear-gradient(90deg,transparent,color-mix(in_srgb,var(--color-accent-foreground)_22%,transparent),transparent)]"
          animate={{ x: ["0%", "320%"] }}
          transition={{ duration: 1.05, repeat: Infinity, ease: "easeInOut" }}
        />
      ) : null}
      <span className="relative inline-flex min-w-0 items-center justify-center gap-2">
        {loading ? <span aria-hidden="true" className="loading-spinner" /> : null}
        {loading ? loadingLabel ?? children : children}
      </span>
    </motion.button>
  );
}
