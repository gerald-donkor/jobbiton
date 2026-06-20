import Link from "next/link";
import type { FindJobsJobSummary } from "@/agent/types";
import { getScoreColor } from "@/lib/adzuna";

type JobsTableProps = {
  jobs: FindJobsJobSummary[];
  emptyMessage?: string;
};

export function JobsTable({
  jobs,
  emptyMessage = "Search for jobs to see your saved matches here.",
}: JobsTableProps) {
  return (
    <section>
      <div className="grid gap-3 md:hidden">
        {jobs.length === 0 ? (
          <div className="rounded-xl border border-border bg-surface px-6 py-12 text-center text-[14px] font-normal leading-5 text-text-muted shadow-[0_1px_3px_color-mix(in_srgb,var(--color-overlay)_8%,transparent),0_1px_2px_color-mix(in_srgb,var(--color-overlay)_6%,transparent)]">
            {emptyMessage}
          </div>
        ) : (
          jobs.map((job) => (
            <Link
              key={job.id}
              href={`/find-jobs/${job.id}`}
              aria-label={`View ${job.title} at ${job.company}`}
              className="rounded-xl border border-border bg-surface px-4 py-4 shadow-[0_1px_3px_color-mix(in_srgb,var(--color-overlay)_8%,transparent),0_1px_2px_color-mix(in_srgb,var(--color-overlay)_6%,transparent)] transition hover:border-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <div className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="find-jobs-company-icon mt-0.5 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-semibold leading-5 text-text-primary">
                    {job.company}
                  </p>
                  <h2 className="mt-1 break-words text-[16px] font-semibold leading-6 text-text-primary">
                    {job.title}
                  </h2>
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
                <div>
                  <dt className="font-semibold uppercase">Salary</dt>
                  <dd className="mt-1 text-text-primary">{job.salary ?? "Not listed"}</dd>
                </div>
                <div>
                  <dt className="font-semibold uppercase">Source</dt>
                  <dd className="mt-1">
                    <span className="rounded-full bg-accent-light px-2 py-0.5 text-[12px] font-medium leading-4 text-accent">
                      {job.source}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold uppercase">Found</dt>
                  <dd className="mt-1 text-text-primary">{formatFoundDate(job.foundAt)}</dd>
                </div>
              </dl>
            </Link>
          ))
        )}
      </div>

      <div className="hidden overflow-hidden rounded-xl border border-border bg-surface shadow-[0_1px_3px_color-mix(in_srgb,var(--color-overlay)_8%,transparent),0_1px_2px_color-mix(in_srgb,var(--color-overlay)_6%,transparent)] md:block">
        <div className="overflow-x-auto">
        <div className="min-w-[1110px]">
          <div className="grid grid-cols-[64px_1.7fr_1fr_176px_132px_96px_110px] border-b border-border bg-surface text-left">
            <span className="border-r border-border px-3 py-4" />
            <span className="px-4 py-4 text-[12px] font-semibold leading-4 text-text-secondary">
              COMPANY
            </span>
            <span className="px-4 py-4 text-[12px] font-semibold leading-4 text-text-secondary">
              ROLE
            </span>
            <span className="px-4 py-4 text-[12px] font-semibold leading-4 text-text-secondary">
              MATCH SCORE
            </span>
            <span className="px-4 py-4 text-[12px] font-semibold leading-4 text-text-secondary">
              SALARY EST.
            </span>
            <span className="px-4 py-4 text-[12px] font-semibold leading-4 text-text-secondary">
              SOURCE
            </span>
            <span className="px-4 py-4 text-[12px] font-semibold leading-4 text-text-secondary">
              DATE FOUND
            </span>
          </div>
          <div>
            {jobs.length === 0 ? (
              <div className="px-6 py-16 text-center text-[14px] font-normal leading-5 text-text-muted">
                {emptyMessage}
              </div>
            ) : (
              jobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/find-jobs/${job.id}`}
                  aria-label={`View ${job.title} at ${job.company}`}
                  className="grid grid-cols-[64px_1.7fr_1fr_176px_132px_96px_110px] border-b border-border transition-colors last:border-b-0 hover:bg-surface-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent"
                >
                  <span className="flex items-center justify-center border-r border-border bg-surface-secondary/35 px-3 py-4">
                    <span
                      aria-hidden="true"
                      className="find-jobs-company-icon shrink-0"
                    />
                  </span>
                  <span className="px-4 py-4 pr-6">
                    <span className="text-[14px] font-semibold leading-5 text-text-primary">
                      {job.company}
                    </span>
                  </span>
                  <span className="px-4 py-4 text-[14px] font-normal leading-5 text-text-primary">
                    {job.title}
                  </span>
                  <span className="px-4 py-4">
                    <span className="flex items-center gap-3">
                      <span className="h-1 w-[90px] overflow-hidden rounded-full bg-border">
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
                  <span className="px-4 py-4 text-[14px] font-normal leading-5 text-text-primary">
                    {job.salary ?? "Not listed"}
                  </span>
                  <span className="px-4 py-4">
                    <span className="rounded-full bg-accent-light px-2 py-0.5 text-[12px] font-medium leading-4 text-accent">
                      {job.source}
                    </span>
                  </span>
                  <span className="px-4 py-4 text-[14px] font-normal leading-5 text-text-muted">
                    {formatFoundDate(job.foundAt)}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
      </div>
    </section>
  );
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
  const timestamp = new Date(value).getTime();

  if (Number.isNaN(timestamp)) {
    return "Recently";
  }

  const diffInHours = Math.max(
    0,
    Math.floor((Date.now() - timestamp) / (1000 * 60 * 60)),
  );

  if (diffInHours < 1) {
    return "Just now";
  }

  if (diffInHours < 24) {
    return diffInHours === 1 ? "1 hour ago" : `${diffInHours} hours ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInDays === 1) {
    return "Yesterday";
  }

  return `${diffInDays} days ago`;
}
