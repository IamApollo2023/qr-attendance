"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";

import { supabase, type AttendanceRecord } from "@/lib";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";

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

  // URL is the single source of truth for pagination
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const urlEventId = searchParams.get("event_id") || eventId;

  // Initialize state from server data (no redundant fetch on mount)
  const [attendees, setAttendees] = useState<AttendanceRecord[]>(
    initialData.records
  );
  const [pagination, setPagination] = useState<PaginationInfo | null>(
    initialData.pagination
  );
  const [eventFilter, setEventFilter] = useState<string>(urlEventId);
  const [isLoading, setIsLoading] = useState(false);
  const [totalMembers, setTotalMembers] = useState(0);
  const [totalActiveMembers, setTotalActiveMembers] = useState(0);
  const [totalVisitors, setTotalVisitors] = useState(0);
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(false);
  const isInitialMount = useRef(true);

  // Auth is already verified by middleware - no need for redundant client-side check
  // This was causing duplicate fetches. Trust the server.

  // Format date consistently (prevents hydration mismatch)
  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  // Format time consistently (prevents hydration mismatch)
  const formatTime = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  }, []);

  // Fetch paginated data - only called when URL changes or user actions
  const fetchPaginatedData = useCallback(
    async (page: number, eventId: string) => {
      setIsLoading(true);
      try {
        const pageSize = 25;
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        // Get total count
        const { count: totalCount } = await supabase
          .from("qr_attendance")
          .select("*", { count: "exact", head: true })
          .eq("event_id", eventId);

        // Get today's count
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const { count: todayCount } = await supabase
          .from("qr_attendance")
          .select("*", { count: "exact", head: true })
          .eq("event_id", eventId)
          .gte("scanned_at", todayStart.toISOString())
          .lte("scanned_at", todayEnd.toISOString());

        // Get unique count
        const { data: uniqueData } = await supabase
          .from("qr_attendance")
          .select("attendee_id", { count: "exact", head: false })
          .eq("event_id", eventId);

        const unique = new Set((uniqueData || []).map((r) => r.attendee_id))
          .size;

        // Fetch paginated records with limited fields
        const { data: records, error } = await supabase
          .from("qr_attendance")
          .select(
            `
          id,
          attendee_id,
          scanned_at,
          event_id,
          member:members (
            first_name,
            last_name,
            age_category,
            gender
          )
        `
          )
          .eq("event_id", eventId)
          .order("scanned_at", { ascending: false })
          .range(from, to);

        if (error) throw error;

        if (records) {
          // Normalize Supabase join shape: ensure `member` is a single object, not an array
          const attendanceRecords = (records as any[]).map((row) => ({
            ...row,
            member: Array.isArray(row.member) ? row.member[0] : row.member,
          })) as AttendanceRecord[];

          setAttendees(attendanceRecords);

          const totalPages = Math.ceil((totalCount || 0) / pageSize);
          setPagination({
            page,
            pageSize,
            total: totalCount || 0,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
          });
        }
      } catch (error) {
        console.error("Failed to fetch attendees:", error);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const ageBreakdown = useMemo(() => {
    const counts: Record<string, number> = {
      Men: 0,
      Women: 0,
      YAN: 0,
      KKB: 0,
      Children: 0,
      Unknown: 0,
    };

    attendees.forEach((record) => {
      const age = record.member?.age_category ?? "Unknown";
      if (counts[age] !== undefined) {
        counts[age] += 1;
      } else {
        counts.Unknown += 1;
      }
    });

    return counts;
  }, [attendees]);

  const loadAnalytics = useCallback(async (currentEventId: string) => {
    try {
      setIsAnalyticsLoading(true);

      // Total members
      const { count: memberCount, error: memberError } = await supabase
        .from("members")
        .select("*", { count: "exact", head: true });
      if (memberError) {
        console.error("Failed to load members count:", memberError);
      }
      setTotalMembers(memberCount || 0);

      // Active members and visitors in the last 30 days for this event
      const since = new Date();
      since.setDate(since.getDate() - 30);

      const { data: attendanceData, error: attendanceError } = await supabase
        .from("qr_attendance")
        .select(
          `
          attendee_id,
          scanned_at,
          member:members (
            member_id
          )
        `
        )
        .eq("event_id", currentEventId)
        .gte("scanned_at", since.toISOString());

      if (attendanceError) {
        console.error("Failed to load attendance analytics:", attendanceError);
        return;
      }

      const countsByMember = new Map<string, number>();
      const visitorIds = new Set<string>();

      (attendanceData || []).forEach((row: any) => {
        const id = row.attendee_id as string;
        if (!id) return;

        countsByMember.set(id, (countsByMember.get(id) || 0) + 1);

        // If there is no joined member record, treat as visitor.
        if (
          !row.member ||
          (Array.isArray(row.member) && row.member.length === 0)
        ) {
          visitorIds.add(id);
        }
      });

      let activeCount = 0;
      countsByMember.forEach((count) => {
        if (count >= 3) activeCount += 1;
      });

      setTotalActiveMembers(activeCount);
      setTotalVisitors(visitorIds.size);
    } finally {
      setIsAnalyticsLoading(false);
    }
  }, []);

  // Sync state with URL params - only fetch if URL changed (not on initial mount)
  useEffect(() => {
    // Skip on initial mount - use server-provided initialData
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const pageFromUrl = parseInt(searchParams.get("page") || "1", 10);
    const eventFromUrl = searchParams.get("event_id") || eventId;

    // Only fetch if URL params differ from current state (user navigated)
    const pageChanged = pageFromUrl !== (pagination?.page || 1);
    const eventChanged = eventFromUrl !== eventFilter;

    if (pageChanged || eventChanged) {
      setEventFilter(eventFromUrl);
      fetchPaginatedData(pageFromUrl, eventFromUrl);
      loadAnalytics(eventFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Set up real-time subscription
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
          await fetchPaginatedData(currentPage, eventFilter);
        }
      )
      .subscribe((status) => {
        console.log("Subscription status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventFilter, currentPage, fetchPaginatedData]);

  // Initial analytics load
  useEffect(() => {
    loadAnalytics(eventFilter);
  }, [eventFilter, loadAnalytics]);

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* Header */}
          <div className="px-4 lg:px-6">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-semibold tracking-tight">
                Attendance analytics
              </h1>
              <p className="text-sm text-muted-foreground">
                High-level overview of QR attendance trends.
              </p>
            </div>
          </div>

          {/* High-level membership KPIs */}
          <div className="grid grid-cols-1 gap-4 px-4 md:grid-cols-3 lg:px-6">
            <Card className="@container/card">
              <CardHeader className="relative">
                <CardDescription>Total members</CardDescription>
                <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                  {isAnalyticsLoading ? "…" : totalMembers}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card className="@container/card">
              <CardHeader className="relative">
                <CardDescription>Active members (last 30 days)</CardDescription>
                <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                  {isAnalyticsLoading ? "…" : totalActiveMembers}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card className="@container/card">
              <CardHeader className="relative">
                <CardDescription>Visitors (last 30 days)</CardDescription>
                <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                  {isAnalyticsLoading ? "…" : totalVisitors}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Age-group analytics */}
          <div className="grid grid-cols-1 gap-4 px-4 md:grid-cols-3 lg:grid-cols-5 lg:px-6">
            <Card className="@container/card">
              <CardHeader className="pb-2">
                <CardDescription>Men</CardDescription>
                <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                  {ageBreakdown.Men}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card className="@container/card">
              <CardHeader className="pb-2">
                <CardDescription>Women</CardDescription>
                <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                  {ageBreakdown.Women}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card className="@container/card">
              <CardHeader className="pb-2">
                <CardDescription>YAN</CardDescription>
                <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                  {ageBreakdown.YAN}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card className="@container/card">
              <CardHeader className="pb-2">
                <CardDescription>KKB</CardDescription>
                <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                  {ageBreakdown.KKB}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card className="@container/card">
              <CardHeader className="pb-2">
                <CardDescription>Kids</CardDescription>
                <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                  {ageBreakdown.Children}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Analytics chart */}
          <div className="px-4 lg:px-6">
            <ChartAreaInteractive />
          </div>
        </div>
      </div>
    </div>
  );
}
