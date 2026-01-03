import { useState, useCallback } from "react";
import type { MemberFilters as MemberFiltersType } from "../types/member.types";

type SegmentKey = "ALL" | "MEN" | "WOMEN" | "YAN" | "KKB" | "KIDS";

/**
 * Hook for managing member segment filtering
 * Single responsibility: Handle segment-based filter presets
 */
export function useMemberSegmentFilter(
  setFilters: React.Dispatch<React.SetStateAction<MemberFiltersType>>
) {
  const [activeSegment, setActiveSegment] = useState<SegmentKey>("ALL");

  const handleSegmentChange = useCallback(
    (segment: SegmentKey) => {
      setActiveSegment(segment);
      setFilters((prev) => {
        if (segment === "ALL") {
          return {
            ...prev,
            ageCategory: "all",
            gender: "all",
          };
        } else if (segment === "MEN") {
          return {
            ...prev,
            ageCategory: "Men",
            gender: "male",
          };
        } else if (segment === "WOMEN") {
          return {
            ...prev,
            ageCategory: "Women",
            gender: "female",
          };
        } else if (segment === "KIDS") {
          return {
            ...prev,
            ageCategory: "Children",
            gender: "all",
          };
        } else {
          // YAN, KKB
          return {
            ...prev,
            ageCategory: segment as MemberFiltersType["ageCategory"],
            gender: "all",
          };
        }
      });
    },
    [setFilters]
  );

  return {
    activeSegment,
    handleSegmentChange,
  };
}
