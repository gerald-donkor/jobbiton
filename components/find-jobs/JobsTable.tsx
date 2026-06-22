"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type KeyboardEvent,
  type MouseEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { FindJobsJobSummary } from "@/agent/types";
import {
  type JobWorkflowCompareSession,
  workflowStatuses,
  type JobWorkflowSnapshot,
  type JobWorkflowStatus,
} from "@/components/job-workflow/types";
import { useJobWorkflow } from "@/components/job-workflow/useJobWorkflow";
import { getScoreColor } from "@/lib/adzuna";

type JobsTableProps = {
  jobs: FindJobsJobSummary[];
  emptyMessage?: string;
  compareScopeKey: string;
  compareScopeLabel: string;
};

type WorkflowView = "active" | "saved" | "tracked" | "hidden";

export function JobsTable({
  jobs,
  emptyMessage = "Search for jobs to see your saved matches here.",
  compareScopeKey,
  compareScopeLabel,
}: JobsTableProps) {
  const [view, setView] = useState<WorkflowView>("active");
  const [showCompareHistory, setShowCompareHistory] = useState(false);
  const workflow = useJobWorkflow();
  const { activateCompareScope, isLoaded } = workflow;
  const visibleJobIds = useMemo(() => jobs.map((job) => job.id), [jobs]);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    activateCompareScope({
      scopeKey: compareScopeKey,
      label: compareScopeLabel,
      visibleJobIds,
    });
  }, [
    activateCompareScope,
    compareScopeKey,
    compareScopeLabel,
    isLoaded,
    visibleJobIds,
  ]);

  const visibleJobs = useMemo(
    () =>
      jobs.filter((job) => {
        const isDismissed = Boolean(workflow.state.dismissed[job.id]);
        const isSaved = Boolean(workflow.state.favorites[job.id]);
        const isTracked = Boolean(workflow.state.statuses[job.id]);

        if (view === "hidden") {
          return isDismissed;
        }

        if (view === "saved") {
          return isSaved && !isDismissed;
        }

        if (view === "tracked") {
          return isTracked && !isDismissed;
        }

        return !isDismissed;
      }),
    [jobs, view, workflow.state.dismissed, workflow.state.favorites, workflow.state.statuses],
  );
  const isCompareScopeActive =
    workflow.state.activeCompareScopeKey === compareScopeKey;
  const activeCompareJobs = isCompareScopeActive ? workflow.compareJobs : [];
  const selectedCompareIds = activeCompareJobs.map((job) => job.id);
  const compareHref = `/compare?jobs=${selectedCompareIds
    .map(encodeURIComponent)
    .join(",")}`;
  const activeCount = jobs.filter((job) => !workflow.state.dismissed[job.id]).length;
  const savedCount = jobs.filter(
    (job) => workflow.state.favorites[job.id] && !workflow.state.dismissed[job.id],
  ).length;
  const trackedCount = jobs.filter(
    (job) => workflow.state.statuses[job.id] && !workflow.state.dismissed[job.id],
  ).length;
  const hiddenCount = jobs.filter((job) => workflow.state.dismissed[job.id]).length;

  return (
    <section className="space-y-3">
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface px-4 py-4 shadow-[0_1px_3px_color-mix(in_srgb,var(--color-overlay)_8%,transparent),0_1px_2px_color-mix(in_srgb,var(--color-overlay)_6%,transparent)] lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          <WorkflowTab
            active={view === "active"}
            label="Active"
            count={activeCount}
            onClick={() => setView("active")}
          />
          <WorkflowTab
            active={view === "saved"}
            label="Saved"
            count={savedCount}
            onClick={() => setView("saved")}
          />
          <WorkflowTab
            active={view === "tracked"}
            label="Tracked"
            count={trackedCount}
            onClick={() => setView("tracked")}
          />
          <WorkflowTab
            active={view === "hidden"}
            label="Hidden"
            count={hiddenCount}
            onClick={() => setView("hidden")}
          />
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          <p className="max-w-full text-[12px] font-medium leading-4 text-text-muted sm:text-right">
            Select up to 4 roles for company comparison.
          </p>
          <button
            type="button"
            onClick={() => setShowCompareHistory((current) => !current)}
            className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-surface-secondary px-3 text-[13px] font-semibold leading-5 text-text-secondary transition hover:border-accent hover:text-accent"
          >
            History {workflow.state.compareHistory.length > 0 ? workflow.state.compareHistory.length : ""}
          </button>
          <Link
            href={activeCompareJobs.length >= 2 ? compareHref : "/compare"}
            aria-disabled={activeCompareJobs.length < 2}
            className={`inline-flex h-9 items-center justify-center rounded-md border px-3 text-[13px] font-semibold leading-5 transition ${
              activeCompareJobs.length >= 2
                ? "border-accent bg-accent text-accent-foreground shadow-[0_8px_18px_color-mix(in_srgb,var(--color-accent)_20%,transparent)] hover:bg-accent-dark"
                : "pointer-events-none border-border bg-surface-secondary text-text-muted"
            }`}
          >
            Compare {activeCompareJobs.length > 0 ? activeCompareJobs.length : ""}
          </Link>
        </div>
      </div>

      {showCompareHistory ? (
        <CompareHistoryPanel
          sessions={workflow.state.compareHistory}
          onRestore={workflow.restoreCompareSession}
          onRemove={workflow.removeCompareSession}
        />
      ) : null}

      <div className="grid min-w-0 gap-3 xl:hidden">
        {visibleJobs.length === 0 ? (
          <EmptyJobsState message={emptyMessageForView(view, emptyMessage)} />
        ) : (
          visibleJobs.map((job) => (
            <MobileJobCard
              key={job.id}
              job={job}
              workflow={workflow}
              compareScopeKey={compareScopeKey}
            />
          ))
        )}
      </div>

      <div className="hidden min-w-0 overflow-hidden rounded-xl border border-border bg-surface shadow-[0_1px_3px_color-mix(in_srgb,var(--color-overlay)_8%,transparent),0_1px_2px_color-mix(in_srgb,var(--color-overlay)_6%,transparent)] xl:block">
          <div className="w-full">
            <div className="grid grid-cols-[44px_minmax(108px,0.95fr)_minmax(132px,1fr)_minmax(116px,0.6fr)_minmax(84px,0.5fr)_68px_72px_270px] border-b border-border bg-surface text-left">
              <span className="border-r border-border px-2 py-4" />
              <TableHeading>COMPANY</TableHeading>
              <TableHeading>ROLE</TableHeading>
              <TableHeading>MATCH SCORE</TableHeading>
              <TableHeading>SALARY EST.</TableHeading>
              <TableHeading>SOURCE</TableHeading>
              <TableHeading>DATE FOUND</TableHeading>
              <TableHeading>ACTIONS</TableHeading>
            </div>
            <div>
              {visibleJobs.length === 0 ? (
                <div className="px-6 py-16 text-center text-[14px] font-normal leading-5 text-text-muted">
                  {emptyMessageForView(view, emptyMessage)}
                </div>
              ) : (
                visibleJobs.map((job) => (
                  <DesktopJobRow
                    key={job.id}
                    job={job}
                    workflow={workflow}
                    compareScopeKey={compareScopeKey}
                  />
                ))
              )}
            </div>
          </div>
      </div>
    </section>
  );
}

