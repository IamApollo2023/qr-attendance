import { useState, useCallback } from "react";
import { supabase } from "@/lib";

export interface DashboardMetrics {
  totalMembers: number;
  totalActiveMembers: number;
  todayAttendance: number;
  totalAttendance: number;
  uniqueAttendees: number;
  newMembers: number;
}

/**
 * Hook for fetching dashboard metrics
 * Single responsibility: Fetch and manage dashboard KPI metrics
 */
export function useDashboardMetrics() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalMembers: 0,
    totalActiveMembers: 0,
    todayAttendance: 0,
    totalAttendance: 0,
    uniqueAttendees: 0,
    newMembers: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  const loadMetrics = useCallback(async (currentEventId: string) => {
    try {
      setIsLoading(true);

      // Total members
      const { count: memberCount, error: memberError } = await supabase
        .from("members")
        .select("*", { count: "exact", head: true });
      if (memberError) {
        console.error("Failed to load members count:", memberError);
      }

      // New members in last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const { count: newMembersCount, error: newMembersError } =
        await supabase
          .from("members")
          .select("*", { count: "exact", head: true })
          .gte("created_at", thirtyDaysAgo.toISOString());
      if (newMembersError) {
        console.error("Failed to load new members count:", newMembersError);
      }

      // Today's attendance for selected event
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);
      const { count: todayCount, error: todayError } = await supabase
        .from("qr_attendance")
        .select("*", { count: "exact", head: true })
        .eq("event_id", currentEventId)
        .gte("scanned_at", todayStart.toISOString())
        .lte("scanned_at", todayEnd.toISOString());
      if (todayError) {
        console.error("Failed to load today's attendance:", todayError);
      }

      // Total attendance for selected event
      const { count: totalCount, error: totalError } = await supabase
        .from("qr_attendance")
        .select("*", { count: "exact", head: true })
        .eq("event_id", currentEventId);
      if (totalError) {
        console.error("Failed to load total attendance:", totalError);
      }

      // Unique attendees for selected event
      const { data: uniqueData, error: uniqueError } = await supabase
        .from("qr_attendance")
        .select("attendee_id", { count: "exact", head: false })
        .eq("event_id", currentEventId);
      if (uniqueError) {
        console.error("Failed to load unique attendees:", uniqueError);
      }
      const unique = new Set((uniqueData || []).map((r) => r.attendee_id)).size;

      // Active members in the last 30 days for this event
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
        console.error(
          "Failed to load attendance analytics:",
          attendanceError
        );
      }

      const countsByMember = new Map<string, number>();

      (attendanceData || []).forEach((row: any) => {
        const id = row.attendee_id as string;
        if (!id) return;

        countsByMember.set(id, (countsByMember.get(id) || 0) + 1);
      });

      let activeCount = 0;
      countsByMember.forEach((count) => {
        if (count >= 3) activeCount += 1;
      });

      setMetrics({
        totalMembers: memberCount || 0,
        totalActiveMembers: activeCount,
        todayAttendance: todayCount || 0,
        totalAttendance: totalCount || 0,
        uniqueAttendees: unique,
        newMembers: newMembersCount || 0,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    metrics,
    isLoading,
    loadMetrics,
  };
}
