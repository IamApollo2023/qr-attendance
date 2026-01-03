import { supabase } from "../supabase";

export interface ScanResult {
  success: boolean;
  message: string;
  memberName?: string;
}

/**
 * Service for processing QR code scans
 * Single responsibility: Validate and record attendance scans
 */
export const scanProcessingService = {
  /**
   * Process a scanned QR code and record attendance
   */
  async processScan(
    attendeeId: string,
    eventId: string
  ): Promise<ScanResult> {
    try {
      // FIRST: Validate that member exists in members table (STRICT VALIDATION)
      const { data: member, error: memberError } = await supabase
        .from("members")
        .select("*")
        .eq("member_id", attendeeId)
        .single();

      if (memberError || !member) {
        // Member not registered - REJECT scan
        return {
          success: false,
          message: "Member not registered",
        };
      }

      // SECOND: Check if already scanned in this event (prevent duplicates)
      const { data: existingScan, error: checkError } = await supabase
        .from("qr_attendance")
        .select("id")
        .eq("attendee_id", attendeeId)
        .eq("event_id", eventId)
        .maybeSingle();

      if (checkError && checkError.code !== "PGRST116") {
        // PGRST116 is "not found" which is expected for new scans
        console.error("Error checking existing scan:", checkError);
        return {
          success: false,
          message: "Error checking attendance",
        };
      }

      if (existingScan) {
        // Already scanned - return success but with duplicate message
        return {
          success: true,
          message: "Already scanned",
          memberName: `${member.first_name} ${member.last_name}`,
        };
      }

      // THIRD: Insert attendance record
      const { error: insertError } = await supabase
        .from("qr_attendance")
        .insert({
          attendee_id: attendeeId,
          event_id: eventId,
          scanned_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error("Error inserting attendance:", insertError);
        return {
          success: false,
          message: "Failed to record attendance",
        };
      }

      // Success
      return {
        success: true,
        message: "Attendance recorded",
        memberName: `${member.first_name} ${member.last_name}`,
      };
    } catch (error: any) {
      console.error("Unexpected error processing scan:", error);
      return {
        success: false,
        message: error?.message || "Unexpected error",
      };
    }
  },
};
