import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib";
import { memberRepository } from "@/lib/repositories/memberRepository";
import type { Member } from "@/types";
import type { PaginationInfo } from "../types/member.types";

interface UseMembersProps {
  initialMembers: Member[];
  initialPagination: PaginationInfo | null;
  onError?: (error: string) => void;
  dateFilters?: {
    dateAddedFrom?: string;
    dateAddedTo?: string;
  };
}

/**
 * Hook for managing members data fetching, pagination, and real-time updates
 */
export function useMembers({
  initialMembers,
  initialPagination,
  onError,
  dateFilters,
}: UseMembersProps) {
  const searchParams = useSearchParams();

  // Memoize URL params to prevent unnecessary rerenders
  const currentPageFromUrl = useMemo(
    () => parseInt(searchParams.get("page") || "1", 10),
    [searchParams]
  );
  const currentPageSizeFromUrl = useMemo(
    () => parseInt(searchParams.get("pageSize") || "20", 10),
    [searchParams]
  );

  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [pagination, setPagination] = useState<PaginationInfo | null>(
    initialPagination
  );
  const [loading, setLoading] = useState(false);
  const isInitialMount = useRef(true);

  const loadMembers = useCallback(
    async (page: number = 1, pageSize: number = 20) => {
      setLoading(true);
      try {
        const result = await memberRepository.getPaginated({
          page,
          pageSize,
          dateAddedFrom: dateFilters?.dateAddedFrom,
          dateAddedTo: dateFilters?.dateAddedTo,
        });
        setMembers(result.members);
        setPagination(result.pagination);
      } catch (error) {
        console.error("Failed to load members:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Failed to load members";
        onError?.(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [onError, dateFilters]
  );

  // Sync state with URL params - only fetch if URL changed (not on initial mount)
  useEffect(() => {
    // Skip on initial mount - use server-provided initialData
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const currentPage = pagination?.page || 1;
    const currentPageSize = pagination?.pageSize || 20;

    if (currentPageFromUrl !== currentPage || currentPageSizeFromUrl !== currentPageSize) {
      loadMembers(currentPageFromUrl, currentPageSizeFromUrl);
    }
  }, [currentPageFromUrl, currentPageSizeFromUrl, pagination?.page, pagination?.pageSize, loadMembers]);

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("members_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "members",
        },
        async () => {
          // Refetch current page when members change
          const currentPage = pagination?.page || currentPageFromUrl;
          const currentPageSize =
            pagination?.pageSize || currentPageSizeFromUrl;
          await loadMembers(currentPage, currentPageSize);
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
    loadMembers,
  ]);

  return {
    members,
    pagination,
    loading,
    loadMembers,
  };
}
