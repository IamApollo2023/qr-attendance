import { getMembersData } from "@/lib/supabase-server";
import dynamic from "next/dynamic";

// Code-split heavy component - only loads when needed
const MembersManagement = dynamic(
  () => import("@/components/MembersManagement"),
  {
    loading: () => (
      <div className="p-8 text-center text-gray-600">Loading members...</div>
    ),
  }
);

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);

  // Auth is already checked by middleware, so we can trust the user is authenticated
  // Fetch initial data server-side with pagination
  const { members, error, pagination } = await getMembersData(page);

  if (error) {
    return (
      <MembersManagement
        initialData={{
          members: [],
          pagination: null,
        }}
      />
    );
  }

  return (
    <MembersManagement
      initialData={{
        members: members || [],
        pagination: pagination || null,
      }}
    />
  );
}


