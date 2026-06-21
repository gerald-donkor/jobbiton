import Link from "next/link";
import { PostHogIdentify } from "@/components/auth/PostHogIdentify";
import type { CompanyResearchDossier } from "@/components/job-details/types";
import { Navbar } from "@/components/layout/Navbar";
import { PageIntro } from "@/components/layout/PageIntro";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { requireUser } from "@/lib/auth";
import { createInsforgeServer } from "@/lib/insforge-server";

const COMPARE_COLUMNS =
  "id, title, company, location, salary, match_score, match_reason, matched_skills, missing_skills, external_apply_url, company_research, found_at";

type ComparePageProps = {
  searchParams: Promise<{
    jobs?: string | string[];
  }>;
};

type ComparedJob = {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string | null;
  matchScore: number;
  matchReason: string;
  matchedSkills: string[];
  missingSkills: string[];
  externalApplyUrl: string;
  foundAt: string;
  companyResearch: CompanyResearchDossier | null;
};

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const params = await searchParams;
  const user = await requireUser();
  const selectedJobIds = parseSelectedJobIds(params.jobs);
  const jobs =
    selectedJobIds.length > 0
      ? await getComparedJobsForUser(user.id, selectedJobIds)
      : [];

  return (
    <div className="min-h-screen bg-background">
      <PostHogIdentify
        userId={user.id}
        email={user.email}
        name={user.profile?.name}
      />
      <Navbar />
      <PageIntro
        eyebrow="Company comparison"
        title="Compare the roles worth your energy."
        copy="Line up company signal, role fit, salary context, strengths, gaps, and research notes before deciding where to apply next."
      />
      <main className="mx-auto w-full max-w-[1440px] bg-background px-4 py-6 text-text-primary sm:px-6 sm:py-8">
        <Reveal className="mx-auto w-full max-w-[1192px]">
          {jobs.length === 0 ? (
            <EmptyComparison />
          ) : (
            <ComparisonGrid jobs={jobs} />
          )}
        </Reveal>
      </main>
    </div>
  );
}

async function getComparedJobsForUser(
  userId: string,
  jobIds: string[],
): Promise<ComparedJob[]> {
  const insforge = await createInsforgeServer();
  const { data, error } = await insforge.database
    .from("jobs")
    .select(COMPARE_COLUMNS)
    .eq("user_id", userId)
    .in("id", jobIds);

  if (error) {
    console.error("[compare/page] Compared jobs query failed", error);
    return [];
  }

  const rows = Array.isArray(data) ? data : [];
  const jobs = rows
    .map(mapComparedJob)
    .filter((job): job is ComparedJob => Boolean(job));
  const order = new Map(jobIds.map((id, index) => [id, index]));

  return jobs.sort(
    (left, right) =>
      (order.get(left.id) ?? Number.MAX_SAFE_INTEGER) -
      (order.get(right.id) ?? Number.MAX_SAFE_INTEGER),
  );
}

