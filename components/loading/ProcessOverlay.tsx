"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

export type ProcessOverlayVariant =
  | "auth"
  | "jobs"
  | "resume-extract"
  | "resume-generate"
  | "resume-upload"
  | "save";

type ProcessStep =
  | string
  | {
      title: string;
      detail: string;
    };

type ProcessOverlayProps = {
  active: boolean;
  variant: ProcessOverlayVariant;
  title: string;
  description: string;
  steps?: ProcessStep[];
};

type NormalizedStep = {
  title: string;
  detail: string;
};

const DEFAULT_STEPS: NormalizedStep[] = [
  { title: "Preparing", detail: "Setting up the request" },
  { title: "Processing", detail: "Running the background task" },
  { title: "Finalizing", detail: "Refreshing the interface" },
];

const VARIANT_LABELS: Record<ProcessOverlayVariant, string> = {
  auth: "Secure handoff",
  jobs: "Match pipeline",
  "resume-extract": "Resume parser",
  "resume-generate": "Document studio",
  "resume-upload": "File sync",
  save: "Profile sync",
};

const VARIANT_DETAILS: Record<ProcessOverlayVariant, string[]> = {
  auth: ["Token", "Provider", "Session"],
  jobs: ["Intent", "Adzuna", "AI score", "Salary", "Save"],
  "resume-extract": ["Text", "Fields", "Draft"],
  "resume-generate": ["Profile", "Content", "PDF"],
  "resume-upload": ["File", "Storage", "Preview"],
  save: ["Validate", "Write", "Refresh"],
};

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
        <ProcessOverlayContent
          description={description}
          steps={steps}
          title={title}
          variant={variant}
        />
      ) : null}
    </AnimatePresence>
  );
}

