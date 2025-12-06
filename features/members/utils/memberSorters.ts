import type { Member } from "@/types";
import type { SortConfig, SortKey } from "../types/member.types";

/**
 * Sort members based on sort configuration
 */
export function sortMembers(
  members: Member[],
  sortConfig: SortConfig | null
): Member[] {
  if (!sortConfig) return members;

  const data = [...members];
  const compare = (a: Member, b: Member) => {
    let aVal: string | number = "";
    let bVal: string | number = "";

    switch (sortConfig.key) {
      case "member_id":
        aVal = a.member_id || "";
        bVal = b.member_id || "";
        break;
      case "first_name":
        aVal = a.first_name || "";
        bVal = b.first_name || "";
        break;
      case "last_name":
        aVal = a.last_name || "";
        bVal = b.last_name || "";
        break;
      case "address":
        // Format: "Barangay, City/Municipality"
        const aBarangay = a.barangay_name || "";
        const aCity = a.city_municipality_name || "";
        const bBarangay = b.barangay_name || "";
        const bCity = b.city_municipality_name || "";
        aVal = `${aBarangay}, ${aCity}`.trim();
        bVal = `${bBarangay}, ${bCity}`.trim();
        break;
      case "age_category":
        aVal = a.age_category || "";
        bVal = b.age_category || "";
        break;
      default:
        break;
    }

    return String(aVal).localeCompare(String(bVal));
  };

  data.sort((a, b) =>
    sortConfig.direction === "asc" ? compare(a, b) : compare(b, a)
  );
  return data;
}
