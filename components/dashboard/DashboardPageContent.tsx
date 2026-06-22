import { PostHogIdentify } from "@/components/auth/PostHogIdentify";
import { CompanyResearchChart } from "@/components/dashboard/CompanyResearchChart";
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";
import { JobsFoundChart } from "@/components/dashboard/JobsFoundChart";
import { MatchDistributionChart } from "@/components/dashboard/MatchDistributionChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { StatCard } from "@/components/dashboard/StatCard";
import { PageIntro } from "@/components/layout/PageIntro";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
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
    <div className="min-h-screen bg-background/68">
      <PostHogIdentify userId={userId} email={userEmail} name={userName} />
      <DashboardNavbar />
      <PageIntro
        eyebrow="Command center"
        title="Track the search as it compounds."
        copy="See the same proof-led flow from the landing page translated into live analytics: jobs found, match quality, company research, and recent agent activity."
        density="compact"
      />
      <main className="w-full bg-background/56 px-4 pb-16 pt-6 text-text-primary backdrop-blur-[2px] sm:px-6 lg:pt-8">
        <RevealGroup className="mx-auto grid w-full max-w-[1120px] gap-4 2xl:max-w-[1240px]">
          <section
            aria-label="Dashboard statistics"
            className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
          >
            {stats.map((stat) => (
              <RevealItem key={stat.label} className="min-w-0">
                <StatCard {...stat} />
              </RevealItem>
            ))}
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <RevealItem className="min-w-0">
              <RecentActivity activities={activities} />
            </RevealItem>
            <RevealItem className="min-w-0">
              <CompanyResearchChart data={analytics.companyResearchActivity} />
            </RevealItem>
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <RevealItem className="min-w-0">
              <JobsFoundChart data={analytics.jobsFoundOverTime} />
            </RevealItem>
            <RevealItem className="min-w-0">
              <MatchDistributionChart data={analytics.matchScoreDistribution} />
            </RevealItem>
          </section>
        </RevealGroup>
      </main>
    </div>
  );
}
