// Library Barrel Exports

// Supabase Clients
// Note: createClient is server-only and should be imported directly from "./supabase-server"
// in server components, not through this barrel export
export { supabase } from "./supabase";

// Auth Utilities
export {
  getCurrentUserProfile,
  hasRole,
  signIn,
  signOut,
  getSession,
  validateRole,
  type UserRole,
  type UserProfile,
} from "./auth";

// Login Utilities
export { handleLogin, type LoginResult } from "./login-utils";

// Member Utilities
export {
  getNextMemberId,
  createMember,
  getMemberById,
  getMemberByMemberId,
  getAllMembers,
  updateMember,
  deleteMember,
  bulkImportMembers,
  type Member,
  type CreateMemberInput,
} from "./members";

// Activity Utilities
export {
  createActivity,
  getActivityById,
  getAllActivities,
  updateActivity,
  deleteActivity,
  type Activity,
  type CreateActivityInput,
} from "./activities";

// Type Exports (re-export from centralized types)
// Note: UserRole, UserProfile, Member, and LoginResult are already exported
// through their respective modules above. Only AttendanceRecord is exported here.
export type { AttendanceRecord } from "@/types";
