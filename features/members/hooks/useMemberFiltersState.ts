import { useState, useCallback, useMemo } from "react";
import type { MemberFilters as MemberFiltersType } from "../types/member.types";

/**
 * Hook for managing member filter state
 * Single responsibility: Handle filter state
 */
export function useMemberFiltersState() {
  const [filters, setFilters] = useState<MemberFiltersType>({
    searchTerm: "",
    gender: "all",
    ageCategory: "all",
    membershipType: "all",
    dateAddedFrom: undefined,
    dateAddedTo: undefined,
  });

  // Memoize dateFilters to prevent unnecessary re-initialization
  const dateFilters = useMemo(
    () => ({
      dateAddedFrom: filters.dateAddedFrom,
      dateAddedTo: filters.dateAddedTo,
    }),
    [filters.dateAddedFrom, filters.dateAddedTo]
  );

  // Memoize membership type change handler
  const handleMembershipTypeChange = useCallback(
    (type: MemberFiltersType["membershipType"]) => {
      setFilters((prev) => {
        // Only update if value actually changed
        if (prev.membershipType === type) {
          return prev;
        }
        return { ...prev, membershipType: type };
      });
    },
    []
  );

  // Handle date selection (single date - sets both from and to to the same date)
  const handleDateChange = useCallback((date: string | undefined) => {
    setFilters((prev) => {
      if (!date) {
        // Clear date filter
        if (!prev.dateAddedFrom && !prev.dateAddedTo) {
          return prev; // No change needed
        }
        return {
          ...prev,
          dateAddedFrom: undefined,
          dateAddedTo: undefined,
        };
      }
      // Set both from and to to the same date (filter for that specific date)
      return {
        ...prev,
        dateAddedFrom: date,
        dateAddedTo: date,
      };
    });
  }, []);

  // Memoize dateFilters object for components
  const memoizedDateFilters = useMemo(
    () => ({
      dateAddedFrom: filters.dateAddedFrom,
      dateAddedTo: filters.dateAddedTo,
    }),
    [filters.dateAddedFrom, filters.dateAddedTo]
  );

  return {
    filters,
    setFilters,
    dateFilters,
    memoizedDateFilters,
    handleMembershipTypeChange,
    handleDateChange,
  };
}
