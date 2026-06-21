import type { FindJobsJobSummary } from "@/agent/types";

export type JobWorkflowStatus =
  | "interested"
  | "applied"
  | "interviewing"
  | "offer"
  | "rejected"
  | "archived";

export type JobWorkflowSnapshot = Pick<
  FindJobsJobSummary,
  | "id"
  | "title"
  | "company"
  | "location"
  | "salary"
  | "foundAt"
  | "matchScore"
  | "matchReason"
  | "matchedSkills"
  | "missingSkills"
  | "externalApplyUrl"
>;

export type JobWorkflowCompareSession = {
  id: string;
  scopeKey: string;
  label: string;
  createdAt: string;
  jobs: JobWorkflowSnapshot[];
};

export type JobWorkflowState = {
  favorites: Record<string, true>;
  dismissed: Record<string, true>;
  statuses: Record<string, JobWorkflowStatus>;
  notes: Record<string, string>;
  compare: Record<string, JobWorkflowSnapshot>;
  activeCompareScopeKey: string | null;
  activeCompareScopeLabel: string | null;
  compareHistory: JobWorkflowCompareSession[];
};

export const workflowStatuses: {
  value: JobWorkflowStatus;
  label: string;
}[] = [
  { value: "interested", label: "Interested" },
  { value: "applied", label: "Applied" },
  { value: "interviewing", label: "Interviewing" },
  { value: "offer", label: "Offer" },
  { value: "rejected", label: "Rejected" },
  { value: "archived", label: "Archived" },
];
