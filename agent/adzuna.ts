import { capturePostHogServerEvent } from "@/lib/posthog-server";
import {
  detectAdzunaCountry,
  formatAdzunaSalary,
  normalizeAdzunaJobType,
  searchAdzunaJobs,
} from "@/lib/adzuna";
import { logAgentMessage } from "@/lib/agent-logs";
import { createInsforgeServer } from "@/lib/insforge-server";
import { MATCH_THRESHOLD } from "@/lib/utils";
import { matchJobToProfile } from "@/agent/matcher";
import type {
  FindJobsJobSummary,
  FindJobsProfile,
} from "@/agent/types";

type DiscoverJobsResult =
  | {
      success: true;
      runId: string;
      jobs: FindJobsJobSummary[];
      page: number;
      totalFound: number;
      totalAvailable: number;
      strongMatchCount: number;
      searchUrl: string;
    }
  | {
      success: false;
      error: string;
      statusCode?: number;
    };

function describeError(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      cause: error.cause,
    };
  }

  return { error };
}

async function loadProfile(userId: string): Promise<FindJobsProfile | null> {
  const insforge = await createInsforgeServer();
  const { data, error } = await insforge.database
    .from("profiles")
    .select(
      "id, full_name, current_title, experience_level, years_experience, skills, industries, work_experience, job_titles_seeking, remote_preference, preferred_locations, work_authorization, is_complete",
    )
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("[agent/adzuna] Profile lookup failed", error);
    return null;
  }

  if (!data) {
    return null;
  }

  return {
    id: String(data.id),
    full_name: typeof data.full_name === "string" ? data.full_name : null,
    current_title:
      typeof data.current_title === "string" ? data.current_title : null,
    experience_level:
      typeof data.experience_level === "string"
        ? data.experience_level
        : null,
    years_experience:
      typeof data.years_experience === "number" ? data.years_experience : null,
    skills: Array.isArray(data.skills)
      ? data.skills.filter((value): value is string => typeof value === "string")
      : [],
    industries: Array.isArray(data.industries)
      ? data.industries.filter(
          (value): value is string => typeof value === "string",
        )
      : [],
    work_experience: Array.isArray(data.work_experience)
      ? data.work_experience.filter(
          (value): value is FindJobsProfile["work_experience"][number] =>
            Boolean(value) && typeof value === "object",
        )
      : [],
    job_titles_seeking: Array.isArray(data.job_titles_seeking)
      ? data.job_titles_seeking.filter(
          (value): value is string => typeof value === "string",
        )
      : [],
    remote_preference:
      typeof data.remote_preference === "string"
        ? data.remote_preference
        : null,
    preferred_locations: Array.isArray(data.preferred_locations)
      ? data.preferred_locations.filter(
          (value): value is string => typeof value === "string",
        )
      : [],
    work_authorization:
      typeof data.work_authorization === "string"
        ? data.work_authorization
        : null,
    is_complete: data.is_complete === true,
  };
}

type RunContext =
  | {
      success: true;
      runId: string;
      jobTitle: string;
      location: string;
    }
  | {
      success: false;
      error: string;
      statusCode?: number;
    };

async function createSearchRun({
  insforge,
  jobTitle,
  location,
  userId,
}: {
  insforge: Awaited<ReturnType<typeof createInsforgeServer>>;
  jobTitle: string;
  location: string;
  userId: string;
}): Promise<RunContext> {
  const { data: run, error: runError } = await insforge.database
    .from("agent_runs")
    .insert([
      {
        user_id: userId,
        status: "running",
        job_title_searched: jobTitle,
        location_searched: location || null,
        jobs_found: 0,
        started_at: new Date().toISOString(),
      },
    ])
    .select("id")
    .single();

  if (runError || !run?.id) {
    console.error("[agent/adzuna] Unable to create agent run", runError);
    return { success: false, error: "We could not start your job search." };
  }

  return {
    success: true,
    runId: String(run.id),
    jobTitle,
    location,
  };
}