function ComparisonGrid({ jobs }: { jobs: ComparedJob[] }) {
  return (
    <RevealGroup className="space-y-5">
      <RevealItem>
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface px-5 py-5 shadow-[0_1px_3px_color-mix(in_srgb,var(--color-overlay)_8%,transparent),0_1px_2px_color-mix(in_srgb,var(--color-overlay)_6%,transparent)] lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[12px] font-semibold uppercase leading-4 text-text-muted">
              Comparing {jobs.length} {jobs.length === 1 ? "role" : "roles"}
            </p>
            <h2 className="mt-1 text-[18px] font-semibold leading-7 text-text-primary">
              Company fit, role fit, and interview signal
            </h2>
          </div>
          <Link
            href="/find-jobs"
            className="inline-flex h-10 w-fit items-center justify-center rounded-md border border-border bg-surface px-4 text-[14px] font-semibold leading-5 text-text-primary shadow-[0_1px_2px_color-mix(in_srgb,var(--color-overlay)_5%,transparent)] transition hover:border-accent hover:text-accent"
          >
            Back to jobs
          </Link>
        </div>
      </RevealItem>

      <RevealItem>
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
          {jobs.map((job) => (
            <ComparedJobCard key={job.id} job={job} />
          ))}
        </div>
      </RevealItem>

      <RevealItem>
        <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-[0_1px_3px_color-mix(in_srgb,var(--color-overlay)_8%,transparent),0_1px_2px_color-mix(in_srgb,var(--color-overlay)_6%,transparent)]">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-[18px] font-semibold leading-7 text-text-primary">
              Side-by-side decision matrix
            </h2>
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-[880px]">
              <CompareRow label="Company" jobs={jobs} render={(job) => job.company} />
              <CompareRow label="Role" jobs={jobs} render={(job) => job.title} />
              <CompareRow
                label="Match"
                jobs={jobs}
                render={(job) => `${job.matchScore}%`}
              />
              <CompareRow
                label="Salary"
                jobs={jobs}
                render={(job) => job.salary ?? "Not listed"}
              />
              <CompareRow
                label="Location"
                jobs={jobs}
                render={(job) => job.location}
              />
              <CompareRow
                label="Research signal"
                jobs={jobs}
                render={(job) =>
                  job.companyResearch
                    ? job.companyResearch.whyThisRole || job.companyResearch.companyOverview
                    : "No company research saved yet."
                }
              />
            </div>
          </div>
        </section>
      </RevealItem>
    </RevealGroup>
  );
}

function ComparedJobCard({ job }: { job: ComparedJob }) {
  const research = job.companyResearch;

  return (
    <article className="flex min-h-full flex-col rounded-xl border border-border bg-surface px-5 py-5 shadow-[0_1px_3px_color-mix(in_srgb,var(--color-overlay)_8%,transparent),0_1px_2px_color-mix(in_srgb,var(--color-overlay)_6%,transparent)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[14px] font-semibold leading-5 text-text-primary">
            {job.company}
          </p>
          <h2 className="mt-1 text-[18px] font-semibold leading-7 text-text-primary">
            {job.title}
          </h2>
        </div>
        <span className="shrink-0 rounded-full bg-success-lightest px-3 py-1 text-[12px] font-semibold leading-4 text-success-foreground">
          {job.matchScore}%
        </span>
      </div>
      <dl className="mt-5 space-y-3 text-[13px] font-medium leading-5">
        <CompareFact label="Salary" value={job.salary ?? "Not listed"} />
        <CompareFact label="Location" value={job.location} />
      </dl>
      <SkillList
        label="Strongest overlap"
        items={job.matchedSkills.slice(0, 4)}
        emptyLabel="No matched skills saved."
      />
      <SkillList
        label="Prep gaps"
        items={(research?.gapsToAddress.length ? research.gapsToAddress : job.missingSkills).slice(0, 4)}
        emptyLabel="No prep gaps saved."
      />
      <div className="mt-auto flex flex-col gap-2 pt-5">
        <Link
          href={`/find-jobs/${job.id}`}
          className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-surface px-4 text-[14px] font-semibold leading-5 text-text-primary shadow-[0_1px_2px_color-mix(in_srgb,var(--color-overlay)_5%,transparent)] transition hover:border-accent hover:text-accent"
        >
          Open job
        </Link>
        {job.externalApplyUrl ? (
          <a
            href={job.externalApplyUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center justify-center rounded-md bg-accent px-4 text-[14px] font-semibold leading-5 text-accent-foreground shadow-[0_8px_18px_color-mix(in_srgb,var(--color-accent)_20%,transparent)] transition hover:bg-accent-dark"
          >
            Apply
          </a>
        ) : null}
      </div>
    </article>
  );
}

function CompareRow({
  label,
  jobs,
  render,
}: {
  label: string;
  jobs: ComparedJob[];
  render: (job: ComparedJob) => string;
}) {
  return (
    <div
      className="grid border-b border-border last:border-b-0"
      style={{ gridTemplateColumns: `180px repeat(${jobs.length}, minmax(180px, 1fr))` }}
    >
      <div className="bg-surface-secondary px-4 py-4 text-[12px] font-semibold uppercase leading-4 text-text-muted">
        {label}
      </div>
      {jobs.map((job) => (
        <div
          key={`${label}-${job.id}`}
          className="border-l border-border px-4 py-4 text-[14px] font-medium leading-6 text-text-primary"
        >
          {render(job)}
        </div>
      ))}
    </div>
  );
}

function CompareFact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[12px] font-semibold uppercase leading-4 text-text-muted">
        {label}
      </dt>
      <dd className="mt-1 text-text-primary">{value}</dd>
    </div>
  );
}

