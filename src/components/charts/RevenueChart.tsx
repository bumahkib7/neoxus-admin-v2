"use client"

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

const chartData = [
  { month: "January", revenue: 0 },
  { month: "February", revenue: 0 },
  { month: "March", revenue: 0 },
  { month: "April", revenue: 0 },
  { month: "May", revenue: 0 },
  { month: "June", revenue: 0 },
  { month: "July", revenue: 0 },
]

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export function RevenueChart() {
  return (
    <ChartContainer config={chartConfig}>
      <AreaChart
        accessibilityLayer
        data={chartData}
        margin={{
          left: 12,
          right: 12,
        }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="line" />}
        />
        <Area
          dataKey="revenue"
          type="natural"
          fill="var(--color-revenue)"
          fillOpacity={0.4}
          stroke="var(--color-revenue)"
          animationDuration={1000}
          animationEasing="ease-out"
        />
      </AreaChart>
    </ChartContainer>
  )
}
