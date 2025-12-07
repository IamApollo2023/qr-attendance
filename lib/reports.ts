import { createClient } from "./supabase-server";

export interface AgeGroupStats {
  total: number;
  today: number;
  unique: number;
}

export interface AgeGroupData {
  key: string;
  name: string;
  stats: AgeGroupStats;
}

export interface EventSession {
  sessionId: string;
  eventName: string;
  date: string;
  displayName: string;
}

export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
}

export interface AgeGroupDetailReport {
  members: Member[];
  sessions: EventSession[];
  attendance: Record<string, string[]>; // memberId -> Array of sessionIds
}

/**
 * Get all attendance records with member data (fetched once for efficiency)
 */
async function getAllAttendanceRecords(supabase: any) {
  const { data: allRecords, error } = await supabase
    .from("qr_attendance")
    .select(
      `
      id,
      attendee_id,
      scanned_at,
      event_id,
      member:members (
        id,
        age_category,
        gender
      )
    `
    );

  if (error) {
    console.error("Error fetching attendance records:", error);
    return [];
  }

  // Transform data to ensure member is a single object, not an array
  return (allRecords || []).map((record: any) => ({
    ...record,
    member: Array.isArray(record.member) ? record.member[0] : record.member,
  }));
}

/**
 * Get all attendance records with full member data for detail reports
 */
async function getAllAttendanceRecordsWithFullMemberData(supabase: any) {
  const { data: allRecords, error } = await supabase
    .from("qr_attendance")
    .select(
      `
      id,
      attendee_id,
      scanned_at,
      event_id,
      member:members (
        id,
        first_name,
        last_name,
        age_category,
        gender
      )
    `
    );

  if (error) {
    console.error("Error fetching attendance records:", error);
    return [];
  }

  // Transform data to ensure member is a single object, not an array
  return (allRecords || []).map((record: any) => ({
    ...record,
    member: Array.isArray(record.member) ? record.member[0] : record.member,
  }));
}

/**
 * Calculate statistics for filtered records
 */
function calculateStats(
  records: any[],
  filterFn: (record: any) => boolean
): AgeGroupStats {
  // Filter records
  const filteredRecords = records.filter(filterFn);

  // Calculate today's date range
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  // Calculate stats
  const total = filteredRecords.length;
  const today = filteredRecords.filter((record: any) => {
    const scannedAt = new Date(record.scanned_at);
    return scannedAt >= todayStart && scannedAt <= todayEnd;
  }).length;
  const unique = new Set(filteredRecords.map((r: any) => r.attendee_id)).size;

  return { total, today, unique };
}

/**
 * Get statistics for all age groups
 */
export async function getAgeGroupStats(): Promise<AgeGroupData[]> {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error("Authentication error in getAgeGroupStats:", authError);
    return [];
  }

  try {
    // Fetch all attendance records once (more efficient)
    const allRecords = await getAllAttendanceRecords(supabase);

    // Calculate statistics for each age group from the same dataset
    // All - all records
    const allStats = calculateStats(allRecords, () => true);

    // Men - Men category + male gender
    const menStats = calculateStats(
      allRecords,
      (record) =>
        record.member?.age_category === "Men" &&
        record.member?.gender === "male"
    );

    // Women - Women category + female gender
    const womenStats = calculateStats(
      allRecords,
      (record) =>
        record.member?.age_category === "Women" &&
        record.member?.gender === "female"
    );

    // YAN - YAN category (both male and female)
    const yanStats = calculateStats(
      allRecords,
      (record) => record.member?.age_category === "YAN"
    );

    // KKB - KKB category (both male and female)
    const kkbStats = calculateStats(
      allRecords,
      (record) => record.member?.age_category === "KKB"
    );

    // Kids - Children category (both male and female)
    const kidsStats = calculateStats(
      allRecords,
      (record) => record.member?.age_category === "Children"
    );

    // Return with "All" first, then others
    return [
      { key: "all", name: "All", stats: allStats },
      { key: "men", name: "Men", stats: menStats },
      { key: "women", name: "Women", stats: womenStats },
      { key: "yan", name: "YAN", stats: yanStats },
      { key: "kkb", name: "KKB", stats: kkbStats },
      { key: "kids", name: "Kids", stats: kidsStats },
    ];
  } catch (error) {
    console.error("Error in getAgeGroupStats:", error);
    return [];
  }
}

