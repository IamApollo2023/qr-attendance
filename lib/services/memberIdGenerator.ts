import { supabase } from "../supabase";

/**
 * Service for generating member IDs
 * Single responsibility: Generate unique member IDs in JIL-LUNA-XXX format
 */
export const memberIdGenerator = {
  /**
   * Get next member ID in sequence (JIL-LUNA-001 format)
   */
  async getNextMemberId(): Promise<string> {
    const { data, error } = await supabase.rpc("get_next_member_id");

    if (error) {
      console.error("Error getting next member ID:", error);
      // Fallback: generate based on timestamp
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 1000);
      return `JIL-LUNA-${timestamp}-${random}`;
    }

    return data || `JIL-LUNA-${Date.now()}`;
  },
};
