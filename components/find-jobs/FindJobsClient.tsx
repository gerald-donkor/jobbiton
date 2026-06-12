"use client";

import { useState } from "react";
import type {
  FindJobsJobSummary,
  FindJobsSearchResponse,
} from "@/agent/types";
import { JobFilterBar } from "@/components/find-jobs/JobFilterBar";
import { JobSearchCard } from "@/components/find-jobs/JobSearchCard";
import { JobsTable } from "@/components/find-jobs/JobsTable";

export function FindJobsClient() {
  const [jobTitle, setJobTitle] = useState("");
  const [location, setLocation] = useState("");
  const [jobs, setJobs] = useState<FindJobsJobSummary[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [feedback, setFeedback] = useState<{
    tone: "error" | "success";
    text: string;
  } | null>(null);
  const [isSearching, setIsSearching] = useState(false);

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
        setJobs([]);
        setTotalResults(0);
        setFeedback({
          tone: "error",
          text: result.success
            ? "We could not search for jobs right now."
            : result.error,
        });
        return;
      }

      setJobs(result.data.jobs);
      setTotalResults(result.data.jobs.length);
      setFeedback({
        tone: "success",
        text:
          result.data.totalFound === 0
            ? "No jobs matched that search right now."
            : `Found ${result.data.totalFound} jobs and saved ${result.data.strongMatchCount} strong matches.`,
      });
    } catch (error) {
      console.error("[FindJobsClient] Search request failed", error);
      setJobs([]);
      setTotalResults(0);
      setFeedback({
        tone: "error",
        text: "We could not search for jobs right now.",
      });
    } finally {
      setIsSearching(false);
    }
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
      <JobFilterBar />
      <JobsTable jobs={jobs} />
      <div className="-mt-1 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[14px] font-normal leading-5 text-text-muted">
          Showing{" "}
          <span className="font-semibold text-text-primary">
            {jobs.length === 0 ? 0 : 1}
          </span>{" "}
          to{" "}
          <span className="font-semibold text-text-primary">
            {jobs.length}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-text-primary">
            {totalResults}
          </span>{" "}
          results
        </p>
        <nav
          aria-label="Jobs pagination"
          className="flex flex-wrap items-center gap-3"
        >
          <button
            type="button"
            disabled
            className="inline-flex h-8 items-center gap-2 text-[14px] font-normal leading-5 text-text-muted disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span aria-hidden="true" className="find-jobs-chevron-left" />
            Previous
          </button>
          <button
            type="button"
            aria-current="page"
            className="h-8 min-w-8 rounded-full bg-accent text-[14px] font-medium leading-5 text-accent-foreground shadow-[0_6px_14px_color-mix(in_srgb,var(--color-accent)_22%,transparent)]"
          >
            1
          </button>
          <button
            type="button"
            disabled
            className="inline-flex h-8 items-center gap-2 text-[14px] font-normal leading-5 text-text-muted disabled:cursor-not-allowed disabled:opacity-60"
          >
            Next
            <span aria-hidden="true" className="find-jobs-chevron-right" />
          </button>
        </nav>
      </div>
    </div>
  );
}
