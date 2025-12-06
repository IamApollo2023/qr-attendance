import type { AttendanceRecord } from "@/types";

/**
 * Export attendance records to CSV format
 */
export function exportAttendanceToCSV(records: AttendanceRecord[]): void {
  const csv = [
    [
      "Attendee ID",
      "Member Name",
      "Age Category",
      "Gender",
      "Scanned At",
      "Event ID",
    ].join(","),
    ...records.map((rec) => {
      const memberName = rec.member
        ? `${rec.member.first_name} ${rec.member.last_name}`
        : rec.attendee_id;
      const ageCategory = rec.member?.age_category || "N/A";
      const gender = rec.member?.gender || "N/A";
      const scannedAt = new Date(rec.scanned_at).toLocaleString();
      const eventId = rec.event_id || "";

      return [
        rec.attendee_id,
        memberName,
        ageCategory,
        gender,
        scannedAt,
        eventId,
      ].join(",");
    }),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `attendance-${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
