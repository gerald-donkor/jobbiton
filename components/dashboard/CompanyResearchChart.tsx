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
import type { DashboardSeriesPoint } from "@/lib/dashboard-analytics";

type CompanyResearchChartProps = {
  data: DashboardSeriesPoint[];
};

export function CompanyResearchChart({ data }: CompanyResearchChartProps) {
  const hasData = data.some((point) => point.value > 0);

  return (
    <ChartFrame title="Company Research Activity" className="min-h-[340px]">
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
                    tone="info"
                  />
                )}
                cursor={{ fill: "var(--color-info-lightest)" }}
              />
              <Bar
                dataKey="value"
                fill="var(--color-info)"
                maxBarSize={38}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <DashboardChartEmptyState message="Research activity will appear after you research companies." />
      )}
    </ChartFrame>
  );
}
