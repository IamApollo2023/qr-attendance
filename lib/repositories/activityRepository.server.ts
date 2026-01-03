import { createClient } from "../supabase-server";
import type { Activity } from "@/types";

export interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface GetActivitiesDataResult {
  error: null;
  activities: Activity[];
  pagination: PaginationInfo;
}

export interface GetActivitiesDataError {
  error: string;
  activities: [];
  pagination: null;
}

/**
 * Server-side repository for activity data operations
 * Handles authentication, authorization, and data fetching
 */
export const activityRepositoryServer = {
  /**
   * Get paginated activities data with authentication check
   */
  async getActivitiesData(
    page: number = 1,
    pageSize: number = 20
  ): Promise<GetActivitiesDataResult | GetActivitiesDataError> {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "Unauthorized", activities: [], pagination: null };
    }

    // Check if user has admin role
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || profile.role !== "admin") {
      return { error: "Forbidden", activities: [], pagination: null };
    }

    try {
      const data = await this.fetchActivitiesData(page, pageSize);
      return { error: null, ...data };
    } catch (error) {
      console.error("Error fetching activities:", error);
      return { error: "Failed to fetch", activities: [], pagination: null };
    }
  },

  /**
   * Internal helper to fetch activities data from Supabase
   */
  async fetchActivitiesData(
    page: number,
    pageSize: number
  ): Promise<{ activities: Activity[]; pagination: PaginationInfo }> {
    const supabase = await createClient();
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from("activities")
      .select(
        `
      id,
      name,
      description,
      date,
      location,
      status,
      notes,
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

    const totalPages = Math.ceil((count || 0) / pageSize);
    const pagination = {
      page,
      pageSize,
      total: count || 0,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };

    return {
      activities: (data || []) as Activity[],
      pagination,
    };
  },
};