type WorkflowApi = ReturnType<typeof useJobWorkflow>;

function MobileJobCard({
  job,
  workflow,
  compareScopeKey,
}: {
  job: FindJobsJobSummary;
  workflow: WorkflowApi;
  compareScopeKey: string;
}) {
  const router = useRouter();
  const detailsHref = `/find-jobs/${job.id}`;
  const handleCardIntent = () => {
    router.prefetch(detailsHref);
  };
  const handleCardClick = (event: MouseEvent<HTMLElement>) => {
    if (isInteractiveEventTarget(event.target)) {
      return;
    }

    router.push(detailsHref);
  };
  const handleCardKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (isInteractiveEventTarget(event.target)) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      router.push(detailsHref);
    }
  };

  return (
    <article
      role="link"
      tabIndex={0}
      aria-label={`View details for ${job.title} at ${job.company}`}
      onClick={handleCardClick}
      onFocus={handleCardIntent}
      onKeyDown={handleCardKeyDown}
      onMouseEnter={handleCardIntent}
      className="rounded-xl border border-border bg-surface px-4 py-4 shadow-[0_1px_3px_color-mix(in_srgb,var(--color-overlay)_8%,transparent),0_1px_2px_color-mix(in_srgb,var(--color-overlay)_6%,transparent)] transition-colors hover:border-accent hover:bg-surface-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="find-jobs-company-icon mt-0.5 shrink-0"
        />
        <div className="min-w-0 flex-1">
          <p className="break-words text-[14px] font-semibold leading-5 text-text-primary">
            {job.company}
          </p>
          <Link
            href={detailsHref}
            className="mt-1 block break-words text-[16px] font-semibold leading-6 text-text-primary transition-colors hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {job.title}
          </Link>
        </div>
        <span
          className={`shrink-0 text-[14px] font-semibold leading-5 ${getScoreTextClass(job.matchScore)}`}
        >
          {job.matchScore}%
        </span>
      </div>
      <div className="mt-4 h-1 overflow-hidden rounded-full bg-border">
        <span
          style={{ width: `${job.matchScore}%` }}
          className={`block h-full rounded-full ${getScoreClass(job.matchScore)}`}
        />
      </div>
      <dl className="mt-4 grid gap-3 text-[12px] leading-4 text-text-secondary min-[420px]:grid-cols-3">
        <InfoTerm label="Salary" value={job.salary ?? "Not listed"} />
        <div>
          <dt className="font-semibold uppercase">Source</dt>
          <dd className="mt-1">
            <SourceBadge label={job.source} />
          </dd>
        </div>
        <InfoTerm label="Found" value={formatFoundDate(job.foundAt)} />
      </dl>
      <WorkflowControls
        job={job}
        workflow={workflow}
        layout="mobile"
        compareScopeKey={compareScopeKey}
      />
    </article>
  );
}

