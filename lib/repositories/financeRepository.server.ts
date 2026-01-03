import { createClient } from "../supabase-server";

export interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface GetTithesDataResult {
  error: null;
  tithes: any[];
  pagination: PaginationInfo;
}

export interface GetTithesDataError {
  error: string;
  tithes: [];
  pagination: null;
}

export interface GetOfferingsDataResult {
  error: null;
  offerings: any[];
  pagination: PaginationInfo;
}

export interface GetOfferingsDataError {
  error: string;
  offerings: [];
  pagination: null;
}

export interface GetPledgesDataResult {
  error: null;
  pledges: any[];
  pagination: PaginationInfo;
}

export interface GetPledgesDataError {
  error: string;
  pledges: [];
  pagination: null;
}

/**
 * Server-side repository for finance data operations
 * Handles authentication, authorization, and data fetching
 */
export const financeRepositoryServer = {
  /**
   * Get paginated tithes data with authentication check
   */
  async getTithesData(
    page: number = 1,
    pageSize: number = 20
  ): Promise<GetTithesDataResult | GetTithesDataError> {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "Unauthorized", tithes: [], pagination: null };
    }

    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (
      profileError ||
      !profile ||
      (profile.role !== "admin" && profile.role !== "finance")
    ) {
      return { error: "Forbidden", tithes: [], pagination: null };
    }

    try {
      const data = await this.fetchTithesData(page, pageSize);
      return { error: null, ...data };
    } catch (error) {
      console.error("Error fetching tithes:", error);
      return { error: "Failed to fetch", tithes: [], pagination: null };
    }
  },

  /**
   * Get paginated offerings data with authentication check
   */
  async getOfferingsData(
    page: number = 1,
    pageSize: number = 20
  ): Promise<GetOfferingsDataResult | GetOfferingsDataError> {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "Unauthorized", offerings: [], pagination: null };
    }

    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (
      profileError ||
      !profile ||
      (profile.role !== "admin" && profile.role !== "finance")
    ) {
      return { error: "Forbidden", offerings: [], pagination: null };
    }

    try {
      const data = await this.fetchOfferingsData(page, pageSize);
      return { error: null, ...data };
    } catch (error) {
      console.error("Error fetching offerings:", error);
      return { error: "Failed to fetch", offerings: [], pagination: null };
    }
  },

  /**
   * Get paginated pledges data with authentication check
   */
  async getPledgesData(
    page: number = 1,
    pageSize: number = 20
  ): Promise<GetPledgesDataResult | GetPledgesDataError> {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "Unauthorized", pledges: [], pagination: null };
    }

    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (
      profileError ||
      !profile ||
      (profile.role !== "admin" && profile.role !== "finance")
    ) {
      return { error: "Forbidden", pledges: [], pagination: null };
    }

    try {
      const data = await this.fetchPledgesData(page, pageSize);
      return { error: null, ...data };
    } catch (error) {
      console.error("Error fetching pledges:", error);
      return { error: "Failed to fetch", pledges: [], pagination: null };
    }
  },

  /**
   * Internal helper to fetch tithes data from Supabase
   */
  async fetchTithesData(
    page: number,
    pageSize: number
  ): Promise<{ tithes: any[]; pagination: PaginationInfo }> {
    const supabase = await createClient();
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from("tithes")
      .select(
        `
      *,
      member:members(id, first_name, last_name, member_id)
    `,
        { count: "exact" }
      )
      .order("date", { ascending: false })
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
      tithes: data || [],
      pagination,
    };
  },

  /**
   * Internal helper to fetch offerings data from Supabase
   */
  async fetchOfferingsData(
    page: number,
    pageSize: number
  ): Promise<{ offerings: any[]; pagination: PaginationInfo }> {
    const supabase = await createClient();
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from("offerings")
      .select(
        `
      *,
      member:members(id, first_name, last_name, member_id)
    `,
        { count: "exact" }
      )
      .order("date", { ascending: false })
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
      offerings: data || [],
      pagination,
    };
  },

  /**
   * Internal helper to fetch pledges data from Supabase
   */
  async fetchPledgesData(
    page: number,
    pageSize: number
  ): Promise<{ pledges: any[]; pagination: PaginationInfo }> {
    const supabase = await createClient();
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from("pledges")
      .select(
        `
      *,
      member:members(id, first_name, last_name, member_id)
    `,
        { count: "exact" }
      )
      .order("date", { ascending: false })
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
      pledges: data || [],
      pagination,
    };
  },
};
