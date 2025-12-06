import { getOfferingsData } from "@/lib/supabase-server";
import { OfferingsManagement } from "@/features/finance/components";

export default async function OfferingsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; pageSize?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const pageSize = parseInt(params.pageSize || "20", 10);

  const { offerings, pagination, error } = await getOfferingsData(
    page,
    pageSize
  );

  if (error) {
    return (
      <OfferingsManagement
        initialData={{
          offerings: [],
          pagination: null,
        }}
      />
    );
  }

  return (
    <OfferingsManagement
      initialData={{
        offerings: offerings || [],
        pagination: pagination || null,
      }}
    />
  );
}
