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

  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [pagination, setPagination] = useState<PaginationInfo | null>(
    initialPagination
  );
  const [loading, setLoading] = useState(false);
  const isInitialMount = useRef(true);

  const loadMembers = useCallback(
    async (page: number = 1) => {
      setLoading(true);
      try {
        const result = await memberRepository.getPaginated({ page });
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
    if (pageFromUrl !== (pagination?.page || 1)) {
      loadMembers(pageFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          await loadMembers(currentPage);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pagination?.page, currentPageFromUrl, loadMembers]);

  return {
    members,
    pagination,
    loading,
    loadMembers,
  };
}