function DesktopJobRow({
  job,
  workflow,
  compareScopeKey,
}: {
  job: FindJobsJobSummary;
  workflow: WorkflowApi;
  compareScopeKey: string;
}) {
  const router = useRouter();
  const detailsHref = `/find-jobs/${job.id}`;
  const handleRowIntent = () => {
    router.prefetch(detailsHref);
  };
  const handleRowClick = (event: MouseEvent<HTMLElement>) => {
    if (isInteractiveEventTarget(event.target)) {
      return;
    }

    router.push(detailsHref);
  };
  const handleRowKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (isInteractiveEventTarget(event.target)) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      router.push(detailsHref);
    }
  };

  return (
    <div
      role="link"
      tabIndex={0}
      aria-label={`View details for ${job.title} at ${job.company}`}
      onClick={handleRowClick}
      onFocus={handleRowIntent}
      onKeyDown={handleRowKeyDown}
      onMouseEnter={handleRowIntent}
      className="grid grid-cols-[44px_minmax(108px,0.95fr)_minmax(132px,1fr)_minmax(116px,0.6fr)_minmax(84px,0.5fr)_68px_72px_270px] border-b border-border transition-colors last:border-b-0 hover:bg-surface-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-accent"
    >
      <span className="flex items-start justify-center border-r border-border bg-surface-secondary/35 px-2 py-4">
        <span aria-hidden="true" className="find-jobs-company-icon shrink-0" />
      </span>
      <span className="min-w-0 px-3 py-4">
        <span className="block break-words text-[14px] font-semibold leading-5 text-text-primary">
          {job.company}
        </span>
      </span>
      <span className="min-w-0 px-3 py-4">
        <Link
          href={detailsHref}
          className="block break-words text-[14px] font-normal leading-5 text-text-primary transition-colors hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {job.title}
        </Link>
      </span>
      <span className="px-3 py-4">
        <span className="flex min-w-0 items-center gap-2">
          <span className="h-1 min-w-0 flex-1 overflow-hidden rounded-full bg-border">
            <span
              style={{ width: `${job.matchScore}%` }}
              className={`block h-full rounded-full ${getScoreClass(job.matchScore)}`}
            />
          </span>
          <span
            className={`text-[14px] font-semibold leading-5 ${getScoreTextClass(job.matchScore)}`}
          >
            {job.matchScore}%
          </span>
        </span>
      </span>
      <span className="break-words px-3 py-4 text-[14px] font-normal leading-5 text-text-primary">
        {job.salary ?? "Not listed"}
      </span>
      <span className="px-3 py-4">
        <SourceBadge label={job.source} />
      </span>
      <span className="px-3 py-4 text-[14px] font-normal leading-5 text-text-muted">
        {formatFoundDate(job.foundAt)}
      </span>
      <span className="min-w-0 px-3 py-3">
        <WorkflowControls
          job={job}
          workflow={workflow}
          layout="desktop"
          compareScopeKey={compareScopeKey}
        />
      </span>
    </div>
  );
}

