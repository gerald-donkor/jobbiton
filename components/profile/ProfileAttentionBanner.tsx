const missingFields = ["PHONE", "LOCATION", "EDUCATION"];

export function ProfileAttentionBanner() {
  return (
    <section className="flex flex-col gap-6 rounded-xl border border-border bg-surface px-6 py-6 shadow-[0_1px_3px_color-mix(in_srgb,var(--color-overlay)_10%,transparent),0_1px_2px_color-mix(in_srgb,var(--color-overlay)_6%,transparent)] sm:flex-row sm:items-center sm:justify-between">
      <div className="max-w-[500px]">
        <div className="flex items-center gap-2">
          <span className="flex size-4 items-center justify-center rounded-full bg-warning text-[11px] font-bold leading-none text-warning-foreground">
            !
          </span>
          <h1 className="text-[14px] font-semibold leading-5 text-text-primary">
            Profile needs attention
          </h1>
        </div>
        <p className="mt-1 text-[14px] font-normal leading-5 text-text-secondary">
          Complete the following fields to improve your chances of getting
          quality resumes.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {missingFields.map((field) => (
            <span
              key={field}
              className="rounded-sm bg-warning px-2 py-0.5 text-[12px] font-medium leading-4 text-warning-foreground"
            >
              {field}
            </span>
          ))}
        </div>
      </div>
      <div
        aria-label="Profile completion 70 percent"
        className="profile-progress-ring mx-auto flex size-[72px] shrink-0 items-center justify-center rounded-full sm:mx-0"
      >
        <div className="flex size-[52px] items-center justify-center rounded-full bg-surface text-[22px] font-semibold leading-8 text-text-primary">
          70%
        </div>
      </div>
    </section>
  );
}
