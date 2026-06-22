type DashboardMobileDataPoint = {
  label: string;
  value: number;
};

type DashboardMobileDataListProps = {
  data: DashboardMobileDataPoint[];
  emptyLabel: string;
  unit: string;
};

export function DashboardMobileDataList({
  data,
  emptyLabel,
  unit,
}: DashboardMobileDataListProps) {
  const visiblePoints = data.filter((point) => point.value > 0);
  const points = visiblePoints.length > 0 ? visiblePoints : data.slice(-6);

  return (
    <dl className="mt-3 grid grid-cols-2 gap-2 sm:hidden">
      {points.length > 0 ? (
        points.map((point) => (
          <div
            key={`${point.label}-${point.value}`}
            className="min-w-0 rounded-md border border-border bg-surface-secondary px-3 py-2"
          >
            <dt className="truncate text-[11px] font-medium leading-4 text-text-muted">
              {point.label}
            </dt>
            <dd className="mt-1 break-words text-[14px] font-semibold leading-5 text-text-primary">
              {point.value} {unit}
            </dd>
          </div>
        ))
      ) : (
        <div className="col-span-2 rounded-md border border-dashed border-border bg-surface-secondary px-3 py-3 text-[12px] font-normal leading-5 text-text-muted">
          {emptyLabel}
        </div>
      )}
    </dl>
  );
}
