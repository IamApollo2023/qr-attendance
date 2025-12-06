"use client";

import { useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import type { Member } from "@/types";

interface PrintQRModalProps {
  membersToPrint: Member[];
}

export function PrintQRModal({ membersToPrint }: PrintQRModalProps) {
  useEffect(() => {
    const styleId = "print-qr-styles";
    if (document.getElementById(styleId)) return;

    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      @media print {
        body * {
          visibility: hidden;
        }
        #print-qr-content,
        #print-qr-content * {
          visibility: visible;
        }
        #print-qr-content {
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

  if (membersToPrint.length === 0) return null;

  return (
    <div id="print-qr-content" className="hidden print:block p-8">
      <h1 className="text-2xl font-bold text-gray-900 text-center mb-4">
        Member QR Codes
      </h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 place-items-center">
        {membersToPrint.map((member) => (
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
