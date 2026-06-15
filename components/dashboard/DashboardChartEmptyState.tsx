type DashboardChartEmptyStateProps = {
  message: string;
};

export function DashboardChartEmptyState({ message }: DashboardChartEmptyStateProps) {
  return (
    <div className="mt-7 flex h-[228px] items-center justify-center rounded-md border border-dashed border-border bg-surface-secondary px-6 text-center text-[12px] font-normal leading-4 text-text-muted">
      {message}
    </div>
  );
}
