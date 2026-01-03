import { supabase } from "../supabase";
import type { Member } from "@/types";
import type { CreateMemberInput } from "../members";
import type { PaginationInfo } from "@/features/members/types/member.types";

const DEFAULT_PAGE_SIZE = 20;

export interface GetPaginatedMembersParams {
  page: number;
  pageSize?: number;
  dateAddedFrom?: string; // ISO date string (YYYY-MM-DD)
  dateAddedTo?: string; // ISO date string (YYYY-MM-DD)
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
    const { page, pageSize = DEFAULT_PAGE_SIZE, dateAddedFrom, dateAddedTo } =
      params;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from("members")
      .select(
        `
        id,
        member_id,
        first_name,
        middle_name,
        last_name,
        barangay_name,
        city_municipality_name,
        gender,
        membership_type,
        classification,
        age_category,
        created_at,
        updated_at
      `,
        { count: "exact" }
      );

    // Apply date range filters
    if (dateAddedFrom) {
      const fromDate = new Date(dateAddedFrom);
      fromDate.setHours(0, 0, 0, 0);
      query = query.gte("created_at", fromDate.toISOString());
    }
    if (dateAddedTo) {
      const toDate = new Date(dateAddedTo);
      toDate.setHours(23, 59, 59, 999);
      query = query.lte("created_at", toDate.toISOString());
    }

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      throw error;
    }

    const totalPages = Math.ceil((count || 0) / pageSize);
    const pagination: PaginationInfo = {
      page,
      pageSize,
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
   * Supports optional date range filtering
   */
  async getAll(params?: {
    dateAddedFrom?: string;
    dateAddedTo?: string;
  }): Promise<Member[]> {
    const { dateAddedFrom, dateAddedTo } = params || {};

    let query = supabase.from("members").select("*");

    // Apply date range filters
    if (dateAddedFrom) {
      const fromDate = new Date(dateAddedFrom);
      fromDate.setHours(0, 0, 0, 0);
      query = query.gte("created_at", fromDate.toISOString());
    }
    if (dateAddedTo) {
      const toDate = new Date(dateAddedTo);
      toDate.setHours(23, 59, 59, 999);
      query = query.lte("created_at", toDate.toISOString());
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      throw error;
    }

    return (data || []) as Member[];
  },
};
