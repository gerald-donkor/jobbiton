import { ChartFrame } from "@/components/dashboard/ChartFrame";
import { ChartTooltip } from "@/components/dashboard/ChartTooltip";

const ranges = [
  { label: "50-60%", value: 5, heightClass: "h-[5%]" },
  { label: "60-70%", value: 15, heightClass: "h-[15%]" },
  { label: "70-80%", value: 45, heightClass: "h-[45%]" },
  { label: "80-90%", value: 85, heightClass: "h-[85%]" },
  { label: "90-100%", value: 35, heightClass: "h-[35%]" },
];

const labels = ["100", "75", "50", "25", "0"];

export function MatchDistributionChart() {
  return (
    <ChartFrame title="Match Score Distribution" className="min-h-[340px]">
      <div className="mt-7 grid h-[228px] grid-cols-[38px_1fr] gap-3">
        <div className="flex flex-col justify-between pb-9 text-right text-[12px] font-normal leading-4 text-text-muted">
          {labels.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
        <div className="relative">
          <div className="absolute inset-x-0 top-0 bottom-9 flex flex-col justify-between">
            {labels.map((label) => (
              <span
                key={label}
                aria-hidden="true"
                className="border-t border-dashed border-border"
              />
            ))}
          </div>
          <div className="relative h-[192px]">
            <div className="absolute inset-0 grid grid-cols-5 gap-4 px-1">
              {ranges.map((range) => (
                <span
                  key={range.label}
                  tabIndex={0}
                  aria-label={`${range.label}: ${range.value} jobs`}
                  className="group relative flex h-full cursor-pointer items-end justify-center rounded-md outline-none focus-visible:ring-2 focus-visible:ring-success focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                >
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 inset-y-0 rounded-md bg-success opacity-0 transition-opacity duration-150 group-hover:opacity-[0.06] group-focus-visible:opacity-[0.06]"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-success opacity-0 transition-opacity duration-150 group-hover:opacity-30 group-focus-visible:opacity-30"
                  />
                  <ChartTooltip
                    title={range.label}
                    detail={`count : ${range.value}`}
                    tone="success"
                    placement="chartTop"
                  />
                  <span
                    className={`relative z-10 w-full max-w-[48px] rounded-sm bg-success shadow-[0_0_0_0_color-mix(in_srgb,var(--color-success)_0%,transparent)] transition duration-150 group-hover:-translate-y-1 group-hover:bg-success-alt group-hover:shadow-[0_0_0_5px_color-mix(in_srgb,var(--color-success)_14%,transparent)] group-focus-visible:-translate-y-1 group-focus-visible:bg-success-alt group-focus-visible:shadow-[0_0_0_5px_color-mix(in_srgb,var(--color-success)_14%,transparent)] ${range.heightClass}`}
                  />
                </span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-5 gap-4 px-1 pt-3 text-center text-[12px] font-normal leading-4 text-text-muted">
            {ranges.map((range) => (
              <span key={range.label} className="whitespace-nowrap">
                {range.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </ChartFrame>
  );
}
