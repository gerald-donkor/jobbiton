import { PostHogIdentify } from "@/components/auth/PostHogIdentify";
import { FindJobsClient } from "@/components/find-jobs/FindJobsClient";
import { Navbar } from "@/components/layout/Navbar";

type FindJobsPageContentProps = {
  userId: string;
  userEmail: string;
  userName?: string | null;
};

export function FindJobsPageContent({
  userId,
  userEmail,
  userName,
}: FindJobsPageContentProps) {
  return (
    <div className="min-h-screen bg-background">
      <PostHogIdentify userId={userId} email={userEmail} name={userName} />
      <Navbar />
      <main className="mx-auto w-full max-w-[1440px] bg-background px-6 py-8 text-text-primary">
        <div className="mx-auto flex w-full max-w-[1192px] flex-col gap-6">
          <FindJobsClient />
        </div>
      </main>
    </div>
  );
}
