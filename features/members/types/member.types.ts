import type { Member, MembershipType, ClassificationType } from "@/types";

export interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface MemberFilters {
  searchTerm: string;
  gender: "all" | "male" | "female";
  ageCategory: "all" | "Children" | "KKB" | "YAN" | "Men" | "Women";
  membershipType: "all" | MembershipType;
  classification?: "all" | ClassificationType;
  dateAddedFrom?: string; // ISO date string (YYYY-MM-DD)
  dateAddedTo?: string; // ISO date string (YYYY-MM-DD)
}

export type SortKey =
  | "member_id"
  | "first_name"
  | "last_name"
  | "address"
  | "age_category";

export interface SortConfig {
  key: SortKey;
  direction: "asc" | "desc";
}

export interface MemberFormData {
  first_name: string;
  middle_name: string;
  last_name: string;
  province_code: string;
  province_name: string;
  city_municipality_code: string;
  city_municipality_name: string;
  barangay_code: string;
  barangay_name: string;
  birthday: string;
  gender: "male" | "female";
  member_id: string;
  membership_type: MembershipType;
  classification?: ClassificationType;
}

export interface MembersManagementProps {
  initialData: {
    members: Member[];
    pagination: PaginationInfo | null;
  };
}
