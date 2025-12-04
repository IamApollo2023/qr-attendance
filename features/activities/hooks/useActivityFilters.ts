import { useMemo } from "react";
import type { Activity } from "@/types";
import type { ActivityFilters } from "../types/activity.types";

interface UseActivityFiltersProps {
  activities: Activity[];
  filters: ActivityFilters;
}

/**
 * Hook for filtering activities based on search term and status
 */
export function useActivityFilters({
  activities,
  filters,
}: UseActivityFiltersProps) {
  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      const searchTarget = `${activity.name} ${activity.description || ""} ${activity.location || ""}`.toLowerCase();
      const matchesSearch = searchTarget.includes(
        filters.searchTerm.toLowerCase()
      );
      const matchesStatus =
        filters.status === "all" || activity.status === filters.status;

      return matchesSearch && matchesStatus;
    });
  }, [activities, filters]);

  return {
    filteredActivities,
  };
}


