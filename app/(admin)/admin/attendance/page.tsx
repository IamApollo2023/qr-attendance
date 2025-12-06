import { getAllEventsWithStats, getActiveEvent } from "@/lib/events";
import { EventAttendanceCards } from "@/components/EventAttendanceCards";

export default async function AttendancePage() {
  // Fetch all events with their stats
  const events = await getAllEventsWithStats();
  const activeEvent = await getActiveEvent();

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-3 py-3 md:gap-6 md:py-6">
        {/* Header */}
        <div className="flex flex-col gap-3 px-4 sm:flex-row sm:items-center sm:justify-between lg:px-6">
          <div>
            <h1 className="text-lg md:text-3xl font-semibold tracking-tight">
              Attendance
            </h1>
            <p className="text-xs md:text-base text-muted-foreground">
              Select an event to view attendance records.
            </p>
          </div>
        </div>

        {/* Event Cards */}
        <div className="flex min-h-0 flex-1 flex-col gap-3 px-4 md:gap-4 lg:px-6">
          <EventAttendanceCards
            events={events}
            activeEventId={activeEvent?.id}
          />
        </div>
      </div>
    </div>
  );
}
