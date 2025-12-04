import dynamic from "next/dynamic";

// Code-split heavy QRScanner component - only loads when needed
const QRScanner = dynamic(() => import("@/components/QRScanner"), {
  loading: () => (
    <div className="flex flex-col h-screen bg-gray-50 items-center justify-center">
      <div className="text-gray-600">Loading scanner...</div>
    </div>
  ),
  // In the App Router, client components are already isolated from SSR.
  // We don't need `ssr: false` here; QRScanner itself is a client component.
});

export default function ScannerPage() {
  // Auth is already checked by middleware, so we can trust the user is authenticated
  return (
    <div className="relative">
      <QRScanner eventId="default" />
    </div>
  );
}
