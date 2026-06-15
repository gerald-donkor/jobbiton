"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ChartFrame } from "@/components/dashboard/ChartFrame";
import { DashboardChartEmptyState } from "@/components/dashboard/DashboardChartEmptyState";
import { DashboardRechartsTooltip } from "@/components/dashboard/DashboardRechartsTooltip";
import type { DashboardSeriesPoint } from "@/lib/dashboard-analytics";

type JobsFoundChartProps = {
  data: DashboardSeriesPoint[];
};

export function JobsFoundChart({ data }: JobsFoundChartProps) {
  const hasData = data.some((point) => point.value > 0);

  return (
    <ChartFrame title="Jobs Found Over Time" className="min-h-[340px]">
      {hasData ? (
        <div className="mt-7 h-[228px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
            >
              <CartesianGrid
                stroke="var(--color-border)"
                strokeDasharray="3 3"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                axisLine={false}
                interval={6}
                tickLine={false}
                tick={{ fill: "var(--color-text-muted)", fontSize: 12 }}
              />
              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--color-text-muted)", fontSize: 12 }}
              />
              <Tooltip
                content={(props) => (
                  <DashboardRechartsTooltip
                    {...props}
                    detailLabel="jobs"
                    tone="accent"
                  />
                )}
                cursor={{ stroke: "var(--color-accent)", strokeOpacity: 0.35 }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="var(--color-accent)"
                strokeWidth={3}
                dot={false}
                activeDot={{
                  fill: "var(--color-accent)",
                  r: 5,
                  stroke: "var(--color-surface)",
                  strokeWidth: 2,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <DashboardChartEmptyState message="Jobs found over time will appear after you run job searches." />
      )}
    </ChartFrame>
  );
}
