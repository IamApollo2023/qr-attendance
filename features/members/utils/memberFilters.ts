import type { Member } from "@/types";
import type { MemberFilters } from "../types/member.types";

/**
 * Filter members based on search term, gender, and age category
 */
export function filterMembers(
  members: Member[],
  filters: MemberFilters
): Member[] {
  return members.filter((member) => {
    const searchTarget = `${member.first_name} ${member.last_name} ${member.member_id} ${member.address}`.toLowerCase();
    const matchesSearch = searchTarget.includes(
      filters.searchTerm.toLowerCase()
    );
    const matchesGender =
      filters.gender === "all" || member.gender === filters.gender;
    const matchesAge =
      filters.ageCategory === "all" ||
      member.age_category === filters.ageCategory;

    return matchesSearch && matchesGender && matchesAge;
  });
}









