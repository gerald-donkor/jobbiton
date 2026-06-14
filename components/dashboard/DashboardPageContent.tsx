import { PostHogIdentify } from "@/components/auth/PostHogIdentify";
import { Navbar } from "@/components/layout/Navbar";
import { CompanyResearchChart } from "@/components/dashboard/CompanyResearchChart";
import { JobsFoundChart } from "@/components/dashboard/JobsFoundChart";
import { MatchDistributionChart } from "@/components/dashboard/MatchDistributionChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { StatCard } from "@/components/dashboard/StatCard";

type DashboardPageContentProps = {
  userId: string;
  userEmail: string;
  userName?: string | null;
};

const stats = [
  {
    label: "Total Jobs Found",
    value: "284",
    trend: "+12%",
    helper: "vs last week",
  },
  {
    label: "Avg. Match Rate",
    value: "82%",
    trend: "+3%",
    helper: "vs last week",
  },
  {
    label: "Companies Researched",
    value: "35",
    helper: "Total researched",
  },
  {
    label: "Jobs This Week",
    value: "28",
    helper: "New this week",
  },
];

export function DashboardPageContent({
  userId,
  userEmail,
  userName,
}: DashboardPageContentProps) {
  return (
    <div className="min-h-screen bg-background">
      <PostHogIdentify userId={userId} email={userEmail} name={userName} />
      <Navbar activeHref="/dashboard" showNavIcons showCta={false} />
      <main className="mx-auto w-full max-w-[1440px] border-x border-border bg-background px-6 py-8 text-text-primary">
        <div className="grid gap-6">
          <section
            aria-label="Dashboard statistics"
            className="grid gap-6 md:grid-cols-2 xl:grid-cols-4"
          >
            {stats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <RecentActivity />
            <CompanyResearchChart />
          </section>

          <section className="grid gap-6 xl:grid-cols-[2.05fr_1fr]">
            <JobsFoundChart />
            <MatchDistributionChart />
          </section>
        </div>
      </main>
    </div>
  );
}
