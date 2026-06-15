import { createInsforgeServer } from "@/lib/insforge-server";

export type DashboardSeriesPoint = {
  date: string;
  label: string;
  value: number;
};

export type DashboardDistributionPoint = {
  label: string;
  value: number;
};

export type DashboardAnalytics = {
  jobsFoundOverTime: DashboardSeriesPoint[];
  matchScoreDistribution: DashboardDistributionPoint[];
  companyResearchActivity: DashboardSeriesPoint[];
};

type DashboardJobAnalyticsRow = {
  matchScore: number;
  foundAt: string | null;
};

type ResearchLogRow = {
  createdAt: string | null;
};

type ResearchJobFallbackRow = {
  companyResearch: unknown;
  foundAt: string | null;
};

type DateWindow = {
  start: Date;
  end: Date;
};

const distributionBuckets = [
  { label: "50-60%", min: 50, max: 60 },
  { label: "60-70%", min: 60, max: 70 },
  { label: "70-80%", min: 70, max: 80 },
  { label: "80-90%", min: 80, max: 90 },
  { label: "90-100%", min: 90, max: 101 },
];

export async function getDashboardAnalyticsForUser(
  userId: string,
): Promise<DashboardAnalytics> {
  const thirtyDayWindow = getTrailingUtcDayWindow(30);
  const sevenDayWindow = getTrailingUtcDayWindow(7);
  const emptyAnalytics = buildDashboardAnalytics({
    jobs: [],
    researchRows: [],
    sevenDayWindow,
    thirtyDayWindow,
  });
  const insforge = await createInsforgeServer();

  const [jobsResult, researchLogsResult] = await Promise.all([
    insforge.database
      .from("jobs")
      .select("match_score, found_at")
      .eq("user_id", userId)
      .gte("found_at", thirtyDayWindow.start.toISOString())
      .lt("found_at", thirtyDayWindow.end.toISOString())
      .order("found_at", { ascending: true }),
    insforge.database
      .from("agent_logs")
      .select("created_at")
      .eq("user_id", userId)
      .eq("level", "success")
      .like("message", "Completed company research%")
      .gte("created_at", sevenDayWindow.start.toISOString())
      .lt("created_at", sevenDayWindow.end.toISOString())
      .order("created_at", { ascending: true }),
  ]);

  if (jobsResult.error) {
    console.error(
      "[dashboard-analytics] Failed to load dashboard jobs analytics",
      jobsResult.error,
    );
  }

  if (researchLogsResult.error) {
    console.error(
      "[dashboard-analytics] Failed to load company research analytics",
      researchLogsResult.error,
    );
  }

  if (jobsResult.error && researchLogsResult.error) {
    return emptyAnalytics;
  }

  const jobs = Array.isArray(jobsResult.data)
    ? jobsResult.data.map(mapJobRow).filter(isJobAnalyticsRow)
    : [];
  const researchRows = Array.isArray(researchLogsResult.data)
    ? researchLogsResult.data.map(mapResearchLogRow).filter(isResearchLogRow)
    : [];

  if (researchRows.length > 0 || researchLogsResult.error) {
    return buildDashboardAnalytics({
      jobs,
      researchRows,
      sevenDayWindow,
      thirtyDayWindow,
    });
  }

  const fallbackRows = await loadResearchFallbackRows(userId, sevenDayWindow);

  return buildDashboardAnalytics({
    jobs,
    researchRows: fallbackRows,
    sevenDayWindow,
    thirtyDayWindow,
  });
}

