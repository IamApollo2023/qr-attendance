"use client";

import React, { useMemo } from "react";
import type { AttendanceRecord } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { SearchInput } from "@/components/ui";

interface AttendanceSearchDialogProps {
  isOpen: boolean;
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  onClose: () => void;
  allRecords: AttendanceRecord[];
  onRecordClick?: (record: AttendanceRecord) => void;
}

export function AttendanceSearchDialog({
  isOpen,
  searchInput,
  onSearchInputChange,
  onClose,
  allRecords,
  onRecordClick,
}: AttendanceSearchDialogProps) {
  // Filter records based on dialog search
  const filteredRecords = useMemo(() => {
    if (!searchInput.trim()) {
      return [];
    }
    const searchLower = searchInput.toLowerCase();
    return allRecords.filter((record) => {
      const attendeeId = record.attendee_id.toLowerCase();
      const memberName = record.member
        ? `${record.member.first_name} ${record.member.last_name}`.toLowerCase()
        : "";
      const scannedAt = new Date(record.scanned_at)
        .toLocaleString()
        .toLowerCase();

      return (
        attendeeId.includes(searchLower) ||
        memberName.includes(searchLower) ||
        scannedAt.includes(searchLower)
      );
    });
  }, [allRecords, searchInput]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80dvh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Search Attendance</DialogTitle>
          <DialogDescription>
            Search for attendance records by attendee ID, member name, or
            scanned date.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 flex-shrink-0">
          <SearchInput
            wrapperClassName="w-full"
            placeholder="Search attendance records..."
            value={searchInput}
            onChange={(e) => onSearchInputChange(e.target.value)}
            autoFocus
          />
        </div>
        <div className="mt-4 flex-1 overflow-y-auto min-h-0">
          {filteredRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-gray-600 text-sm md:text-base">
                {searchInput.trim()
                  ? "No records found"
                  : "Start typing to search for attendance records"}
              </p>
              {searchInput.trim() && (
                <p className="text-gray-500 text-xs md:text-sm mt-2">
                  Try a different search term
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredRecords.map((record) => (
                <div
                  key={record.id || record.attendee_id}
                  onClick={() => {
                    onRecordClick?.(record);
                    onClose();
                  }}
                  className="p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-semibold text-xs md:text-sm text-gray-900">
                          {record.attendee_id}
                        </span>
                        {record.member?.age_category && (
                          <span className="px-1.5 md:px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] md:text-xs font-medium">
                            {record.member.age_category}
                          </span>
                        )}
                      </div>
                      <p className="text-sm md:text-base font-medium text-gray-900">
                        {record.member
                          ? `${record.member.first_name} ${record.member.last_name}`
                          : record.attendee_id}
                      </p>
                      <p className="text-xs md:text-sm text-gray-600 mt-1">
                        Scanned at:{" "}
                        {new Date(record.scanned_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
