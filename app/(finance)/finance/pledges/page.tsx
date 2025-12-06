import { getPledgesData } from "@/lib/supabase-server";
import { PledgesManagement } from "@/features/finance/components";

export default async function PledgesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; pageSize?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const pageSize = parseInt(params.pageSize || "20", 10);

  const { pledges, pagination, error } = await getPledgesData(page, pageSize);

  if (error) {
    return (
      <PledgesManagement
        initialData={{
          pledges: [],
          pagination: null,
        }}
      />
    );
  }

  return (
    <PledgesManagement
      initialData={{
        pledges: pledges || [],
        pagination: pagination || null,
      }}
    />
  );
}
