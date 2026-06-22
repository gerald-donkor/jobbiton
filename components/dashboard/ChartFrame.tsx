import type { ReactNode } from "react";

type ChartFrameProps = {
  title: string;
  children: ReactNode;
  className?: string;
};

export function ChartFrame({ title, children, className = "" }: ChartFrameProps) {
  return (
    <section
      className={`min-w-0 overflow-hidden rounded-xl border border-border bg-surface px-4 py-5 shadow-[0_1px_3px_color-mix(in_srgb,var(--color-overlay)_10%,transparent),0_1px_2px_color-mix(in_srgb,var(--color-overlay)_6%,transparent)] transition-shadow duration-150 hover:shadow-[0_14px_32px_color-mix(in_srgb,var(--color-overlay)_10%,transparent),0_2px_6px_color-mix(in_srgb,var(--color-overlay)_6%,transparent)] sm:px-6 sm:py-6 ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="min-w-0 text-[16px] font-semibold leading-6 text-text-primary">
          {title}
        </h2>
        <span className="rounded-full border border-border bg-surface-secondary px-2.5 py-1 text-[11px] font-semibold leading-4 text-text-muted sm:hidden">
          Swipe chart
        </span>
      </div>
      {children}
    </section>
  );
}
