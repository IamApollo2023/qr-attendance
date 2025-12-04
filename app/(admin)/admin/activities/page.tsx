import { getActivitiesData } from "@/lib/supabase-server";
import dynamic from "next/dynamic";

// Code-split heavy component - only loads when needed
const ActivitiesManagement = dynamic(
  () => import("@/components/ActivitiesManagement"),
  {
    loading: () => (
      <div className="p-8 text-center text-gray-600">Loading activities...</div>
    ),
  }
);

export default async function ActivitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);

  // Auth is already checked by middleware, so we can trust the user is authenticated
  // Fetch initial data server-side with pagination
  const { activities, error, pagination } = await getActivitiesData(page);

  if (error) {
    return (
      <ActivitiesManagement
        initialData={{
          activities: [],
          pagination: null,
        }}
      />
    );
  }

  return (
    <ActivitiesManagement
      initialData={{
        activities: activities || [],
        pagination: pagination || null,
      }}
    />
  );
}


