import { ChartFrame } from "@/components/dashboard/ChartFrame";

const labels = ["100", "75", "50", "25", "0"];
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function JobsFoundChart() {
  return (
    <ChartFrame title="Jobs Found Over Time" className="min-h-[376px]">
      <div className="mt-8 grid h-[300px] grid-cols-[42px_1fr] gap-3">
        <div className="flex flex-col justify-between pb-8 text-right text-[13px] font-normal leading-4 text-text-muted">
          {labels.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
        <div className="relative">
          <div className="absolute inset-x-0 top-0 bottom-8 flex flex-col justify-between">
            {labels.map((label) => (
              <span
                key={label}
                aria-hidden="true"
                className="border-t border-dashed border-border"
              />
            ))}
          </div>
          <svg
            className="relative h-[252px] w-full overflow-visible"
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
              strokeWidth="3"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <div className="grid grid-cols-7 pt-4 text-center text-[13px] font-normal leading-4 text-text-muted">
            {days.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
        </div>
      </div>
    </ChartFrame>
  );
}