async function loadExistingRun({
  runId,
  userId,
}: {
  runId: string;
  userId: string;
}): Promise<RunContext> {
  const insforge = await createInsforgeServer();
  const { data, error } = await insforge.database
    .from("agent_runs")
    .select("id, job_title_searched, location_searched")
    .eq("id", runId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("[agent/adzuna] Existing run lookup failed", error);
    return {
      success: false,
      error: "We could not load that job search.",
      statusCode: 500,
    };
  }

  if (!data?.id || typeof data.job_title_searched !== "string") {
    return {
      success: false,
      error: "We could not load that job search.",
      statusCode: 404,
    };
  }

  return {
    success: true,
    runId: String(data.id),
    jobTitle: data.job_title_searched,
    location:
      typeof data.location_searched === "string" ? data.location_searched : "",
  };
}

export async function discoverJobsForUser({
  jobTitle,
  location,
  page = 1,
  runId: requestedRunId = null,
  userId,
}: {
  jobTitle: string;
  location: string;
  page?: number;
  runId?: string | null;
  userId: string;
}): Promise<DiscoverJobsResult> {
  const insforge = await createInsforgeServer();
  const requestedPage = Math.max(1, page);
  const runContext = requestedRunId
    ? await loadExistingRun({
        runId: requestedRunId,
        userId,
      })
    : await createSearchRun({
        insforge,
        jobTitle,
        location,
        userId,
      });

  if (!runContext.success) {
    return {
      success: false,
      error: runContext.error,
      statusCode: runContext.statusCode,
    };
  }

  const { runId } = runContext;
  const effectiveJobTitle = runContext.jobTitle;
  const effectiveLocation = runContext.location;

  try {
    const profile = await loadProfile(userId);

    if (!profile || profile.skills.length === 0) {
      await logAgentMessage({
        level: "warning",
        message: "Job search blocked because the user profile is incomplete.",
        runId,
        userId,
      });
      await insforge.database
        .from("agent_runs")
        .update({
          status: "failed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", runId)
        .eq("user_id", userId);

      return {
        success: false,
        error: "Please complete your profile before searching for jobs.",
        statusCode: 400,
      };
    }

    const country = detectAdzunaCountry(effectiveLocation);
    const adzunaSearch = await searchAdzunaJobs(
      effectiveJobTitle,
      effectiveLocation,
      country,
      requestedPage,
    );
    const adzunaJobs = adzunaSearch.jobs;

    if (adzunaJobs.length === 0) {
      await insforge.database
        .from("agent_runs")
        .update({
          status: "completed",
          jobs_found: adzunaSearch.totalAvailable,
          completed_at: new Date().toISOString(),
        })
        .eq("id", runId)
        .eq("user_id", userId);

      return {
        success: true,
        runId,
        jobs: [],
        page: requestedPage,
        totalFound: 0,
        totalAvailable: adzunaSearch.totalAvailable,
        strongMatchCount: 0,
        searchUrl: adzunaSearch.searchUrl,
      };
    }

    const jobRows: Array<Record<string, unknown>> = [];

    for (const job of adzunaJobs) {
      try {
        const match = await matchJobToProfile(job, profile);

        jobRows.push({
          run_id: runId,
          user_id: userId,
          source: "search",
          source_url: job.redirect_url,
          external_apply_url: job.redirect_url,
          title: job.title,
          company: job.company.display_name,
          location: job.location.display_name,
          salary: formatAdzunaSalary(job),
          job_type: normalizeAdzunaJobType(job.contract_type),
          about_role: job.description,
          responsibilities: [],
          requirements: [],
          nice_to_have: [],
          benefits: [],
          about_company: null,
          match_score: match.matchScore,
          match_reason: match.matchReason,
          matched_skills: match.matchedSkills,
          missing_skills: match.missingSkills,
          found_at: new Date().toISOString(),
        });
      } catch (error) {
        console.error("[agent/adzuna] Job scoring failed", describeError(error));
        await logAgentMessage({
          level: "warning",
          message: `Skipped ${job.title} at ${job.company.display_name} because scoring failed.`,
          runId,
          userId,
        });
      }
    }

    if (jobRows.length === 0) {
      await insforge.database
        .from("agent_runs")
        .update({
          status: "failed",
          jobs_found: adzunaSearch.totalAvailable,
          completed_at: new Date().toISOString(),
        })
        .eq("id", runId)
        .eq("user_id", userId);

      return {
        success: false,
        error: "We found jobs, but we could not score them. Please try again.",
      };
    }

    const { data: insertedJobs, error: insertError } = await insforge.database
      .from("jobs")
      .insert(jobRows)
      .select(
        "id, title, company, location, salary, match_score, match_reason, matched_skills, missing_skills, external_apply_url, found_at",
      );

    if (insertError || !insertedJobs) {
      console.error("[agent/adzuna] Job insert failed", insertError);
      await logAgentMessage({
        level: "error",
        message: "Job search failed while saving discovered jobs.",
        runId,
        userId,
      });
      await insforge.database
        .from("agent_runs")
        .update({
          status: "failed",
          jobs_found: adzunaSearch.totalAvailable,
          completed_at: new Date().toISOString(),
        })
        .eq("id", runId)
        .eq("user_id", userId);

      return {
        success: false,
        error: "We found jobs, but could not save them.",
      };
    }

    const jobs = [...insertedJobs]
      .map(
        (job): FindJobsJobSummary => ({
          id: String(job.id),
          title: String(job.title),
          company: String(job.company),
          location: String(job.location),
          salary:
            typeof job.salary === "string" && job.salary.trim()
              ? job.salary
              : null,
          source: "Search",
          foundAt: String(job.found_at),
          matchScore: Number(job.match_score),
          matchReason: String(job.match_reason),
          matchedSkills: Array.isArray(job.matched_skills)
            ? job.matched_skills.filter(
                (value): value is string => typeof value === "string",
              )
            : [],
          missingSkills: Array.isArray(job.missing_skills)
            ? job.missing_skills.filter(
                (value): value is string => typeof value === "string",
              )
            : [],
          externalApplyUrl: String(job.external_apply_url),
        }),
      )
      .sort((left, right) => right.matchScore - left.matchScore);

    for (const job of jobs) {
      await capturePostHogServerEvent({
        name: "job_found",
        distinctId: userId,
        properties: {
          userId,
          source: "search",
          matchScore: job.matchScore,
        },
      });
    }

    await insforge.database
      .from("agent_runs")
      .update({
        status: "completed",
        jobs_found: adzunaSearch.totalAvailable,
        completed_at: new Date().toISOString(),
      })
      .eq("id", runId)
      .eq("user_id", userId);

    await logAgentMessage({
      level: "success",
      message: `Found ${adzunaSearch.totalAvailable} available jobs and saved ${jobs.length}.`,
      runId,
      userId,
    });

    return {
      success: true,
      runId,
      jobs,
      page: requestedPage,
      totalFound: adzunaJobs.length,
      totalAvailable: adzunaSearch.totalAvailable,
      strongMatchCount: jobs.filter((job) => job.matchScore >= MATCH_THRESHOLD)
        .length,
      searchUrl: adzunaSearch.searchUrl,
    };
  } catch (error) {
    console.error("[agent/adzuna]", describeError(error));
    await logAgentMessage({
      level: "error",
      message: "Job discovery failed before completion.",
      runId,
      userId,
    });
    await insforge.database
      .from("agent_runs")
      .update({
        status: "failed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", runId)
      .eq("user_id", userId);

    return {
      success: false,
      error: "We could not complete the job search. Please try again.",
    };
  }
}
