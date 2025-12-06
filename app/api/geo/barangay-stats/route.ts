import { NextResponse } from "next/server";

import { createServerClient } from "@/lib/supabase-server-geo";

export async function GET() {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("members")
    .select("barangay_code, barangay_name")
    .not("barangay_code", "is", null);

  console.log("[barangay-stats] Query result:", {
    data,
    error,
    count: data?.length,
  });

  if (error) {
    console.error("Failed to fetch barangay stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }

  const counts = new Map<
    string,
    { barangay_code: string; barangay_name: string; count: number }
  >();

  (data || []).forEach((row) => {
    const code = row.barangay_code as string | null;
    const name = (row.barangay_name as string | null) ?? "";
    if (!code) return;
    const existing = counts.get(code);
    if (existing) {
      existing.count += 1;
    } else {
      counts.set(code, { barangay_code: code, barangay_name: name, count: 1 });
    }
  });

  const result = Array.from(counts.values()).sort((a, b) => b.count - a.count);

  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}
