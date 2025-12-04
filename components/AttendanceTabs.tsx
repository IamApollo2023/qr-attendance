"use client";

import { useMemo, useState } from "react";

import type { AttendanceRecord } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type TabKey =
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
  const [activeTab, setActiveTab] = useState<TabKey>("MEN");
  const [pageByTab, setPageByTab] = useState<Record<TabKey, number>>({
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

  return (
    <div className="flex flex-1 flex-col gap-4 min-h-0">
      {/* Tabs */}
      <div className="overflow-x-auto">
        <div className="flex min-w-max gap-1 rounded-t-xl bg-muted px-2 pt-2">
          {TABS.map((tab) => {
            const isActive = tab.key === activeTab;
            return (
              <Button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                size="sm"
                variant={isActive ? "default" : "ghost"}
                className={`rounded-b-none border-b-0 text-xs shadow-sm ${
                  isActive ? "" : "text-muted-foreground"
                }`}
              >
                {tab.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <Card className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            {TABS.find((t) => t.key === activeTab)?.label} attendance
          </CardTitle>
        </CardHeader>
        <CardContent className="flex min-h-0 flex-1 flex-col p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[130px] text-xs">
                    Member ID
                  </TableHead>
                  <TableHead className="text-xs">Name</TableHead>
                  <TableHead className="text-xs">Age group</TableHead>
                  <TableHead className="text-xs">Scanned at</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedRecords.length === 0
                  ? Array.from({ length: 5 }).map((_, idx) => (
                      <TableRow key={idx} className="animate-pulse">
                        <TableCell>
                          <div className="h-3 w-24 rounded bg-muted" />
                        </TableCell>
                        <TableCell>
                          <div className="h-3 w-40 rounded bg-muted" />
                        </TableCell>
                        <TableCell>
                          <div className="h-3 w-24 rounded bg-muted" />
                        </TableCell>
                        <TableCell>
                          <div className="h-3 w-32 rounded bg-muted" />
                        </TableCell>
                      </TableRow>
                    ))
                  : pagedRecords.map((rec) => (
                      <TableRow key={rec.id}>
                        <TableCell className="font-mono text-xs">
                          {rec.attendee_id}
                        </TableCell>
                        <TableCell className="text-xs">
                          {rec.member
                            ? `${rec.member.first_name} ${rec.member.last_name}`
                            : rec.attendee_id}
                        </TableCell>
                        <TableCell className="text-xs">
                          {rec.member?.age_category || "N/A"}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(rec.scanned_at).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between border-t bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
            {currentTabRecords.length === 0 ? (
              <span className="w-full text-center">
                No records yet for this group
              </span>
            ) : (
              <>
                <span>
                  Showing {(currentPage - 1) * PAGE_SIZE + 1}-
                  {Math.min(
                    currentPage * PAGE_SIZE,
                    currentTabRecords.length
                  )}{" "}
                  of {currentTabRecords.length} records
                </span>
                {totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-[11px]"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage <= 1}
                    >
                      Prev
                    </Button>
                    <span>
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-[11px]"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
