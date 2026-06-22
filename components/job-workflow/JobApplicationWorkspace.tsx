"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useMemo, useState } from "react";
import type { JobDetailsRecord } from "@/components/job-details/types";
import {
  workflowStatuses,
  type JobWorkflowSnapshot,
  type JobWorkflowStatus,
} from "@/components/job-workflow/types";
import { useJobWorkflow } from "@/components/job-workflow/useJobWorkflow";
import { Button } from "@/components/ui/button";

type JobApplicationWorkspaceProps = {
  job: JobDetailsRecord;
};

export function JobApplicationWorkspace({ job }: JobApplicationWorkspaceProps) {
  const workflow = useJobWorkflow();
  const [activePanel, setActivePanel] = useState<"tracker" | "prep">("tracker");
  const shouldReduceMotion = useReducedMotion();
  const isSaved = Boolean(workflow.state.favorites[job.id]);
  const isHidden = Boolean(workflow.state.dismissed[job.id]);
  const isCompared = Boolean(workflow.state.compare[job.id]);
  const status = workflow.state.statuses[job.id] ?? "interested";
  const compareJobs = workflow.compareJobs;
  const compareHref = `/compare?jobs=${compareJobs
    .map((item) => encodeURIComponent(item.id))
    .join(",")}`;
  const prepItems = useMemo(() => buildInterviewPrep(job), [job]);

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-[0_1px_3px_color-mix(in_srgb,var(--color-overlay)_8%,transparent),0_1px_2px_color-mix(in_srgb,var(--color-overlay)_6%,transparent)]">
      <div className="flex flex-col gap-4 border-b border-border px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-[12px] font-semibold uppercase leading-4 text-text-muted">
            Application workspace
          </p>
          <h2 className="mt-1 text-[18px] font-semibold leading-7 text-text-primary">
            Track, save, compare, and prepare
          </h2>
        </div>
        <div className="flex w-full rounded-full border border-border bg-surface-secondary p-1 min-[420px]:w-fit">
          <PanelTab
            active={activePanel === "tracker"}
            label="Tracker"
            onClick={() => setActivePanel("tracker")}
          />
          <PanelTab
            active={activePanel === "prep"}
            label="Interview prep"
            onClick={() => setActivePanel("prep")}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activePanel === "tracker" ? (
          <motion.div
            key="tracker"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0, y: -10 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="grid gap-5 px-4 py-5 sm:px-6 sm:py-6 lg:grid-cols-[0.9fr_1.1fr]"
          >
            <div className="space-y-4">
              <label className="block">
                <span className="text-[12px] font-semibold uppercase leading-4 text-text-muted">
                  Application status
                </span>
                <select
                  value={status}
                  onChange={(event) =>
                    workflow.setStatus(
                      job.id,
                      event.currentTarget.value as JobWorkflowStatus,
                    )
                  }
                  className="mt-2 h-11 w-full rounded-md border border-border bg-surface px-3 text-[14px] font-medium leading-5 text-text-primary transition-colors focus:border-accent focus:outline-none"
                >
                  {workflowStatuses.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <div className="grid gap-2 sm:grid-cols-3">
                <Button
                  type="button"
                  variant={isSaved ? "primary" : "secondary"}
                  size="md"
                  onClick={() => workflow.toggleFavorite(job.id)}
                >
                  {isSaved ? "Saved" : "Save job"}
                </Button>
                <Button
                  type="button"
                  variant={isCompared ? "primary" : "secondary"}
                  size="md"
                  disabled={workflow.compareJobs.length >= 4 && !isCompared}
                  onClick={() => workflow.toggleCompare(toWorkflowSnapshot(job))}
                >
                  {isCompared ? "Compared" : "Compare"}
                </Button>
                <Button
                  type="button"
                  variant={isHidden ? "primary" : "secondary"}
                  size="md"
                  onClick={() => workflow.toggleDismissed(job.id)}
                >
                  {isHidden ? "Restore" : "Hide"}
                </Button>
              </div>
              {compareJobs.length >= 2 ? (
                <Link
                  href={compareHref}
                className="inline-flex min-h-10 w-full items-center justify-center rounded-md border border-accent bg-accent px-4 py-2 text-center text-[14px] font-semibold leading-5 text-accent-foreground shadow-[0_8px_18px_color-mix(in_srgb,var(--color-accent)_20%,transparent)] transition hover:bg-accent-dark sm:w-auto"
                >
                  View company comparison
                </Link>
              ) : (
                <p className="text-[13px] font-medium leading-5 text-text-muted">
                  Add at least two jobs to compare companies side by side.
                </p>
              )}
            </div>
            <label className="block">
              <span className="text-[12px] font-semibold uppercase leading-4 text-text-muted">
                Private notes
              </span>
              <textarea
                value={workflow.state.notes[job.id] ?? ""}
                onChange={(event) => workflow.setNote(job.id, event.currentTarget.value)}
                rows={7}
                placeholder="Add recruiter notes, application links, reminders, or follow-up dates."
                className="mt-2 w-full resize-y rounded-md border border-border bg-surface-secondary px-4 py-3 text-[14px] font-medium leading-6 text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-accent"
              />
            </label>
          </motion.div>
        ) : (
          <motion.div
            key="prep"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0, y: -10 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="grid gap-4 px-4 py-5 sm:px-6 sm:py-6 md:grid-cols-2"
          >
            {prepItems.map((section) => (
              <div
                key={section.title}
                className="rounded-xl border border-border bg-surface-secondary px-4 py-4"
              >
                <h3 className="text-[14px] font-semibold leading-5 text-text-primary">
                  {section.title}
                </h3>
                {section.items.length > 0 ? (
                  <ul className="mt-3 space-y-2 text-[13px] font-medium leading-5 text-text-secondary">
                    {section.items.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span
                          aria-hidden="true"
                          className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-[13px] font-medium leading-5 text-text-muted">
                    Run company research to unlock richer prep notes here.
                  </p>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function PanelTab({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`min-h-8 flex-1 rounded-full px-3 py-1 text-[13px] font-semibold leading-5 transition min-[420px]:flex-none ${
        active
          ? "bg-accent text-accent-foreground shadow-[0_6px_14px_color-mix(in_srgb,var(--color-accent)_20%,transparent)]"
          : "text-text-secondary hover:text-accent"
      }`}
    >
      {label}
    </button>
  );
}

function buildInterviewPrep(job: JobDetailsRecord): {
  title: string;
  items: string[];
}[] {
  const dossier = job.companyResearch;

  return [
    {
      title: "Opening talking points",
      items:
        dossier?.interviewPrep.length || dossier?.whyThisRole
          ? [...(dossier?.interviewPrep ?? []), dossier?.whyThisRole ?? ""].filter(Boolean)
          : [job.matchReason].filter(Boolean),
    },
    {
      title: "Your strongest proof",
      items:
        dossier?.yourEdge.length || job.matchedSkills.length
          ? [...(dossier?.yourEdge ?? []), ...job.matchedSkills.slice(0, 4)]
          : [],
    },
    {
      title: "Gaps to prepare",
      items:
        dossier?.gapsToAddress.length || job.missingSkills.length
          ? [...(dossier?.gapsToAddress ?? []), ...job.missingSkills.slice(0, 4)]
          : [],
    },
    {
      title: "Questions to ask",
      items: dossier?.smartQuestions ?? [],
    },
  ];
}

function toWorkflowSnapshot(job: JobDetailsRecord): JobWorkflowSnapshot {
  return {
    id: job.id,
    title: job.title,
    company: job.company,
    location: job.location,
    salary: job.salary,
    foundAt: job.foundAt,
    matchScore: job.matchScore,
    matchReason: job.matchReason,
    matchedSkills: job.matchedSkills,
    missingSkills: job.missingSkills,
    externalApplyUrl: job.externalApplyUrl,
  };
}
