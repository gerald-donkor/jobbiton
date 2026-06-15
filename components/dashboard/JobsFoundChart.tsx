import { ChartFrame } from "@/components/dashboard/ChartFrame";
import { ChartTooltip } from "@/components/dashboard/ChartTooltip";

const labels = ["100", "75", "50", "25", "0"];
const days = [
  { label: "Mon", value: 12, pointClass: "top-[86.5%]" },
  { label: "Tue", value: 62, pointClass: "top-[38%]" },
  { label: "Wed", value: 50, pointClass: "top-[56%]" },
  { label: "Thu", value: 55, pointClass: "top-[45%]" },
  { label: "Fri", value: 85, pointClass: "top-[18%]" },
  { label: "Sat", value: 78, pointClass: "top-[26%]" },
  { label: "Sun", value: 8, pointClass: "top-[90%]" },
];

export function JobsFoundChart() {
  return (
    <ChartFrame title="Jobs Found Over Time" className="min-h-[340px]">
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
          <svg
            className="relative h-[192px] w-full overflow-visible"
            viewBox="0 0 720 252"
            preserveAspectRatio="none"
            role="img"
            aria-label="Jobs found line chart from Monday to Sunday"
          >
            <defs>
              <linearGradient id="jobs-found-area" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="var(--color-accent-light)" />
                <stop offset="100%" stopColor="var(--color-surface)" />
              </linearGradient>
            </defs>
            <path
              d="M0 220 C70 135 105 92 176 96 C250 101 282 161 355 122 C420 88 455 18 532 46 C590 67 606 151 720 226 L720 252 L0 252 Z"
              fill="url(#jobs-found-area)"
            />
            <path
              d="M0 220 C70 135 105 92 176 96 C250 101 282 161 355 122 C420 88 455 18 532 46 C590 67 606 151 720 226"
              fill="none"
              stroke="var(--color-accent)"
              strokeLinecap="round"
              strokeWidth="4"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <div className="absolute inset-x-0 top-0 grid h-[192px] grid-cols-7">
            {days.map((day) => (
              <span
                key={day.label}
                tabIndex={0}
                aria-label={`${day.label}: ${day.value} jobs found`}
                className="group relative cursor-pointer rounded-md outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-x-2 inset-y-0 rounded-md bg-accent opacity-0 transition-opacity duration-150 group-hover:opacity-[0.04] group-focus-visible:opacity-[0.04]"
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-accent opacity-0 transition-opacity duration-150 group-hover:opacity-35 group-focus-visible:opacity-35"
                />
                <ChartTooltip
                  title={day.label}
                  detail={`jobs: ${day.value}`}
                  tone="accent"
                  placement="chartTop"
                />
                <span
                  className={`absolute left-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface bg-accent opacity-0 shadow-[0_0_0_5px_color-mix(in_srgb,var(--color-accent)_18%,transparent)] transition duration-150 group-hover:scale-110 group-hover:opacity-100 group-focus-visible:scale-110 group-focus-visible:opacity-100 ${day.pointClass}`}
                />
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 pt-3 text-center text-[12px] font-normal leading-4 text-text-muted">
            {days.map((day) => (
              <span key={day.label}>{day.label}</span>
            ))}
          </div>
        </div>
      </div>
    </ChartFrame>
  );
}
