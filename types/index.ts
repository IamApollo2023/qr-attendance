// Shared type definitions used across the application

// User and Authentication Types
export type UserRole = "scanner" | "admin" | "finance";

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

// Attendance Types
export interface AttendanceRecord {
  id?: string;
  attendee_id: string;
  scanned_at: string;
  event_id?: string;
  scanned_by?: string;
  member_id?: string; // Foreign key to members table
  member?: {
    first_name: string;
    last_name: string;
    age_category: string;
    gender: "male" | "female";
  }; // Joined member data
}

// Member Types
export type MembershipType = "WSAM-LGAM" | "LGAM" | "WSAM" | "Attendee";

export type ClassificationType = "MEMBER" | "WORKER" | "PASTOR";

export interface Member {
  id: string;
  member_id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  // Deprecated freeform address, kept for backward compatibility
  address?: string;
  province_code?: string;
  province_name?: string;
  city_municipality_code?: string;
  city_municipality_name?: string;
  barangay_code?: string;
  barangay_name?: string;
  birthday: string; // ISO date string
  gender: "male" | "female";
  age_category: "Children" | "KKB" | "YAN" | "Men" | "Women";
  membership_type: MembershipType;
  classification?: ClassificationType;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

// Activity Types
export type ActivityStatus = "active" | "inactive";

export type ActivityType =
  | "life-group"
  | "icare"
  | "water-baptism"
  | "house-blessings"
  | "necros-services"
  | "non-jil-related";

export interface Activity {
  id: string;
  name: string;
  description?: string;
  date?: string; // ISO date string (YYYY-MM-DD)
  location?: string;
  status: ActivityStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface ActivityAlbum {
  id: string;
  activity_type: ActivityType;
  caption: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  images?: ActivityAlbumImage[];
}

export interface ActivityAlbumImage {
  id: string;
  album_id: string;
  image_url: string;
  image_order: number;
  created_at: string;
}

// Event Types
export interface Event {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EventStats {
  total: number;
  today: number;
  unique: number;
}

// Login Types
export interface LoginResult {
  success: boolean;
  error?: string;
}
