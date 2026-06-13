"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { CompanyResearchDossier } from "@/components/job-details/types";
import type { CompanyResearchResponse } from "@/agent/types";

const blockedSourceDomains = [
  "adzuna.",
  "greenhouse.io",
  "lever.co",
  "workable.com",
  "smartrecruiters.com",
  "ashbyhq.com",
  "bamboohr.com",
  "indeed.com",
  "linkedin.com",
  "ziprecruiter.com",
];

const researchSteps = [
  {
    title: "Finding the company site",
    description: "Following the saved job link and checking for the real employer website.",
  },
  {
    title: "Browsing public pages",
    description: "Opening the homepage and the most useful internal pages for candidate research.",
  },
  {
    title: "Reading useful signals",
    description: "Pulling out product, culture, team, technology, and role-specific clues.",
  },
  {
    title: "Building your dossier",
    description: "Turning the research into talking points, questions, gaps, and prep notes.",
  },
] as const;

type CompanyResearchPanelProps = {
  company: string;
  companyWebsiteUrl: string | null;
  dossier: CompanyResearchDossier | null;
  jobId: string;
};

type ResearchIconName =
  | "overview"
  | "tech"
  | "culture"
  | "why"
  | "edge"
  | "gaps"
  | "questions"
  | "prep";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isResearchResponse(value: unknown): value is CompanyResearchResponse {
  if (!isRecord(value)) {
    return false;
  }

  if (value.success === false) {
    return typeof value.error === "string";
  }

  if (value.success !== true || !isRecord(value.data)) {
    return false;
  }

  const dossier = value.data.dossier;

  return Boolean(dossier) && typeof dossier === "object";
}

export function CompanyResearchPanel({
  company,
  companyWebsiteUrl,
  dossier,
  jobId,
}: CompanyResearchPanelProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isResearching, setIsResearching] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const isBusy = isResearching || isPending;

  useEffect(() => {
    if (!isResearching) {
      return;
    }

    const interval = window.setInterval(() => {
      setCurrentStep((step) => Math.min(step + 1, researchSteps.length - 1));
    }, 4200);

    return () => window.clearInterval(interval);
  }, [isResearching]);

  async function handleResearch(): Promise<void> {
    setError(null);
    setIsResearching(true);
    setCurrentStep(0);

    try {
      const response = await fetch("/api/agent/research", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jobId }),
      });
      const responseBody: unknown = await response.json();

      if (!isResearchResponse(responseBody)) {
        setError("We could not read the company research response. Please try again.");
        return;
      }

      if (!responseBody.success) {
        setError(responseBody.error);
        return;
      }

      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error("[CompanyResearchPanel] Research request failed", error);
      setError("We could not start company research. Please try again.");
    } finally {
      setIsResearching(false);
    }
  }

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-[0_1px_3px_color-mix(in_srgb,var(--color-overlay)_8%,transparent),0_1px_2px_color-mix(in_srgb,var(--color-overlay)_6%,transparent)]">
      <div className="flex flex-col gap-4 border-b border-border px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="job-details-small-icon job-details-research-icon"
          />
          <h2 className="text-[18px] font-semibold leading-7 text-text-primary">
            Company Research
          </h2>
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          <button
            type="button"
            onClick={handleResearch}
            disabled={isBusy}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-accent px-4 text-[14px] font-semibold leading-5 text-accent-foreground transition-colors hover:bg-accent-dark disabled:opacity-70"
          >
            <span aria-hidden="true" className="job-details-search-icon" />
            {isBusy
              ? "Researching..."
              : dossier
                ? "Research Again"
                : "Research Company"}
          </button>
          {error ? (
            <p className="max-w-[280px] text-left text-[12px] font-medium leading-4 text-error sm:text-right">
              {error}
            </p>
          ) : null}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isResearching ? (
          <ResearchLoadingCard key="research-loading" currentStep={currentStep} />
        ) : dossier ? (
          <ResearchDossier
            key="research-dossier"
            companyWebsiteUrl={companyWebsiteUrl}
            dossier={dossier}
          />
        ) : (
          <ResearchEmptyState key="research-empty" company={company} />
        )}
      </AnimatePresence>
    </section>
  );
}

