"use client";

import { AnimatePresence, motion } from "motion/react";

export type ProcessOverlayVariant =
  | "auth"
  | "jobs"
  | "resume-extract"
  | "resume-generate"
  | "resume-upload"
  | "save";

type ProcessOverlayProps = {
  active: boolean;
  variant: ProcessOverlayVariant;
  title: string;
  description: string;
  steps?: string[];
};

const DEFAULT_STEPS = ["Preparing", "Processing", "Finalizing"];
const BAR_KEYS = ["first", "second", "third", "fourth"];
const DOT_KEYS = ["north", "east", "south", "west"];
const LINE_KEYS = ["name", "role", "skills", "history"];
const LINE_WIDTH_CLASSES = ["w-11/12", "w-3/4", "w-2/3", "w-1/2"];
const CHECK_KEYS = ["profile", "resume", "preferences"];

export function ProcessOverlay({
  active,
  variant,
  title,
  description,
  steps = DEFAULT_STEPS,
}: ProcessOverlayProps) {
  return (
    <AnimatePresence>
      {active ? (
        <motion.div
          className="absolute inset-0 z-20 flex items-center justify-center rounded-xl border border-border bg-surface/95 px-5 py-6 shadow-[0_18px_40px_color-mix(in_srgb,var(--color-overlay)_14%,transparent)] backdrop-blur-md"
          initial={{ opacity: 0, scale: 0.985 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.985 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          aria-live="polite"
          aria-busy="true"
        >
          <div className="w-full max-w-[520px] rounded-xl border border-border bg-surface-secondary px-6 py-6 text-center shadow-[0_10px_24px_color-mix(in_srgb,var(--color-overlay)_10%,transparent)]">
            <ProcessVisual variant={variant} />
            <p className="mt-5 text-[12px] font-semibold uppercase leading-4 tracking-[0.08em] text-accent">
              Working
            </p>
            <h3 className="mt-2 text-[22px] font-semibold leading-8 text-text-primary">
              {title}
            </h3>
            <p className="mx-auto mt-2 max-w-[400px] text-[14px] font-normal leading-6 text-text-secondary">
              {description}
            </p>
            <div className="mt-6 grid gap-2 sm:grid-cols-3">
              {steps.slice(0, 3).map((step, index) => (
                <motion.div
                  key={step}
                  className="rounded-lg border border-border bg-surface px-3 py-3 text-[12px] font-semibold leading-4 text-text-secondary"
                  initial={{ opacity: 0.45, y: 4 }}
                  animate={{ opacity: [0.45, 1, 0.45], y: [4, 0, 4] }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    delay: index * 0.22,
                    ease: "easeInOut",
                  }}
                >
                  {step}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function ProcessVisual({ variant }: { variant: ProcessOverlayVariant }) {
  if (variant === "jobs") {
    return (
      <div className="mx-auto flex h-24 w-36 items-end justify-center gap-2 rounded-xl border border-border bg-surface px-5 py-5">
        {BAR_KEYS.map((key, index) => (
          <motion.span
            key={key}
            className="w-5 rounded-full bg-accent"
            initial={{ height: 18 }}
            animate={{ height: [18, 58 - index * 8, 24 + index * 6, 18] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: index * 0.14,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === "resume-extract") {
    return (
      <div className="relative mx-auto h-28 w-24 rounded-lg border border-border bg-surface px-3 py-4">
        {LINE_KEYS.map((key, index) => (
          <span
            key={key}
            className={`mb-3 block h-2 rounded-full bg-border-muted ${LINE_WIDTH_CLASSES[index]}`}
          />
        ))}
        <motion.span
          className="absolute left-2 right-2 top-4 h-8 rounded-md border border-accent/40 bg-accent/10"
          animate={{ y: [0, 58, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    );
  }

  if (variant === "resume-generate") {
    return (
      <div className="mx-auto flex h-28 w-28 items-center justify-center">
        <motion.div
          className="h-24 w-20 rounded-lg border border-border bg-surface shadow-[0_8px_18px_color-mix(in_srgb,var(--color-overlay)_10%,transparent)]"
          animate={{ rotate: [-4, 4, -4], y: [0, -5, 0] }}
          transition={{ duration: 1.7, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="mx-3 mt-4 h-2 rounded-full bg-accent" />
          <div className="mx-3 mt-3 h-2 rounded-full bg-border-muted" />
          <div className="mx-3 mt-3 h-2 rounded-full bg-border-muted" />
          <div className="mx-3 mt-3 h-2 w-8 rounded-full bg-border-muted" />
        </motion.div>
      </div>
    );
  }

  if (variant === "resume-upload") {
    return (
      <div className="relative mx-auto h-28 w-28">
        <motion.span
          className="absolute inset-3 rounded-full border border-accent"
          animate={{ scale: [0.8, 1.12, 0.8], opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.span
          className="absolute inset-8 rounded-full bg-accent"
          animate={{ y: [8, -8, 8] }}
          transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    );
  }

  if (variant === "save") {
    return (
      <div className="mx-auto flex h-24 w-40 items-center justify-center gap-3 rounded-xl border border-border bg-surface px-5">
        {CHECK_KEYS.map((key, index) => (
          <motion.span
            key={key}
            className="flex size-8 items-center justify-center rounded-full border border-success/40 bg-success/10 text-[14px] font-bold text-success"
            animate={{ scale: [0.86, 1, 0.86], opacity: [0.45, 1, 0.45] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: index * 0.18,
              ease: "easeInOut",
            }}
          >
            OK
          </motion.span>
        ))}
      </div>
    );
  }

  return (
    <div className="relative mx-auto h-28 w-28">
      <motion.span
        className="absolute inset-5 rounded-full border border-accent/40"
        animate={{ rotate: 360 }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
      />
      {DOT_KEYS.map((key, index) => (
        <motion.span
          key={key}
          className="absolute left-1/2 top-1/2 size-3 rounded-full bg-accent"
          animate={{
            x: Math.cos((index / DOT_KEYS.length) * Math.PI * 2) * 38 - 6,
            y: Math.sin((index / DOT_KEYS.length) * Math.PI * 2) * 38 - 6,
            scale: [0.7, 1.2, 0.7],
          }}
          transition={{
            duration: 1.4,
            repeat: Infinity,
            delay: index * 0.12,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
