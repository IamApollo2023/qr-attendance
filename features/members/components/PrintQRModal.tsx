"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { QRCodeSVG } from "qrcode.react";
import type { Member } from "@/types";

interface PrintQRModalProps {
  membersToPrint: Member[];
}

export function PrintQRModal({ membersToPrint }: PrintQRModalProps) {
  useEffect(() => {
    const styleId = "print-qr-styles";
    // Remove existing style if it exists
    const existingStyle = document.getElementById(styleId);
    if (existingStyle) {
      existingStyle.remove();
    }

    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      /* Hide on screen - but keep in DOM */
      #print-qr-content {
        position: fixed !important;
        left: -9999px !important;
        top: -9999px !important;
        width: 1px !important;
        height: 1px !important;
        overflow: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
        z-index: -1 !important;
      }

      @media print {
        /* Hide everything except print content */
        * {
          visibility: hidden !important;
        }

        /* Show print content and all its children */
        #print-qr-content,
        #print-qr-content * {
          visibility: visible !important;
        }

        #print-qr-content {
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          width: 100% !important;
          min-height: 100vh !important;
          background: white !important;
          padding: 2rem !important;
          opacity: 1 !important;
          z-index: 999999 !important;
          overflow: visible !important;
        }

        /* Title */
        #print-qr-content .print-title {
          text-align: center;
          font-size: 1.5rem;
          font-weight: bold;
          color: #111827;
          margin-bottom: 1.5rem;
          display: block;
        }

        /* Grid container for cards */
        #print-qr-content .print-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
          justify-items: center;
        }

        /* Individual card */
        #print-qr-content .print-card {
          width: 90mm;
          height: 120mm;
          border: 2px solid #111827;
          border-radius: 0.5rem;
          background: white;
          padding: 4mm 8mm 10mm 8mm; /* Reduced top padding to move QR code higher */
          page-break-inside: avoid;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
        }

        /* QR code container - centered, positioned higher */
        #print-qr-content .print-qr-container {
          flex: 0 0 auto; /* Don't grow/shrink, use auto sizing */
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
          margin-top: -2rem; /* Smaller negative margin since we reduced top padding */
        }

        /* QR code SVG */
        #print-qr-content .print-qr-container svg {
          display: block;
          visibility: visible !important;
        }

        /* Logo image inside QR code */
        #print-qr-content .print-qr-container svg image {
          border-radius: 8px; /* Optional: rounded corners for logo */
        }

        /* Text container */
        #print-qr-content .print-text-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          margin-top: -4rem;
        }

        /* Name */
        #print-qr-content .print-name {
          font-size: 1.125rem;
          font-weight: 500;
          color: #111827;
          text-align: center;
          display: block;
        }

        /* ID */
        #print-qr-content .print-id {
          font-size: 1rem;
          font-family: monospace;
          color: #374151;
          text-align: center;
          display: block;
        }

        /* Age category */
        #print-qr-content .print-age {
          font-size: 1rem;
          color: #4b5563;
          text-align: center;
          display: block;
        }

        /* Page settings */
        @page {
          margin: 1cm;
          size: A4 portrait;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      const styleToRemove = document.getElementById(styleId);
      if (styleToRemove) {
        styleToRemove.remove();
      }
    };
  }, []);

  if (membersToPrint.length === 0) return null;

  const printContent = (
    <div id="print-qr-content" data-print-content="true" aria-hidden="true">
      <h1 className="print-title">Member QR Codes</h1>
      <div className="print-grid">
        {membersToPrint.map((member) => (
          <div key={member.id} className="print-card">
            {/* QR Code - centered */}
            <div className="print-qr-container">
              <QRCodeSVG
                value={member.member_id}
                size={360}
                level="H"
                includeMargin={true}
                imageSettings={{
                  src: "/logo.png",
                  height: 60,
                  width: 60,
                  excavate: true, // Removes QR code data behind logo for better scanning
                }}
              />
            </div>

            {/* Text information - vertically stacked */}
            <div className="print-text-container">
              <p className="print-name">
                {member.first_name} {member.last_name}
              </p>
              <p className="print-age">{member.age_category}</p>
              <p className="print-id">{member.member_id}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render directly to body using portal to ensure it's always available for printing
  if (typeof window !== "undefined") {
    return createPortal(printContent, document.body);
  }

  return printContent;
}
