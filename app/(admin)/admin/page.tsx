import { getAttendanceData } from "@/lib/supabase-server";
import AdminDashboard from "@/components/AdminDashboard";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ event_id?: string; page?: string }>;
}) {
  const params = await searchParams;
  const eventId = params.event_id || "default";
  const page = parseInt(params.page || "1", 10);

  // Auth is already checked by middleware, so we can trust the user is authenticated
  // Fetch initial data server-side with pagination
  const { records, stats, error, pagination } = await getAttendanceData(
    eventId,
    page
  );

  if (error) {
    // If there's an error, still render but with empty data
    // The client component will handle real-time updates
    return (
      <AdminDashboard
        initialData={{
          records: [],
          stats: { total: 0, today: 0, unique: 0 },
          pagination: null,
        }}
        eventId={eventId}
      />
    );
  }

  return (
    <AdminDashboard
      initialData={{
        records: records || [],
        stats: stats || { total: 0, today: 0, unique: 0 },
        pagination: pagination || null,
      }}
      eventId={eventId}
    />
  );
}


