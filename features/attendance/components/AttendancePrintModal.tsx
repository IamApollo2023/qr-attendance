"use client";

import { useEffect } from "react";
import type { AttendanceRecord } from "@/types";

interface AttendancePrintModalProps {
  recordsToPrint: AttendanceRecord[];
}

export function AttendancePrintModal({
  recordsToPrint,
}: AttendancePrintModalProps) {
  useEffect(() => {
    const styleId = "print-attendance-styles";
    if (document.getElementById(styleId)) return;

    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      @media print {
        body * {
          visibility: hidden;
        }
        #print-attendance-content,
        #print-attendance-content * {
          visibility: visible;
        }
        #print-attendance-content {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          background: white;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      const existingStyle = document.getElementById(styleId);
      if (existingStyle) {
        document.head.removeChild(existingStyle);
      }
    };
  }, []);

  if (recordsToPrint.length === 0) return null;

  return (
    <div id="print-attendance-content" className="hidden print:block p-8">
      <h1 className="text-2xl font-bold text-gray-900 text-center mb-4">
        Attendance Records
      </h1>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700">
              Member ID
            </th>
            <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700">
              Name
            </th>
            <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700">
              Age Group
            </th>
            <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700">
              Scanned At
            </th>
          </tr>
        </thead>
        <tbody>
          {recordsToPrint.map((record) => (
            <tr key={record.id || record.attendee_id}>
              <td className="border border-gray-300 px-4 py-2 text-sm font-mono">
                {record.attendee_id}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-sm">
                {record.member
                  ? `${record.member.first_name} ${record.member.last_name}`
                  : record.attendee_id}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-sm">
                {record.member?.age_category || "N/A"}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-sm">
                {new Date(record.scanned_at).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