function WorkflowControls({
  job,
  workflow,
  layout,
  compareScopeKey,
}: {
  job: FindJobsJobSummary;
  workflow: WorkflowApi;
  layout: "mobile" | "desktop";
  compareScopeKey: string;
}) {
  const isSaved = Boolean(workflow.state.favorites[job.id]);
  const isDismissed = Boolean(workflow.state.dismissed[job.id]);
  const isCompareScopeActive =
    workflow.state.activeCompareScopeKey === compareScopeKey;
  const activeCompareCount = isCompareScopeActive ? workflow.compareJobs.length : 0;
  const isCompared = isCompareScopeActive && Boolean(workflow.state.compare[job.id]);
  const status = workflow.state.statuses[job.id] ?? "interested";
  const compareLimitReached = activeCompareCount >= 4 && !isCompared;

  return (
    <div
      className={
        layout === "mobile"
          ? "mt-4 flex flex-col gap-3 border-t border-border pt-4"
          : "flex flex-col gap-2"
      }
    >
      <select
        aria-label={`Application status for ${job.title}`}
        value={status}
        onChange={(event) =>
          workflow.setStatus(job.id, event.currentTarget.value as JobWorkflowStatus)
        }
        className="h-9 w-full min-w-0 rounded-md border border-border bg-surface px-3 text-[13px] font-medium leading-5 text-text-primary transition-colors focus:border-accent focus:outline-none"
      >
        {workflowStatuses.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="flex flex-wrap gap-2">
        <ActionButton
          active={isSaved}
          label={isSaved ? "Saved" : "Save"}
          onClick={() => workflow.toggleFavorite(job.id)}
        />
        <ActionButton
          active={isCompared}
          disabled={compareLimitReached}
          label={isCompared ? "Added" : "Compare"}
          onClick={() => workflow.toggleCompare(toWorkflowSnapshot(job))}
        />
        <ActionButton
          active={isDismissed}
          label={isDismissed ? "Restore" : "Hide"}
          onClick={() => workflow.toggleDismissed(job.id)}
        />
      </div>
    </div>
  );
}

function isInteractiveEventTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) {
    return false;
  }

  return Boolean(
    target.closest(
      'a, button, input, select, textarea, label, summary, [role="button"], [data-row-action]',
    ),
  );
}

function CompareHistoryPanel({
  sessions,
  onRestore,
  onRemove,
}: {
  sessions: JobWorkflowCompareSession[];
  onRestore: (sessionId: string) => void;
  onRemove: (sessionId: string) => void;
}) {
  if (sessions.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface px-5 py-5 text-[13px] font-medium leading-5 text-text-muted shadow-[0_1px_3px_color-mix(in_srgb,var(--color-overlay)_8%,transparent),0_1px_2px_color-mix(in_srgb,var(--color-overlay)_6%,transparent)]">
        Previous comparison groups will appear here after you start a new search.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-surface px-5 py-5 shadow-[0_1px_3px_color-mix(in_srgb,var(--color-overlay)_8%,transparent),0_1px_2px_color-mix(in_srgb,var(--color-overlay)_6%,transparent)]">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-[14px] font-semibold leading-5 text-text-primary">
            Comparison history
          </h2>
          <p className="mt-1 text-[12px] font-medium leading-4 text-text-muted">
            Reopen previous comparison groups without carrying them into new searches.
          </p>
        </div>
        <span className="text-[12px] font-semibold uppercase leading-4 text-text-muted">
          Latest {sessions.length}
        </span>
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        {sessions.map((session) => (
          <CompareHistoryItem
            key={session.id}
            session={session}
            onRestore={onRestore}
            onRemove={onRemove}
          />
        ))}
      </div>
    </div>
  );
}

