import { createClient } from "../supabase-server";
import type { AttendanceRecord } from "@/types";

export interface AttendanceStats {
  total: number;
  today: number;
  unique: number;
}

export interface AttendancePagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface GetAttendanceDataResult {
  records: AttendanceRecord[];
  stats: AttendanceStats;
  pagination: AttendancePagination;
}

export interface GetAttendanceDataError {
  error: string;
  records: [];
  stats: null;
  pagination: null;
}

/**
 * Server-side repository for attendance data operations
 * Handles authentication, authorization, and data fetching
 */
export const attendanceRepository = {
  /**
   * Fetch attendance data with stats and pagination
   */
  async getAttendanceData(
    eventId: string = "default",
    page: number = 1,
    pageSize: number = 25
  ): Promise<GetAttendanceDataResult | GetAttendanceDataError> {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        error: "Unauthorized",
        records: [],
        stats: null,
        pagination: null,
      };
    }

    // Check if user has admin role
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || profile.role !== "admin") {
      return {
        error: "Forbidden",
        records: [],
        stats: null,
        pagination: null,
      };
    }

    try {
      const data = await this.fetchAttendanceData(eventId, page, pageSize);
      return data as GetAttendanceDataResult;
    } catch (error) {
      console.error("Error fetching attendance:", error);
      return {
        error: "Failed to fetch",
        records: [],
        stats: null,
        pagination: null,
      };
    }
  },

  /**
   * Internal helper to fetch attendance data from Supabase
   */
  async fetchAttendanceData(
    eventId: string,
    page: number,
    pageSize: number
  ): Promise<{
    records: AttendanceRecord[];
    stats: AttendanceStats;
    pagination: AttendancePagination;
  }> {
    const supabase = await createClient();

    // Get total count for stats (fast query, no data transfer)
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

    // Get unique attendees count
    const { data: uniqueData } = await supabase
      .from("qr_attendance")
      .select("attendee_id", { count: "exact", head: false })
      .eq("event_id", eventId);

    const unique = new Set((uniqueData || []).map((r) => r.attendee_id)).size;

    // Pagination: Calculate range
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Fetch paginated attendance records with limited fields
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
    `,
        { count: "exact" }
      )
      .eq("event_id", eventId)
      .order("scanned_at", { ascending: false })
      .range(from, to);

    if (error) {
      throw error;
    }

    // Transform data to ensure member is a single object, not an array
    const attendanceRecords = (records || []).map((record: any) => ({
      ...record,
      member: Array.isArray(record.member)
        ? record.member[0] || undefined
        : record.member || undefined,
    })) as AttendanceRecord[];
    const totalPages = Math.ceil((totalCount || 0) / pageSize);

    return {
      records: attendanceRecords,
      stats: {
        total: totalCount || 0,
        today: todayCount || 0,
        unique,
      },
      pagination: {
        page,
        pageSize,
        total: totalCount || 0,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  },

  /**
   * Fetch attendance records only (for tabbed views, no stats)
   */
  async getAttendanceRecordsForTabs(
    eventId: string = "default",
    page: number = 1,
    pageSize: number = 150
  ): Promise<
    | { error: null; records: AttendanceRecord[] }
    | { error: string; records: AttendanceRecord[] }
  > {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "Unauthorized", records: [] as AttendanceRecord[] };
    }

    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || profile.role !== "admin") {
      return { error: "Forbidden", records: [] as AttendanceRecord[] };
    }

    try {
      const records = await this.fetchAttendanceRecordsOnly(
        eventId,
        page,
        pageSize
      );
      return { error: null, records };
    } catch (error) {
      console.error("Error fetching attendance records for tabs:", error);
      return { error: "Failed to fetch", records: [] as AttendanceRecord[] };
    }
  },

  /**
   * Internal helper to fetch attendance records only (no stats)
   */
  async fetchAttendanceRecordsOnly(
    eventId: string,
    page: number,
    pageSize: number
  ): Promise<AttendanceRecord[]> {
    const supabase = await createClient();
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error } = await supabase
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

    if (error) {
      throw error;
    }

    // Transform data to ensure member is a single object, not an array
    const transformedData = (data || []).map((record: any) => ({
      ...record,
      member: Array.isArray(record.member)
        ? record.member[0] || undefined
        : record.member || undefined,
    }));

    return transformedData as AttendanceRecord[];
  },
};
