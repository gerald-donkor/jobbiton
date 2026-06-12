import { FindJobsPageContent } from "@/components/find-jobs/FindJobsPageContent";
import { requireUser } from "@/lib/auth";

export default async function FindJobsPage() {
  const user = await requireUser();

  return (
    <FindJobsPageContent
      userId={user.id}
      userEmail={user.email}
      userName={user.profile?.name}
    />
  );
}
