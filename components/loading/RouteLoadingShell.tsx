"use client";

import { motion } from "motion/react";

type RouteLoadingShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  variant: "dashboard" | "jobs" | "profile" | "compare" | "details";
};

const SKELETON_ROWS = ["one", "two", "three", "four"];
const DETAIL_BLOCKS = ["summary", "workflow", "research"];

export function RouteLoadingShell({
  eyebrow,
  title,
  description,
  variant,
}: RouteLoadingShellProps) {
  return (
    <main className="bg-background text-text-primary">
      <section className="border-b border-border bg-surface px-6 py-16 md:px-10">
        <div className="mx-auto grid max-w-[1180px] gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <p className="text-[12px] font-semibold uppercase leading-4 tracking-[0.1em] text-accent">
              {eyebrow}
            </p>
            <h1 className="mt-6 max-w-[520px] text-[52px] font-bold leading-[1.05] text-text-primary md:text-[64px]">
              {title}
            </h1>
          </div>
          <p className="max-w-[640px] text-[19px] font-normal leading-8 text-text-secondary">
            {description}
          </p>
        </div>
      </section>
      <section className="px-6 py-10 md:px-10">
        <div className="mx-auto max-w-[1180px]">
          <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-[0_1px_3px_color-mix(in_srgb,var(--color-overlay)_10%,transparent)]">
            <LoadingVisual variant={variant} />
          </div>
        </div>
      </section>
    </main>
  );
}

function LoadingVisual({
  variant,
}: {
  variant: RouteLoadingShellProps["variant"];
}) {
  if (variant === "details") {
    return (
      <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5 border-b border-border p-6 lg:border-r lg:border-b-0">
          <PulseBlock className="h-8 w-3/5" />
          <PulseBlock className="h-4 w-4/5" />
          <PulseBlock className="h-4 w-2/3" />
          <div className="grid gap-3 pt-5 sm:grid-cols-3">
            {DETAIL_BLOCKS.map((block) => (
              <PulseBlock key={block} className="h-24" />
            ))}
          </div>
        </div>
        <div className="space-y-4 p-6">
          <RadarPulse />
          <PulseBlock className="h-4 w-5/6" />
          <PulseBlock className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-5">
      <div className="mb-5 grid gap-3 md:grid-cols-[1fr_148px]">
        <PulseBlock className="h-12" />
        <PulseBlock className="h-12" />
      </div>
      <div className="overflow-hidden rounded-lg border border-border">
        {SKELETON_ROWS.map((row, index) => (
          <motion.div
            key={row}
            className="grid gap-4 border-b border-border px-5 py-5 last:border-b-0 md:grid-cols-[1fr_1fr_0.7fr_0.7fr]"
            initial={{ opacity: 0.35 }}
            animate={{ opacity: [0.35, 0.85, 0.35] }}
            transition={{
              duration: 1.7,
              repeat: Infinity,
              delay: index * 0.12,
              ease: "easeInOut",
            }}
          >
            <PulseBlock className="h-5" />
            <PulseBlock className="h-5" />
            <PulseBlock className="h-5" />
            <PulseBlock className="h-8" />
          </motion.div>
        ))}
      </div>
      {variant === "profile" || variant === "compare" ? (
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <PulseBlock className="h-28" />
          <PulseBlock className="h-28" />
          <PulseBlock className="h-28" />
        </div>
      ) : null}
    </div>
  );
}

function PulseBlock({ className }: { className: string }) {
  return (
    <motion.div
      className={`rounded-md bg-surface-secondary ${className}`}
      animate={{ opacity: [0.45, 1, 0.45] }}
      transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

function RadarPulse() {
  return (
    <div className="relative mx-auto h-40 w-40">
      <motion.span
        className="absolute inset-4 rounded-full border border-accent"
        animate={{ scale: [0.7, 1.2, 0.7], opacity: [0.25, 0.75, 0.25] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.span
        className="absolute inset-10 rounded-full bg-accent"
        animate={{ rotate: 360 }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}
