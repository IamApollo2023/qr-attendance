import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib";

/**
 * Hook for fetching available dates from members table
 * Single responsibility: Fetch distinct dates where members were added
 */
export function useAvailableDates() {
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAvailableDates = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch distinct dates from created_at column
      const { data, error } = await supabase
        .from("members")
        .select("created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Extract unique dates (YYYY-MM-DD format)
      const uniqueDates = new Set<string>();
      (data || []).forEach((member) => {
        if (member.created_at) {
          const date = new Date(member.created_at);
          const dateStr = date.toISOString().split("T")[0]; // YYYY-MM-DD
          uniqueDates.add(dateStr);
        }
      });

      // Sort dates in descending order (newest first)
      const sortedDates = Array.from(uniqueDates).sort((a, b) => {
        return new Date(b).getTime() - new Date(a).getTime();
      });

      setAvailableDates(sortedDates);
    } catch (error) {
      console.error("Failed to fetch available dates:", error);
      setAvailableDates([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAvailableDates();
  }, [fetchAvailableDates]);

  return {
    availableDates,
    isLoading,
    refetch: fetchAvailableDates,
  };
}
