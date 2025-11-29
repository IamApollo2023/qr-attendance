'use client'

import { useSearchParams } from 'next/navigation'
import { QRCodeSVG } from 'qrcode.react'
import { Suspense } from 'react'
import { Info } from 'lucide-react'

function AttendeeContent() {
  const searchParams = useSearchParams()
  const attendeeId = searchParams.get('id') || 'ATTENDEE-001'

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#141E30] via-[#243B55] to-[#35577D] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 md:p-12 shadow-2xl border border-white/20">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Your QR Code</h1>
            <p className="text-blue-200 text-base md:text-lg">Show this code to check in</p>
          </div>

          {/* QR Code Container - Larger for screen display */}
          <div className="bg-white rounded-xl p-8 md:p-12 mb-8 flex items-center justify-center shadow-lg">
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
          <div className="text-center space-y-4">
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <p className="text-blue-200 text-sm md:text-base mb-2">Attendee ID</p>
              <p className="text-white font-mono text-2xl md:text-3xl font-semibold">{attendeeId}</p>
            </div>

            <p className="text-blue-200 text-sm md:text-base">
              Point the scanner at this QR code to check in
            </p>
          </div>

          {/* Instructions */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="flex items-start gap-3 text-blue-200 text-base md:text-lg">
              <Info className="w-6 h-6 mt-0.5 flex-shrink-0" />
              <p>Make sure the QR code is clearly visible and well-lit when scanning</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AttendeePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#141E30] via-[#243B55] to-[#35577D] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <AttendeeContent />
    </Suspense>
  )
}

