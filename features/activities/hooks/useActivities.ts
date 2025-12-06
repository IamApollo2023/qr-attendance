import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib";
import { activityRepository } from "@/lib/repositories/activityRepository";
import type { Activity } from "@/types";
import type { PaginationInfo } from "../types/activity.types";

interface UseActivitiesProps {
  initialActivities: Activity[];
  initialPagination: PaginationInfo | null;
  onError?: (error: string) => void;
}

/**
 * Hook for managing activities data fetching, pagination, and real-time updates
 */
export function useActivities({
  initialActivities,
  initialPagination,
  onError,
}: UseActivitiesProps) {
  const searchParams = useSearchParams();
  const currentPageFromUrl = parseInt(searchParams.get("page") || "1", 10);

  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [pagination, setPagination] = useState<PaginationInfo | null>(
    initialPagination
  );
  const [loading, setLoading] = useState(false);
  const isInitialMount = useRef(true);

  const loadActivities = useCallback(
    async (page: number = 1) => {
      setLoading(true);
      try {
        const result = await activityRepository.getPaginated({ page });
        setActivities(result.activities);
        setPagination(result.pagination);
      } catch (error) {
        console.error("Failed to load activities:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Failed to load activities";
        onError?.(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [onError]
  );

  // Sync state with URL params - only fetch if URL changed (not on initial mount)
  useEffect(() => {
    // Skip on initial mount - use server-provided initialData
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const pageFromUrl = parseInt(searchParams.get("page") || "1", 10);
    if (pageFromUrl !== (pagination?.page || 1)) {
      loadActivities(pageFromUrl);
    }
  }, [searchParams]);

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("activities_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "activities",
        },
        async () => {
          // Refetch current page when activities change
          const currentPage = pagination?.page || currentPageFromUrl;
          await loadActivities(currentPage);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pagination?.page, currentPageFromUrl, loadActivities]);

  return {
    activities,
    pagination,
    loading,
    loadActivities,
  };
}
