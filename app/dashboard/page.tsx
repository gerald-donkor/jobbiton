import { DashboardPageContent } from "@/components/dashboard/DashboardPageContent";
import { requireUser } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await requireUser();

  return (
    <DashboardPageContent
      userId={user.id}
      userEmail={user.email}
      userName={user.profile?.name}
    />
  );
}
