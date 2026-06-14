import { ChartFrame } from "@/components/dashboard/ChartFrame";

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
    <ChartFrame title="Match Score Distribution" className="min-h-[376px]">
      <div className="mt-8 grid h-[300px] grid-cols-[36px_1fr] gap-3">
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
          <div className="relative grid h-full grid-cols-5 items-end gap-5 px-2">
            {ranges.map((range) => (
              <div key={range.label} className="flex h-full flex-col items-center justify-end gap-4">
                <div
                  aria-label={`${range.label}: ${range.value} jobs`}
                  className={`w-full max-w-[34px] rounded-sm bg-success ${range.heightClass}`}
                />
                <span className="h-4 whitespace-nowrap text-[13px] font-normal leading-4 text-text-muted">
                  {range.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ChartFrame>
  );
}
