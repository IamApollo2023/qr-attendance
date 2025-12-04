"use client";

import { useSearchParams } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { Suspense } from "react";
import { Info } from "lucide-react";

function AttendeeContent() {
  const searchParams = useSearchParams();
  const attendeeId = searchParams.get("id") || "ATTENDEE-001";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#141E30] via-[#243B55] to-[#35577D] flex items-center justify-center p-4 print:bg-white print:block">
      <div className="w-full max-w-2xl">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 md:p-12 shadow-2xl border border-white/20 print:bg-white print:shadow-none print:border-0 print:p-8">
          <div className="print:flex print:flex-col print:items-center">
            {/* Header */}
            <div className="text-center mb-8 print:mb-6">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 print:text-gray-900 print:text-3xl">
                Your QR Code
              </h1>
              <p className="text-blue-200 text-base md:text-lg print:text-gray-700">
                Show this code to check in
              </p>
            </div>

            {/* QR Code Container - Larger for screen & print */}
            <div className="bg-white rounded-xl p-8 md:p-12 mb-8 flex items-center justify-center shadow-lg print:shadow-none print:mb-4">
              <QRCodeSVG
                value={attendeeId}
                size={400}
                level="H"
                includeMargin={true}
                fgColor="#141E30"
                bgColor="#ffffff"
              />
            </div>

            {/* Attendee Info */}
            <div className="text-center space-y-4 print:space-y-3">
              <div className="bg-white/5 rounded-lg p-6 border border-white/10 print:bg-white print:border print:border-gray-200">
                <p className="text-blue-200 text-sm md:text-base mb-2 print:text-gray-600">
                  Attendee ID
                </p>
                <p className="text-white font-mono text-2xl md:text-3xl font-semibold print:text-gray-900 print:text-2xl">
                  {attendeeId}
                </p>
              </div>

              <p className="text-blue-200 text-sm md:text-base print:text-gray-700">
                Point the scanner at this QR code to check in
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AttendeePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-[#141E30] via-[#243B55] to-[#35577D] flex items-center justify-center">
          <div className="text-white">Loading...</div>
        </div>
      }
    >
      <AttendeeContent />
    </Suspense>
  );
}
