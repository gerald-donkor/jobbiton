import { capturePostHogServerEvent } from "@/lib/posthog-server";
import {
  detectAdzunaCountry,
  formatAdzunaSalary,
  normalizeAdzunaJobType,
  searchAdzunaJobs,
} from "@/lib/adzuna";
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
      totalFound: number;
      strongMatchCount: number;
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

async function logAgentMessage({
  jobId,
  level,
  message,
  runId,
  userId,
}: {
  jobId?: string;
  level: "info" | "success" | "warning" | "error";
  message: string;
  runId: string;
  userId: string;
}): Promise<void> {
  try {
    const insforge = await createInsforgeServer();
    const { error } = await insforge.database.from("agent_logs").insert([
      {
        run_id: runId,
        user_id: userId,
        job_id: jobId ?? null,
        level,
        message,
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error("[agent/adzuna] Unable to write agent log", error);
    }
  } catch (error) {
    console.error("[agent/adzuna] Unable to write agent log", error);
  }
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

export async function discoverJobsForUser({
  jobTitle,
  location,
  userId,
}: {
  jobTitle: string;
  location: string;
  userId: string;
}): Promise<DiscoverJobsResult> {
  const insforge = await createInsforgeServer();
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

  const runId = run.id;

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

    const country = detectAdzunaCountry(location);
    const adzunaJobs = await searchAdzunaJobs(jobTitle, location, country);

    if (adzunaJobs.length === 0) {
      await insforge.database
        .from("agent_runs")
        .update({
          status: "completed",
          jobs_found: 0,
          completed_at: new Date().toISOString(),
        })
        .eq("id", runId)
        .eq("user_id", userId);

      return {
        success: true,
        runId,
        jobs: [],
        totalFound: 0,
        strongMatchCount: 0,
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
          jobs_found: adzunaJobs.length,
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
          jobs_found: adzunaJobs.length,
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
        jobs_found: adzunaJobs.length,
        completed_at: new Date().toISOString(),
      })
      .eq("id", runId)
      .eq("user_id", userId);

    await logAgentMessage({
      level: "success",
      message: `Discovered ${adzunaJobs.length} jobs and saved ${jobs.length}.`,
      runId,
      userId,
    });

    return {
      success: true,
      runId,
      jobs,
      totalFound: adzunaJobs.length,
      strongMatchCount: jobs.filter((job) => job.matchScore >= MATCH_THRESHOLD)
        .length,
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
