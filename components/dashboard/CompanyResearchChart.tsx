import { ChartFrame } from "@/components/dashboard/ChartFrame";
import { ChartTooltip } from "@/components/dashboard/ChartTooltip";

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
    <ChartFrame title="Company Research Activity" className="min-h-[340px]">
      <div className="mt-7 grid h-[228px] grid-cols-[38px_1fr] gap-3">
        <div className="flex flex-col justify-between pb-9 pt-0 text-right text-[12px] font-normal leading-4 text-text-muted">
          {gridLabels.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
        <div className="relative">
          <div className="absolute inset-x-0 top-0 bottom-9 flex flex-col justify-between">
            {gridLabels.map((label) => (
              <span
                key={label}
                aria-hidden="true"
                className="border-t border-dashed border-border"
              />
            ))}
          </div>
          <div className="relative h-[192px]">
            <div className="absolute inset-0 grid grid-cols-7 gap-4 px-2">
              {values.map((item) => (
                <span
                  key={item.day}
                  tabIndex={0}
                  aria-label={`${item.day}: ${item.value} companies researched`}
                  className="group relative flex h-full cursor-pointer items-end justify-center rounded-md outline-none focus-visible:ring-2 focus-visible:ring-info focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                >
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 inset-y-0 rounded-md bg-info opacity-0 transition-opacity duration-150 group-hover:opacity-[0.06] group-focus-visible:opacity-[0.06]"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-info opacity-0 transition-opacity duration-150 group-hover:opacity-30 group-focus-visible:opacity-30"
                  />
                  <ChartTooltip
                    title={item.day}
                    detail={`count : ${item.value}`}
                    tone="info"
                    placement="chartTop"
                  />
                  <span
                    className={`relative z-10 w-full max-w-[38px] rounded-sm bg-info shadow-[0_0_0_0_color-mix(in_srgb,var(--color-info)_0%,transparent)] transition duration-150 group-hover:-translate-y-1 group-hover:bg-info-medium group-hover:shadow-[0_0_0_5px_color-mix(in_srgb,var(--color-info)_14%,transparent)] group-focus-visible:-translate-y-1 group-focus-visible:bg-info-medium group-focus-visible:shadow-[0_0_0_5px_color-mix(in_srgb,var(--color-info)_14%,transparent)] ${item.heightClass}`}
                  />
                </span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-7 gap-4 px-2 pt-3 text-center text-[12px] font-normal leading-4 text-text-muted">
            {values.map((item) => (
              <span key={item.day}>{item.day}</span>
            ))}
          </div>
        </div>
      </div>
    </ChartFrame>
  );
}
