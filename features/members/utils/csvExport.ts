import type { Member } from "@/types";

/**
 * Export members to CSV format
 */
export function exportMembersToCSV(members: Member[]): void {
  const csv = [
    [
      "Member ID",
      "First Name",
      "Middle Name",
      "Last Name",
      "Province Code",
      "Province Name",
      "City/Municipality Code",
      "City/Municipality Name",
      "Barangay Code",
      "Barangay Name",
      "Birthday",
      "Gender",
      "Membership Type",
      "Classification",
      "Age Category",
    ].join(","),
    ...members.map((m) =>
      [
        m.member_id,
        m.first_name,
        m.middle_name ?? "",
        m.last_name,
        m.province_code ?? "",
        m.province_name ?? "",
        m.city_municipality_code ?? "",
        m.city_municipality_name ?? "",
        m.barangay_code ?? "",
        m.barangay_name ?? "",
        m.birthday.split("T")[0],
        m.gender,
        m.membership_type,
        m.classification ?? "",
        m.age_category,
      ].join(",")
    ),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `members-${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
