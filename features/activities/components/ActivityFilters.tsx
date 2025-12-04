"use client";

import type { ActivityFilters as ActivityFiltersType } from "../types/activity.types";
import { SearchInput, FilterSelect } from "@/components/ui";

interface ActivityFiltersProps {
  filters: ActivityFiltersType;
  onFiltersChange: (filters: Partial<ActivityFiltersType>) => void;
  searchInput: string;
  onSearchInputChange: (value: string) => void;
}

export function ActivityFilters({
  filters,
  onFiltersChange,
  searchInput,
  onSearchInputChange,
}: ActivityFiltersProps) {
  return (
    <div className="bg-white rounded-xl px-4 py-3 shadow-lg border border-gray-200 flex-shrink-0">
      <div className="flex flex-row items-center gap-3">
        <SearchInput
          wrapperClassName="w-100"
          placeholder="Search activities..."
          value={searchInput}
          onChange={(e) => onSearchInputChange(e.target.value)}
        />
        <FilterSelect
          value={filters.status}
          onChange={(e) =>
            onFiltersChange({
              status: e.target.value as ActivityFiltersType["status"],
            })
          }
          options={[
            { value: "all", label: "All Status" },
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
          ]}
        />
      </div>
    </div>
  );
}
