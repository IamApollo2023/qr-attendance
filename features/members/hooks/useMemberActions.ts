import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { deleteMember, type Member } from "@/lib";
import { useToastContext } from "@/components/ToastProvider";
import { exportMembersToCSV } from "@/features/members/utils/csvExport";
import type { SortKey, SortConfig } from "../types/member.types";
import type { PaginationInfo } from "../types/member.types";

interface UseMemberActionsProps {
  members: Member[];
  pagination: PaginationInfo | null;
  loadMembers: (page: number) => void;
  setSortConfig: React.Dispatch<React.SetStateAction<SortConfig | null>>;
}

/**
 * Hook for member action handlers
 * Single responsibility: Handle member actions (delete, export, sort, pagination)
 */
export function useMemberActions({
  members,
  pagination,
  loadMembers,
  setSortConfig,
}: UseMemberActionsProps) {
  const router = useRouter();
  const { success, error: showError, showAlert } = useToastContext();

  const handlePageChange = useCallback(
    (newPage: number) => {
      if (newPage < 1 || (pagination && newPage > pagination.totalPages))
        return;
      const currentPageSize = pagination?.pageSize || 20;
      router.push(`/admin/members?page=${newPage}&pageSize=${currentPageSize}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [router, pagination]
  );

  const handlePageSizeChange = useCallback(
    (newPageSize: number) => {
      router.push(`/admin/members?page=1&pageSize=${newPageSize}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [router]
  );

  const handleDelete = useCallback(
    async (member: Member) => {
      const confirmed = await showAlert({
        type: "warning",
        title: "Delete Member?",
        message: `Are you sure you want to delete ${member.first_name} ${member.last_name} (${member.member_id})?`,
        confirmText: "Yes, delete it",
        cancelText: "Cancel",
      });

      if (confirmed) {
        try {
          await deleteMember(member.id);
          success("Deleted!", "Member deleted successfully", 2000);
          const currentPage = pagination?.page || 1;
          loadMembers(currentPage);
        } catch (error) {
          console.error("Failed to delete member:", error);
          showError("Error", "Failed to delete member", 3000);
        }
      }
    },
    [showAlert, success, showError, loadMembers, pagination]
  );

  const handleExport = useCallback(() => {
    exportMembersToCSV(members);
  }, [members]);

  const handleSort = useCallback(
    (key: SortKey) => {
      setSortConfig((prev) => {
        if (!prev || prev.key !== key) {
          return { key, direction: "asc" };
        }
        if (prev.direction === "asc") {
          return { key, direction: "desc" };
        }
        return null; // third click clears sort
      });
    },
    [setSortConfig]
  );

  return {
    handlePageChange,
    handlePageSizeChange,
    handleDelete,
    handleExport,
    handleSort,
  };
}
