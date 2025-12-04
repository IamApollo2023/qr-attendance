import { createBrowserClient } from "@supabase/ssr";
import type { AttendanceRecord } from "@/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
  );
}

// Use createBrowserClient from @supabase/ssr to ensure cookies are used instead of localStorage
// This makes the session accessible to the proxy/middleware
export const supabase = createBrowserClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-key"
);

// Re-export for backward compatibility
export type { AttendanceRecord };
