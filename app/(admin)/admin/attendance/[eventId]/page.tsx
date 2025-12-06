import { getAttendanceRecordsForTabs } from "@/lib/supabase-server";
import { getEventById } from "@/lib/events";
import type { AttendanceRecord } from "@/types";
import { AttendanceManagement } from "@/components/AttendanceManagement";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface EventDetailPageProps {
  params: Promise<{ eventId: string }>;
}

export default async function EventDetailPage({
  params,
}: EventDetailPageProps) {
  const { eventId } = await params;

  // Fetch event details
  const event = await getEventById(eventId);

  if (!event) {
    notFound();
  }

  // Fetch attendance records for this event
  const { records, error } = await getAttendanceRecordsForTabs(
    event.name,
    1,
    150
  );

  const safeRecords: AttendanceRecord[] = error ? [] : records || [];

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-3 py-3 md:gap-6 md:py-6">
        {/* Back Button */}
        <div className="flex flex-col gap-3 px-4 sm:flex-row sm:items-center sm:justify-between lg:px-6">
          <Link href="/admin/attendance">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Events</span>
              <span className="sm:hidden">Back</span>
            </Button>
          </Link>
        </div>

        {/* Attendance Table */}
        <div className="flex min-h-0 flex-1 flex-col gap-3 px-4 md:gap-4 lg:px-6">
          <AttendanceManagement
            records={safeRecords}
            eventId={event.name}
            eventName={event.name}
            eventDescription={event.description}
          />
        </div>
      </div>
    </div>
  );
}
