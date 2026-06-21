import type { FindJobsJobSummary } from "@/agent/types";
import { FindJobsPageContent } from "@/components/find-jobs/FindJobsPageContent";
import {
  type FindJobsListResult,
  parseMatchFilterValue,
  parseSortValue,
  type MatchFilterValue,
  type SortValue,
} from "@/components/find-jobs/types";
import { requireUser } from "@/lib/auth";
import { buildAdzunaSearchUrl, detectAdzunaCountry } from "@/lib/adzuna";
import { createInsforgeServer } from "@/lib/insforge-server";
import { MATCH_THRESHOLD } from "@/lib/utils";

const FIND_JOBS_PAGE_SIZE = 10;

const JOB_SUMMARY_COLUMNS =
  "id, title, company, location, salary, source, match_score, match_reason, matched_skills, missing_skills, external_apply_url, found_at";

type FindJobsSearchParams = {
  q?: string | string[];
  match?: string | string[];
  sort?: string | string[];
  page?: string | string[];
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
    sortBy: filters.sortBy,
    page: filters.page,
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
        sortBy: filters.sortBy,
        runId: activeRunId,
      }}
    />
  );
}

function parseFindJobsSearchParams(params: FindJobsSearchParams): {
  query: string;
  matchFilter: MatchFilterValue;
  sortBy: SortValue;
  page: number;
  runId: string | null;
} {
  const query = firstParam(params.q).slice(0, 120);
  const match = firstParam(params.match);
  const sort = firstParam(params.sort);
  const page = Number(firstParam(params.page));
  const runId = normalizeRunId(firstParam(params.run));

  return {
    query,
    matchFilter: parseMatchFilterValue(match),
    sortBy: parseSortValue(sort),
    page: Number.isInteger(page) && page > 0 ? page : 1,
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
  sortBy,
  page,
}: {
  userId: string;
  runId: string | null;
  query: string;
  matchFilter: MatchFilterValue;
  sortBy: SortValue;
  page: number;
}): Promise<FindJobsListResult> {
  const insforge = await createInsforgeServer();
  const normalizedQuery = normalizeSearchQuery(query);
  const requestedPage = Math.max(1, page);

  if (!runId) {
    return emptyJobsResult(null, requestedPage);
  }

  const countQuery = insforge.database
    .from("jobs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("run_id", runId);

  applyMatchFilter(countQuery, matchFilter);
  applyTextSearch(countQuery, normalizedQuery);

  const { count, error: countError } = await countQuery;

  if (countError) {
    console.error("[find-jobs/page] Count query failed", countError);
    return failedJobsResult(runId, requestedPage);
  }

  const totalResults = typeof count === "number" ? count : 0;
  const availability = await loadRunAvailability({
    runId,
    userId,
  });
  const totalPages = Math.max(1, Math.ceil(totalResults / FIND_JOBS_PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);
  const rangeStart = (currentPage - 1) * FIND_JOBS_PAGE_SIZE;
  const rangeEnd = rangeStart + FIND_JOBS_PAGE_SIZE - 1;

  const dataQuery = insforge.database
    .from("jobs")
    .select(JOB_SUMMARY_COLUMNS)
    .eq("user_id", userId)
    .eq("run_id", runId);

  applyMatchFilter(dataQuery, matchFilter);
  applyTextSearch(dataQuery, normalizedQuery);
  applySort(dataQuery, sortBy);

  const { data, error: dataError } = await dataQuery.range(
    rangeStart,
    rangeEnd,
  );

  if (dataError) {
    console.error("[find-jobs/page] Data query failed", dataError);
    return failedJobsResult(runId, currentPage);
  }

  const rows: unknown[] = Array.isArray(data) ? data : [];

  return {
    activeRunId: runId,
    jobs: rows.map(mapJobRow).filter((job): job is FindJobsJobSummary =>
      Boolean(job),
    ),
    totalResults,
    totalAvailable: availability.totalAvailable,
    externalSearchUrl: availability.externalSearchUrl,
    currentPage,
    totalPages,
    pageSize: FIND_JOBS_PAGE_SIZE,
    error: null,
  };
}

function emptyJobsResult(
  activeRunId: string | null,
  page: number,
): FindJobsListResult {
  return {
    activeRunId,
    jobs: [],
    totalResults: 0,
    totalAvailable: null,
    externalSearchUrl: null,
    currentPage: page,
    totalPages: 1,
    pageSize: FIND_JOBS_PAGE_SIZE,
    error: null,
  };
}

async function loadRunAvailability({
  runId,
  userId,
}: {
  runId: string;
  userId: string;
}): Promise<{
  totalAvailable: number | null;
  externalSearchUrl: string | null;
}> {
  const insforge = await createInsforgeServer();
  const { data, error } = await insforge.database
    .from("agent_runs")
    .select("jobs_found, job_title_searched, location_searched")
    .eq("id", runId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("[find-jobs/page] Run availability lookup failed", error);
    return {
      totalAvailable: null,
      externalSearchUrl: null,
    };
  }

  const record = toRecord(data);
  const jobTitle = readString(record?.job_title_searched);
  const location = readString(record?.location_searched) ?? "";
  const totalAvailable = readNumberOrNull(record?.jobs_found);

  return {
    totalAvailable,
    externalSearchUrl: jobTitle
      ? buildAdzunaSearchUrl(
          jobTitle,
          location,
          detectAdzunaCountry(location),
        )
      : null,
  };
}

function failedJobsResult(
  activeRunId: string | null,
  page: number,
): FindJobsListResult {
  return {
    ...emptyJobsResult(activeRunId, page),
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

function applySort(
  query: {
    order: (
      column: string,
      options: { ascending: boolean; nullsFirst?: boolean },
    ) => unknown;
  },
  sortBy: SortValue,
): void {
  if (sortBy === "newest") {
    query.order("found_at", { ascending: false });
    return;
  }

  if (sortBy === "oldest") {
    query.order("found_at", { ascending: true });
    return;
  }

  query.order("match_score", { ascending: false, nullsFirst: false });
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

  if (!id || !title || !company || !foundAt) {
    return null;
  }

  return {
    id,
    title,
    company,
    location: readString(record.location) || "Not listed",
    salary: readString(record.salary),
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

function readNumberOrNull(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}
