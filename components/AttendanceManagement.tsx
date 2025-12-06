"use client";

import React, { useState } from "react";
import type { AttendanceRecord } from "@/types";
import { Download, Printer, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AttendanceTabs } from "@/components/AttendanceTabs";
import {
  AttendanceSearchDialog,
  AttendancePrintDialog,
} from "@/features/attendance/components";
import { exportAttendanceToCSV } from "@/features/attendance/utils/csvExport";

interface AttendanceManagementProps {
  records: AttendanceRecord[];
  eventId: string;
  eventName?: string;
  eventDescription?: string;
}

export function AttendanceManagement({
  records,
  eventId,
  eventName,
  eventDescription,
}: AttendanceManagementProps) {
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  const handleExport = () => {
    exportAttendanceToCSV(records);
  };

  return (
    <>
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-3 py-3 md:gap-6 md:py-6">
          {/* Header */}
          <div className="flex flex-col gap-3 px-4 sm:flex-row sm:items-center sm:justify-between lg:px-6">
            <div>
              <h1 className="text-lg md:text-3xl font-semibold tracking-tight">
                {eventName || "Attendance"}
              </h1>
              {eventDescription && (
                <p className="text-xs md:text-base text-muted-foreground">
                  {eventDescription}
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleExport}
                disabled={records.length === 0}
                className="text-xs md:text-sm"
              >
                <Download className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Export</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsSearchDialogOpen(true)}
                className="text-xs md:text-sm"
              >
                <Search className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Search</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsPrintDialogOpen(true)}
                className="text-xs md:text-sm"
              >
                <Printer className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Print</span>
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex min-h-0 flex-1 flex-col gap-3 px-4 md:gap-4 lg:px-6">
            <AttendanceTabs records={records} eventId={eventId} />
          </div>
        </div>
      </div>

      {/* Search Dialog */}
      <AttendanceSearchDialog
        isOpen={isSearchDialogOpen}
        searchInput={searchInput}
        onSearchInputChange={setSearchInput}
        onClose={() => {
          setIsSearchDialogOpen(false);
          setSearchInput("");
        }}
        allRecords={records}
      />

      {/* Print Dialog */}
      <AttendancePrintDialog
        isOpen={isPrintDialogOpen}
        allRecords={records}
        onClose={() => setIsPrintDialogOpen(false)}
      />
    </>
  );
}
