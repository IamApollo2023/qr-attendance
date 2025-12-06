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

// Mock data for 12 months (Jan-Dec 2024) with dates
const chartData = [
  { date: "2024-01-01", tithes: 45000, offerings: 32000, pledges: 28000 },
  { date: "2024-02-01", tithes: 52000, offerings: 38000, pledges: 31000 },
  { date: "2024-03-01", tithes: 48000, offerings: 35000, pledges: 29000 },
  { date: "2024-04-01", tithes: 55000, offerings: 42000, pledges: 33000 },
  { date: "2024-05-01", tithes: 60000, offerings: 45000, pledges: 36000 },
  { date: "2024-06-01", tithes: 58000, offerings: 44000, pledges: 34000 },
  { date: "2024-07-01", tithes: 62000, offerings: 47000, pledges: 38000 },
  { date: "2024-08-01", tithes: 59000, offerings: 43000, pledges: 35000 },
  { date: "2024-09-01", tithes: 64000, offerings: 49000, pledges: 40000 },
  { date: "2024-10-01", tithes: 61000, offerings: 46000, pledges: 37000 },
  { date: "2024-11-01", tithes: 67000, offerings: 51000, pledges: 42000 },
  { date: "2024-12-01", tithes: 72000, offerings: 55000, pledges: 45000 },
];

const chartConfig = {
  tithes: {
    label: "Tithes",
    color: "hsl(var(--chart-1))",
  },
  offerings: {
    label: "Offerings",
    color: "hsl(var(--chart-2))",
  },
  pledges: {
    label: "Pledges",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

export function ChartFinanceLine() {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("all");

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("q1");
    }
  }, [isMobile]);

  const filteredData = React.useMemo(() => {
    if (timeRange === "all") {
      return chartData; // Show all 12 months
    }

    // Filter by specific quarter ranges
    const monthRanges: Record<string, number[]> = {
      q1: [1, 2, 3, 4], // Jan-Apr
      q2: [5, 6, 7, 8], // May-Aug
      q3: [9, 10, 11, 12], // Sep-Dec
    };

    const monthsToShow = monthRanges[timeRange] || [];
    return chartData.filter((item) => {
      const date = new Date(item.date);
      const month = date.getMonth() + 1; // getMonth() returns 0-11, so add 1
      return monthsToShow.includes(month);
    });
  }, [timeRange]);

  return (
    <Card className="@container/card">
      <CardHeader className="relative">
        <CardTitle className="text-sm md:text-lg">Financial Overview</CardTitle>
        <CardDescription className="text-xs md:text-sm">
          <span className="@[540px]/card:block hidden">
            Monthly totals for tithes, offerings, and pledges (2024)
          </span>
          <span className="@[540px]/card:hidden">Monthly totals (2024)</span>
        </CardDescription>
        <div className="absolute right-4 top-4">
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="@[767px]/card:flex hidden"
          >
            <ToggleGroupItem value="all" className="h-8 px-2.5 text-xs">
              All Year
            </ToggleGroupItem>
            <ToggleGroupItem value="q1" className="h-8 px-2.5 text-xs">
              Jan-Apr
            </ToggleGroupItem>
            <ToggleGroupItem value="q2" className="h-8 px-2.5 text-xs">
              May-Aug
            </ToggleGroupItem>
            <ToggleGroupItem value="q3" className="h-8 px-2.5 text-xs">
              Sep-Dec
            </ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="@[767px]/card:hidden flex w-32 text-xs h-8"
              aria-label="Select time range"
            >
              <SelectValue placeholder="Jan-Apr" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all" className="rounded-lg text-xs">
                All Year
              </SelectItem>
              <SelectItem value="q1" className="rounded-lg text-xs">
                Jan-Apr
              </SelectItem>
              <SelectItem value="q2" className="rounded-lg text-xs">
                May-Aug
              </SelectItem>
              <SelectItem value="q3" className="rounded-lg text-xs">
                Sep-Dec
              </SelectItem>
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
              <linearGradient id="fillTithes" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-tithes)"
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-tithes)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillOfferings" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-offerings)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-offerings)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillPledges" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-pledges)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-pledges)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              interval={0}
              tickFormatter={(value) => {
                const date = new Date(value);
                const monthStr = date.toLocaleDateString("en-US", {
                  month: "short",
                });
                // Use 1 letter for "All Year" view, 3 letters for quarter views
                return timeRange === "all"
                  ? monthStr.substring(0, 1)
                  : monthStr;
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    });
                  }}
                  formatter={(value, name) => {
                    const formatted = new Intl.NumberFormat("en-PH", {
                      style: "currency",
                      currency: "PHP",
                      minimumFractionDigits: 0,
                    }).format(Number(value));
                    return [
                      formatted,
                      chartConfig[name as keyof typeof chartConfig]?.label ||
                        name,
                    ];
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="pledges"
              type="natural"
              fill="url(#fillPledges)"
              stroke="var(--color-pledges)"
              stackId="a"
            />
            <Area
              dataKey="offerings"
              type="natural"
              fill="url(#fillOfferings)"
              stroke="var(--color-offerings)"
              stackId="a"
            />
            <Area
              dataKey="tithes"
              type="natural"
              fill="url(#fillTithes)"
              stroke="var(--color-tithes)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
