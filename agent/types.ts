import type { WorkExperienceEntry } from "@/lib/profile";

export type FindJobsProfile = {
  id: string;
  full_name: string | null;
  current_title: string | null;
  experience_level: string | null;
  years_experience: number | null;
  skills: string[];
  industries: string[];
  work_experience: WorkExperienceEntry[];
  job_titles_seeking: string[];
  remote_preference: string | null;
  preferred_locations: string[];
  work_authorization: string | null;
  is_complete: boolean;
};

export type JobMatchResult = {
  matchScore: number;
  matchReason: string;
  matchedSkills: string[];
  missingSkills: string[];
};

export type FindJobsJobSummary = {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string | null;
  source: "Search";
  foundAt: string;
  matchScore: number;
  matchReason: string;
  matchedSkills: string[];
  missingSkills: string[];
  externalApplyUrl: string;
};

export type FindJobsSearchResponse =
  | {
      success: true;
      data: {
        runId: string;
        jobs: FindJobsJobSummary[];
        totalFound: number;
        strongMatchCount: number;
      };
    }
  | {
      success: false;
      error: string;
    };
