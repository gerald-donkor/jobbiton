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

  return mapJobDetailsRow(data);
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
