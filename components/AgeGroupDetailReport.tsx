"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import type { AgeGroupDetailReport } from "@/lib/reports";

const ageGroupNames: Record<string, string> = {
  all: "All",
  men: "Men",
  women: "Women",
  yan: "YAN",
  kkb: "KKB",
  kids: "Kids",
};

interface AgeGroupDetailReportProps {
  ageGroup: string;
  initialData: AgeGroupDetailReport;
}

export default function AgeGroupDetailReport({
  ageGroup,
  initialData,
}: AgeGroupDetailReportProps) {
  const { members, sessions, attendance } = initialData;
  const ageGroupName = ageGroupNames[ageGroup] || ageGroup;

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-3 py-3 md:gap-6 md:py-6">
        {/* Header with Back Button */}
        <div className="flex flex-col gap-3 px-4 lg:px-6">
          <Link href="/admin/report">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Reports</span>
              <span className="sm:hidden">Back</span>
            </Button>
          </Link>
          <div>
            <h1 className="text-lg md:text-3xl font-semibold tracking-tight">
              {ageGroupName} Report
            </h1>
            <p className="text-xs md:text-base text-muted-foreground">
              Attendance by event sessions
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="flex min-h-0 flex-1 flex-col gap-3 px-4 md:gap-4 lg:px-6">
          {members.length === 0 || sessions.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center flex-1 flex items-center justify-center flex-col">
              <p className="text-gray-700 text-sm md:text-base">
                No attendance data available for this age group
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 flex-1 flex flex-col min-h-0">
              <div
                className="overflow-x-auto overflow-y-auto flex-1 min-h-0 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-gray-400"
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: "#cbd5e1 #f1f5f9",
                }}
              >
                <table
                  className="w-full min-w-full"
                  style={{ tableLayout: "auto", width: "100%" }}
                >
                  <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-2 md:px-4 md:py-3 text-left text-gray-700 font-semibold text-[10px] md:text-xs sticky left-0 bg-gray-50 z-20 border-r border-gray-200">
                        Member Name
                      </th>
                      {sessions.map((session) => (
                        <th
                          key={session.sessionId}
                          className="px-3 py-2 md:px-4 md:py-3 text-center text-gray-700 font-semibold text-[10px] md:text-xs whitespace-nowrap"
                        >
                          {session.displayName}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {members.map((member) => (
                      <tr
                        key={member.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-2 md:px-4 md:py-3 text-gray-700 text-xs md:text-sm whitespace-nowrap sticky left-0 bg-white z-10 border-r border-gray-200 font-medium">
                          {member.fullName}
                        </td>
                        {sessions.map((session) => {
                          const hasAttended =
                            attendance[member.id]?.includes(
                              session.sessionId
                            ) || false;
                          return (
                            <td
                              key={session.sessionId}
                              className="px-3 py-2 md:px-4 md:py-3 text-center"
                            >
                              {hasAttended ? (
                                <span className="text-green-600 font-semibold text-lg">
                                  ✓
                                </span>
                              ) : (
                                <span className="text-gray-300">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
