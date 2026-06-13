import { notFound } from "next/navigation";
import { JobDetailsNavbar } from "@/components/job-details/JobDetailsNavbar";
import { JobDetailsPageContent } from "@/components/job-details/JobDetailsPageContent";
import type {
  CompanyResearchDossier,
  JobDetailsRecord,
} from "@/components/job-details/types";
import { requireUser } from "@/lib/auth";
import { createInsforgeServer } from "@/lib/insforge-server";

const JOB_DETAILS_COLUMNS =
  "id, source_url, external_apply_url, title, company, location, salary, job_type, about_role, responsibilities, requirements, nice_to_have, benefits, about_company, match_score, match_reason, matched_skills, missing_skills, company_research, found_at";

type JobDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function JobDetailsPage({ params }: JobDetailsPageProps) {
  const { id } = await params;
  const user = await requireUser();
  const job = await getJobDetailsForUser(id, user.id);

  if (!job) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <JobDetailsNavbar
        userId={user.id}
        userEmail={user.email}
        userName={user.profile?.name}
      />
      <JobDetailsPageContent job={job} />
    </div>
  );
}

async function getJobDetailsForUser(
  jobId: string,
  userId: string,
): Promise<JobDetailsRecord | null> {
  const insforge = await createInsforgeServer();
  const { data, error } = await insforge.database
    .from("jobs")
    .select(JOB_DETAILS_COLUMNS)
    .eq("id", jobId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("[find-jobs/[id]/page] Job lookup failed", error);
    return null;
  }

  const job = mapJobDetailsRow(data);

  if (!job) {
    return null;
  }

  return {
    ...job,
    companyWebsiteUrl: await resolveCompanyWebsiteUrl(job),
  };
}

function mapJobDetailsRow(row: unknown): JobDetailsRecord | null {
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
    jobType: readString(record.job_type),
    aboutRole: readString(record.about_role) || "",
    descriptionIsTruncated: isTruncatedPreview(record.about_role),
    responsibilities: readStringArray(record.responsibilities),
    requirements: readStringArray(record.requirements),
    niceToHave: readStringArray(record.nice_to_have),
    benefits: readStringArray(record.benefits),
    aboutCompany: readString(record.about_company),
    matchScore: readNumber(record.match_score),
    matchReason: readString(record.match_reason) || "",
    matchedSkills: readStringArray(record.matched_skills),
    missingSkills: readStringArray(record.missing_skills),
    externalApplyUrl: readString(record.external_apply_url) || "",
    sourceUrl: readString(record.source_url),
    companyWebsiteUrl: null,
    foundAt,
    companyResearch: readCompanyResearch(record.company_research),
  };
}

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

async function resolveCompanyWebsiteUrl(
  job: JobDetailsRecord,
): Promise<string | null> {
  const candidates = [job.externalApplyUrl, job.sourceUrl].filter(
    (value): value is string => Boolean(value),
  );

  for (const candidate of candidates) {
    const resolvedUrl = await resolveLiveEmployerUrl(candidate);

    if (resolvedUrl) {
      return resolvedUrl;
    }
  }

  return null;
}

async function resolveLiveEmployerUrl(value: string): Promise<string | null> {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    return null;
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return null;
  }

  try {
    const response = await fetch(url, {
      cache: "no-store",
      redirect: "follow",
      signal: AbortSignal.timeout(6000),
    });
    const resolvedUrl = new URL(response.url);

    if (isBlockedSourceDomain(resolvedUrl.hostname)) {
      return null;
    }

    return `https://${getRootDomain(resolvedUrl.hostname)}`;
  } catch (error) {
    console.error("[find-jobs/[id]/page] Company website resolution failed", error);
    return null;
  }
}

function isBlockedSourceDomain(hostname: string): boolean {
  const normalizedHostname = hostname.replace(/^www\./i, "").toLowerCase();

  return blockedSourceDomains.some((domain) =>
    domain.endsWith(".")
      ? normalizedHostname.startsWith(domain)
      : normalizedHostname === domain || normalizedHostname.endsWith(`.${domain}`),
  );
}

function getRootDomain(hostname: string): string {
  const parts = hostname
    .replace(/^www\./i, "")
    .split(".")
    .filter(Boolean);

  if (parts.length <= 2) {
    return parts.join(".");
  }

  const last = parts[parts.length - 1];
  const secondLast = parts[parts.length - 2];
  const thirdLast = parts[parts.length - 3];
  const secondLevelDomains = new Set(["co", "com", "edu", "gov", "net", "org"]);

  if (last.length === 2 && secondLevelDomains.has(secondLast) && thirdLast) {
    return `${thirdLast}.${secondLast}.${last}`;
  }

  return `${secondLast}.${last}`;
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

  // InsForge rows and JSONB values are plain JSON objects.
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

function isTruncatedPreview(value: unknown): boolean {
  if (typeof value !== "string") {
    return false;
  }

  const trimmed = value.trim();

  return /(\u2026|\.{3})$/.test(trimmed);
}