function CompareHistoryItem({
  session,
  onRestore,
  onRemove,
}: {
  session: JobWorkflowCompareSession;
  onRestore: (sessionId: string) => void;
  onRemove: (sessionId: string) => void;
}) {
  const compareHref = `/compare?jobs=${session.jobs
    .map((job) => encodeURIComponent(job.id))
    .join(",")}`;
  const companies = session.jobs.map((job) => job.company).join(" vs ");

  return (
    <article className="rounded-xl border border-border bg-surface-secondary px-4 py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-[12px] font-semibold uppercase leading-4 text-accent">
            {session.label} - {session.jobs.length} roles
          </p>
          <h3 className="mt-1 break-words text-[14px] font-semibold leading-5 text-text-primary">
            {companies}
          </h3>
          <p className="mt-1 text-[12px] font-medium leading-4 text-text-muted">
            Saved {formatHistoryDate(session.createdAt)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onRemove(session.id)}
          className="shrink-0 rounded-md border border-border bg-surface px-2 py-1 text-[12px] font-semibold leading-4 text-text-muted transition hover:border-error hover:text-error"
        >
          Remove
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {session.jobs.map((job) => (
          <span
            key={job.id}
            className="rounded-full border border-border bg-surface px-2 py-1 text-[12px] font-medium leading-4 text-text-secondary"
          >
            {job.title}
          </span>
        ))}
      </div>
      <div className="mt-4 flex flex-col gap-2 min-[380px]:flex-row min-[380px]:flex-wrap">
        <Link
          href={compareHref}
          className="inline-flex h-8 items-center justify-center rounded-md border border-accent bg-accent px-3 text-[12px] font-semibold leading-4 text-accent-foreground transition hover:bg-accent-dark"
        >
          Open comparison
        </Link>
        <button
          type="button"
          onClick={() => onRestore(session.id)}
          className="inline-flex h-8 items-center justify-center rounded-md border border-border bg-surface px-3 text-[12px] font-semibold leading-4 text-text-secondary transition hover:border-accent hover:text-accent"
        >
          Make active
        </button>
      </div>
    </article>
  );
}

function WorkflowTab({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`inline-flex h-9 items-center gap-2 rounded-full border px-3 text-[13px] font-semibold leading-5 transition ${
        active
          ? "border-accent bg-accent text-accent-foreground shadow-[0_8px_18px_color-mix(in_srgb,var(--color-accent)_18%,transparent)]"
          : "border-border bg-surface-secondary text-text-secondary hover:border-accent hover:text-accent"
      }`}
    >
      {label}
      <span className="rounded-full bg-surface px-2 py-0.5 text-[11px] leading-4 text-text-primary">
        {count}
      </span>
    </button>
  );
}

function ActionButton({
  active,
  disabled = false,
  label,
  onClick,
}: {
  active: boolean;
  disabled?: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex h-8 min-w-fit items-center justify-center whitespace-nowrap rounded-md border px-2.5 text-[12px] font-semibold leading-4 transition disabled:cursor-not-allowed disabled:opacity-50 ${
        active
          ? "border-accent bg-accent-light text-accent"
          : "border-border bg-surface text-text-secondary hover:border-accent hover:text-accent"
      }`}
    >
      {label}
    </button>
  );
}

function TableHeading({ children }: { children: string }) {
  return (
    <span className="px-3 py-4 text-[12px] font-semibold leading-4 text-text-secondary">
      {children}
    </span>
  );
}

function SourceBadge({ label }: { label: string }) {
  return (
    <span className="rounded-full bg-accent-light px-2 py-0.5 text-[12px] font-medium leading-4 text-accent">
      {label}
    </span>
  );
}

function InfoTerm({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-semibold uppercase">{label}</dt>
      <dd className="mt-1 text-text-primary">{value}</dd>
    </div>
  );
}

function EmptyJobsState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface px-6 py-12 text-center text-[14px] font-normal leading-5 text-text-muted shadow-[0_1px_3px_color-mix(in_srgb,var(--color-overlay)_8%,transparent),0_1px_2px_color-mix(in_srgb,var(--color-overlay)_6%,transparent)]">
      {message}
    </div>
  );
}

function emptyMessageForView(view: WorkflowView, fallback: string): string {
  if (view === "saved") {
    return "No saved jobs in this search yet.";
  }

  if (view === "tracked") {
    return "No jobs have been moved into your application tracker yet.";
  }

  if (view === "hidden") {
    return "No hidden jobs in this search.";
  }

  return fallback;
}

function toWorkflowSnapshot(job: FindJobsJobSummary): JobWorkflowSnapshot {
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

function getScoreClass(score: number): string {
  const color = getScoreColor(score);

  if (color === "success") {
    return "bg-success";
  }

  if (color === "warning") {
    return "bg-warning";
  }

  return "bg-info";
}

function getScoreTextClass(score: number): string {
  const color = getScoreColor(score);

  if (color === "success") {
    return "text-success";
  }

  if (color === "warning") {
    return "text-warning";
  }

  return "text-info";
}

function formatFoundDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return `${months[date.getUTCMonth()]} ${date.getUTCDate()}`;
}

function formatHistoryDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "recently";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
