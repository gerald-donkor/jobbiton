import type { TooltipContentProps } from "recharts";

type DashboardRechartsTooltipProps = TooltipContentProps & {
  detailLabel: string;
  tone: "accent" | "info" | "success";
};

const toneClasses: Record<DashboardRechartsTooltipProps["tone"], string> = {
  accent: "text-accent",
  info: "text-info-medium",
  success: "text-success",
};

export function DashboardRechartsTooltip({
  active,
  detailLabel,
  label,
  payload,
  tone,
}: DashboardRechartsTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-md border border-border bg-surface px-3 py-2 text-left shadow-[0_10px_24px_color-mix(in_srgb,var(--color-overlay)_12%,transparent)]">
      <p className="whitespace-nowrap text-[13px] font-semibold leading-5 text-text-primary">
        {label}
      </p>
      <p className={`whitespace-nowrap text-[12px] font-semibold leading-4 ${toneClasses[tone]}`}>
        {detailLabel} : {payload[0]?.value ?? 0}
      </p>
    </div>
  );
}
