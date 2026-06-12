import Link from "next/link";
import type { FindJobsJobSummary } from "@/agent/types";
import { getScoreColor } from "@/lib/adzuna";

type JobsTableProps = {
  jobs: FindJobsJobSummary[];
};

export function JobsTable({ jobs }: JobsTableProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-[0_1px_3px_color-mix(in_srgb,var(--color-overlay)_8%,transparent),0_1px_2px_color-mix(in_srgb,var(--color-overlay)_6%,transparent)]">
      <div className="overflow-x-auto">
        <div className="min-w-[820px]">
          <div className="grid grid-cols-[16%_24%_20%_16%_10%_14%] border-b border-border bg-surface text-left">
            <span className="px-6 py-4 text-[12px] font-semibold leading-4 text-text-secondary">
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
                Search for jobs to see your saved matches here.
              </div>
            ) : (
              jobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/find-jobs/${job.id}`}
                  aria-label={`View ${job.title} at ${job.company}`}
                  className="grid grid-cols-[16%_24%_20%_16%_10%_14%] border-b border-border transition-colors last:border-b-0 hover:bg-surface-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent"
                >
                  <span className="px-6 py-4">
                    <span className="flex items-center gap-3">
                      <span
                        aria-hidden="true"
                        className="find-jobs-company-icon shrink-0"
                      />
                      <span className="text-[14px] font-semibold leading-5 text-text-primary">
                        {job.company}
                      </span>
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
