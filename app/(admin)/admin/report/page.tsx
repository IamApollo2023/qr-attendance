import { getAgeGroupStats } from "@/lib/reports";
import ReportsManagement from "@/components/ReportsManagement";

export default async function ReportPage() {
  // Fetch age group statistics
  const ageGroups = await getAgeGroupStats();

  return <ReportsManagement initialData={{ ageGroups }} />;
}
