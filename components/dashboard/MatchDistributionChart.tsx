"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ChartFrame } from "@/components/dashboard/ChartFrame";
import { DashboardChartEmptyState } from "@/components/dashboard/DashboardChartEmptyState";
import { DashboardRechartsTooltip } from "@/components/dashboard/DashboardRechartsTooltip";
import type { DashboardDistributionPoint } from "@/lib/dashboard-analytics";

type MatchDistributionChartProps = {
  data: DashboardDistributionPoint[];
};

export function MatchDistributionChart({ data }: MatchDistributionChartProps) {
  const hasData = data.some((point) => point.value > 0);

  return (
    <ChartFrame title="Match Score Distribution" className="min-h-[340px]">
      {hasData ? (
        <div className="mt-7 h-[228px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 8, right: 4, left: -18, bottom: 0 }}
            >
              <CartesianGrid
                stroke="var(--color-border)"
                strokeDasharray="3 3"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                axisLine={false}
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
                    detailLabel="count"
                    tone="success"
                  />
                )}
                cursor={{ fill: "var(--color-success-lightest)" }}
              />
              <Bar
                dataKey="value"
                fill="var(--color-success)"
                maxBarSize={48}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <DashboardChartEmptyState message="Match score distribution will appear after matched jobs are saved." />
      )}
    </ChartFrame>
  );
}
