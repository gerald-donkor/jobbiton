type StatCardProps = {
  label: string;
  value: string;
  helper: string;
  trend?: string;
};

export function StatCard({ label, value, helper, trend }: StatCardProps) {
  return (
    <article className="min-h-[136px] rounded-xl border border-border bg-surface px-6 py-7 shadow-[0_1px_3px_color-mix(in_srgb,var(--color-overlay)_10%,transparent),0_1px_2px_color-mix(in_srgb,var(--color-overlay)_6%,transparent)]">
      <p className="text-[14px] font-semibold leading-5 text-text-secondary">
        {label}
      </p>
      <p className="mt-2 text-[34px] font-semibold leading-10 text-text-primary">
        {value}
      </p>
      <div className="mt-3 flex items-center gap-3">
        {trend ? (
          <span className="inline-flex min-h-6 items-center rounded-sm bg-success-lightest px-2 text-[12px] font-semibold leading-4 text-success-darker">
            {trend}
          </span>
        ) : null}
        <span className="text-[13px] font-normal leading-5 text-text-muted">
          {helper}
        </span>
      </div>
    </article>
  );
}
