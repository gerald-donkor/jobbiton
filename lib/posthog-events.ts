export type PostHogEvent =
  | {
      name: "job_search_started";
      distinctId: string;
      properties: {
        userId: string;
        jobTitle: string;
        location: string;
      };
    }
  | {
      name: "job_found";
      distinctId: string;
      properties: {
        userId: string;
        source: string;
        matchScore: number;
      };
    }
  | {
      name: "profile_completed";
      distinctId: string;
      properties: {
        userId: string;
      };
    }
  | {
      name: "company_researched";
      distinctId: string;
      properties: {
        userId: string;
        jobId: string;
        company: string;
      };
    };
