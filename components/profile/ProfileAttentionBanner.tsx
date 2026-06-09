import type { ProfileCompletion } from "@/lib/profile";

type ProfileAttentionBannerProps = {
  completion: ProfileCompletion;
};

const ringClasses: Record<number, string> = {
  0: "profile-progress-ring-0",
  10: "profile-progress-ring-10",
  20: "profile-progress-ring-20",
  30: "profile-progress-ring-30",
  40: "profile-progress-ring-40",
  50: "profile-progress-ring-50",
  60: "profile-progress-ring-60",
  70: "profile-progress-ring-70",
  80: "profile-progress-ring-80",
  90: "profile-progress-ring-90",
  100: "profile-progress-ring-100",
};

function getRingClass(percentage: number): string {
  const bucket = Math.min(100, Math.max(0, Math.round(percentage / 10) * 10));

  return ringClasses[bucket];
}

export function ProfileAttentionBanner({ completion }: ProfileAttentionBannerProps) {
  const isComplete = completion.isComplete || completion.percentage >= 100;
  const fields = isComplete ? ["READY"] : completion.missingFields;
  const iconLabel = isComplete ? "OK" : "!";

  return (
    <section className="flex flex-col gap-6 rounded-xl border border-border bg-surface px-6 py-6 shadow-[0_1px_3px_color-mix(in_srgb,var(--color-overlay)_10%,transparent),0_1px_2px_color-mix(in_srgb,var(--color-overlay)_6%,transparent)] sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className={`flex size-4 items-center justify-center rounded-full text-[9px] font-bold leading-none ${
              isComplete
                ? "bg-success text-success-lightest"
                : "bg-warning text-warning-foreground"
            }`}
          >
            {iconLabel}
          </span>
          <h1 className="text-[14px] font-semibold leading-5 text-text-primary">
            {isComplete ? "Profile complete" : "Profile needs attention"}
          </h1>
        </div>
        <p className="mt-1 text-[14px] font-normal leading-5 text-text-secondary">
          {isComplete
            ? "Your profile is ready to power job applications and generated resumes."
            : "Complete the following fields to improve your chances of getting quality resumes."}
        </p>
        <div className="mt-3 flex w-full flex-wrap gap-2 lg:flex-nowrap lg:gap-1.5">
          {fields.map((field) => (
            <span
              key={field}
              className={`inline-flex min-h-5 shrink-0 items-center justify-center whitespace-nowrap rounded-sm px-2 py-0.5 text-center text-[12px] font-medium leading-4 lg:px-1.5 lg:text-[11px] ${
                isComplete
                  ? "bg-success-lightest text-success-foreground"
                  : "bg-warning text-warning-foreground"
              }`}
            >
              {field}
            </span>
          ))}
        </div>
      </div>
      <div
        aria-label={`Profile completion ${completion.percentage} percent`}
        className={`${getRingClass(completion.percentage)} profile-progress-ring mx-auto flex size-[72px] shrink-0 items-center justify-center rounded-full sm:mx-0`}
      >
        <div className="flex size-[52px] items-center justify-center rounded-full bg-surface text-[22px] font-semibold leading-8 text-text-primary">
          {completion.percentage}%
        </div>
      </div>
    </section>
  );
}
