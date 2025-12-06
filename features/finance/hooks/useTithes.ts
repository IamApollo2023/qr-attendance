import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib";
import { financeRepository } from "@/lib/repositories/financeRepository";
import type { Tithe } from "../types/finance.types";
import type { PaginationInfo } from "../types/finance.types";

interface UseTithesProps {
  initialTithes: Tithe[];
  initialPagination: PaginationInfo | null;
  onError?: (error: string) => void;
}

/**
 * Hook for managing tithes data fetching, pagination, and real-time updates
 */
export function useTithes({
  initialTithes,
  initialPagination,
  onError,
}: UseTithesProps) {
  const searchParams = useSearchParams();
  const currentPageFromUrl = parseInt(searchParams.get("page") || "1", 10);
  const currentPageSizeFromUrl = parseInt(
    searchParams.get("pageSize") || "20",
    10
  );
  const searchTerm = searchParams.get("search") || "";
  const startDate = searchParams.get("startDate") || undefined;
  const endDate = searchParams.get("endDate") || undefined;

  const [tithes, setTithes] = useState<Tithe[]>(initialTithes);
  const [pagination, setPagination] = useState<PaginationInfo | null>(
    initialPagination
  );
  const [loading, setLoading] = useState(false);
  const isInitialMount = useRef(true);

  const loadTithes = useCallback(
    async (
      page: number = 1,
      pageSize: number = 20,
      search?: string,
      start?: string,
      end?: string
    ) => {
      setLoading(true);
      try {
        const result = await financeRepository.getPaginatedTithes({
          page,
          pageSize,
          searchTerm: search,
          startDate: start,
          endDate: end,
        });
        setTithes(result.tithes);
        setPagination(result.pagination);
      } catch (error) {
        console.error("Failed to load tithes:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Failed to load tithes";
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
    const pageSizeFromUrl = parseInt(searchParams.get("pageSize") || "20", 10);
    const searchFromUrl = searchParams.get("search") || "";
    const startDateFromUrl = searchParams.get("startDate") || undefined;
    const endDateFromUrl = searchParams.get("endDate") || undefined;
    const currentPage = pagination?.page || 1;
    const currentPageSize = pagination?.pageSize || 20;

    if (
      pageFromUrl !== currentPage ||
      pageSizeFromUrl !== currentPageSize ||
      searchFromUrl !== searchTerm ||
      startDateFromUrl !== startDate ||
      endDateFromUrl !== endDate
    ) {
      loadTithes(
        pageFromUrl,
        pageSizeFromUrl,
        searchFromUrl,
        startDateFromUrl,
        endDateFromUrl
      );
    }
  }, [searchParams]);

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("tithes_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tithes",
        },
        async () => {
          // Refetch current page when tithes change
          const currentPage = pagination?.page || currentPageFromUrl;
          const currentPageSize =
            pagination?.pageSize || currentPageSizeFromUrl;
          await loadTithes(
            currentPage,
            currentPageSize,
            searchTerm,
            startDate,
            endDate
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [
    pagination?.page,
    pagination?.pageSize,
    currentPageFromUrl,
    currentPageSizeFromUrl,
    searchTerm,
    startDate,
    endDate,
    loadTithes,
  ]);

  return {
    tithes,
    pagination,
    loading,
    loadTithes,
  };
}
