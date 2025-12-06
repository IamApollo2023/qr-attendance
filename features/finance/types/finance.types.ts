export interface Tithe {
  id: string;
  member_id: string | null;
  amount: number;
  date: string; // ISO date string (YYYY-MM-DD)
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  member?: {
    first_name: string;
    last_name: string;
    member_id: string;
  };
}

export interface Offering {
  id: string;
  member_id: string | null;
  amount: number;
  date: string; // ISO date string (YYYY-MM-DD)
  offering_type: "general" | "building" | "mission";
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  member?: {
    first_name: string;
    last_name: string;
    member_id: string;
  };
}

export interface CreateTitheInput {
  member_id?: string | null;
  amount: number;
  date: string;
  notes?: string | null;
}

export interface UpdateTitheInput {
  member_id?: string | null;
  amount?: number;
  date?: string;
  notes?: string | null;
}

export interface CreateOfferingInput {
  member_id?: string | null;
  amount: number;
  date: string;
  offering_type: "general" | "building" | "mission";
  notes?: string | null;
}

export interface UpdateOfferingInput {
  member_id?: string | null;
  amount?: number;
  date?: string;
  offering_type?: "general" | "building" | "mission";
  notes?: string | null;
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface GetPaginatedTithesParams {
  page: number;
  pageSize?: number;
  searchTerm?: string;
  startDate?: string;
  endDate?: string;
}

export interface GetPaginatedTithesResult {
  tithes: Tithe[];
  pagination: PaginationInfo;
}

export interface GetPaginatedOfferingsParams {
  page: number;
  pageSize?: number;
  searchTerm?: string;
  offeringType?: "all" | "general" | "building" | "mission";
  startDate?: string;
  endDate?: string;
}

export interface GetPaginatedOfferingsResult {
  offerings: Offering[];
  pagination: PaginationInfo;
}

export interface Pledge {
  id: string;
  member_id: string | null;
  amount: number;
  date: string; // ISO date string (YYYY-MM-DD)
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  member?: {
    first_name: string;
    last_name: string;
    member_id: string;
  };
}

export interface CreatePledgeInput {
  member_id?: string | null;
  amount: number;
  date: string;
  notes?: string | null;
}

export interface UpdatePledgeInput {
  member_id?: string | null;
  amount?: number;
  date?: string;
  notes?: string | null;
}

export interface GetPaginatedPledgesParams {
  page: number;
  pageSize?: number;
  searchTerm?: string;
  startDate?: string;
  endDate?: string;
}

export interface GetPaginatedPledgesResult {
  pledges: Pledge[];
  pagination: PaginationInfo;
}
