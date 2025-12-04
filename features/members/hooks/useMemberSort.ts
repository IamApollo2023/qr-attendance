import { useMemo } from "react";
import type { Member } from "@/types";
import type { SortConfig, SortKey } from "../types/member.types";

interface UseMemberSortProps {
  members: Member[];
  sortConfig: SortConfig | null;
}

/**
 * Hook for sorting members based on sort configuration
 */
export function useMemberSort({
  members,
  sortConfig,
}: UseMemberSortProps) {
  const sortedMembers = useMemo(() => {
    const data = [...members];
    if (!sortConfig) return data;

    const compare = (a: Member, b: Member) => {
      let aVal: string | number = "";
      let bVal: string | number = "";

      switch (sortConfig.key) {
        case "member_id":
          aVal = a.member_id || "";
          bVal = b.member_id || "";
          break;
        case "name":
          aVal = `${a.last_name || ""} ${a.first_name || ""}`;
          bVal = `${b.last_name || ""} ${b.first_name || ""}`;
          break;
        case "address":
          aVal = a.address || "";
          bVal = b.address || "";
          break;
        case "birthday":
          aVal = a.birthday || "";
          bVal = b.birthday || "";
          break;
        case "age_category":
          aVal = a.age_category || "";
          bVal = b.age_category || "";
          break;
        case "created_at":
          aVal = a.created_at || "";
          bVal = b.created_at || "";
          break;
        case "updated_at":
          aVal = a.updated_at || "";
          bVal = b.updated_at || "";
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
  }, [members, sortConfig]);

  return {
    sortedMembers,
  };
}

