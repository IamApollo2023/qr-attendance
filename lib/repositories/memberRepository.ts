import { supabase } from "../supabase";
import type { Member } from "@/types";
import type { CreateMemberInput } from "../members";
import type { PaginationInfo } from "@/features/members/types/member.types";

const PAGE_SIZE = 20;

export interface GetPaginatedMembersParams {
  page: number;
}

export interface GetPaginatedMembersResult {
  members: Member[];
  pagination: PaginationInfo;
}

/**
 * Repository layer for member data access
 * Abstracts Supabase queries from business logic
 */
export const memberRepository = {
  /**
   * Get paginated members from database
   */
  async getPaginated(
    params: GetPaginatedMembersParams
  ): Promise<GetPaginatedMembersResult> {
    const { page } = params;
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, error, count } = await supabase
      .from("members")
      .select(
        `
        id,
        member_id,
        first_name,
        middle_name,
        last_name,
        address,
        birthday,
        gender,
        membership_type,
        age_category,
        created_at,
        updated_at
      `,
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      throw error;
    }

    const totalPages = Math.ceil((count || 0) / PAGE_SIZE);
    const pagination: PaginationInfo = {
      page,
      pageSize: PAGE_SIZE,
      total: count || 0,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };

    return {
      members: (data || []) as Member[],
      pagination,
    };
  },

  /**
   * Get all members (for export/filtering)
   */
  async getAll(): Promise<Member[]> {
    const { data, error } = await supabase
      .from("members")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return (data || []) as Member[];
  },
};
