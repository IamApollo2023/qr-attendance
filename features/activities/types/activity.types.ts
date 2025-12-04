import type { Activity, ActivityStatus } from "@/types";

export interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ActivityFilters {
  searchTerm: string;
  status: "all" | ActivityStatus;
}

export type SortKey =
  | "name"
  | "date"
  | "location"
  | "status"
  | "created_at"
  | "updated_at";

export interface SortConfig {
  key: SortKey;
  direction: "asc" | "desc";
}

export interface ActivityFormData {
  name: string;
  description: string;
  date: string; // YYYY-MM-DD format
  location: string;
  status: ActivityStatus;
  notes: string;
}

export interface ActivitiesManagementProps {
  initialData: {
    activities: Activity[];
    pagination: PaginationInfo | null;
  };
}


