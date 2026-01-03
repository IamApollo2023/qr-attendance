import { useState, useCallback, useMemo } from "react";
import type { Member } from "@/lib";

/**
 * Hook for member selection management
 * Single responsibility: Handle member selection state and operations
 */
export function useMemberSelection(members: Member[]) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelect = useCallback((memberId: string) => {
    setSelectedIds((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  }, []);

  const toggleSelectAllVisible = useCallback(
    (visibleMembers: Member[]) => {
      const visibleIds = visibleMembers.map((m) => m.member_id);
      const allSelected = visibleIds.every((id) => selectedIds.includes(id));
      if (allSelected) {
        setSelectedIds((prev) =>
          prev.filter((id) => !visibleIds.includes(id))
        );
      } else {
        setSelectedIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
      }
    },
    [selectedIds]
  );

  const allVisibleSelected = useMemo(() => {
    return (
      members.length > 0 &&
      members.every((m) => selectedIds.includes(m.member_id))
    );
  }, [members, selectedIds]);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  return {
    selectedIds,
    allVisibleSelected,
    toggleSelect,
    toggleSelectAllVisible,
    clearSelection,
  };
}
