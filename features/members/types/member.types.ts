import type { Member, MembershipType } from "@/types";

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
}

export type SortKey =
  | "member_id"
  | "name"
  | "address"
  | "birthday"
  | "age_category"
  | "created_at"
  | "updated_at";

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
}

export interface MembersManagementProps {
  initialData: {
    members: Member[];
    pagination: PaginationInfo | null;
  };
}
