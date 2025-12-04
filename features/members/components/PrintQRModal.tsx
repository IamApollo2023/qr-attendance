"use client";

import { useRef, useEffect } from "react";
import { useReactToPrint } from "react-to-print";
import { QRCodeSVG } from "qrcode.react";
import type { Member } from "@/types";

interface PrintQRModalProps {
  members: Member[];
  selectedIds: string[];
  onPrintHandlerReady?: (handler: () => void) => void;
}

export function PrintQRModal({
  members,
  selectedIds,
  onPrintHandlerReady,
}: PrintQRModalProps) {
  const printRef = useRef<HTMLDivElement | null>(null);
  const handleBatchPrint = useReactToPrint({
    contentRef: printRef,
  } as any);

  useEffect(() => {
    if (onPrintHandlerReady) {
      onPrintHandlerReady(handleBatchPrint);
    }
  }, [handleBatchPrint, onPrintHandlerReady]);

  const selectedMembers = members.filter((m) =>
    selectedIds.includes(m.member_id)
  );

  return (
    <div ref={printRef} className="p-8 hidden print:block">
      <h1 className="text-2xl font-bold text-gray-900 text-center mb-4">
        Member QR Codes
      </h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 place-items-center">
        {selectedMembers.map((member) => (
          <div
            key={member.id}
            className="flex flex-col items-center justify-center border border-gray-200 rounded-2xl"
            style={{
              width: "85.6mm", // credit-card / wallet size width
              height: "54mm", // credit-card / wallet size height
              pageBreakInside: "avoid",
              padding: "8mm 4mm",
              margin: "0 auto",
            }}
          >
            <QRCodeSVG
              value={member.member_id}
              size={80}
              level="H"
              includeMargin={false}
            />
            <p className="text-xs font-semibold text-gray-800 mb-1 text-center">
              {member.first_name} {member.last_name}
            </p>
            <p className="text-[10px] font-mono text-gray-700 text-center">
              {member.member_id}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

