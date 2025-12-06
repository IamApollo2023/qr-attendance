import { supabase } from "../supabase";
import type {
  Tithe,
  Offering,
  Pledge,
  CreateTitheInput,
  UpdateTitheInput,
  CreateOfferingInput,
  UpdateOfferingInput,
  CreatePledgeInput,
  UpdatePledgeInput,
  GetPaginatedTithesParams,
  GetPaginatedTithesResult,
  GetPaginatedOfferingsParams,
  GetPaginatedOfferingsResult,
  GetPaginatedPledgesParams,
  GetPaginatedPledgesResult,
} from "@/features/finance/types/finance.types";

const DEFAULT_PAGE_SIZE = 20;

/**
 * Repository layer for financial data access
 * Abstracts Supabase queries from business logic
 */
export const financeRepository = {
  /**
   * Get paginated tithes from database
   */
  async getPaginatedTithes(
    params: GetPaginatedTithesParams
  ): Promise<GetPaginatedTithesResult> {
    const {
      page,
      pageSize = DEFAULT_PAGE_SIZE,
      searchTerm,
      startDate,
      endDate,
    } = params;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
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

    // Apply filters
    if (searchTerm) {
      query = query.or(
        `notes.ilike.%${searchTerm}%,member_id.ilike.%${searchTerm}%`
      );
    }

    if (startDate) {
      query = query.gte("date", startDate);
    }

    if (endDate) {
      query = query.lte("date", endDate);
    }

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch tithes: ${error.message}`);
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / pageSize);

    return {
      tithes: (data as Tithe[]) || [],
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  },

  /**
   * Get a single tithe by ID
   */
  async getTitheById(id: string): Promise<Tithe | null> {
    const { data, error } = await supabase
      .from("tithes")
      .select(
        `
        *,
        member:members(id, first_name, last_name, member_id)
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(`Failed to fetch tithe: ${error.message}`);
    }

    return data as Tithe;
  },

  /**
   * Create a new tithe
   */
  async createTithe(input: CreateTitheInput): Promise<Tithe> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("tithes")
      .insert({
        ...input,
        created_by: user?.id || null,
      })
      .select(
        `
        *,
        member:members(id, first_name, last_name, member_id)
      `
      )
      .single();

    if (error) {
      throw new Error(`Failed to create tithe: ${error.message}`);
    }

    return data as Tithe;
  },

  /**
   * Update an existing tithe
   */
  async updateTithe(id: string, input: UpdateTitheInput): Promise<Tithe> {
    const { data, error } = await supabase
      .from("tithes")
      .update(input)
      .eq("id", id)
      .select(
        `
        *,
        member:members(id, first_name, last_name, member_id)
      `
      )
      .single();

    if (error) {
      throw new Error(`Failed to update tithe: ${error.message}`);
    }

    return data as Tithe;
  },

  /**
   * Delete a tithe
   */
  async deleteTithe(id: string): Promise<void> {
    const { error } = await supabase.from("tithes").delete().eq("id", id);

    if (error) {
      throw new Error(`Failed to delete tithe: ${error.message}`);
    }
  },

  /**
   * Get paginated offerings from database
   */
  async getPaginatedOfferings(
    params: GetPaginatedOfferingsParams
  ): Promise<GetPaginatedOfferingsResult> {
    const {
      page,
      pageSize = DEFAULT_PAGE_SIZE,
      searchTerm,
      offeringType,
      startDate,
      endDate,
    } = params;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
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

    // Apply filters
    if (searchTerm) {
      query = query.or(
        `notes.ilike.%${searchTerm}%,member_id.ilike.%${searchTerm}%`
      );
    }

    if (offeringType && offeringType !== "all") {
      query = query.eq("offering_type", offeringType);
    }

    if (startDate) {
      query = query.gte("date", startDate);
    }

    if (endDate) {
      query = query.lte("date", endDate);
    }

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch offerings: ${error.message}`);
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / pageSize);

    return {
      offerings: (data as Offering[]) || [],
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  },

  /**
   * Get a single offering by ID
   */
  async getOfferingById(id: string): Promise<Offering | null> {
    const { data, error } = await supabase
      .from("offerings")
      .select(
        `
        *,
        member:members(id, first_name, last_name, member_id)
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(`Failed to fetch offering: ${error.message}`);
    }

    return data as Offering;
  },

  /**
   * Create a new offering
   */
  async createOffering(input: CreateOfferingInput): Promise<Offering> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("offerings")
      .insert({
        ...input,
        created_by: user?.id || null,
      })
      .select(
        `
        *,
        member:members(id, first_name, last_name, member_id)
      `
      )
      .single();

    if (error) {
      throw new Error(`Failed to create offering: ${error.message}`);
    }

    return data as Offering;
  },

  /**
   * Update an existing offering
   */
  async updateOffering(
    id: string,
    input: UpdateOfferingInput
  ): Promise<Offering> {
    const { data, error } = await supabase
      .from("offerings")
      .update(input)
      .eq("id", id)
      .select(
        `
        *,
        member:members(id, first_name, last_name, member_id)
      `
      )
      .single();

    if (error) {
      throw new Error(`Failed to update offering: ${error.message}`);
    }

    return data as Offering;
  },

  /**
   * Delete an offering
   */
  async deleteOffering(id: string): Promise<void> {
    const { error } = await supabase.from("offerings").delete().eq("id", id);

    if (error) {
      throw new Error(`Failed to delete offering: ${error.message}`);
    }
  },

  /**
   * Get paginated pledges from database
   */
  async getPaginatedPledges(
    params: GetPaginatedPledgesParams
  ): Promise<GetPaginatedPledgesResult> {
    const {
      page,
      pageSize = DEFAULT_PAGE_SIZE,
      searchTerm,
      startDate,
      endDate,
    } = params;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
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

    // Apply filters
    if (searchTerm) {
      query = query.or(
        `notes.ilike.%${searchTerm}%,member_id.ilike.%${searchTerm}%`
      );
    }

    if (startDate) {
      query = query.gte("date", startDate);
    }

    if (endDate) {
      query = query.lte("date", endDate);
    }

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch pledges: ${error.message}`);
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / pageSize);

    return {
      pledges: (data as Pledge[]) || [],
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  },

  /**
   * Get a single pledge by ID
   */
  async getPledgeById(id: string): Promise<Pledge | null> {
    const { data, error } = await supabase
      .from("pledges")
      .select(
        `
        *,
        member:members(id, first_name, last_name, member_id)
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(`Failed to fetch pledge: ${error.message}`);
    }

    return data as Pledge;
  },

  /**
   * Create a new pledge
   */
  async createPledge(input: CreatePledgeInput): Promise<Pledge> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("pledges")
      .insert({
        ...input,
        created_by: user?.id || null,
      })
      .select(
        `
        *,
        member:members(id, first_name, last_name, member_id)
      `
      )
      .single();

    if (error) {
      throw new Error(`Failed to create pledge: ${error.message}`);
    }

    return data as Pledge;
  },

  /**
   * Update an existing pledge
   */
  async updatePledge(id: string, input: UpdatePledgeInput): Promise<Pledge> {
    const { data, error } = await supabase
      .from("pledges")
      .update(input)
      .eq("id", id)
      .select(
        `
        *,
        member:members(id, first_name, last_name, member_id)
      `
      )
      .single();

    if (error) {
      throw new Error(`Failed to update pledge: ${error.message}`);
    }

    return data as Pledge;
  },

  /**
   * Delete a pledge
   */
  async deletePledge(id: string): Promise<void> {
    const { error } = await supabase.from("pledges").delete().eq("id", id);

    if (error) {
      throw new Error(`Failed to delete pledge: ${error.message}`);
    }
  },
};
