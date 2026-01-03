"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";

import { supabase, type AttendanceRecord } from "@/lib";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardMetricsGrid } from "@/components/dashboard/DashboardMetricsGrid";
import { AgeCategoryCard } from "@/components/dashboard/AgeCategoryCard";
import {
  useAttendanceAnalytics,
  useDashboardMetrics,
  useAgeCategoryBreakdown,
} from "@/features/attendance/hooks";

interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface AdminDashboardProps {
  initialData: {
    records: AttendanceRecord[];
    stats: {
      total: number;
      today: number;
      unique: number;
    };
    pagination: PaginationInfo | null;
  };
  eventId?: string;
}

export default function AdminDashboard({
  initialData,
  eventId = "default",
}: AdminDashboardProps) {
  const searchParams = useSearchParams();

  // Extract URL params once - memoize to prevent unnecessary rerenders
  const pageParam = searchParams.get("page");
  const eventParam = searchParams.get("event_id");

  // URL is the single source of truth for pagination
  const currentPage = parseInt(pageParam || "1", 10);
  const urlEventId = eventParam || eventId;

  // Initialize state from server data (no redundant fetch on mount)
  const [eventFilter, setEventFilter] = useState<string>(urlEventId);
  const [selectedAgeCategory, setSelectedAgeCategory] = useState<string>("Men");
  const isInitialMount = useRef(true);
  const previousPageRef = useRef<number>(currentPage);
  const previousEventRef = useRef<string>(urlEventId);

  // Use custom hooks for data fetching
  const { attendees, pagination, isLoading, fetchPaginatedData } =
    useAttendanceAnalytics();

  const {
    metrics,
    isLoading: isAnalyticsLoading,
    loadMetrics,
  } = useDashboardMetrics();

  const { ageCategoryBreakdown, fetchAgeCategoryBreakdown } =
    useAgeCategoryBreakdown();

  // Sync state with URL params - only fetch if URL changed (not on initial mount)
  useEffect(() => {
    // Skip on initial mount - use server-provided initialData
    if (isInitialMount.current) {
      isInitialMount.current = false;
      previousPageRef.current = currentPage;
      previousEventRef.current = urlEventId;
      setEventFilter(urlEventId);
      return;
    }

    // Only fetch if URL params actually changed
    const pageChanged = currentPage !== previousPageRef.current;
    const eventChanged = urlEventId !== previousEventRef.current;

    if (pageChanged || eventChanged) {
      previousPageRef.current = currentPage;
      previousEventRef.current = urlEventId;
      setEventFilter(urlEventId);
      fetchPaginatedData(currentPage, urlEventId);
      loadMetrics(urlEventId);
      fetchAgeCategoryBreakdown(urlEventId);
    }
  }, [
    currentPage,
    urlEventId,
    fetchPaginatedData,
    loadMetrics,
    fetchAgeCategoryBreakdown,
  ]);

  // Set up real-time subscription - only recreate when eventFilter changes
  useEffect(() => {
    const channel = supabase
      .channel("qr_attendance_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "qr_attendance",
          filter: `event_id=eq.${eventFilter}`,
        },
        async (payload) => {
          console.log("Real-time update received:", payload);
          // Refetch current page to ensure consistency
          const currentPageNum = pagination?.page || currentPage;
          await fetchPaginatedData(currentPageNum, eventFilter);
          // Refresh metrics and age category breakdown
          await loadMetrics(eventFilter);
          await fetchAgeCategoryBreakdown(eventFilter);
        }
      )
      .subscribe((status) => {
        console.log("Subscription status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [
    eventFilter,
    pagination?.page,
    currentPage,
    fetchPaginatedData,
    loadMetrics,
    fetchAgeCategoryBreakdown,
  ]);

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-3 py-3 md:gap-6 md:py-6">
          {/* Header */}
          <DashboardHeader />

          {/* High-level membership KPIs */}
          <DashboardMetricsGrid
            metrics={metrics}
            isLoading={isAnalyticsLoading}
          />

          {/* Age-group analytics */}
          <AgeCategoryCard
            ageCategoryBreakdown={ageCategoryBreakdown}
            selectedAgeCategory={selectedAgeCategory}
            onAgeCategoryChange={setSelectedAgeCategory}
          />

          {/* Analytics chart */}
          <div className="px-4 lg:px-6">
            <ChartAreaInteractive />
          </div>
        </div>
      </div>
    </div>
  );
}
