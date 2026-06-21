import { PostHogIdentify } from "@/components/auth/PostHogIdentify";
import { FindJobsClient } from "@/components/find-jobs/FindJobsClient";
import { Navbar } from "@/components/layout/Navbar";
import { PageIntro } from "@/components/layout/PageIntro";
import { Reveal } from "@/components/motion/Reveal";
import type {
  FindJobsListResult,
  MatchFilterValue,
} from "@/components/find-jobs/types";

type FindJobsPageContentProps = {
  userId: string;
  userEmail: string;
  userName?: string | null;
  jobsList: FindJobsListResult;
  filters: {
    query: string;
    matchFilter: MatchFilterValue;
    runId: string | null;
  };
};

export function FindJobsPageContent({
  userId,
  userEmail,
  userName,
  jobsList,
  filters,
}: FindJobsPageContentProps) {
  return (
    <div className="min-h-screen bg-background">
      <PostHogIdentify userId={userId} email={userEmail} name={userName} />
      <Navbar />
      <PageIntro
        eyebrow="Discovery"
        title="Search roles, then let fit rise to the top."
        copy="The search page now follows the same editorial flow: intent first, action second, then an organized list of matched opportunities."
      />
      <main className="mx-auto w-full max-w-[1440px] bg-background px-4 py-6 text-text-primary sm:px-6 sm:py-8">
        <div className="mx-auto flex w-full max-w-[1192px] flex-col gap-6">
          <Reveal>
            <FindJobsClient
              key={`${filters.runId ?? "no-run"}:${filters.query}:${filters.matchFilter}:${jobsList.currentPage}`}
              jobsList={jobsList}
              filters={filters}
            />
          </Reveal>
        </div>
      </main>
    </div>
  );
}
