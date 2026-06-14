import { ChartFrame } from "@/components/dashboard/ChartFrame";

const values = [
  { day: "Mon", value: 2, heightClass: "h-[16.67%]" },
  { day: "Tue", value: 5, heightClass: "h-[41.67%]" },
  { day: "Wed", value: 3, heightClass: "h-1/4" },
  { day: "Thu", value: 8, heightClass: "h-[66.67%]" },
  { day: "Fri", value: 12, heightClass: "h-full" },
  { day: "Sat", value: 4, heightClass: "h-1/3" },
  { day: "Sun", value: 1, heightClass: "h-[8.33%]" },
];

const gridLabels = [12, 9, 6, 3, 0];

export function CompanyResearchChart() {
  return (
    <ChartFrame title="Company Research Activity" className="min-h-[408px]">
      <div className="mt-16 grid h-[270px] grid-cols-[38px_1fr] gap-3">
        <div className="flex flex-col justify-between pb-8 pt-0 text-right text-[13px] font-normal leading-4 text-text-muted">
          {gridLabels.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
        <div className="relative">
          <div className="absolute inset-x-0 top-0 bottom-8 flex flex-col justify-between">
            {gridLabels.map((label) => (
              <span
                key={label}
                aria-hidden="true"
                className="border-t border-dashed border-border"
              />
            ))}
          </div>
          <div className="relative grid h-full grid-cols-7 items-end gap-6 px-4">
            {values.map((item) => (
              <div key={item.day} className="flex h-full flex-col items-center justify-end gap-4">
                <div
                  aria-label={`${item.day}: ${item.value} companies researched`}
                  className={`w-full max-w-[40px] rounded-sm bg-info ${item.heightClass}`}
                />
                <span className="h-4 text-[13px] font-normal leading-4 text-text-muted">
                  {item.day}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ChartFrame>
  );
}
