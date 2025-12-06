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
      <div className="flex min-w-max gap-0.5 md:gap-1 -mb-px">
        {SEGMENTS.map((segment) => {
          const isActive = segment.key === activeSegment;
          return (
            <button
              key={segment.key}
              onClick={() => onSegmentChange(segment.key)}
              className={`px-2 py-1.5 md:px-4 md:py-2 text-[10px] md:text-xs font-semibold rounded-t-lg border border-b-0 transition-colors ${
                isActive
                  ? "bg-white text-blue-600 border-gray-300 border-b-white relative z-10"
                  : "bg-transparent text-gray-600 border-transparent hover:text-blue-600 hover:bg-gray-50"
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
