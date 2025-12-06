import { supabase } from "../supabase";
import type { Activity } from "@/types";
import type { PaginationInfo } from "@/features/activities/types/activity.types";

const PAGE_SIZE = 20;

export interface GetPaginatedActivitiesParams {
  page: number;
}

export interface GetPaginatedActivitiesResult {
  activities: Activity[];
  pagination: PaginationInfo;
}

/**
 * Repository layer for activity data access
 * Abstracts Supabase queries from business logic
 */
export const activityRepository = {
  /**
   * Get paginated activities from database
   */
  async getPaginated(
    params: GetPaginatedActivitiesParams
  ): Promise<GetPaginatedActivitiesResult> {
    const { page } = params;
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

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
      activities: (data || []) as Activity[],
      pagination,
    };
  },

  /**
   * Get all activities (for export/filtering)
   */
  async getAll(): Promise<Activity[]> {
    const { data, error } = await supabase
      .from("activities")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return (data || []) as Activity[];
  },
};
