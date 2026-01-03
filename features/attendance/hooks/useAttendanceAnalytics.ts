import { useState, useCallback } from "react";
import { supabase } from "@/lib";
import type { AttendanceRecord } from "@/types";

export interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Hook for fetching paginated attendance data
 * Single responsibility: Fetch and manage paginated attendance records
 */
export function useAttendanceAnalytics() {
  const [attendees, setAttendees] = useState<AttendanceRecord[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

  return {
    attendees,
    pagination,
    isLoading,
    fetchPaginatedData,
  };
}
