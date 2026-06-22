"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type {
  FindJobsJobSummary,
  FindJobsSearchResponse,
} from "@/agent/types";
import { JobFilterBar } from "@/components/find-jobs/JobFilterBar";
import { JobSearchCard } from "@/components/find-jobs/JobSearchCard";
import { JobsTable } from "@/components/find-jobs/JobsTable";
import { ProcessOverlay } from "@/components/loading/ProcessOverlay";
import type {
  FindJobsListResult,
  MatchFilterValue,
} from "@/components/find-jobs/types";
import { MATCH_THRESHOLD } from "@/lib/utils";

type FindJobsClientProps = {
  jobsList: FindJobsListResult;
  filters: {
    query: string;
    matchFilter: MatchFilterValue;
    runId: string | null;
  };
};

export function FindJobsClient({ jobsList, filters }: FindJobsClientProps) {
  const router = useRouter();
  const [jobTitle, setJobTitle] = useState("");
  const [location, setLocation] = useState("");
  const [filterQuery, setFilterQuery] = useState(filters.query);
  const [latestSearchJobs, setLatestSearchJobs] = useState<
    FindJobsJobSummary[] | null
  >(null);
  const [latestSearchRunId, setLatestSearchRunId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    tone: "error" | "success";
    text: string;
  } | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const visibleLatestSearchJobs = latestSearchJobs
    ? filterAndSortJobs(latestSearchJobs, {
        query: filterQuery,
        matchFilter: filters.matchFilter,
      })
    : null;
  const displayedJobs = visibleLatestSearchJobs ?? jobsList.jobs;
  const compareScopeKey =
    latestSearchRunId ?? filters.runId ?? jobsList.activeRunId ?? "no-active-search";
  const compareScopeLabel = latestSearchRunId
    ? `Search for ${jobTitle.trim() || "new roles"}`
    : "Current search";
  const displayedTotal = latestSearchJobs ? displayedJobs.length : jobsList.totalResults;
  const shouldShowSummary = displayedTotal > 0;
  const emptyMessage =
    jobsList.error ??
    (filterQuery.trim() || filters.matchFilter !== "all"
      ? "No jobs match the current filters."
      : "Search for jobs to see your saved matches here.");

  async function handleSearch(): Promise<void> {
    const trimmedJobTitle = jobTitle.trim();

    if (!trimmedJobTitle) {
      setFeedback({
        tone: "error",
        text: "Enter a job title before searching.",
      });
      return;
    }

    setIsSearching(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/agent/find", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobTitle: trimmedJobTitle,
          location: location.trim(),
        }),
      });
      const result = (await response.json()) as FindJobsSearchResponse;

      if (!response.ok || !result.success) {
        resetLatestSearchState();
        setFeedback({
          tone: "error",
          text: result.success
            ? "We could not search for jobs right now."
            : result.error,
        });
        return;
      }

      const rankedJobs = [...result.data.jobs].sort(
        (left, right) => right.matchScore - left.matchScore,
      );

      setLatestSearchJobs(rankedJobs);
      setLatestSearchRunId(result.data.runId);
      setFilterQuery("");
      setFeedback({
        tone: "success",
        text:
          result.data.totalFound === 0
            ? "No jobs matched that search right now."
            : `Showing the top ${result.data.totalFound} matched roles for this search.`,
      });
      navigateToRun(result.data.runId);
    } catch (error) {
      console.error("[FindJobsClient] Search request failed", error);
      resetLatestSearchState();
      setFeedback({
        tone: "error",
        text: "We could not search for jobs right now.",
      });
    } finally {
      setIsSearching(false);
    }
  }

  function updateRoute(next: {
    query?: string;
    matchFilter?: MatchFilterValue;
  }): void {
    const nextQuery = next.query ?? filterQuery;
    const nextMatchFilter = next.matchFilter ?? filters.matchFilter;
    const params = new URLSearchParams();

    if (nextQuery.trim()) {
      params.set("q", nextQuery.trim());
    }

    if (filters.runId) {
      params.set("run", filters.runId);
    }

    if (nextMatchFilter !== "all") {
      params.set("match", nextMatchFilter);
    }

    resetLatestSearchState();
    router.replace(params.size > 0 ? `/find-jobs?${params}` : "/find-jobs", {
      scroll: false,
    });
  }

  function navigateToRun(runId: string): void {
    const params = new URLSearchParams();

    params.set("run", runId);

    if (filters.matchFilter !== "all") {
      params.set("match", filters.matchFilter);
    }

    router.replace(`/find-jobs?${params}`, { scroll: false });
  }

  function handleFilterQueryChange(value: string): void {
    setFilterQuery(value);
    updateRoute({ query: value });
  }

  function handleMatchFilterChange(value: MatchFilterValue): void {
    updateRoute({ matchFilter: value });
  }

  function resetLatestSearchState(): void {
    setLatestSearchJobs(null);
    setLatestSearchRunId(null);
  }

  return (
    <div className="relative flex flex-col gap-6">
      <ProcessOverlay
        active={isSearching}
        variant="jobs"
        title="Building your top 10"
        description="Searching live roles with salary estimates, scoring each one against your profile, and keeping the strongest matches."
        steps={[
          {
            title: "Reading role intent",
            detail: "Understanding the job title and location you entered.",
          },
          {
            title: "Collecting salary-listed roles",
            detail: "Keeping roles that include salary estimates before scoring.",
          },
          {
            title: "Scoring profile fit",
            detail: "Comparing the role against your saved skills and experience.",
          },
          {
            title: "Saving top matches",
            detail: "Writing the strongest matches to your search run.",
          },
          {
            title: "Preparing results",
            detail: "Refreshing the table with your highest matched jobs.",
          },
        ]}
      />
      <JobSearchCard
        jobTitle={jobTitle}
        location={location}
        isSearching={isSearching}
        feedback={feedback}
        onJobTitleChange={setJobTitle}
        onLocationChange={setLocation}
        onSearch={handleSearch}
      />
      <JobFilterBar
        filterQuery={filterQuery}
        matchFilter={filters.matchFilter}
        onFilterQueryChange={handleFilterQueryChange}
        onMatchFilterChange={handleMatchFilterChange}
      />
      {jobsList.error ? (
        <div className="rounded-md border border-error bg-surface px-4 py-3 text-[13px] font-medium leading-5 text-error">
          {jobsList.error}
        </div>
      ) : null}
      <JobsTable
        jobs={displayedJobs}
        emptyMessage={emptyMessage}
        compareScopeKey={compareScopeKey}
        compareScopeLabel={compareScopeLabel}
      />
      {shouldShowSummary ? (
        <div className="-mt-1 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[14px] font-normal leading-5 text-text-muted">
            Top{" "}
            <span className="font-semibold text-text-primary">
              {displayedTotal}
            </span>{" "}
            matched roles, ordered by match score.
          </p>
        </div>
      ) : null}
    </div>
  );
}

function filterAndSortJobs(
  jobs: FindJobsJobSummary[],
  filters: {
    query: string;
    matchFilter: MatchFilterValue;
  },
): FindJobsJobSummary[] {
  const normalizedQuery = filters.query.trim().toLowerCase();

  return jobs
    .filter((job) => {
      if (filters.matchFilter === "high" && job.matchScore < MATCH_THRESHOLD) {
        return false;
      }

      if (filters.matchFilter === "low" && job.matchScore >= MATCH_THRESHOLD) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return (
        job.company.toLowerCase().includes(normalizedQuery) ||
        job.title.toLowerCase().includes(normalizedQuery)
      );
    })
    .sort((left, right) => right.matchScore - left.matchScore);
}
