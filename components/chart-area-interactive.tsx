"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
// Generate data for all 12 months of 2024
const generateMonthlyData = () => {
  const data: { date: string; attendance: number }[] = [];
  const months = [
    { month: 1, days: 31, base: 350 }, // January
    { month: 2, days: 29, base: 380 }, // February (2024 is leap year)
    { month: 3, days: 31, base: 420 }, // March
    { month: 4, days: 30, base: 450 }, // April
    { month: 5, days: 31, base: 480 }, // May
    { month: 6, days: 30, base: 520 }, // June
    { month: 7, days: 31, base: 500 }, // July
    { month: 8, days: 31, base: 490 }, // August
    { month: 9, days: 30, base: 510 }, // September
    { month: 10, days: 31, base: 530 }, // October
    { month: 11, days: 30, base: 550 }, // November
    { month: 12, days: 31, base: 600 }, // December
  ];

  months.forEach(({ month, days, base }) => {
    for (let day = 1; day <= days; day++) {
      const date = new Date(2024, month - 1, day);
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      // Higher attendance on weekends, with some variation
      const variation = Math.floor(Math.random() * 200) - 100;
      const weekendBoost = isWeekend ? 150 : 0;
      const attendance = Math.max(100, base + variation + weekendBoost);

      data.push({
        date: `2024-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
        attendance,
      });
    }
  });

  return data;
};

const chartData = generateMonthlyData();

const chartConfig = {
  attendance: {
    label: "Attendance",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function ChartAreaInteractive() {
  const isMobile = useIsMobile();

  // Get unique months from chart data
  const availableMonths = React.useMemo(() => {
    const months = new Set<string>();
    chartData.forEach((item) => {
      const date = new Date(item.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      months.add(monthKey);
    });
    return Array.from(months).sort();
  }, []);

  // Set default to most recent month
  const [selectedMonth, setSelectedMonth] = React.useState<string>(() => {
    const months = new Set<string>();
    chartData.forEach((item) => {
      const date = new Date(item.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      months.add(monthKey);
    });
    const sorted = Array.from(months).sort();
    return sorted[sorted.length - 1] || "";
  });

  // Filter and group data by month and weeks
  const filteredData = React.useMemo(() => {
    const monthData = chartData.filter((item) => {
      const date = new Date(item.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      return monthKey === selectedMonth;
    });

    // Group by week (W1, W2, W3, W4)
    const weekGroups: Record<
      string,
      { week: string; attendance: number; count: number }
    > = {};

    monthData.forEach((item) => {
      const date = new Date(item.date);
      const day = date.getDate();
      const week = Math.min(Math.ceil(day / 7), 4); // Cap at W4
      const weekKey = `W${week}`;

      if (!weekGroups[weekKey]) {
        weekGroups[weekKey] = { week: weekKey, attendance: 0, count: 0 };
      }
      weekGroups[weekKey].attendance += item.attendance;
      weekGroups[weekKey].count += 1;
    });

    // Convert to array and calculate average attendance per week
    return Object.values(weekGroups)
      .map((group) => ({
        week: group.week,
        attendance: Math.round(group.attendance / group.count),
      }))
      .sort((a, b) => {
        const weekNumA = parseInt(a.week.substring(1));
        const weekNumB = parseInt(b.week.substring(1));
        return weekNumA - weekNumB;
      });
  }, [selectedMonth]);

  return (
    <Card className="@container/card">
      <CardHeader className="relative">
        <CardTitle className="text-sm md:text-lg">
          Attendance overview
        </CardTitle>
        <CardDescription className="text-xs md:text-sm">
          <span className="@[540px]/card:block hidden">
            Weekly attendance breakdown by month
          </span>
          <span className="@[540px]/card:hidden">Weekly breakdown</span>
        </CardDescription>
        <div className="absolute right-4 top-4">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger
              className="w-32 text-xs h-8"
              aria-label="Select month"
            >
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {availableMonths.map((monthKey) => {
                const [year, month] = monthKey.split("-");
                const date = new Date(parseInt(year), parseInt(month) - 1);
                const monthName = date.toLocaleDateString("en-US", {
                  month: "short",
                });
                return (
                  <SelectItem
                    key={monthKey}
                    value={monthKey}
                    className="rounded-lg text-xs"
                  >
                    {monthName} {year}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillAttendance" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-attendance)"
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-attendance)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="week"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              interval={0}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return value;
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="attendance"
              type="natural"
              fill="url(#fillAttendance)"
              stroke="var(--color-attendance)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
