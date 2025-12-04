import { useMemo } from "react";
import type { Member } from "@/types";
import type { MemberFilters } from "../types/member.types";

interface UseMemberFiltersProps {
  members: Member[];
  filters: MemberFilters;
}

/**
 * Hook for filtering members based on search term, gender, and age category
 */
export function useMemberFilters({ members, filters }: UseMemberFiltersProps) {
  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const searchTarget =
        `${member.first_name} ${member.last_name} ${member.member_id} ${member.address}`.toLowerCase();
      const matchesSearch = searchTarget.includes(
        filters.searchTerm.toLowerCase()
      );
      const matchesGender =
        filters.gender === "all" || member.gender === filters.gender;
      const matchesAge =
        filters.ageCategory === "all" ||
        member.age_category === filters.ageCategory;
      const matchesMembershipType =
        filters.membershipType === "all" ||
        member.membership_type === filters.membershipType;

      return (
        matchesSearch && matchesGender && matchesAge && matchesMembershipType
      );
    });
  }, [members, filters]);

  return {
    filteredMembers,
  };
}
