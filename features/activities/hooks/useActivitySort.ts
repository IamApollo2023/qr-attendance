import { useMemo } from "react";
import type { Activity } from "@/types";
import type { SortConfig, SortKey } from "../types/activity.types";

interface UseActivitySortProps {
  activities: Activity[];
  sortConfig: SortConfig | null;
}

/**
 * Hook for sorting activities based on sort configuration
 */
export function useActivitySort({
  activities,
  sortConfig,
}: UseActivitySortProps) {
  const sortedActivities = useMemo(() => {
    const data = [...activities];
    if (!sortConfig) return data;

    const compare = (a: Activity, b: Activity) => {
      let aVal: string | number = "";
      let bVal: string | number = "";

      switch (sortConfig.key) {
        case "name":
          aVal = a.name || "";
          bVal = b.name || "";
          break;
        case "date":
          aVal = a.date || "";
          bVal = b.date || "";
          break;
        case "location":
          aVal = a.location || "";
          bVal = b.location || "";
          break;
        case "status":
          aVal = a.status || "";
          bVal = b.status || "";
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
  }, [activities, sortConfig]);

  return {
    sortedActivities,
  };
}


