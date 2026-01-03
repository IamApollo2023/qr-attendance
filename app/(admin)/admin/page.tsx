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
  const result = await getAttendanceData(eventId, page);

  // Check if result is an error type
  if ("error" in result && result.error) {
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

  // Type guard: result is GetAttendanceDataResult
  const data = result as {
    records: any[];
    stats: { total: number; today: number; unique: number };
    pagination: any;
  };

  return (
    <AdminDashboard
      initialData={{
        records: data.records || [],
        stats: data.stats || { total: 0, today: 0, unique: 0 },
        pagination: data.pagination || null,
      }}
      eventId={eventId}
    />
  );
}