function SkillList({
  label,
  items,
  emptyLabel,
}: {
  label: string;
  items: string[];
  emptyLabel: string;
}) {
  return (
    <div className="mt-5">
      <p className="text-[12px] font-semibold uppercase leading-4 text-text-muted">
        {label}
      </p>
      {items.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {items.map((item) => (
            <span
              key={item}
              className="rounded-full bg-accent-light px-3 py-1 text-[12px] font-semibold leading-4 text-accent"
            >
              {item}
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-[13px] font-medium leading-5 text-text-muted">
          {emptyLabel}
        </p>
      )}
    </div>
  );
}

function EmptyComparison() {
  return (
    <section className="rounded-xl border border-border bg-surface px-6 py-12 text-center shadow-[0_1px_3px_color-mix(in_srgb,var(--color-overlay)_8%,transparent),0_1px_2px_color-mix(in_srgb,var(--color-overlay)_6%,transparent)]">
      <h2 className="text-[20px] font-semibold leading-7 text-text-primary">
        No jobs selected for comparison
      </h2>
      <p className="mx-auto mt-3 max-w-[520px] text-[14px] font-medium leading-6 text-text-secondary">
        Save at least two roles from Find Jobs, then open the comparison view to
        inspect company fit and role tradeoffs together.
      </p>
      <Link
        href="/find-jobs"
        className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-accent px-4 text-[14px] font-semibold leading-5 text-accent-foreground shadow-[0_8px_18px_color-mix(in_srgb,var(--color-accent)_20%,transparent)] transition hover:bg-accent-dark"
      >
        Choose jobs
      </Link>
    </section>
  );
}

function parseSelectedJobIds(value: string | string[] | undefined): string[] {
  const rawValue = Array.isArray(value) ? value[0] : value;

  if (!rawValue) {
    return [];
  }

  return rawValue
    .split(",")
    .map((item) => item.trim())
    .filter((item) => /^[a-zA-Z0-9_-]{1,120}$/.test(item))
    .filter((item, index, items) => items.indexOf(item) === index)
    .slice(0, 4);
}

function mapComparedJob(row: unknown): ComparedJob | null {
  const record = toRecord(row);

  if (!record) {
    return null;
  }

  const id = readString(record.id);
  const title = readString(record.title);
  const company = readString(record.company);
  const foundAt = readString(record.found_at);

  if (!id || !title || !company || !foundAt) {
    return null;
  }

  return {
    id,
    title,
    company,
    location: readString(record.location) || "Not listed",
    salary: readString(record.salary),
    matchScore: readNumber(record.match_score),
    matchReason: readString(record.match_reason) || "",
    matchedSkills: readStringArray(record.matched_skills),
    missingSkills: readStringArray(record.missing_skills),
    externalApplyUrl: readString(record.external_apply_url) || "",
    foundAt,
    companyResearch: readCompanyResearch(record.company_research),
  };
}

function readCompanyResearch(value: unknown): CompanyResearchDossier | null {
  const record = toRecord(value);

  if (!record) {
    return null;
  }

  const companyOverview = readString(record.companyOverview) || "";
  const whyThisRole = readString(record.whyThisRole) || "";

  if (!companyOverview && !whyThisRole) {
    return null;
  }

  return {
    companyOverview,
    techStack: readStringArray(record.techStack),
    culture: readStringArray(record.culture),
    whyThisRole,
    yourEdge: readStringArray(record.yourEdge),
    gapsToAddress: readStringArray(record.gapsToAddress),
    smartQuestions: readStringArray(record.smartQuestions),
    interviewPrep: readStringArray(record.interviewPrep),
    sources: readStringArray(record.sources),
  };
}

function toRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function readNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

