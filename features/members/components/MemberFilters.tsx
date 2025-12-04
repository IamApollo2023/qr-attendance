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
    <div className="bg-white rounded-xl px-4 py-3 shadow-lg border border-gray-200 flex-shrink-0">
      <div className="flex flex-col md:flex-row md:flex-nowrap items-center gap-3">
        <SearchInput
          wrapperClassName="w-full md:w-64 lg:w-72"
          placeholder="Search members..."
          value={searchInput}
          onChange={(e) => onSearchInputChange(e.target.value)}
        />
        <div className="flex flex-wrap gap-2 w-full md:w-auto md:ml-4 md:justify-end">
          <FilterSelect
            value={filters.gender}
            onChange={(e) =>
              onFiltersChange({
                gender: e.target.value as "all" | "male" | "female",
              })
            }
            options={[
              { value: "all", label: "All Genders" },
              { value: "male", label: "Male" },
              { value: "female", label: "Female" },
            ]}
          />
          <FilterSelect
            value={filters.ageCategory}
            onChange={(e) =>
              onFiltersChange({
                ageCategory: e.target.value as
                  | "all"
                  | "Children"
                  | "KKB"
                  | "YAN"
                  | "Men"
                  | "Women",
              })
            }
            options={[
              { value: "all", label: "All Age Groups" },
              { value: "Children", label: "Children" },
              { value: "KKB", label: "KKB" },
              { value: "YAN", label: "YAN" },
              { value: "Men", label: "Men" },
              { value: "Women", label: "Women" },
            ]}
          />
          <FilterSelect
            value={filters.membershipType}
            onChange={(e) =>
              onFiltersChange({
                membershipType: e.target
                  .value as MemberFiltersType["membershipType"],
              })
            }
            options={[
              { value: "all", label: "All Membership Types" },
              { value: "MEMBER", label: "MEMBER" },
              { value: "WORKER", label: "WORKER" },
              { value: "PASTOR", label: "PASTOR" },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
