import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { createClient } from "@supabase/supabase-js";
import type { AttendanceRecord } from "@/types";

// Server-side Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const eventId = searchParams.get("event_id") || "default";
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");

    // Create authenticated Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    // Verify user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has admin role
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || profile.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden - Admin role required" },
        { status: 403 }
      );
    }

    // Fetch attendance records
    const { data: records, error } = await supabase
      .from("qr_attendance")
      .select("*")
      .eq("event_id", eventId)
      .order("scanned_at", { ascending: false });

    if (error) {
      console.error("Error fetching attendance:", error);
      return NextResponse.json(
        { error: "Failed to fetch attendance records" },
        { status: 500 }
      );
    }

    const attendanceRecords = (records || []) as AttendanceRecord[];

    // Calculate stats
    const total = attendanceRecords.length;
    const today = attendanceRecords.filter((r) => {
      const scanDate = new Date(r.scanned_at);
      const today = new Date();
      return scanDate.toDateString() === today.toDateString();
    }).length;
    const unique = new Set(attendanceRecords.map((r) => r.attendee_id)).size;

    return NextResponse.json({
      records: attendanceRecords,
      stats: {
        total,
        today,
        unique,
      },
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
