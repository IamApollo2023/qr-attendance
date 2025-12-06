import { getTithesData } from "@/lib/supabase-server";
import { TithesManagement } from "@/features/finance/components";

export default async function TithesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; pageSize?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const pageSize = parseInt(params.pageSize || "20", 10);

  const { tithes, pagination, error } = await getTithesData(page, pageSize);

  if (error) {
    return (
      <TithesManagement
        initialData={{
          tithes: [],
          pagination: null,
        }}
      />
    );
  }

  return (
    <TithesManagement
      initialData={{
        tithes: tithes || [],
        pagination: pagination || null,
      }}
    />
  );
}
