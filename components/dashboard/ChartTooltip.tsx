type ChartTooltipTone = "accent" | "info" | "success";

type ChartTooltipProps = {
  title: string;
  detail: string;
  tone: ChartTooltipTone;
  placement?: "top" | "right" | "chartTop";
};

const toneClasses: Record<ChartTooltipTone, string> = {
  accent: "text-accent",
  info: "text-info-medium",
  success: "text-success",
};

const placementClasses: Record<NonNullable<ChartTooltipProps["placement"]>, string> = {
  chartTop: "left-1/2 top-4 -translate-x-1/2",
  top: "bottom-[calc(100%+12px)] left-1/2 -translate-x-1/2",
  right: "bottom-1/2 left-[calc(100%+14px)] translate-y-1/2",
};

export function ChartTooltip({
  title,
  detail,
  tone,
  placement = "top",
}: ChartTooltipProps) {
  return (
    <span
      className={`pointer-events-none absolute z-20 min-w-[112px] rounded-md border border-border bg-surface px-3 py-2 text-left opacity-0 shadow-[0_10px_24px_color-mix(in_srgb,var(--color-overlay)_12%,transparent)] transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100 ${placementClasses[placement]}`}
    >
      <span className="block whitespace-nowrap text-[13px] font-semibold leading-5 text-text-primary">
        {title}
      </span>
      <span className={`block whitespace-nowrap text-[12px] font-semibold leading-4 ${toneClasses[tone]}`}>
        {detail}
      </span>
    </span>
  );
}
