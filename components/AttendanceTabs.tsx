"use client";

import { useMemo, useState } from "react";

import type { AttendanceRecord } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";

type TabKey =
  | "ALL"
  | "MEN"
  | "WOMEN"
  | "YAN_MALE"
  | "YAN_FEMALE"
  | "KKB_MALE"
  | "KKB_FEMALE"
  | "KID_MALE"
  | "KID_FEMALE";

interface AttendanceTabsProps {
  records: AttendanceRecord[];
  eventId: string;
}

const TABS: { key: TabKey; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "MEN", label: "MEN" },
  { key: "WOMEN", label: "WOMEN" },
  { key: "YAN_MALE", label: "YAN MALE" },
  { key: "YAN_FEMALE", label: "YAN FEMALE" },
  { key: "KKB_MALE", label: "KKB MALE" },
  { key: "KKB_FEMALE", label: "KKB FEMALE" },
  { key: "KID_MALE", label: "KID MALE" },
  { key: "KID_FEMALE", label: "KID FEMALE" },
];

function matchesTab(record: AttendanceRecord, tab: TabKey): boolean {
  // "ALL" shows all records
  if (tab === "ALL") {
    return true;
  }

  const member = record.member;
  if (!member) return false;

  const age = member.age_category;
  const gender = member.gender;

  switch (tab) {
    case "MEN":
      return age === "Men" && gender === "male";
    case "WOMEN":
      return age === "Women" && gender === "female";
    case "YAN_MALE":
      return age === "YAN" && gender === "male";
    case "YAN_FEMALE":
      return age === "YAN" && gender === "female";
    case "KKB_MALE":
      return age === "KKB" && gender === "male";
    case "KKB_FEMALE":
      return age === "KKB" && gender === "female";
    case "KID_MALE":
      return age === "Children" && gender === "male";
    case "KID_FEMALE":
      return age === "Children" && gender === "female";
    default:
      return false;
  }
}

const PAGE_SIZE = 25;

export function AttendanceTabs({ records, eventId }: AttendanceTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("ALL");
  const [pageByTab, setPageByTab] = useState<Record<TabKey, number>>({
    ALL: 1,
    MEN: 1,
    WOMEN: 1,
    YAN_MALE: 1,
    YAN_FEMALE: 1,
    KKB_MALE: 1,
    KKB_FEMALE: 1,
    KID_MALE: 1,
    KID_FEMALE: 1,
  });

  const filteredByTab: Record<TabKey, AttendanceRecord[]> = useMemo(() => {
    const base: Record<TabKey, AttendanceRecord[]> = {
      ALL: [],
      MEN: [],
      WOMEN: [],
      YAN_MALE: [],
      YAN_FEMALE: [],
      KKB_MALE: [],
      KKB_FEMALE: [],
      KID_MALE: [],
      KID_FEMALE: [],
    };

    for (const rec of records) {
      (Object.keys(base) as TabKey[]).forEach((tab) => {
        if (matchesTab(rec, tab)) {
          base[tab].push(rec);
        }
      });
    }

    return base;
  }, [records]);

  const currentTabRecords = filteredByTab[activeTab] || [];
  const currentPage = pageByTab[activeTab] || 1;
  const totalPages = Math.max(
    1,
    Math.ceil(currentTabRecords.length / PAGE_SIZE)
  );
  const pagedRecords = currentTabRecords.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPageByTab((prev) => ({ ...prev, [activeTab]: newPage }));
  };

  const selectedLabel = TABS.find((t) => t.key === activeTab)?.label || "All";

  return (
    <Card
      className="flex min-h-0 flex-1 flex-col overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-gray-400"
      style={{
        scrollbarWidth: "thin",
        scrollbarColor: "#cbd5e1 #f1f5f9",
      }}
    >
      <div className="flex-shrink-0">
        <div className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-3 border-b border-gray-200">
          <label className="text-[10px] md:text-xs font-medium text-gray-700 whitespace-nowrap">
            Filter by:
          </label>
          <Select
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as TabKey)}
          >
            <SelectTrigger className="w-[140px] md:w-[160px] h-7 md:h-8 text-[10px] md:text-xs">
              <SelectValue>{selectedLabel}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {TABS.map((tab) => (
                <SelectItem key={tab.key} value={tab.key} className="text-xs">
                  {tab.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <CardContent className="flex min-h-0 flex-1 flex-col p-0">
        <div
          className="overflow-x-auto overflow-y-hidden flex-1 min-h-0 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-gray-400"
          style={{ scrollbarWidth: "thin", scrollbarColor: "#cbd5e1 #f1f5f9" }}
        >
          <table style={{ tableLayout: "auto", minWidth: "100%" }}>
            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
              <tr>
                <th className="px-3 py-2 md:px-4 md:py-3 text-left text-gray-700 font-semibold text-[10px] md:text-xs">
                  Name
                </th>
                <th className="px-3 py-2 md:px-4 md:py-3 text-left text-gray-700 font-semibold text-[10px] md:text-xs mobile:hidden">
                  Age group
                </th>
                <th className="px-3 py-2 md:px-4 md:py-3 text-left text-gray-700 font-semibold text-[10px] md:text-xs">
                  Scanned at
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {pagedRecords.length === 0
                ? Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="px-4 py-3">
                        <div className="h-3 w-40 rounded bg-muted" />
                      </td>
                      <td className="px-4 py-3 mobile:hidden">
                        <div className="h-3 w-24 rounded bg-muted" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-3 w-32 rounded bg-muted" />
                      </td>
                    </tr>
                  ))
                : pagedRecords.map((rec) => (
                    <tr
                      key={rec.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-gray-700 text-xs md:text-sm whitespace-nowrap">
                        {rec.member
                          ? `${rec.member.first_name} ${rec.member.last_name}`
                          : rec.attendee_id}
                      </td>
                      <td className="px-3 py-2 md:px-4 md:py-3 mobile:hidden whitespace-nowrap">
                        <span className="px-1.5 md:px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] md:text-xs font-medium">
                          {rec.member?.age_category || "N/A"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-[10px] md:text-xs whitespace-nowrap">
                        {new Date(rec.scanned_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        <div className="px-3 py-2 md:px-4 md:py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-gray-600 text-[10px] md:text-xs">
              {currentTabRecords.length === 0 ? (
                "No records yet for this group"
              ) : (
                <>
                  Showing {(currentPage - 1) * PAGE_SIZE + 1}-
                  {Math.min(currentPage * PAGE_SIZE, currentTabRecords.length)}{" "}
                  of {currentTabRecords.length} record
                  {currentTabRecords.length !== 1 ? "s" : ""}
                </>
              )}
            </p>

            {currentTabRecords.length > 0 && totalPages > 1 && (
              <div className="flex items-center gap-0.5 md:gap-1 flex-wrap justify-center">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="p-1 md:p-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-3 h-3 md:w-4 md:h-4 text-gray-700" />
                </button>
                <span className="px-1 md:px-2 text-gray-400 text-[10px] md:text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="p-1 md:p-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-3 h-3 md:w-4 md:h-4 text-gray-700" />
                </button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
