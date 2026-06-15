import type {
  DashboardActivityItem,
  DashboardActivityTone,
} from "@/lib/dashboard-activity";

type RecentActivityProps = {
  activities: DashboardActivityItem[];
};

const dotClasses: Record<DashboardActivityTone, string> = {
  info: "bg-info",
  success: "bg-success",
};

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <section className="min-h-[340px] rounded-xl border border-border bg-surface px-6 py-6 shadow-[0_1px_3px_color-mix(in_srgb,var(--color-overlay)_10%,transparent),0_1px_2px_color-mix(in_srgb,var(--color-overlay)_6%,transparent)]">
      <header>
        <h2 className="text-[16px] font-semibold leading-6 text-text-primary">
          Recent Activity
        </h2>
      </header>
      {activities.length === 0 ? (
        <div className="mt-5 flex min-h-[236px] items-center justify-center rounded-md border border-dashed border-border bg-surface-secondary px-6 text-center text-[12px] font-normal leading-4 text-text-muted">
          Activity will appear after you find jobs or research companies.
        </div>
      ) : (
        <ol className="mt-5">
          {activities.map((activity, index) => {
            const isLast = index === activities.length - 1;

            return (
              <li
                key={activity.id}
                tabIndex={0}
                aria-label={`${activity.label}, ${activity.time}`}
                className="group flex cursor-pointer gap-4 rounded-md px-1 py-1 outline-none transition-colors duration-150 hover:bg-surface-secondary focus-visible:bg-surface-secondary focus-visible:ring-2 focus-visible:ring-accent"
              >
                <div className="flex w-4 flex-col items-center">
                  <span
                    aria-hidden="true"
                    className={`mt-1 size-2 rounded-full ${dotClasses[activity.tone]} ring-4 ring-surface-secondary transition-transform duration-150 group-hover:scale-125`}
                  />
                  {isLast ? null : (
                    <span
                      aria-hidden="true"
                      className="mt-2 h-7 w-px bg-border"
                    />
                  )}
                </div>
                <div className={isLast ? "pb-0" : "pb-3"}>
                  <p className="text-[14px] font-medium leading-5 text-text-primary transition-colors duration-150 group-hover:text-accent group-focus-visible:text-accent">
                    {activity.label}
                  </p>
                  <p className="mt-1 text-[12px] font-normal leading-4 text-text-muted">
                    {activity.time}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
