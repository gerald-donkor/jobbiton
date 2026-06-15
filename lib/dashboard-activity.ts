import { createInsforgeServer } from "@/lib/insforge-server";

export type DashboardActivityTone = "info" | "success";

export type DashboardActivityItem = {
  id: string;
  label: string;
  time: string;
  tone: DashboardActivityTone;
  occurredAt: string;
};

type AgentRunRow = {
  id: string;
  jobTitleSearched: string | null;
  jobsFound: number;
  occurredAt: string | null;
};

type ResearchJobRow = {
  id: string;
  company: string | null;
  companyResearch: unknown;
  occurredAt: string | null;
};

type ActivityCandidate = {
  id: string;
  label: string;
  tone: DashboardActivityTone;
  occurredAt: Date;
};

const activityLimit = 5;

export async function getRecentActivityForUser(
  userId: string,
): Promise<DashboardActivityItem[]> {
  const insforge = await createInsforgeServer();

  const [runsResult, jobsResult] = await Promise.all([
    insforge.database
      .from("agent_runs")
      .select("id, job_title_searched, jobs_found, completed_at, started_at")
      .eq("user_id", userId)
      .eq("status", "completed")
      .order("completed_at", { ascending: false })
      .limit(10),
    insforge.database
      .from("jobs")
      .select("id, company, company_research, found_at")
      .eq("user_id", userId)
      .order("found_at", { ascending: false })
      .limit(25),
  ]);

  if (runsResult.error) {
    console.error(
      "[dashboard-activity] Failed to load recent agent runs",
      runsResult.error,
    );
  }

  if (jobsResult.error) {
    console.error(
      "[dashboard-activity] Failed to load recent researched jobs",
      jobsResult.error,
    );
  }

  const runActivities = Array.isArray(runsResult.data)
    ? runsResult.data.map(mapAgentRunRow).filter(isAgentRunRow).map(toRunActivity)
    : [];
  const researchActivities = Array.isArray(jobsResult.data)
    ? jobsResult.data
        .map(mapResearchJobRow)
        .filter(isResearchJobRow)
        .filter((row) => hasCompanyResearch(row.companyResearch))
        .map(toResearchActivity)
    : [];

  return [...runActivities, ...researchActivities]
    .filter(isActivityCandidate)
    .sort((left, right) => right.occurredAt.getTime() - left.occurredAt.getTime())
    .slice(0, activityLimit)
    .map((activity) => ({
      id: activity.id,
      label: activity.label,
      time: formatRelativeTime(activity.occurredAt),
      tone: activity.tone,
      occurredAt: activity.occurredAt.toISOString(),
    }));
}

function toRunActivity(row: AgentRunRow): ActivityCandidate | null {
  const occurredAt = parseDate(row.occurredAt);

  if (!occurredAt) {
    return null;
  }

  const jobCount = new Intl.NumberFormat("en-US").format(row.jobsFound);
  const jobWord = row.jobsFound === 1 ? "job" : "jobs";
  const searchedTitle = row.jobTitleSearched
    ? ` for ${row.jobTitleSearched}`
    : "";

  return {
    id: `run-${row.id}`,
    label: `Found ${jobCount} ${jobWord}${searchedTitle}`,
    tone: "success",
    occurredAt,
  };
}

function toResearchActivity(row: ResearchJobRow): ActivityCandidate | null {
  const occurredAt = parseDate(row.occurredAt);

  if (!occurredAt) {
    return null;
  }

  return {
    id: `research-${row.id}`,
    label: `Researched ${row.company ?? "company"}`,
    tone: "info",
    occurredAt,
  };
}

function mapAgentRunRow(row: unknown): AgentRunRow | null {
  const record = toRecord(row);

  if (!record) {
    return null;
  }

  const id = readString(record.id);

  if (!id) {
    return null;
  }

  return {
    id,
    jobTitleSearched: readString(record.job_title_searched),
    jobsFound: readNumber(record.jobs_found),
    occurredAt:
      readString(record.completed_at) ?? readString(record.started_at),
  };
}

function mapResearchJobRow(row: unknown): ResearchJobRow | null {
  const record = toRecord(row);

  if (!record) {
    return null;
  }

  const id = readString(record.id);

  if (!id) {
    return null;
  }

  return {
    id,
    company: readString(record.company),
    companyResearch: record.company_research,
    occurredAt: readString(record.found_at),
  };
}

function isAgentRunRow(row: AgentRunRow | null): row is AgentRunRow {
  return Boolean(row);
}

function isResearchJobRow(row: ResearchJobRow | null): row is ResearchJobRow {
  return Boolean(row);
}

function isActivityCandidate(
  activity: ActivityCandidate | null,
): activity is ActivityCandidate {
  return Boolean(activity);
}

function hasCompanyResearch(value: unknown): boolean {
  if (!value) {
    return false;
  }

  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return typeof value === "object" && Object.keys(value).length > 0;
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = Math.max(0, now.getTime() - date.getTime());
  const minutes = Math.floor(diffMs / 60_000);

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes} ${minutes === 1 ? "min" : "mins"} ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  }

  if (hours < 48) {
    return "Yesterday";
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `${days} days ago`;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

function parseDate(value: string | null): Date | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
}

function toRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  // InsForge rows are JSON objects, so this narrows the unknown SDK payload.
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
