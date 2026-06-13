import Link from "next/link";
import type { JobDetailsRecord } from "@/components/job-details/types";

type JobDetailsPageContentProps = {
  job: JobDetailsRecord;
};

export function JobDetailsPageContent({ job }: JobDetailsPageContentProps) {
  const jobUrl = job.externalApplyUrl || job.sourceUrl || "/find-jobs";

  return (
    <main className="mx-auto w-full max-w-[1440px] border-x border-border bg-background px-6 py-9 text-text-primary">
      <div className="mx-auto flex w-full max-w-[1040px] flex-col gap-6">
        <Link
          href="/find-jobs"
          className="inline-flex w-fit items-center gap-3 text-[14px] font-medium leading-5 text-text-secondary transition-colors hover:text-accent"
        >
          <span aria-hidden="true" className="job-details-chevron-left" />
          Back to Jobs
        </Link>

        <section className="rounded-xl border border-border bg-surface px-6 py-6 shadow-[0_1px_3px_color-mix(in_srgb,var(--color-overlay)_8%,transparent),0_1px_2px_color-mix(in_srgb,var(--color-overlay)_6%,transparent)]">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <span
                aria-hidden="true"
                className="job-details-building-icon h-[58px] w-[58px] shrink-0"
              />
              <div className="min-w-0">
                <h1 className="truncate text-[26px] font-semibold leading-8 text-text-primary">
                  {job.title}
                </h1>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-[14px] font-semibold leading-5 text-text-secondary">
                  <span>{job.company}</span>
                  <span aria-hidden="true">•</span>
                  <span className="rounded-full bg-success-lightest px-3 py-0.5 text-[12px] font-medium leading-4 text-success-foreground">
                    {job.matchScore}% Match Score
                  </span>
                </div>
              </div>
            </div>
            <a
              href={jobUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-[42px] shrink-0 items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 text-[14px] font-semibold leading-5 text-text-primary shadow-[0_1px_2px_color-mix(in_srgb,var(--color-overlay)_5%,transparent)] transition-colors hover:border-accent hover:text-accent"
            >
              <span aria-hidden="true" className="job-details-external-icon" />
              View Job Post
            </a>
          </div>
        </section>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1.55fr_1fr_1fr]">
          <InfoCard icon="salary" value={job.salary ?? "Not listed"} label="SALARY EST." />
          <InfoCard icon="location" value={job.location} label="LOCATION" />
          <InfoCard icon="job-type" value={formatJobType(job.jobType)} label="JOB TYPE" />
          <InfoCard icon="date" value={formatFoundDate(job.foundAt)} label="DATE FOUND" />
        </div>

        <section className="rounded-xl border border-border bg-surface px-6 py-6 shadow-[0_1px_3px_color-mix(in_srgb,var(--color-overlay)_8%,transparent),0_1px_2px_color-mix(in_srgb,var(--color-overlay)_6%,transparent)]">
          <div className="mb-5 flex items-center gap-3">
            <span
              aria-hidden="true"
              className="job-details-small-icon job-details-match-icon"
            />
            <h2 className="text-[12px] font-semibold leading-4 text-text-secondary">
              AI MATCH REASONING
            </h2>
          </div>
          <p className="text-[15px] font-medium leading-6 text-text-primary">
            {job.matchReason || "No match reasoning was saved for this job."}
          </p>
        </section>

        <section className="rounded-xl border border-border bg-surface px-6 py-6 shadow-[0_1px_3px_color-mix(in_srgb,var(--color-overlay)_8%,transparent),0_1px_2px_color-mix(in_srgb,var(--color-overlay)_6%,transparent)]">
          <h2 className="text-[12px] font-semibold leading-4 text-text-secondary">
            REQUIRED SKILLS VS YOUR PROFILE
          </h2>
          <SkillGroup
            label="You have"
            emptyLabel="No matched skills were saved for this job."
            skills={job.matchedSkills}
            tone="matched"
          />
          <SkillGroup
            label="Gap skills"
            emptyLabel="No missing skills were saved for this job."
            skills={job.missingSkills}
            tone="missing"
          />
        </section>

        <section className="rounded-xl border border-border bg-surface px-6 py-7 shadow-[0_1px_3px_color-mix(in_srgb,var(--color-overlay)_8%,transparent),0_1px_2px_color-mix(in_srgb,var(--color-overlay)_6%,transparent)]">
          <div className="mb-6 flex items-center gap-3">
            <span
              aria-hidden="true"
              className="job-details-small-icon job-details-document-icon"
            />
            <h2 className="text-[18px] font-semibold leading-7 text-text-primary">
              Job Description
            </h2>
          </div>
          <JobDescription job={job} />
        </section>

        <CompanyResearchCard job={job} />

        <a
          href={jobUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-12 items-center justify-center rounded-md bg-accent px-5 text-[15px] font-semibold leading-5 text-accent-foreground transition-colors hover:bg-accent-dark"
        >
          Apply Now at {job.company}
        </a>
      </div>
    </main>
  );
}

type InfoCardProps = {
  icon: "salary" | "location" | "job-type" | "date";
  value: string;
  label: string;
};

function InfoCard({ icon, value, label }: InfoCardProps) {
  return (
    <section className="flex min-w-0 items-center gap-3 rounded-xl border border-border bg-surface px-4 py-4 shadow-[0_1px_3px_color-mix(in_srgb,var(--color-overlay)_8%,transparent),0_1px_2px_color-mix(in_srgb,var(--color-overlay)_6%,transparent)]">
      <span
        aria-hidden="true"
        className={`job-details-info-icon job-details-info-icon-${icon}`}
      />
      <div className="min-w-0">
        <p className="break-words text-[15px] font-semibold leading-5 text-text-primary">
          {value}
        </p>
        <p className="mt-1 text-[12px] font-semibold leading-4 text-text-muted">
          {label}
        </p>
      </div>
    </section>
  );
}

type SkillGroupProps = {
  label: string;
  emptyLabel: string;
  skills: string[];
  tone: "matched" | "missing";
};

function SkillGroup({ label, emptyLabel, skills, tone }: SkillGroupProps) {
  return (
    <div className="mt-4">
      <p className="mb-2 text-[13px] font-normal leading-5 text-text-muted">
        {label}
      </p>
      {skills.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span
              key={`${tone}-${skill}`}
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[12px] font-medium leading-4 ${
                tone === "matched"
                  ? "bg-success-lightest text-success-foreground"
                  : "bg-accent-muted text-accent"
              }`}
            >
              <span aria-hidden="true">
                {tone === "matched" ? "\u2713" : "\u00d7"}
              </span>
              {skill}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-[13px] font-normal leading-5 text-text-muted">
          {emptyLabel}
        </p>
      )}
    </div>
  );
}

function JobDescription({ job }: { job: JobDetailsRecord }) {
  const sections = [
    { title: "Responsibilities", items: job.responsibilities },
    { title: "Requirements", items: job.requirements },
    { title: "Nice to have", items: job.niceToHave },
    { title: "Benefits", items: job.benefits },
  ].filter((section) => section.items.length > 0);
  const descriptionParagraphs = splitDescriptionText(job.aboutRole);
  const jobUrl = job.externalApplyUrl || job.sourceUrl || "";

  return (
    <div className="space-y-5 text-[15px] font-medium leading-6 text-text-primary">
      {descriptionParagraphs.length > 0 ? (
        <div className="space-y-4 break-words">
          {descriptionParagraphs.map((paragraph) => (
            <p key={paragraph} className="whitespace-pre-wrap">
              {paragraph}
            </p>
          ))}
        </div>
      ) : (
        <p>No job description was saved for this job.</p>
      )}
      {job.descriptionIsTruncated && jobUrl ? (
        <div className="rounded-md border border-border bg-surface-secondary px-4 py-4">
          <p className="text-[14px] font-medium leading-5 text-text-primary">
            This saved listing preview ends mid-sentence. Open the original job
            post to read the complete description.
          </p>
          <a
            href={jobUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex h-9 items-center justify-center gap-2 rounded-md border border-border bg-surface px-3 text-[13px] font-semibold leading-5 text-text-primary shadow-[0_1px_2px_color-mix(in_srgb,var(--color-overlay)_5%,transparent)] transition-colors hover:border-accent hover:text-accent"
          >
            <span aria-hidden="true" className="job-details-external-icon" />
            Open full job description
          </a>
        </div>
      ) : null}
      {job.aboutCompany ? <p>{job.aboutCompany}</p> : null}
      {sections.map((section) => (
        <div key={section.title}>
          <h3 className="mb-2 text-[14px] font-semibold leading-5 text-text-primary">
            {section.title}
          </h3>
          <ul className="space-y-1 text-[14px] font-medium leading-6 text-text-primary">
            {section.items.map((item) => (
              <li key={item} className="flex gap-2">
                <span aria-hidden="true" className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-text-muted" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function splitDescriptionText(value: string): string[] {
  return value
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0);
}

function CompanyResearchCard({ job }: { job: JobDetailsRecord }) {
  const dossier = job.companyResearch;

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
        <button
          type="button"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-accent px-4 text-[14px] font-semibold leading-5 text-accent-foreground transition-colors hover:bg-accent-dark"
        >
          <span aria-hidden="true" className="job-details-search-icon" />
          Research Company
        </button>
      </div>
      {dossier ? (
        <div className="space-y-6 px-6 py-6">
          <ResearchParagraph title="Company Overview" value={dossier.companyOverview} />
          <ResearchTags title="Tech Stack" items={dossier.techStack} />
          <ResearchList title="Culture" items={dossier.culture} />
          <ResearchParagraph title="Why This Role" value={dossier.whyThisRole} />
          <ResearchList title="Your Edge" items={dossier.yourEdge} />
          <ResearchList title="Gaps to Address" items={dossier.gapsToAddress} />
          <ResearchList title="Smart Questions" items={dossier.smartQuestions} />
          <ResearchList title="Interview Prep" items={dossier.interviewPrep} />
          <ResearchSources sources={dossier.sources} />
        </div>
      ) : (
        <div className="flex min-h-[246px] flex-col items-center justify-center px-6 py-14 text-center">
          <span
            aria-hidden="true"
            className="job-details-empty-research-icon"
          />
          <p className="mt-5 text-[15px] font-semibold leading-5 text-text-primary">
            No research yet
          </p>
          <p className="mt-2 max-w-[320px] text-[14px] font-normal leading-5 text-text-muted">
            Click &quot;Research Company&quot; to let the AI browse {job.company}
            &apos;s public pages and build a dossier.
          </p>
        </div>
      )}
    </section>
  );
}

function ResearchParagraph({ title, value }: { title: string; value: string }) {
  if (!value) {
    return null;
  }

  return (
    <section>
      <h3 className="text-[14px] font-semibold leading-5 text-text-primary">
        {title}
      </h3>
      <p className="mt-2 text-[14px] font-medium leading-6 text-text-primary">
        {value}
      </p>
    </section>
  );
}

function ResearchTags({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section>
      <h3 className="text-[14px] font-semibold leading-5 text-text-primary">
        {title}
      </h3>
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
    </section>
  );
}

function ResearchList({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section>
      <h3 className="text-[14px] font-semibold leading-5 text-text-primary">
        {title}
      </h3>
      <ul className="mt-2 space-y-2 text-[14px] font-medium leading-6 text-text-primary">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span aria-hidden="true" className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-accent" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ResearchSources({ sources }: { sources: string[] }) {
  if (sources.length === 0) {
    return null;
  }

  return (
    <section>
      <h3 className="text-[14px] font-semibold leading-5 text-text-primary">
        Sources
      </h3>
      <div className="mt-2 flex flex-wrap gap-2">
        {sources.map((source) => (
          <a
            key={source}
            href={source}
            target="_blank"
            rel="noreferrer"
            className="text-[12px] font-medium leading-4 text-text-secondary transition-colors hover:text-accent"
          >
            {source}
          </a>
        ))}
      </div>
    </section>
  );
}

function formatJobType(value: string | null): string {
  if (!value) {
    return "-";
  }

  const normalized = value.replaceAll("_", " ").replaceAll("-", " ").trim();

  if (!normalized) {
    return "-";
  }

  return normalized
    .split(" ")
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(" ");
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
