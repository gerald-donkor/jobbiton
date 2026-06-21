import type { FindJobsJobSummary } from "@/agent/types";

export type MatchFilterValue = "all" | "high" | "low";

export type FindJobsListResult = {
  activeRunId: string | null;
  jobs: FindJobsJobSummary[];
  totalResults: number;
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