function ResearchLoadingCard({ currentStep }: { currentStep: number }) {
  const shouldReduceMotion = useReducedMotion();
  const activeStep = researchSteps[currentStep];
  const progress = ((currentStep + 1) / researchSteps.length) * 100;
  const canAnimate = !shouldReduceMotion;

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={shouldReduceMotion ? undefined : { opacity: 0, y: -8 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
      className="px-6 py-6"
    >
      <div className="relative overflow-hidden rounded-xl border border-border bg-surface-secondary px-5 py-5 shadow-[0_1px_2px_color-mix(in_srgb,var(--color-overlay)_4%,transparent)]">
        {canAnimate ? (
          <motion.span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-accent-light opacity-40 blur-xl"
            animate={{ x: ["0%", "430%"] }}
            transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
          />
        ) : null}

        <div className="relative flex items-start gap-4">
          <motion.div
            className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent-muted text-accent"
            animate={canAnimate ? { scale: [1, 1.025, 1] } : undefined}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          >
            <motion.span
              aria-hidden="true"
              className="absolute inset-0 rounded-full border border-accent opacity-50"
              animate={canAnimate ? { scale: [1, 1.22, 1], opacity: [0.5, 0, 0.5] } : undefined}
              transition={{ duration: 1.9, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.span
              aria-hidden="true"
              className="absolute inset-1 rounded-full border border-accent"
              animate={canAnimate ? { rotate: 360 } : undefined}
              transition={{ duration: 5.5, repeat: Infinity, ease: "linear" }}
            />
            <span aria-hidden="true" className="job-details-search-icon" />
          </motion.div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[14px] font-semibold leading-5 text-text-primary">
                Researching company intelligence
              </p>
              <span className="rounded-full bg-surface px-2 py-0.5 text-[11px] font-semibold leading-4 text-accent">
                Step {currentStep + 1} of {researchSteps.length}
              </span>
            </div>
            <AnimatePresence mode="wait">
              <motion.p
                key={activeStep.title}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? undefined : { opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="mt-1 text-[13px] font-medium leading-5 text-text-secondary"
              >
                {activeStep.description}
              </motion.p>
            </AnimatePresence>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface shadow-[inset_0_1px_2px_color-mix(in_srgb,var(--color-overlay)_8%,transparent)]">
              <motion.div
                className="relative h-full overflow-hidden rounded-full bg-accent"
                initial={false}
                animate={{ width: `${progress}%` }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.45, ease: "easeOut" }}
              >
                {canAnimate ? (
                  <motion.span
                    aria-hidden="true"
                    className="absolute inset-y-0 right-0 w-10 bg-accent-light opacity-60"
                    animate={{ x: ["-140%", "140%"] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  />
                ) : null}
              </motion.div>
            </div>
          </div>
        </div>

        <ol className="relative mt-5 grid gap-3 sm:grid-cols-2">
          {researchSteps.map((step, index) => {
            const isComplete = index < currentStep;
            const isActive = index === currentStep;

            return (
              <motion.li
                key={step.title}
                animate={{
                  opacity: isComplete || isActive ? 1 : 0.62,
                  y: isActive && canAnimate ? -2 : 0,
                  scale: isActive && canAnimate ? 1.01 : 1,
                }}
                transition={{ duration: 0.24, ease: "easeOut" }}
                className={`flex gap-3 rounded-lg border px-3 py-3 shadow-[0_1px_2px_color-mix(in_srgb,var(--color-overlay)_3%,transparent)] ${
                  isActive
                    ? "border-accent bg-surface"
                    : "border-border bg-surface"
                }`}
              >
                <span
                  className={`relative mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold leading-none ${
                    isComplete || isActive
                      ? "bg-accent text-accent-foreground"
                      : "bg-surface-secondary text-text-muted"
                  }`}
                >
                  {isActive && canAnimate ? (
                    <motion.span
                      aria-hidden="true"
                      className="absolute inset-0 rounded-full border border-accent"
                      animate={{ scale: [1, 1.55, 1], opacity: [0.55, 0, 0.55] }}
                      transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                    />
                  ) : null}
                  {isComplete ? "" : index + 1}
                  {isComplete ? (
                    <span aria-hidden="true" className="job-details-loading-check-icon" />
                  ) : null}
                </span>
                <span>
                  <span className="block text-[13px] font-semibold leading-5 text-text-primary">
                    {step.title}
                  </span>
                  <span className="mt-0.5 block text-[12px] font-medium leading-4 text-text-secondary">
                    {isComplete ? "Complete" : isActive ? "In progress" : "Queued"}
                  </span>
                  {isActive ? (
                    <span className="mt-2 flex gap-1">
                      {[0, 1, 2].map((dot) => (
                        <motion.span
                          key={dot}
                          aria-hidden="true"
                          className="h-1.5 w-1.5 rounded-full bg-accent"
                          animate={canAnimate ? { opacity: [0.35, 1, 0.35], y: [0, -2, 0] } : undefined}
                          transition={{
                            delay: dot * 0.15,
                            duration: 0.9,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        />
                      ))}
                    </span>
                  ) : null}
                </span>
              </motion.li>
            );
          })}
        </ol>
      </div>
    </motion.div>
  );
}

function ResearchDossier({
  companyWebsiteUrl,
  dossier,
}: {
  companyWebsiteUrl: string | null;
  dossier: CompanyResearchDossier;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
      <div className="space-y-5 px-6 py-6">
        <ResearchParagraph
          icon="overview"
          title="Company Overview"
          value={dossier.companyOverview}
          size="wide"
        />
        <div className="grid gap-4 lg:grid-cols-2">
          <ResearchTags icon="tech" title="Tech Stack" items={dossier.techStack} />
          <ResearchList icon="culture" title="Culture" items={dossier.culture} />
          <ResearchList icon="edge" title="Your Edge" items={dossier.yourEdge} />
          <ResearchList
            icon="gaps"
            title="Gaps to Address"
            items={dossier.gapsToAddress}
          />
          <ResearchList
            icon="questions"
            title="Smart Questions"
            items={dossier.smartQuestions}
          />
          <ResearchList icon="prep" title="Interview Prep" items={dossier.interviewPrep} />
        </div>
        <ResearchParagraph
          icon="why"
          title="Why This Role"
          value={dossier.whyThisRole}
          size="wide"
        />
      </div>
      <ResearchSources
        companyWebsiteUrl={companyWebsiteUrl}
        sources={dossier.sources}
      />
    </motion.div>
  );
}

function ResearchEmptyState({ company }: { company: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="flex min-h-[246px] flex-col items-center justify-center px-6 py-14 text-center"
    >
      <span aria-hidden="true" className="job-details-empty-research-icon" />
      <p className="mt-5 text-[15px] font-semibold leading-5 text-text-primary">
        No research yet
      </p>
      <p className="mt-2 max-w-[320px] text-[14px] font-normal leading-5 text-text-muted">
        Click &quot;Research Company&quot; to let the AI browse {company}
        &apos;s public pages and build a dossier.
      </p>
    </motion.div>
  );
}

function ResearchSectionShell({
  children,
  icon,
  size = "default",
  title,
}: {
  children: ReactNode;
  icon: ResearchIconName;
  size?: "default" | "wide";
  title: string;
}) {
  return (
    <section
      className={`rounded-xl border border-border bg-surface-secondary px-4 py-4 shadow-[0_1px_2px_color-mix(in_srgb,var(--color-overlay)_4%,transparent)] ${
        size === "wide" ? "lg:px-5 lg:py-5" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className={`job-details-research-card-icon job-details-research-card-icon-${icon}`}
        />
        <h3 className="text-[14px] font-semibold leading-5 text-text-primary">
          {title}
        </h3>
      </div>
      {children}
    </section>
  );
}

function ResearchParagraph({
  icon,
  size,
  title,
  value,
}: {
  icon: ResearchIconName;
  size?: "default" | "wide";
  title: string;
  value: string;
}) {
  if (!value) {
    return null;
  }

  return (
    <ResearchSectionShell icon={icon} size={size} title={title}>
      <p className="mt-2 text-[14px] font-medium leading-6 text-text-primary">
        {value}
      </p>
    </ResearchSectionShell>
  );
}

function ResearchTags({
  icon,
  title,
  items,
}: {
  icon: ResearchIconName;
  title: string;
  items: string[];
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <ResearchSectionShell icon={icon} title={title}>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className="rounded-full bg-accent-muted px-3 py-1 text-[12px] font-medium leading-4 text-accent"
          >
            {item}
          </span>
        ))}
      </div>
    </ResearchSectionShell>
  );
}

function ResearchList({
  icon,
  title,
  items,
}: {
  icon: ResearchIconName;
  title: string;
  items: string[];
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <ResearchSectionShell icon={icon} title={title}>
      <ul className="mt-2 space-y-2 text-[14px] font-medium leading-6 text-text-primary">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span aria-hidden="true" className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-accent" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </ResearchSectionShell>
  );
}

function ResearchSources({
  companyWebsiteUrl,
  sources,
}: {
  companyWebsiteUrl: string | null;
  sources: string[];
}) {
  const validSources = getValidSourceUrls(sources);
  const displaySources = getUniqueSourceUrls([
    ...(companyWebsiteUrl ? [companyWebsiteUrl] : []),
    ...validSources,
  ]);

  if (displaySources.length === 0) {
    return null;
  }

  return (
    <section className="border-t border-border px-6 pb-5 pt-4">
      <h3 className="text-[12px] font-semibold uppercase leading-4 text-text-muted">
        SOURCES
      </h3>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
        {displaySources.map((source) => (
          <a
            key={source}
            href={source}
            target="_blank"
            rel="noreferrer"
            className="text-[12px] font-medium leading-4 text-text-primary transition-colors hover:text-accent"
          >
            {source}
          </a>
        ))}
      </div>
    </section>
  );
}

function getValidSourceUrls(sources: string[]): string[] {
  const seen = new Set<string>();
  const validSources: string[] = [];

  for (const source of sources) {
    try {
      const url = new URL(source);

      if (url.protocol !== "http:" && url.protocol !== "https:") {
        continue;
      }

      if (isBlockedSourceDomain(url.hostname)) {
        continue;
      }

      const normalizedUrl = url.toString();

      if (seen.has(normalizedUrl)) {
        continue;
      }

      seen.add(normalizedUrl);
      validSources.push(normalizedUrl);
    } catch {
      continue;
    }
  }

  return validSources;
}

function getUniqueSourceUrls(sources: string[]): string[] {
  const seen = new Set<string>();
  const uniqueSources: string[] = [];

  for (const source of sources) {
    if (seen.has(source)) {
      continue;
    }

    seen.add(source);
    uniqueSources.push(source);
  }

  return uniqueSources;
}

function isBlockedSourceDomain(hostname: string): boolean {
  const normalizedHostname = hostname.replace(/^www\./i, "").toLowerCase();

  return blockedSourceDomains.some((domain) =>
    domain.endsWith(".")
      ? normalizedHostname.startsWith(domain)
      : normalizedHostname === domain || normalizedHostname.endsWith(`.${domain}`),
  );
}
