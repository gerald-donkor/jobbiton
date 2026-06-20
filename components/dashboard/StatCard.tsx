type StatCardProps = {
  label: string;
  value: string;
  helper: string;
  trend?: string;
};

export function StatCard({ label, value, helper, trend }: StatCardProps) {
  return (
    <article className="group min-h-[128px] rounded-xl border border-border bg-surface px-5 py-5 shadow-[0_1px_3px_color-mix(in_srgb,var(--color-overlay)_10%,transparent),0_1px_2px_color-mix(in_srgb,var(--color-overlay)_6%,transparent)] transition-transform duration-150 hover:-translate-y-1 hover:shadow-[0_14px_32px_color-mix(in_srgb,var(--color-overlay)_10%,transparent),0_2px_6px_color-mix(in_srgb,var(--color-overlay)_6%,transparent)] sm:px-6 sm:py-6">
      <p className="text-[14px] font-medium leading-5 text-text-secondary">
        {label}
      </p>
      <p className="mt-2 text-[30px] font-semibold leading-9 text-text-primary">
        {value}
      </p>
      <div className="mt-2 flex items-center gap-2">
        {trend ? (
          <span className="inline-flex items-center text-[12px] font-semibold leading-4 text-success-darker">
            {trend}
          </span>
        ) : null}
        <span className="text-[12px] font-normal leading-4 text-text-muted">
          {helper}
        </span>
      </div>
    </article>
  );
}
