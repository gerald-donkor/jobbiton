import type { FindJobsJobSummary } from "@/agent/types";

export type MatchFilterValue = "all" | "high" | "low";
export type SortValue = "score" | "newest" | "oldest";

export type FindJobsListResult = {
  activeRunId: string | null;
  jobs: FindJobsJobSummary[];
  totalResults: number;
  totalAvailable: number | null;
  externalSearchUrl: string | null;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  error: string | null;
};

export function parseMatchFilterValue(value: string): MatchFilterValue {
  if (value === "high" || value === "low" || value === "all") {
    return value;
  }

  return "all";
}

export function parseSortValue(value: string): SortValue {
  if (value === "newest" || value === "oldest" || value === "score") {
    return value;
  }

  return "score";
}