async function loadResearchFallbackRows(
  userId: string,
  window: DateWindow,
): Promise<ResearchLogRow[]> {
  const insforge = await createInsforgeServer();
  const { data, error } = await insforge.database
    .from("jobs")
    .select("company_research, found_at")
    .eq("user_id", userId)
    .gte("found_at", window.start.toISOString())
    .lt("found_at", window.end.toISOString())
    .order("found_at", { ascending: true });

  if (error) {
    console.error(
      "[dashboard-analytics] Failed to load company research fallback",
      error,
    );
    return [];
  }

  return Array.isArray(data)
    ? data
        .map(mapResearchJobFallbackRow)
        .filter(isResearchJobFallbackRow)
        .filter((row) => hasCompanyResearch(row.companyResearch))
        .map((row) => ({ createdAt: row.foundAt }))
    : [];
}

function buildDashboardAnalytics({
  jobs,
  researchRows,
  sevenDayWindow,
  thirtyDayWindow,
}: {
  jobs: DashboardJobAnalyticsRow[];
  researchRows: ResearchLogRow[];
  sevenDayWindow: DateWindow;
  thirtyDayWindow: DateWindow;
}): DashboardAnalytics {
  return {
    jobsFoundOverTime: buildSeries(
      thirtyDayWindow,
      jobs.map((row) => row.foundAt),
    ),
    matchScoreDistribution: buildDistribution(jobs),
    companyResearchActivity: buildSeries(
      sevenDayWindow,
      researchRows.map((row) => row.createdAt),
    ),
  };
}

function buildSeries(window: DateWindow, dates: Array<string | null>): DashboardSeriesPoint[] {
  const points = eachUtcDay(window).map((date) => ({
    date: formatDateKey(date),
    label: formatAxisDate(date),
    value: 0,
  }));
  const pointMap = new Map(points.map((point) => [point.date, point]));

  dates.forEach((value) => {
    const date = parseDate(value);

    if (!date || date < window.start || date >= window.end) {
      return;
    }

    const point = pointMap.get(formatDateKey(date));

    if (point) {
      point.value += 1;
    }
  });

  return points;
}

function buildDistribution(rows: DashboardJobAnalyticsRow[]): DashboardDistributionPoint[] {
  const points = distributionBuckets.map((bucket) => ({
    label: bucket.label,
    value: 0,
  }));

  rows.forEach((row) => {
    const bucketIndex = distributionBuckets.findIndex(
      (bucket) => row.matchScore >= bucket.min && row.matchScore < bucket.max,
    );

    if (bucketIndex >= 0) {
      points[bucketIndex].value += 1;
    }
  });

  return points;
}

function getTrailingUtcDayWindow(dayCount: number): DateWindow {
  const today = new Date();
  const end = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + 1),
  );
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - dayCount);
  return { start, end };
}

function eachUtcDay(window: DateWindow): Date[] {
  const dates: Date[] = [];
  const cursor = new Date(window.start);

  while (cursor < window.end) {
    dates.push(new Date(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return dates;
}

function mapJobRow(row: unknown): DashboardJobAnalyticsRow | null {
  const record = toRecord(row);

  if (!record) {
    return null;
  }

  return {
    matchScore: readNumber(record.match_score),
    foundAt: readString(record.found_at),
  };
}

function mapResearchLogRow(row: unknown): ResearchLogRow | null {
  const record = toRecord(row);

  if (!record) {
    return null;
  }

  return {
    createdAt: readString(record.created_at),
  };
}

function mapResearchJobFallbackRow(row: unknown): ResearchJobFallbackRow | null {
  const record = toRecord(row);

  if (!record) {
    return null;
  }

  return {
    companyResearch: record.company_research,
    foundAt: readString(record.found_at),
  };
}

function isJobAnalyticsRow(
  row: DashboardJobAnalyticsRow | null,
): row is DashboardJobAnalyticsRow {
  return Boolean(row);
}

function isResearchLogRow(row: ResearchLogRow | null): row is ResearchLogRow {
  return Boolean(row);
}

function isResearchJobFallbackRow(
  row: ResearchJobFallbackRow | null,
): row is ResearchJobFallbackRow {
  return Boolean(row);
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

function parseDate(value: string | null): Date | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
}

function formatDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function formatAxisDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
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
