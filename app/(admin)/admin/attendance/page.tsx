import { getAttendanceRecordsForTabs } from "@/lib/supabase-server";
import type { AttendanceRecord } from "@/types";

import { AttendanceManagement } from "@/components/AttendanceManagement";

interface AttendancePageSearchParams {
  event_id?: string;
}

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<AttendancePageSearchParams>;
}) {
  const params = await searchParams;
  const eventId = params.event_id || "default";

  // For the tabbed view we fetch a reasonable page size once and paginate on the client per tab
  const { records, error } = await getAttendanceRecordsForTabs(eventId, 1, 150);

  const safeRecords: AttendanceRecord[] = error ? [] : records || [];

  return <AttendanceManagement records={safeRecords} eventId={eventId} />;
}
