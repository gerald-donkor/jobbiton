import { PostHogIdentify } from "@/components/auth/PostHogIdentify";
import { CompanyResearchChart } from "@/components/dashboard/CompanyResearchChart";
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";
import { JobsFoundChart } from "@/components/dashboard/JobsFoundChart";
import { MatchDistributionChart } from "@/components/dashboard/MatchDistributionChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { StatCard } from "@/components/dashboard/StatCard";
import type { DashboardAnalytics } from "@/lib/dashboard-analytics";
import type { DashboardActivityItem } from "@/lib/dashboard-activity";
import type { DashboardStat } from "@/lib/dashboard-stats";

type DashboardPageContentProps = {
  activities: DashboardActivityItem[];
  analytics: DashboardAnalytics;
  stats: DashboardStat[];
  userId: string;
  userEmail: string;
  userName?: string | null;
};

export function DashboardPageContent({
  activities,
  analytics,
  stats,
  userId,
  userEmail,
  userName,
}: DashboardPageContentProps) {
  return (
    <div className="min-h-screen bg-background">
      <PostHogIdentify userId={userId} email={userEmail} name={userName} />
      <DashboardNavbar />
      <main className="w-full bg-background px-6 pb-16 pt-8 text-text-primary">
        <div className="mx-auto grid max-w-[824px] gap-4">
          <section
            aria-label="Dashboard statistics"
            className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
          >
            {stats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <RecentActivity activities={activities} />
            <CompanyResearchChart data={analytics.companyResearchActivity} />
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <JobsFoundChart data={analytics.jobsFoundOverTime} />
            <MatchDistributionChart data={analytics.matchScoreDistribution} />
          </section>
        </div>
      </main>
    </div>
  );
}