/**
 * Get member filter function based on age group key
 */
function getMemberFilter(ageGroupKey: string) {
  switch (ageGroupKey) {
    case "all":
      return (record: any) => true;
    case "men":
      return (record: any) =>
        record.member?.age_category === "Men" &&
        record.member?.gender === "male";
    case "women":
      return (record: any) =>
        record.member?.age_category === "Women" &&
        record.member?.gender === "female";
    case "yan":
      return (record: any) => record.member?.age_category === "YAN";
    case "kkb":
      return (record: any) => record.member?.age_category === "KKB";
    case "kids":
      return (record: any) => record.member?.age_category === "Children";
    default:
      return (record: any) => true;
  }
}

/**
 * Get detailed report for a specific age group
 */
export async function getAgeGroupDetailReport(
  ageGroupKey: string
): Promise<AgeGroupDetailReport> {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error(
      "Authentication error in getAgeGroupDetailReport:",
      authError
    );
    return {
      members: [],
      sessions: [],
      attendance: {},
    };
  }

  try {
    // Fetch all attendance records with full member data
    const allRecords =
      await getAllAttendanceRecordsWithFullMemberData(supabase);

    // Filter by age group
    const memberFilter = getMemberFilter(ageGroupKey);
    const filteredRecords = allRecords.filter(memberFilter);

    // Extract unique members
    const memberMap = new Map<string, Member>();
    filteredRecords.forEach((record: any) => {
      if (record.member?.id) {
        const memberId = record.member.id;
        if (!memberMap.has(memberId)) {
          memberMap.set(memberId, {
            id: memberId,
            firstName: record.member.first_name || "",
            lastName: record.member.last_name || "",
            fullName:
              `${record.member.first_name || ""} ${record.member.last_name || ""}`.trim(),
          });
        }
      }
    });

    // Extract unique event sessions (grouped by event_id and date)
    const sessionMap = new Map<string, EventSession>();
    filteredRecords.forEach((record: any) => {
      if (record.event_id && record.scanned_at) {
        const scannedDate = new Date(record.scanned_at);
        const dateStr = scannedDate.toISOString().split("T")[0]; // YYYY-MM-DD
        const sessionId = `${record.event_id}-${dateStr}`
          .toLowerCase()
          .replace(/\s+/g, "-");

        if (!sessionMap.has(sessionId)) {
          const eventName = record.event_id;
          const displayName = `${eventName} - ${dateStr}`;
          sessionMap.set(sessionId, {
            sessionId,
            eventName,
            date: dateStr,
            displayName,
          });
        }
      }
    });

    // Build attendance map: memberId -> Array of sessionIds
    const attendance: Record<string, string[]> = {};
    filteredRecords.forEach((record: any) => {
      if (record.member?.id && record.event_id && record.scanned_at) {
        const memberId = record.member.id;
        const scannedDate = new Date(record.scanned_at);
        const dateStr = scannedDate.toISOString().split("T")[0];
        const sessionId = `${record.event_id}-${dateStr}`
          .toLowerCase()
          .replace(/\s+/g, "-");

        if (!attendance[memberId]) {
          attendance[memberId] = [];
        }
        // Only add if not already in array (avoid duplicates)
        if (!attendance[memberId].includes(sessionId)) {
          attendance[memberId].push(sessionId);
        }
      }
    });

    // Convert to arrays and sort
    const members = Array.from(memberMap.values()).sort((a, b) => {
      // Sort by last name, then first name
      const lastNameCompare = a.lastName.localeCompare(b.lastName);
      if (lastNameCompare !== 0) return lastNameCompare;
      return a.firstName.localeCompare(b.firstName);
    });

    const sessions = Array.from(sessionMap.values()).sort((a, b) => {
      // Sort by date (oldest first), then by event name
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.eventName.localeCompare(b.eventName);
    });

    return {
      members,
      sessions,
      attendance,
    };
  } catch (error) {
    console.error("Error in getAgeGroupDetailReport:", error);
    return {
      members: [],
      sessions: [],
      attendance: {},
    };
  }
}
