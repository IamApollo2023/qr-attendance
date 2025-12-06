import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib";
import { memberRepository } from "@/lib/repositories/memberRepository";
import type { Member } from "@/types";
import type { PaginationInfo } from "../types/member.types";

interface UseMembersProps {
  initialMembers: Member[];
  initialPagination: PaginationInfo | null;
  onError?: (error: string) => void;
}

/**
 * Hook for managing members data fetching, pagination, and real-time updates
 */
export function useMembers({
  initialMembers,
  initialPagination,
  onError,
}: UseMembersProps) {
  const searchParams = useSearchParams();
  const currentPageFromUrl = parseInt(searchParams.get("page") || "1", 10);
  const currentPageSizeFromUrl = parseInt(
    searchParams.get("pageSize") || "20",
    10
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
        const result = await memberRepository.getPaginated({ page, pageSize });
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
    const currentPage = pagination?.page || 1;
    const currentPageSize = pagination?.pageSize || 20;

    if (pageFromUrl !== currentPage || pageSizeFromUrl !== currentPageSize) {
      loadMembers(pageFromUrl, pageSizeFromUrl);
    }
  }, [searchParams]);

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
