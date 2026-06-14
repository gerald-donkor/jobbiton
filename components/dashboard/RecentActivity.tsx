type ActivityTone = "accent" | "info" | "success";

type ActivityItem = {
  label: string;
  time: string;
  tone: ActivityTone;
};

const activities: ActivityItem[] = [
  {
    label: "Found 8 jobs for Frontend Engineer",
    time: "10 mins ago",
    tone: "accent",
  },
  {
    label: "Researched Stripe",
    time: "1 hour ago",
    tone: "info",
  },
  {
    label: "Found 12 jobs for React Developer",
    time: "2 hours ago",
    tone: "success",
  },
  {
    label: "Researched Vercel",
    time: "Yesterday",
    tone: "accent",
  },
  {
    label: "Found 10 jobs for Full Stack Engineer",
    time: "Yesterday",
    tone: "success",
  },
];

const dotClasses: Record<ActivityTone, string> = {
  accent: "bg-accent",
  info: "bg-info",
  success: "bg-success",
};

export function RecentActivity() {
  return (
    <section className="min-h-[408px] rounded-xl border border-border bg-surface shadow-[0_1px_3px_color-mix(in_srgb,var(--color-overlay)_10%,transparent),0_1px_2px_color-mix(in_srgb,var(--color-overlay)_6%,transparent)]">
      <header className="border-b border-border px-6 py-6">
        <h2 className="text-[18px] font-semibold leading-6 text-text-primary">
          Recent Activity
        </h2>
      </header>
      <ol className="px-6 py-6">
        {activities.map((activity, index) => {
          const isLast = index === activities.length - 1;

          return (
            <li key={`${activity.label}-${activity.time}`} className="flex gap-5">
              <div className="flex w-5 flex-col items-center">
                <span
                  aria-hidden="true"
                  className={`mt-1 size-3 rounded-full ${dotClasses[activity.tone]} ring-4 ring-surface-secondary`}
                />
                {isLast ? null : (
                  <span
                    aria-hidden="true"
                    className="mt-2 h-11 w-px bg-border"
                  />
                )}
              </div>
              <div className={isLast ? "pb-0" : "pb-6"}>
                <p className="text-[16px] font-medium leading-6 text-text-primary">
                  {activity.label}
                </p>
                <p className="mt-1 text-[14px] font-normal leading-5 text-text-muted">
                  {activity.time}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
