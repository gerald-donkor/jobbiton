import { createInsforgeServer } from "@/lib/insforge-server";
import { warnDashboardDataIssue } from "@/lib/dashboard-log";

export type DashboardStat = {
  label: string;
  value: string;
  helper: string;
  trend?: string;
};

type DashboardJobRow = {
  matchScore: number;
  companyResearch: unknown;
  foundAt: string | null;
};

export async function getDashboardStatsForUser(
  userId: string,
): Promise<DashboardStat[]> {
  const insforge = await createInsforgeServer();
  const { data, error } = await insforge.database
    .from("jobs")
    .select("match_score, company_research, found_at")
    .eq("user_id", userId);

  if (error) {
    warnDashboardDataIssue(
      "[dashboard-stats] Failed to load dashboard stats",
      error,
    );
    return buildDashboardStats([]);
  }

  const rows = Array.isArray(data) ? data.map(mapJobRow).filter(isJobRow) : [];

  return buildDashboardStats(rows);
}

function buildDashboardStats(rows: DashboardJobRow[]): DashboardStat[] {
  const totalJobs = rows.length;
  const researchedCompanies = rows.filter((row) =>
    hasCompanyResearch(row.companyResearch),
  ).length;
  const averageMatchRate = average(
    rows.map((row) => row.matchScore).filter((score) => score > 0),
  );
  const { currentWeekRows, previousWeekRows } = splitWeekRows(rows);
  const currentWeekAverage = average(
    currentWeekRows.map((row) => row.matchScore).filter((score) => score > 0),
  );
  const previousWeekAverage = average(
    previousWeekRows.map((row) => row.matchScore).filter((score) => score > 0),
  );

  return [
    {
      label: "Total Jobs Found",
      value: formatCount(totalJobs),
      trend: formatPercentTrend(currentWeekRows.length, previousWeekRows.length),
      helper: "vs last week",
    },
    {
      label: "Avg. Match Rate",
      value: `${Math.round(averageMatchRate)}%`,
      trend: formatPointTrend(currentWeekAverage, previousWeekAverage),
      helper: "vs last week",
    },
    {
      label: "Companies Researched",
      value: formatCount(researchedCompanies),
      helper: "Total researched",
    },
    {
      label: "Jobs This Week",
      value: formatCount(currentWeekRows.length),
      helper: "New this week",
    },
  ];
}

function splitWeekRows(rows: DashboardJobRow[]): {
  currentWeekRows: DashboardJobRow[];
  previousWeekRows: DashboardJobRow[];
} {
  const now = new Date();
  const currentWeekStart = startOfUtcWeek(now);
  const nextWeekStart = addDays(currentWeekStart, 7);
  const previousWeekStart = addDays(currentWeekStart, -7);

  const currentWeekRows: DashboardJobRow[] = [];
  const previousWeekRows: DashboardJobRow[] = [];

  rows.forEach((row) => {
    if (!row.foundAt) {
      return;
    }

    const foundAt = new Date(row.foundAt);

    if (!Number.isFinite(foundAt.getTime())) {
      return;
    }

    if (foundAt >= currentWeekStart && foundAt < nextWeekStart) {
      currentWeekRows.push(row);
      return;
    }

    if (foundAt >= previousWeekStart && foundAt < currentWeekStart) {
      previousWeekRows.push(row);
    }
  });

  return { currentWeekRows, previousWeekRows };
}

function startOfUtcWeek(date: Date): Date {
  const start = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  const day = start.getUTCDay();
  const daysSinceMonday = day === 0 ? 6 : day - 1;
  start.setUTCDate(start.getUTCDate() - daysSinceMonday);
  return start;
}

function addDays(date: Date, days: number): Date {
  const nextDate = new Date(date);
  nextDate.setUTCDate(nextDate.getUTCDate() + days);
  return nextDate;
}

function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  const total = values.reduce((sum, value) => sum + value, 0);
  return total / values.length;
}

function formatPercentTrend(current: number, previous: number): string {
  if (previous === 0) {
    return current > 0 ? "+100%" : "+0%";
  }

  const percentChange = ((current - previous) / previous) * 100;
  return formatSignedPercent(percentChange);
}

function formatPointTrend(current: number, previous: number): string {
  return formatSignedPercent(current - previous);
}

function formatSignedPercent(value: number): string {
  const rounded = Math.round(value);
  return `${rounded >= 0 ? "+" : ""}${rounded}%`;
}

function formatCount(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

function mapJobRow(row: unknown): DashboardJobRow | null {
  const record = toRecord(row);

  if (!record) {
    return null;
  }

  return {
    matchScore: readNumber(record.match_score),
    companyResearch: record.company_research,
    foundAt: readString(record.found_at),
  };
}

function isJobRow(row: DashboardJobRow | null): row is DashboardJobRow {
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
