"use client";

import React from "react";

type SegmentKey = "ALL" | "MEN" | "WOMEN" | "YAN" | "KKB" | "KIDS";

interface MemberSegmentsTabsProps {
  activeSegment: SegmentKey;
  onSegmentChange: (segment: SegmentKey) => void;
}

const SEGMENTS: { key: SegmentKey; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "MEN", label: "Men" },
  { key: "WOMEN", label: "Women" },
  { key: "YAN", label: "YAN" },
  { key: "KKB", label: "KKB" },
  { key: "KIDS", label: "Kids" },
];

export function MemberSegmentsTabs({
  activeSegment,
  onSegmentChange,
}: MemberSegmentsTabsProps) {
  return (
    <div className="overflow-x-auto">
      <div className="flex min-w-max bg-gray-100 rounded-t-xl px-2 pt-2 gap-1">
        {SEGMENTS.map((segment) => {
          const isActive = segment.key === activeSegment;
          return (
            <button
              key={segment.key}
              onClick={() => onSegmentChange(segment.key)}
              className={`px-4 py-2 text-xs font-semibold rounded-t-lg border border-b-0 transition-colors shadow-sm ${
                isActive
                  ? "bg-white text-blue-600 border-gray-300"
                  : "bg-gray-100 text-gray-600 border-transparent hover:bg-white hover:text-blue-600"
              }`}
            >
              {segment.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}








