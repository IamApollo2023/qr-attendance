"use client";

import dynamic from "next/dynamic";

const GeoMap = dynamic(
  () => import("@/components/GeoMap").then((m) => m.GeoMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[320px] w-full items-center justify-center rounded-lg border border-dashed border-gray-200 text-sm text-gray-500">
        Loading map…
      </div>
    ),
  }
);

export default function GeoPage() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <h1 className="text-2xl font-semibold tracking-tight">
            Geo Mapping
          </h1>
          <p className="text-sm text-muted-foreground">
            Barangay-level overview of members in Luna, La Union.
          </p>
        </div>
        <div className="flex min-h-0 flex-1 flex-col px-4 lg:px-6">
          <GeoMap />
        </div>
      </div>
    </div>
  );
}





