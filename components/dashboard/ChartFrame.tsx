import type { ReactNode } from "react";

type ChartFrameProps = {
  title: string;
  children: ReactNode;
  className?: string;
};

export function ChartFrame({ title, children, className = "" }: ChartFrameProps) {
  return (
    <section
      className={`rounded-xl border border-border bg-surface px-6 py-7 shadow-[0_1px_3px_color-mix(in_srgb,var(--color-overlay)_10%,transparent),0_1px_2px_color-mix(in_srgb,var(--color-overlay)_6%,transparent)] ${className}`}
    >
      <h2 className="text-[18px] font-semibold leading-6 text-text-primary">
        {title}
      </h2>
      {children}
    </section>
  );
}
