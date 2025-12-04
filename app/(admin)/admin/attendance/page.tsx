import { getAttendanceData } from "@/lib/supabase-server";
import type { AttendanceRecord } from "@/types";
import { AttendanceTabs } from "@/components/AttendanceTabs";

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

  // For the tabbed view we fetch a larger page size once and paginate on the client per tab
  const { records, error } = await getAttendanceData(eventId, 1, 500);

  const safeRecords: AttendanceRecord[] = error ? [] : (records || []);

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <h1 className="text-2xl font-semibold tracking-tight">Attendance</h1>
          <p className="text-sm text-muted-foreground">
            View attendance records organized by age group and gender.
          </p>
        </div>
        <div className="flex min-h-0 flex-1 flex-col px-4 lg:px-6">
          <AttendanceTabs records={safeRecords} eventId={eventId} />
        </div>
      </div>
    </div>
  );
}



