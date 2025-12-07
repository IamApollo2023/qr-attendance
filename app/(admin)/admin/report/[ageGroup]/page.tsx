import { getAgeGroupDetailReport } from "@/lib/reports";
import AgeGroupDetailReport from "@/components/AgeGroupDetailReport";
import { notFound } from "next/navigation";

const validAgeGroupKeys = ["all", "men", "women", "yan", "kkb", "kids"];

interface AgeGroupReportPageProps {
  params: Promise<{ ageGroup: string }>;
}

export default async function AgeGroupReportPage({
  params,
}: AgeGroupReportPageProps) {
  const { ageGroup } = await params;

  // Validate age group key
  if (!validAgeGroupKeys.includes(ageGroup)) {
    notFound();
  }

  // Fetch detail report data
  const reportData = await getAgeGroupDetailReport(ageGroup);

  return <AgeGroupDetailReport ageGroup={ageGroup} initialData={reportData} />;
}
