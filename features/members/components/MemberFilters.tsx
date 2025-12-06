"use client";

import type { MemberFilters as MemberFiltersType } from "../types/member.types";
import { SearchInput, FilterSelect } from "@/components/ui";

interface MemberFiltersProps {
  filters: MemberFiltersType;
  onFiltersChange: (filters: Partial<MemberFiltersType>) => void;
  searchInput: string;
  onSearchInputChange: (value: string) => void;
}

export function MemberFilters({
  filters,
  onFiltersChange,
  searchInput,
  onSearchInputChange,
}: MemberFiltersProps) {
  return (
    <div className="bg-white rounded-xl px-2 py-1.5 md:px-3 md:py-2 shadow-lg border border-gray-200 flex-shrink-0">
      <div className="flex flex-col sm:flex-row sm:flex-nowrap items-center gap-1.5 md:gap-2">
        <SearchInput
          wrapperClassName="w-full sm:w-40 md:w-48 sm:flex-shrink-0"
          placeholder="Search members..."
          value={searchInput}
          onChange={(e) => onSearchInputChange(e.target.value)}
        />
      </div>
    </div>
  );
}
