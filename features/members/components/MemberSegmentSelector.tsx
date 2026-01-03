"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { MemberFilters as MemberFiltersType } from "../types/member.types";
import { useAvailableDates } from "../hooks/useAvailableDates";

type SegmentKey = "ALL" | "MEN" | "WOMEN" | "YAN" | "KKB" | "KIDS";

interface MemberSegmentSelectorProps {
  activeSegment: SegmentKey;
  onSegmentChange: (segment: SegmentKey) => void;
  membershipType: MemberFiltersType["membershipType"];
  onMembershipTypeChange: (type: MemberFiltersType["membershipType"]) => void;
  selectedDate?: string;
  onDateChange: (date: string | undefined) => void;
}

const SEGMENTS: { key: SegmentKey; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "MEN", label: "Men" },
  { key: "WOMEN", label: "Women" },
  { key: "YAN", label: "YAN" },
  { key: "KKB", label: "KKB" },
  { key: "KIDS", label: "Kids" },
];

/**
 * Format date string (YYYY-MM-DD) to readable format
 */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Check if it's today
  if (date.toDateString() === today.toDateString()) {
    return "Today";
  }

  // Check if it's yesterday
  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }

  // Format as "MMM DD, YYYY"
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function MemberSegmentSelector({
  activeSegment,
  onSegmentChange,
  membershipType,
  onMembershipTypeChange,
  selectedDate,
  onDateChange,
}: MemberSegmentSelectorProps) {
  const { availableDates, isLoading } = useAvailableDates();

  const selectedLabel =
    SEGMENTS.find((s) => s.key === activeSegment)?.label || "All";

  const membershipTypeLabel =
    membershipType === "all"
      ? "All Membership Types"
      : membershipType === "WSAM-LGAM"
        ? "WSAM-LGAM"
        : membershipType === "LGAM"
          ? "LGAM"
          : membershipType === "WSAM"
            ? "WSAM"
            : "Attendee";

  const dateLabel = selectedDate ? formatDate(selectedDate) : "All Dates";

  return (
    <div className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-3 border-b border-gray-200">
      <label className="text-[10px] md:text-xs font-medium text-gray-700 whitespace-nowrap">
        Filter by:
      </label>
      <Select
        value={activeSegment}
        onValueChange={(value) => onSegmentChange(value as SegmentKey)}
      >
        <SelectTrigger className="w-[100px] md:w-[120px] h-7 md:h-8 text-[10px] md:text-xs">
          <SelectValue>{selectedLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {SEGMENTS.map((segment) => (
            <SelectItem
              key={segment.key}
              value={segment.key}
              className="text-xs"
            >
              {segment.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={membershipType}
        onValueChange={(value) =>
          onMembershipTypeChange(value as MemberFiltersType["membershipType"])
        }
      >
        <SelectTrigger className="w-[140px] md:w-[180px] h-7 md:h-8 text-[10px] md:text-xs">
          <SelectValue>{membershipTypeLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" className="text-xs">
            All Membership Types
          </SelectItem>
          <SelectItem value="WSAM-LGAM" className="text-xs">
            WSAM-LGAM
          </SelectItem>
          <SelectItem value="LGAM" className="text-xs">
            LGAM
          </SelectItem>
          <SelectItem value="WSAM" className="text-xs">
            WSAM
          </SelectItem>
          <SelectItem value="Attendee" className="text-xs">
            Attendee
          </SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={selectedDate || "all"}
        onValueChange={(value) =>
          onDateChange(value === "all" ? undefined : value)
        }
        disabled={isLoading}
      >
        <SelectTrigger className="w-[130px] md:w-[160px] h-7 md:h-8 text-[10px] md:text-xs">
          <SelectValue>
            {isLoading ? "Loading..." : dateLabel}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" className="text-xs">
            All Dates
          </SelectItem>
          {availableDates.map((date) => (
            <SelectItem key={date} value={date} className="text-xs">
              {formatDate(date)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
