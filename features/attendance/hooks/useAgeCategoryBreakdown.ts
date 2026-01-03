import { useState, useCallback } from "react";
import { supabase } from "@/lib";

/**
 * Hook for fetching age category breakdown from attendance records
 * Single responsibility: Fetch and manage age category statistics
 */
export function useAgeCategoryBreakdown() {
  const [ageCategoryBreakdown, setAgeCategoryBreakdown] = useState<
    Record<string, number>
  >({
    Men: 0,
    Women: 0,
    YAN: 0,
    KKB: 0,
    Children: 0,
    Unknown: 0,
  });

  const fetchAgeCategoryBreakdown = useCallback(async (eventId: string) => {
    try {
      const { data, error } = await supabase
        .from("qr_attendance")
        .select(
          `
          member:members (
            age_category
          )
        `
        )
        .eq("event_id", eventId);

      if (error) {
        console.error("Failed to fetch age category breakdown:", error);
        return;
      }

      const counts: Record<string, number> = {
        Men: 0,
        Women: 0,
        YAN: 0,
        KKB: 0,
        Children: 0,
        Unknown: 0,
      };

      (data || []).forEach((row: any) => {
        const member = Array.isArray(row.member) ? row.member[0] : row.member;
        const age = member?.age_category ?? "Unknown";
        if (counts[age] !== undefined) {
          counts[age] += 1;
        } else {
          counts.Unknown += 1;
        }
      });

      setAgeCategoryBreakdown(counts);
    } catch (err) {
      console.error("Error calculating age category breakdown:", err);
    }
  }, []);

  return {
    ageCategoryBreakdown,
    fetchAgeCategoryBreakdown,
  };
}
