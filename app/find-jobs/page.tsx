import type { FindJobsJobSummary } from "@/agent/types";
import { FindJobsPageContent } from "@/components/find-jobs/FindJobsPageContent";
import {
  type FindJobsListResult,
  parseMatchFilterValue,
  type MatchFilterValue,
} from "@/components/find-jobs/types";
import { requireUser } from "@/lib/auth";
import { createInsforgeServer } from "@/lib/insforge-server";
import { MATCH_THRESHOLD } from "@/lib/utils";

const FIND_JOBS_PAGE_SIZE = 10;
const FIND_JOBS_QUERY_LIMIT = 50;

const JOB_SUMMARY_COLUMNS =
  "id, title, company, location, salary, source, match_score, match_reason, matched_skills, missing_skills, external_apply_url, found_at";

type FindJobsSearchParams = {
  loc?: string | string[];
  q?: string | string[];
  match?: string | string[];
  role?: string | string[];
  run?: string | string[];
};

type FindJobsPageProps = {
  searchParams: Promise<FindJobsSearchParams>;
};

export default async function FindJobsPage({
  searchParams,
}: FindJobsPageProps) {
  const params = await searchParams;
  const user = await requireUser();
  const filters = parseFindJobsSearchParams(params);
  const activeRunId =
    filters.runId ?? (await getLatestCompletedRunIdForUser(user.id));
  const jobsList = await listFindJobsForUser({
    userId: user.id,
    runId: activeRunId,
    query: filters.query,
    matchFilter: filters.matchFilter,
  });

  return (
    <FindJobsPageContent
      userId={user.id}
      userEmail={user.email}
      userName={user.profile?.name}
      jobsList={jobsList}
      filters={{
        query: filters.query,
        matchFilter: filters.matchFilter,
        runId: activeRunId,
        jobTitle: filters.jobTitle,
        location: filters.location,
      }}
    />
  );
}

function parseFindJobsSearchParams(params: FindJobsSearchParams): {
  jobTitle: string;
  location: string;
  query: string;
  matchFilter: MatchFilterValue;
  runId: string | null;
} {
  const jobTitle = firstParam(params.role).slice(0, 120);
  const location = firstParam(params.loc).slice(0, 120);
  const query = firstParam(params.q).slice(0, 120);
  const match = firstParam(params.match);
  const runId = normalizeRunId(firstParam(params.run));

  return {
    jobTitle,
    location,
    query,
    matchFilter: parseMatchFilterValue(match),
    runId,
  };
}

function firstParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function normalizeRunId(value: string): string | null {
  const trimmed = value.trim();

  if (!trimmed || trimmed.length > 80) {
    return null;
  }

  return /^[a-zA-Z0-9_-]+$/.test(trimmed) ? trimmed : null;
}

async function getLatestCompletedRunIdForUser(
  userId: string,
): Promise<string | null> {
  const insforge = await createInsforgeServer();
  const { data, error } = await insforge.database
    .from("agent_runs")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "completed")
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[find-jobs/page] Latest run lookup failed", error);
    return null;
  }

  return readString(toRecord(data)?.id) ?? null;
}

async function listFindJobsForUser({
  userId,
  runId,
  query,
  matchFilter,
}: {
  userId: string;
  runId: string | null;
  query: string;
  matchFilter: MatchFilterValue;
}): Promise<FindJobsListResult> {
  const insforge = await createInsforgeServer();
  const normalizedQuery = normalizeSearchQuery(query);

  if (!runId) {
    return emptyJobsResult(null);
  }

  const dataQuery = insforge.database
    .from("jobs")
    .select(JOB_SUMMARY_COLUMNS)
    .eq("user_id", userId)
    .eq("run_id", runId);

  applyMatchFilter(dataQuery, matchFilter);
  applyTextSearch(dataQuery, normalizedQuery);
  dataQuery.order("match_score", { ascending: false, nullsFirst: false });
  dataQuery.limit(FIND_JOBS_QUERY_LIMIT);

  const { data, error: dataError } = await dataQuery;

  if (dataError) {
    console.error("[find-jobs/page] Data query failed", dataError);
    return failedJobsResult(runId);
  }

  const rows: unknown[] = Array.isArray(data) ? data : [];
  const jobs = rows
    .map(mapJobRow)
    .filter((job): job is FindJobsJobSummary => Boolean(job))
    .slice(0, FIND_JOBS_PAGE_SIZE);

  return {
    activeRunId: runId,
    jobs,
    totalResults: jobs.length,
    currentPage: 1,
    totalPages: 1,
    pageSize: FIND_JOBS_PAGE_SIZE,
    error: null,
  };
}

function emptyJobsResult(
  activeRunId: string | null,
): FindJobsListResult {
  return {
    activeRunId,
    jobs: [],
    totalResults: 0,
    currentPage: 1,
    totalPages: 1,
    pageSize: FIND_JOBS_PAGE_SIZE,
    error: null,
  };
}

function failedJobsResult(
  activeRunId: string | null,
): FindJobsListResult {
  return {
    ...emptyJobsResult(activeRunId),
    error: "We could not load your saved jobs right now.",
  };
}

function normalizeSearchQuery(query: string): string[] {
  return query
    .trim()
    .replace(/[^a-zA-Z0-9#]+/g, " ")
    .split(" ")
    .map((token) => token.trim())
    .filter((token) => token.length > 0)
    .slice(0, 5);
}

function applyMatchFilter(
  query: {
    gte: (column: string, value: number) => unknown;
    lt: (column: string, value: number) => unknown;
  },
  matchFilter: MatchFilterValue,
): void {
  if (matchFilter === "high") {
    query.gte("match_score", MATCH_THRESHOLD);
    return;
  }

  if (matchFilter === "low") {
    query.lt("match_score", MATCH_THRESHOLD);
  }
}

function applyTextSearch(
  query: {
    or: (filters: string) => unknown;
  },
  normalizedQuery: string[],
): void {
  if (normalizedQuery.length === 0) {
    return;
  }

  const filters = normalizedQuery.flatMap((token) => {
    const pattern = `%${token}%`;
    return [`company.ilike.${pattern}`, `title.ilike.${pattern}`];
  });

  query.or(filters.join(","));
}

function mapJobRow(row: unknown): FindJobsJobSummary | null {
  const record = toRecord(row);

  if (!record) {
    return null;
  }

  const id = readString(record.id);
  const title = readString(record.title);
  const company = readString(record.company);
  const foundAt = readString(record.found_at);
  const salary = readString(record.salary);

  if (!id || !title || !company || !foundAt || !salary) {
    return null;
  }

  return {
    id,
    title,
    company,
    location: readString(record.location) || "Not listed",
    salary,
    source: "Search",
    foundAt,
    matchScore: readNumber(record.match_score),
    matchReason: readString(record.match_reason) || "",
    matchedSkills: readStringArray(record.matched_skills),
    missingSkills: readStringArray(record.missing_skills),
    externalApplyUrl: readString(record.external_apply_url) || "",
  };
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

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}
