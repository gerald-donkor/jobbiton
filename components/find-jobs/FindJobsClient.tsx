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
import type {
  FindJobsListResult,
  MatchFilterValue,
  SortValue,
} from "@/components/find-jobs/types";
import { MATCH_THRESHOLD } from "@/lib/utils";

type FindJobsClientProps = {
  jobsList: FindJobsListResult;
  filters: {
    query: string;
    matchFilter: MatchFilterValue;
    sortBy: SortValue;
    runId: string | null;
  };
};

const LIVE_SEARCH_PAGE_SIZE = 10;

type LiveSearchRequest = {
  jobTitle: string;
  location: string;
  runId: string;
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
  const [latestSearchPage, setLatestSearchPage] = useState(1);
  const [latestSearchTotalAvailable, setLatestSearchTotalAvailable] =
    useState<number | null>(null);
  const [latestSearchPages, setLatestSearchPages] = useState<
    Record<number, FindJobsJobSummary[]>
  >({});
  const [liveSearchRequest, setLiveSearchRequest] =
    useState<LiveSearchRequest | null>(null);
  const [feedback, setFeedback] = useState<{
    tone: "error" | "success";
    text: string;
  } | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const visibleLatestSearchJobs = latestSearchJobs
    ? filterAndSortJobs(latestSearchJobs, {
        query: filterQuery,
        matchFilter: filters.matchFilter,
        sortBy: filters.sortBy,
      })
    : null;
  const displayedJobs = visibleLatestSearchJobs ?? jobsList.jobs;
  const compareScopeKey =
    latestSearchRunId ?? filters.runId ?? jobsList.activeRunId ?? "no-active-search";
  const compareScopeLabel = latestSearchRunId
    ? `Search for ${jobTitle.trim() || "new roles"}`
    : "Current search";
  const displayedTotal = latestSearchJobs
    ? (latestSearchTotalAvailable ?? displayedJobs.length)
    : jobsList.totalResults;
  const showingFrom =
    displayedTotal === 0
      ? 0
      : visibleLatestSearchJobs
        ? (latestSearchPage - 1) * LIVE_SEARCH_PAGE_SIZE + 1
        : (jobsList.currentPage - 1) * jobsList.pageSize + 1;
  const showingTo = visibleLatestSearchJobs
    ? Math.min(
        (latestSearchPage - 1) * LIVE_SEARCH_PAGE_SIZE +
          visibleLatestSearchJobs.length,
        displayedTotal,
      )
    : Math.min(jobsList.currentPage * jobsList.pageSize, jobsList.totalResults);
  const latestSearchTotalPages =
    latestSearchTotalAvailable === null
      ? 1
      : Math.max(1, Math.ceil(latestSearchTotalAvailable / LIVE_SEARCH_PAGE_SIZE));
  const shouldShowPagination = visibleLatestSearchJobs
    ? visibleLatestSearchJobs.length > 0
    : jobsList.totalResults > 0;
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

      setLatestSearchJobs(result.data.jobs);
      setLatestSearchRunId(result.data.runId);
      setLatestSearchPage(result.data.page);
      setLatestSearchTotalAvailable(result.data.totalAvailable);
      setLatestSearchPages({ [result.data.page]: result.data.jobs });
      setLiveSearchRequest({
        jobTitle: trimmedJobTitle,
        location: location.trim(),
        runId: result.data.runId,
      });
      setFilterQuery("");
      setFeedback({
        tone: "success",
        text:
          result.data.totalAvailable === 0
            ? "No jobs matched that search right now."
            : `Found ${result.data.totalAvailable} available jobs. Saved and scored ${result.data.totalFound} for this page, including ${result.data.strongMatchCount} strong matches.`,
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
    sortBy?: SortValue;
    page?: number;
  }): void {
    const nextQuery = next.query ?? filterQuery;
    const nextMatchFilter = next.matchFilter ?? filters.matchFilter;
    const nextSortBy = next.sortBy ?? filters.sortBy;
    const nextPage = next.page ?? 1;
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

    if (nextSortBy !== "score") {
      params.set("sort", nextSortBy);
    }

    if (nextPage > 1) {
      params.set("page", String(nextPage));
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

    if (filters.sortBy !== "score") {
      params.set("sort", filters.sortBy);
    }

    router.replace(`/find-jobs?${params}`, { scroll: false });
  }

  function navigateToRunPage(runId: string, page: number): void {
    const params = new URLSearchParams();

    params.set("run", runId);

    if (page > 1) {
      params.set("page", String(page));
    }

    if (filters.matchFilter !== "all") {
      params.set("match", filters.matchFilter);
    }

    if (filters.sortBy !== "score") {
      params.set("sort", filters.sortBy);
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

  function handleSortByChange(value: SortValue): void {
    updateRoute({ sortBy: value });
  }

  function handlePageChange(page: number): void {
    updateRoute({ page });
  }

  async function handleLiveSearchPageChange(page: number): Promise<void> {
    if (!liveSearchRequest || page === latestSearchPage) {
      return;
    }

    const cachedPage = latestSearchPages[page];

    if (cachedPage) {
      setLatestSearchJobs(cachedPage);
      setLatestSearchPage(page);
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
          jobTitle: liveSearchRequest.jobTitle,
          location: liveSearchRequest.location,
          page,
          runId: liveSearchRequest.runId,
        }),
      });
      const result = (await response.json()) as FindJobsSearchResponse;

      if (!response.ok || !result.success) {
        setFeedback({
          tone: "error",
          text: result.success
            ? "We could not load that jobs page right now."
            : result.error,
        });
        return;
      }

      setLatestSearchJobs(result.data.jobs);
      setLatestSearchRunId(result.data.runId);
      setLatestSearchPage(result.data.page);
      setLatestSearchTotalAvailable(result.data.totalAvailable);
      setLatestSearchPages((current) => ({
        ...current,
        [result.data.page]: result.data.jobs,
      }));
      navigateToRunPage(result.data.runId, result.data.page);
    } catch (error) {
      console.error("[FindJobsClient] Search page request failed", error);
      setFeedback({
        tone: "error",
        text: "We could not load that jobs page right now.",
      });
    } finally {
      setIsSearching(false);
    }
  }

  function resetLatestSearchState(): void {
    setLatestSearchJobs(null);
    setLatestSearchRunId(null);
    setLatestSearchPage(1);
    setLatestSearchTotalAvailable(null);
    setLatestSearchPages({});
    setLiveSearchRequest(null);
  }

  return (
    <div className="flex flex-col gap-6">
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
        sortBy={filters.sortBy}
        onFilterQueryChange={handleFilterQueryChange}
        onMatchFilterChange={handleMatchFilterChange}
        onSortByChange={handleSortByChange}
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
      {shouldShowPagination ? (
        <div className="-mt-1 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[14px] font-normal leading-5 text-text-muted">
            Showing{" "}
            <span className="font-semibold text-text-primary">
              {showingFrom}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-text-primary">
              {showingTo}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-text-primary">
              {displayedTotal}
            </span>{" "}
            results
          </p>
          <JobsPagination
            currentPage={latestSearchJobs ? latestSearchPage : jobsList.currentPage}
            totalPages={latestSearchJobs ? latestSearchTotalPages : jobsList.totalPages}
            onPageChange={
              latestSearchJobs ? handleLiveSearchPageChange : handlePageChange
            }
          />
        </div>
      ) : null}
    </div>
  );
}

function JobsPagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const pages = getVisiblePages(currentPage, totalPages);

  return (
    <nav
      aria-label="Jobs pagination"
      className="flex flex-wrap items-center gap-3"
    >
      <button
        type="button"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="inline-flex h-8 items-center gap-2 text-[14px] font-normal leading-5 text-text-muted transition-colors hover:text-accent disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:text-text-muted"
      >
        <span aria-hidden="true" className="find-jobs-chevron-left" />
        Previous
      </button>
      {pages.map((page) => (
        <button
          key={page}
          type="button"
          aria-current={page === currentPage ? "page" : undefined}
          onClick={() => onPageChange(page)}
          className={
            page === currentPage
              ? "h-8 min-w-8 rounded-full bg-accent text-[14px] font-medium leading-5 text-accent-foreground shadow-[0_6px_14px_color-mix(in_srgb,var(--color-accent)_22%,transparent)]"
              : "h-8 min-w-8 rounded-full text-[14px] font-medium leading-5 text-text-secondary transition-colors hover:bg-surface-secondary hover:text-accent"
          }
        >
          {page}
        </button>
      ))}
      <button
        type="button"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="inline-flex h-8 items-center gap-2 text-[14px] font-normal leading-5 text-text-muted transition-colors hover:text-accent disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:text-text-muted"
      >
        Next
        <span aria-hidden="true" className="find-jobs-chevron-right" />
      </button>
    </nav>
  );
}

function getVisiblePages(currentPage: number, totalPages: number): number[] {
  const pages: number[] = [];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);

  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }

  return pages;
}

function filterAndSortJobs(
  jobs: FindJobsJobSummary[],
  filters: {
    query: string;
    matchFilter: MatchFilterValue;
    sortBy: SortValue;
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
    .sort((left, right) => {
      if (filters.sortBy === "newest") {
        return (
          new Date(right.foundAt).getTime() - new Date(left.foundAt).getTime()
        );
      }

      if (filters.sortBy === "oldest") {
        return (
          new Date(left.foundAt).getTime() - new Date(right.foundAt).getTime()
        );
      }

      return right.matchScore - left.matchScore;
    });
}
