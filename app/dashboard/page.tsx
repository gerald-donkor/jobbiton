import { DashboardPageContent } from "@/components/dashboard/DashboardPageContent";
import { requireUser } from "@/lib/auth";
import { getRecentActivityForUser } from "@/lib/dashboard-activity";
import { getDashboardStatsForUser } from "@/lib/dashboard-stats";

export default async function DashboardPage() {
  const user = await requireUser();
  const [stats, activities] = await Promise.all([
    getDashboardStatsForUser(user.id),
    getRecentActivityForUser(user.id),
  ]);

  return (
    <DashboardPageContent
      activities={activities}
      stats={stats}
      userId={user.id}
      userEmail={user.email}
      userName={user.profile?.name}
    />
  );
}
