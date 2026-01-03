import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { DashboardMetrics } from "@/features/attendance/hooks/useDashboardMetrics";

interface DashboardMetricsGridProps {
  metrics: DashboardMetrics;
  isLoading: boolean;
}

/**
 * Dashboard Metrics Grid Component
 * Single responsibility: Display KPI metrics in a grid layout
 */
export function DashboardMetricsGrid({
  metrics,
  isLoading,
}: DashboardMetricsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 md:gap-4 px-4 lg:px-6">
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription className="text-xs md:text-sm">
            Total members
          </CardDescription>
          <CardTitle className="text-lg md:text-3xl font-semibold tabular-nums">
            {isLoading ? "…" : metrics.totalMembers}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription className="text-xs md:text-sm">
            Active members <br /> (last 30 days)
          </CardDescription>
          <CardTitle className="text-lg md:text-3xl font-semibold tabular-nums">
            {isLoading ? "…" : metrics.totalActiveMembers}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription className="text-xs md:text-sm">
            Today's Attendance
          </CardDescription>
          <CardTitle className="text-lg md:text-3xl font-semibold tabular-nums">
            {isLoading ? "…" : metrics.todayAttendance}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription className="text-xs md:text-sm">
            Total Attendance
          </CardDescription>
          <CardTitle className="text-lg md:text-3xl font-semibold tabular-nums">
            {isLoading ? "…" : metrics.totalAttendance}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription className="text-xs md:text-sm">
            Unique Attendees
          </CardDescription>
          <CardTitle className="text-lg md:text-3xl font-semibold tabular-nums">
            {isLoading ? "…" : metrics.uniqueAttendees}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription className="text-xs md:text-sm">
            New Members <br /> (last 30 days)
          </CardDescription>
          <CardTitle className="text-lg md:text-3xl font-semibold tabular-nums">
            {isLoading ? "…" : metrics.newMembers}
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}
