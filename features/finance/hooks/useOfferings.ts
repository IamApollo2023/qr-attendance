import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib";
import { financeRepository } from "@/lib/repositories/financeRepository";
import type { Offering } from "../types/finance.types";
import type { PaginationInfo } from "../types/finance.types";

interface UseOfferingsProps {
  initialOfferings: Offering[];
  initialPagination: PaginationInfo | null;
  onError?: (error: string) => void;
}

/**
 * Hook for managing offerings data fetching, pagination, and real-time updates
 */
export function useOfferings({
  initialOfferings,
  initialPagination,
  onError,
}: UseOfferingsProps) {
  const searchParams = useSearchParams();
  const currentPageFromUrl = parseInt(searchParams.get("page") || "1", 10);
  const currentPageSizeFromUrl = parseInt(
    searchParams.get("pageSize") || "20",
    10
  );
  const searchTerm = searchParams.get("search") || "";
  const offeringType =
    (searchParams.get("offeringType") as
      | "all"
      | "general"
      | "building"
      | "mission") || "all";
  const startDate = searchParams.get("startDate") || undefined;
  const endDate = searchParams.get("endDate") || undefined;

  const [offerings, setOfferings] = useState<Offering[]>(initialOfferings);
  const [pagination, setPagination] = useState<PaginationInfo | null>(
    initialPagination
  );
  const [loading, setLoading] = useState(false);
  const isInitialMount = useRef(true);

  const loadOfferings = useCallback(
    async (
      page: number = 1,
      pageSize: number = 20,
      search?: string,
      type?: "all" | "general" | "building" | "mission",
      start?: string,
      end?: string
    ) => {
      setLoading(true);
      try {
        const result = await financeRepository.getPaginatedOfferings({
          page,
          pageSize,
          searchTerm: search,
          offeringType: type,
          startDate: start,
          endDate: end,
        });
        setOfferings(result.offerings);
        setPagination(result.pagination);
      } catch (error) {
        console.error("Failed to load offerings:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Failed to load offerings";
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
    const typeFromUrl =
      (searchParams.get("offeringType") as
        | "all"
        | "general"
        | "building"
        | "mission") || "all";
    const startDateFromUrl = searchParams.get("startDate") || undefined;
    const endDateFromUrl = searchParams.get("endDate") || undefined;
    const currentPage = pagination?.page || 1;
    const currentPageSize = pagination?.pageSize || 20;

    if (
      pageFromUrl !== currentPage ||
      pageSizeFromUrl !== currentPageSize ||
      searchFromUrl !== searchTerm ||
      typeFromUrl !== offeringType ||
      startDateFromUrl !== startDate ||
      endDateFromUrl !== endDate
    ) {
      loadOfferings(
        pageFromUrl,
        pageSizeFromUrl,
        searchFromUrl,
        typeFromUrl,
        startDateFromUrl,
        endDateFromUrl
      );
    }
  }, [searchParams]);

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("offerings_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "offerings",
        },
        async () => {
          // Refetch current page when offerings change
          const currentPage = pagination?.page || currentPageFromUrl;
          const currentPageSize =
            pagination?.pageSize || currentPageSizeFromUrl;
          await loadOfferings(
            currentPage,
            currentPageSize,
            searchTerm,
            offeringType,
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
    offeringType,
    startDate,
    endDate,
    loadOfferings,
  ]);

  return {
    offerings,
    pagination,
    loading,
    loadOfferings,
  };
}