function ProcessOverlayContent({
  variant,
  title,
  description,
  steps = DEFAULT_STEPS,
}: Omit<ProcessOverlayProps, "active">) {
  const shouldReduceMotion = useReducedMotion();
  const normalizedSteps = useMemo(() => normalizeSteps(steps), [steps]);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveStep((currentStep) =>
        Math.min(currentStep + 1, normalizedSteps.length - 1),
      );
    }, 1700);

    return () => window.clearInterval(interval);
  }, [normalizedSteps.length]);

  const progress =
    normalizedSteps.length <= 1
      ? 100
      : ((activeStep + 1) / normalizedSteps.length) * 100;
  const current = normalizedSteps[activeStep] ?? normalizedSteps[0];

  return (
    <motion.div
      className="absolute inset-0 z-20 flex items-center justify-center overflow-hidden rounded-xl border border-border bg-surface/95 px-5 py-6 shadow-[0_18px_40px_color-mix(in_srgb,var(--color-overlay)_14%,transparent)] backdrop-blur-md"
      initial={{ opacity: 0, scale: 0.985 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.985 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      aria-live="polite"
      aria-busy="true"
    >
      <motion.span
        aria-hidden="true"
        className="process-overlay-scan absolute inset-x-0 top-0 h-24 opacity-45"
        animate={shouldReduceMotion ? undefined : { x: ["-45%", "45%", "-45%"] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="relative w-full max-w-[760px] rounded-xl border border-border bg-surface-secondary px-5 py-5 text-left shadow-[0_10px_24px_color-mix(in_srgb,var(--color-overlay)_10%,transparent)] sm:px-6 sm:py-6">
        <div className="grid gap-5 lg:grid-cols-[220px_1fr] lg:items-center">
          <ProcessVisual
            activeStep={activeStep}
            reducedMotion={Boolean(shouldReduceMotion)}
            variant={variant}
          />
          <div>
            <p className="text-[12px] font-semibold uppercase leading-4 tracking-[0.08em] text-accent">
              {VARIANT_LABELS[variant]}
            </p>
            <h3 className="mt-2 text-[24px] font-semibold leading-8 text-text-primary">
              {title}
            </h3>
            <p className="mt-2 max-w-[460px] text-[14px] font-normal leading-6 text-text-secondary">
              {description}
            </p>
            <div className="mt-5 overflow-hidden rounded-full border border-border bg-surface">
              <motion.div
                className="h-2 rounded-full bg-accent"
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.45 }}
              />
            </div>
            <div className="mt-4 rounded-lg border border-border bg-surface px-4 py-4">
              <p className="text-[12px] font-semibold uppercase leading-4 text-text-muted">
                Current step
              </p>
              <p className="mt-1 text-[16px] font-semibold leading-6 text-text-primary">
                {current.title}
              </p>
              <p className="mt-1 text-[13px] font-medium leading-5 text-text-secondary">
                {current.detail}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {normalizedSteps.map((step, index) => {
            const isComplete = index < activeStep;
            const isActive = index === activeStep;

            return (
              <motion.div
                key={`${step.title}-${index}`}
                className={
                  isActive
                    ? "rounded-lg border border-accent bg-accent-muted px-4 py-4 text-accent shadow-[0_8px_18px_color-mix(in_srgb,var(--color-accent)_16%,transparent)]"
                    : "rounded-lg border border-border bg-surface px-4 py-4 text-text-secondary"
                }
                animate={
                  isActive && !shouldReduceMotion
                    ? { y: [0, -4, 0], opacity: [0.88, 1, 0.88] }
                    : undefined
                }
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={
                      isComplete
                        ? "flex size-6 items-center justify-center rounded-full bg-success text-[10px] font-bold text-accent-foreground"
                        : isActive
                          ? "flex size-6 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground"
                          : "flex size-6 items-center justify-center rounded-full border border-border text-[10px] font-bold text-text-muted"
                    }
                  >
                    {isComplete ? "OK" : index + 1}
                  </span>
                  <p className="min-w-0 text-[13px] font-semibold leading-5">
                    {step.title}
                  </p>
                </div>
                <p className="mt-2 text-[12px] font-medium leading-5 text-text-secondary">
                  {step.detail}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

function ProcessVisual({
  activeStep,
  reducedMotion,
  variant,
}: {
  activeStep: number;
  reducedMotion: boolean;
  variant: ProcessOverlayVariant;
}) {
  const labels = VARIANT_DETAILS[variant];

  return (
    <div className="relative mx-auto flex min-h-[220px] w-full max-w-[240px] items-center justify-center rounded-xl border border-border bg-surface px-5 py-5">
      <motion.div
        className="absolute inset-4 rounded-xl border border-accent/30"
        animate={
          reducedMotion
            ? undefined
            : {
                opacity: [0.24, 0.7, 0.24],
                scale: [0.96, 1.02, 0.96],
              }
        }
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="relative grid w-full gap-3">
        {labels.map((label, index) => {
          const isActive = index === activeStep % labels.length;
          const isPast = index < activeStep % labels.length;

          return (
            <motion.div
              key={label}
              className={
                isActive
                  ? "flex items-center justify-between rounded-lg border border-accent bg-accent-muted px-3 py-2 text-accent"
                  : "flex items-center justify-between rounded-lg border border-border bg-surface-secondary px-3 py-2 text-text-secondary"
              }
              animate={
                isActive && !reducedMotion
                  ? { x: [0, 4, 0], opacity: [0.82, 1, 0.82] }
                  : undefined
              }
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            >
              <span className="text-[12px] font-semibold leading-4">{label}</span>
              <span
                className={
                  isPast
                    ? "size-2 rounded-full bg-success"
                    : isActive
                      ? "size-2 rounded-full bg-accent"
                      : "size-2 rounded-full bg-border-muted"
                }
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function normalizeSteps(steps: ProcessStep[]): NormalizedStep[] {
  const normalized = steps
    .map((step) => {
      if (typeof step === "string") {
        return {
          title: step,
          detail: "Working through this stage",
        };
      }

      return step;
    })
    .filter((step) => step.title.trim().length > 0);

  return normalized.length > 0 ? normalized : DEFAULT_STEPS;
}
