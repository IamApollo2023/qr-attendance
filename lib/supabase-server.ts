import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { AttendanceRecord, Member, Activity } from "@/types";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

// Internal helper to fetch attendance data from Supabase
async function fetchAttendanceData(
  eventId: string,
  page: number,
  pageSize: number
) {
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
}

export async function getAttendanceData(
  eventId: string = "default",
  page: number = 1,
  pageSize: number = 25
) {
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
    return { error: "Forbidden", records: [], stats: null, pagination: null };
  }

  try {
    const data = await fetchAttendanceData(eventId, page, pageSize);
    return { error: null, ...data };
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return {
      error: "Failed to fetch",
      records: [],
      stats: null,
      pagination: null,
    };
  }
}

// Lightweight attendance fetch for tabbed Attendance page (records only, no stats)
async function fetchAttendanceRecordsOnly(
  eventId: string,
  page: number,
  pageSize: number
) {
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
}

export async function getAttendanceRecordsForTabs(
  eventId: string = "default",
  page: number = 1,
  pageSize: number = 150
) {
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
    const records = await fetchAttendanceRecordsOnly(eventId, page, pageSize);
    return { error: null, records };
  } catch (error) {
    console.error("Error fetching attendance records for tabs:", error);
    return { error: "Failed to fetch", records: [] as AttendanceRecord[] };
  }
}

// Internal helper to fetch members data from Supabase
async function fetchMembersData(page: number, pageSize: number) {
  const supabase = await createClient();

  // Pagination: Calculate range
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // Fetch paginated members with limited fields
  const {
    data: members,
    error,
    count,
  } = await supabase
    .from("members")
    .select(
      `
      id,
      member_id,
      first_name,
      last_name,
      barangay_name,
      city_municipality_name,
      gender,
      age_category
    `,
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw error;
  }

  const totalPages = Math.ceil((count || 0) / pageSize);

  return {
    members: (members || []) as Member[],
    pagination: {
      page,
      pageSize,
      total: count || 0,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}

export async function getMembersData(page: number = 1, pageSize: number = 20) {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Unauthorized", members: [], pagination: null };
  }

  // Check if user has admin role
  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile || profile.role !== "admin") {
    return { error: "Forbidden", members: [], pagination: null };
  }

  try {
    const data = await fetchMembersData(page, pageSize);
    return { error: null, ...data };
  } catch (error) {
    console.error("Error fetching members:", error);
    return { error: "Failed to fetch", members: [], pagination: null };
  }
}

async function fetchActivitiesData(page: number, pageSize: number) {
  const supabase = await createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("activities")
    .select(
      `
      id,
      name,
      description,
      date,
      location,
      status,
      notes,
      created_at,
      updated_at
    `,
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw error;
  }

  const totalPages = Math.ceil((count || 0) / pageSize);
  const pagination = {
    page,
    pageSize,
    total: count || 0,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };

  return {
    activities: (data || []) as Activity[],
    pagination,
  };
}

export async function getActivitiesData(
  page: number = 1,
  pageSize: number = 20
) {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Unauthorized", activities: [], pagination: null };
  }

  // Check if user has admin role
  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile || profile.role !== "admin") {
    return { error: "Forbidden", activities: [], pagination: null };
  }

  try {
    const data = await fetchActivitiesData(page, pageSize);
    return { error: null, ...data };
  } catch (error) {
    console.error("Error fetching activities:", error);
    return { error: "Failed to fetch", activities: [], pagination: null };
  }
}

// Finance data fetching functions
async function fetchTithesData(page: number, pageSize: number) {
  const supabase = await createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("tithes")
    .select(
      `
      *,
      member:members(id, first_name, last_name, member_id)
    `,
      { count: "exact" }
    )
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw error;
  }

  const totalPages = Math.ceil((count || 0) / pageSize);
  const pagination = {
    page,
    pageSize,
    total: count || 0,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };

  return {
    tithes: data || [],
    pagination,
  };
}

export async function getTithesData(page: number = 1, pageSize: number = 20) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Unauthorized", tithes: [], pagination: null };
  }

  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (
    profileError ||
    !profile ||
    (profile.role !== "admin" && profile.role !== "finance")
  ) {
    return { error: "Forbidden", tithes: [], pagination: null };
  }

  try {
    const data = await fetchTithesData(page, pageSize);
    return { error: null, ...data };
  } catch (error) {
    console.error("Error fetching tithes:", error);
    return { error: "Failed to fetch", tithes: [], pagination: null };
  }
}

async function fetchOfferingsData(page: number, pageSize: number) {
  const supabase = await createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("offerings")
    .select(
      `
      *,
      member:members(id, first_name, last_name, member_id)
    `,
      { count: "exact" }
    )
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw error;
  }

  const totalPages = Math.ceil((count || 0) / pageSize);
  const pagination = {
    page,
    pageSize,
    total: count || 0,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };

  return {
    offerings: data || [],
    pagination,
  };
}

export async function getOfferingsData(
  page: number = 1,
  pageSize: number = 20
) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Unauthorized", offerings: [], pagination: null };
  }

  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (
    profileError ||
    !profile ||
    (profile.role !== "admin" && profile.role !== "finance")
  ) {
    return { error: "Forbidden", offerings: [], pagination: null };
  }

  try {
    const data = await fetchOfferingsData(page, pageSize);
    return { error: null, ...data };
  } catch (error) {
    console.error("Error fetching offerings:", error);
    return { error: "Failed to fetch", offerings: [], pagination: null };
  }
}

async function fetchPledgesData(page: number, pageSize: number) {
  const supabase = await createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("pledges")
    .select(
      `
      *,
      member:members(id, first_name, last_name, member_id)
    `,
      { count: "exact" }
    )
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw error;
  }

  const totalPages = Math.ceil((count || 0) / pageSize);
  const pagination = {
    page,
    pageSize,
    total: count || 0,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };

  return {
    pledges: data || [],
    pagination,
  };
}

export async function getPledgesData(page: number = 1, pageSize: number = 20) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Unauthorized", pledges: [], pagination: null };
  }

  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (
    profileError ||
    !profile ||
    (profile.role !== "admin" && profile.role !== "finance")
  ) {
    return { error: "Forbidden", pledges: [], pagination: null };
  }

  try {
    const data = await fetchPledgesData(page, pageSize);
    return { error: null, ...data };
  } catch (error) {
    console.error("Error fetching pledges:", error);
    return { error: "Failed to fetch", pledges: [], pagination: null };
  }
}
