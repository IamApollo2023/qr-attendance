import type { Activity } from "@/types";

/**
 * Export activities to CSV format
 */
export function exportActivitiesToCSV(activities: Activity[]): void {
  const csv = [
    [
      "Name",
      "Description",
      "Date",
      "Location",
      "Status",
      "Notes",
      "Created At",
      "Updated At",
    ].join(","),
    ...activities.map((a) =>
      [
        a.name,
        a.description || "",
        a.date ? a.date.split("T")[0] : "",
        a.location || "",
        a.status,
        a.notes || "",
        a.created_at ? new Date(a.created_at).toLocaleString() : "",
        a.updated_at ? new Date(a.updated_at).toLocaleString() : "",
      ]
        .map((field) => `"${String(field).replace(/"/g, '""')}"`)
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `activities-${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}


