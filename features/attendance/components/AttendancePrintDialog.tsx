"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import type { AttendanceRecord } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui";
import { Checkbox } from "@/components/ui/checkbox";
import { AttendancePrintModal } from "./AttendancePrintModal";
import { Printer, Search } from "lucide-react";

type DialogMode = "initial" | "print-all" | "print-specific";

interface AttendancePrintDialogProps {
  isOpen: boolean;
  allRecords: AttendanceRecord[];
  onClose: () => void;
}

export function AttendancePrintDialog({
  isOpen,
  allRecords,
  onClose,
}: AttendancePrintDialogProps) {
  const [mode, setMode] = useState<DialogMode>("initial");
  const [searchInput, setSearchInput] = useState("");
  const [selectedRecordIds, setSelectedRecordIds] = useState<Set<string>>(
    new Set()
  );
  const [recordsToPrint, setRecordsToPrint] = useState<AttendanceRecord[]>([]);
  const [shouldTriggerPrint, setShouldTriggerPrint] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const printTriggeredRef = useRef(false);

  // Filter records based on search input
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

  // Get selected records
  const selectedRecords = useMemo(() => {
    return allRecords.filter((record) =>
      selectedRecordIds.has(record.id || record.attendee_id)
    );
  }, [allRecords, selectedRecordIds]);

  // Handle print all
  const handlePrintAll = () => {
    setRecordsToPrint(allRecords);
    setShouldTriggerPrint(true);
  };

  // Handle print specific
  const handlePrintSpecific = () => {
    if (selectedRecords.length === 0) return;
    setRecordsToPrint(selectedRecords);
    setShouldTriggerPrint(true);
  };

  // Toggle record selection
  const toggleRecordSelection = (recordId: string) => {
    setSelectedRecordIds((prev) => {
      const next = new Set(prev);
      if (next.has(recordId)) {
        next.delete(recordId);
      } else {
        next.add(recordId);
      }
      return next;
    });
  };

  // Toggle select all visible
  const toggleSelectAllVisible = () => {
    const visibleIds = filteredRecords.map((r) => r.id || r.attendee_id);
    const allSelected = visibleIds.every((id) => selectedRecordIds.has(id));

    setSelectedRecordIds((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        visibleIds.forEach((id) => next.delete(id));
      } else {
        visibleIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  // Trigger print when recordsToPrint is set
  useEffect(() => {
    if (
      shouldTriggerPrint &&
      recordsToPrint.length > 0 &&
      !printTriggeredRef.current
    ) {
      printTriggeredRef.current = true;
      setIsPrinting(true);

      // Close dialog first
      onClose();

      // Wait for dialog to close and AttendancePrintModal to mount, then trigger print
      setTimeout(() => {
        const printContent = document.getElementById(
          "print-attendance-content"
        );
        if (printContent) {
          window.print();
        } else {
          setTimeout(() => {
            window.print();
          }, 200);
        }
      }, 300);
    }
  }, [shouldTriggerPrint, recordsToPrint, onClose]);

  // Handle print dialog close event to reset state
  useEffect(() => {
    const handleAfterPrint = () => {
      if (printTriggeredRef.current && isPrinting) {
        setTimeout(() => {
          setMode("initial");
          setSearchInput("");
          setSelectedRecordIds(new Set());
          setRecordsToPrint([]);
          setShouldTriggerPrint(false);
          setIsPrinting(false);
          printTriggeredRef.current = false;
        }, 300);
      }
    };

    window.addEventListener("afterprint", handleAfterPrint);

    return () => {
      window.removeEventListener("afterprint", handleAfterPrint);
    };
  }, [isPrinting]);

  // Reset state when dialog closes (only if not printing)
  const handleClose = () => {
    if (!isPrinting) {
      setMode("initial");
      setSearchInput("");
      setSelectedRecordIds(new Set());
      setRecordsToPrint([]);
      setShouldTriggerPrint(false);
      printTriggeredRef.current = false;
      setIsPrinting(false);
    }
    onClose();
  };

  // Reset when dialog opens
  useEffect(() => {
    if (isOpen && !isPrinting) {
      setMode("initial");
      setSearchInput("");
      setSelectedRecordIds(new Set());
      setRecordsToPrint([]);
      setShouldTriggerPrint(false);
      printTriggeredRef.current = false;
      setIsPrinting(false);
    }
  }, [isOpen, isPrinting]);

  const allVisibleSelected =
    filteredRecords.length > 0 &&
    filteredRecords.every((r) => selectedRecordIds.has(r.id || r.attendee_id));

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="max-w-2xl max-h-[80dvh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Print Attendance Records</DialogTitle>
            <DialogDescription>
              {mode === "initial" &&
                "Choose to print all records or select specific records."}
              {mode === "print-specific" &&
                "Search and select attendance records to print."}
            </DialogDescription>
          </DialogHeader>

          {mode === "initial" && (
            <div className="flex flex-col gap-3 mt-4">
              <Button onClick={handlePrintAll} className="w-full" size="lg">
                <Printer className="h-4 w-4" />
                Print All ({allRecords.length} records)
              </Button>
              <Button
                onClick={() => setMode("print-specific")}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <Search className="h-4 w-4" />
                Print Specific
              </Button>
            </div>
          )}

          {mode === "print-specific" && (
            <div className="flex flex-col flex-1 min-h-0 mt-4 gap-4">
              <div className="flex-shrink-0">
                <SearchInput
                  wrapperClassName="w-full"
                  placeholder="Search attendance records..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  autoFocus
                />
              </div>

              {filteredRecords.length > 0 && (
                <div className="flex-shrink-0 flex items-center gap-2 pb-2 border-b">
                  <Checkbox
                    checked={allVisibleSelected}
                    onCheckedChange={toggleSelectAllVisible}
                  />
                  <span className="text-sm text-muted-foreground">
                    Select all visible ({filteredRecords.length})
                  </span>
                </div>
              )}

              <div className="flex-1 overflow-y-auto min-h-0">
                {filteredRecords.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-gray-600 text-sm md:text-base">
                      {searchInput.trim()
                        ? "No records found"
                        : "Start typing to search for records"}
                    </p>
                    {searchInput.trim() && (
                      <p className="text-gray-500 text-xs md:text-sm mt-2">
                        Try a different search term
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredRecords.map((record) => {
                      const recordId = record.id || record.attendee_id;
                      const isSelected = selectedRecordIds.has(recordId);
                      return (
                        <div
                          key={recordId}
                          onClick={() => toggleRecordSelection(recordId)}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                            isSelected
                              ? "bg-blue-50 border-blue-200"
                              : "border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() =>
                                toggleRecordSelection(recordId)
                              }
                              onClick={(e) => e.stopPropagation()}
                            />
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
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex-shrink-0 flex items-center justify-between pt-4 border-t gap-3">
                <div className="text-sm text-muted-foreground">
                  {selectedRecords.length > 0
                    ? `${selectedRecords.length} record${selectedRecords.length !== 1 ? "s" : ""} selected`
                    : "No records selected"}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setMode("initial");
                      setSearchInput("");
                      setSelectedRecordIds(new Set());
                    }}
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handlePrintSpecific}
                    disabled={selectedRecords.length === 0}
                  >
                    <Printer className="h-4 w-4" />
                    Print ({selectedRecords.length})
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* AttendancePrintModal - render when printing or when we have records to print */}
      {(isPrinting || recordsToPrint.length > 0) && (
        <AttendancePrintModal recordsToPrint={recordsToPrint} />
      )}
    </>
  );
}
