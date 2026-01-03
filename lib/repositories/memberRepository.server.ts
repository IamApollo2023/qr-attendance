import { createClient } from "../supabase-server";
import type { Member } from "@/types";

export interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface GetMembersDataResult {
  error: null;
  members: Member[];
  pagination: PaginationInfo;
}

export interface GetMembersDataError {
  error: string;
  members: [];
  pagination: null;
}

/**
 * Server-side repository for member data operations
 * Handles authentication, authorization, and data fetching
 */
export const memberRepositoryServer = {
  /**
   * Get paginated members data with authentication check
   */
  async getMembersData(
    page: number = 1,
    pageSize: number = 20
  ): Promise<GetMembersDataResult | GetMembersDataError> {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "Unauthorized", members: [], pagination: null };
    }

    // Check if user has admin role
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || profile.role !== "admin") {
      return { error: "Forbidden", members: [], pagination: null };
    }

    try {
      const data = await this.fetchMembersData(page, pageSize);
      return { error: null, ...data };
    } catch (error) {
      console.error("Error fetching members:", error);
      return { error: "Failed to fetch", members: [], pagination: null };
    }
  },

  /**
   * Internal helper to fetch members data from Supabase
   */
  async fetchMembersData(
    page: number,
    pageSize: number
  ): Promise<{ members: Member[]; pagination: PaginationInfo }> {
    const supabase = await createClient();

    // Pagination: Calculate range
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Fetch paginated members with limited fields
    const {
      data: members,
      error,
      count,
    } = await supabase
      .from("members")
      .select(
        `
      id,
      member_id,
      first_name,
      last_name,
      barangay_name,
      city_municipality_name,
      gender,
      age_category
    `,
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      throw error;
    }

    const totalPages = Math.ceil((count || 0) / pageSize);

    return {
      members: (members || []) as Member[],
      pagination: {
        page,
        pageSize,
        total: count || 0,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  },
};
