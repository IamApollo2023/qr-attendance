"use client";

import type { MemberFilters as MemberFiltersType } from "../types/member.types";
import { SearchInput, FilterSelect } from "@/components/ui";
import { DateInput } from "@/components/ui/date-input";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const hasDateFilter = filters.dateAddedFrom || filters.dateAddedTo;

  const clearDateFilter = () => {
    onFiltersChange({
      dateAddedFrom: undefined,
      dateAddedTo: undefined,
    });
  };

  return (
    <div className="bg-white rounded-xl px-2 py-1.5 md:px-3 md:py-2 shadow-lg border border-gray-200 flex-shrink-0">
      <div className="flex flex-col gap-2">
        <div className="flex flex-col sm:flex-row sm:flex-nowrap items-center gap-1.5 md:gap-2">
          <SearchInput
            wrapperClassName="w-full sm:w-40 md:w-48 sm:flex-shrink-0"
            placeholder="Search members..."
            value={searchInput}
            onChange={(e) => onSearchInputChange(e.target.value)}
          />
        </div>
        <div className="flex flex-col sm:flex-row sm:flex-nowrap items-center gap-1.5 md:gap-2">
          <div className="flex items-center gap-1.5 md:gap-2 w-full sm:w-auto">
            <DateInput
              className="w-full sm:w-36 md:w-40 text-xs md:text-sm"
              placeholder="From date"
              value={filters.dateAddedFrom || ""}
              onChange={(e) =>
                onFiltersChange({ dateAddedFrom: e.target.value || undefined })
              }
            />
            <span className="text-gray-500 text-xs md:text-sm hidden sm:inline">
              to
            </span>
            <DateInput
              className="w-full sm:w-36 md:w-40 text-xs md:text-sm"
              placeholder="To date"
              value={filters.dateAddedTo || ""}
              onChange={(e) =>
                onFiltersChange({ dateAddedTo: e.target.value || undefined })
              }
            />
            {hasDateFilter && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearDateFilter}
                className="h-8 w-8 p-0"
                title="Clear date filter"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
