import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Creates a server-side Supabase client with cookie-based authentication
 * This is the only function that should remain in this file.
 * All data fetching logic has been moved to domain-specific repositories.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

// Re-export server-side repositories for backward compatibility
// These maintain the same API as the old functions but are now organized by domain
export { attendanceRepository } from "./repositories/attendanceRepository";
export { memberRepositoryServer } from "./repositories/memberRepository.server";
export { activityRepositoryServer } from "./repositories/activityRepository.server";
export { financeRepositoryServer } from "./repositories/financeRepository.server";

// Legacy function exports for backward compatibility
// These will be deprecated in favor of using repositories directly
export async function getAttendanceData(
  eventId: string = "default",
  page: number = 1,
  pageSize: number = 25
) {
  const { attendanceRepository } =
    await import("./repositories/attendanceRepository");
  return attendanceRepository.getAttendanceData(eventId, page, pageSize);
}

export async function getAttendanceRecordsForTabs(
  eventId: string = "default",
  page: number = 1,
  pageSize: number = 150
) {
  const { attendanceRepository } =
    await import("./repositories/attendanceRepository");
  return attendanceRepository.getAttendanceRecordsForTabs(
    eventId,
    page,
    pageSize
  );
}

export async function getMembersData(page: number = 1, pageSize: number = 20) {
  const { memberRepositoryServer } =
    await import("./repositories/memberRepository.server");
  return memberRepositoryServer.getMembersData(page, pageSize);
}

export async function getActivitiesData(
  page: number = 1,
  pageSize: number = 20
) {
  const { activityRepositoryServer } =
    await import("./repositories/activityRepository.server");
  return activityRepositoryServer.getActivitiesData(page, pageSize);
}

export async function getTithesData(page: number = 1, pageSize: number = 20) {
  const { financeRepositoryServer } =
    await import("./repositories/financeRepository.server");
  return financeRepositoryServer.getTithesData(page, pageSize);
}

export async function getOfferingsData(
  page: number = 1,
  pageSize: number = 20
) {
  const { financeRepositoryServer } =
    await import("./repositories/financeRepository.server");
  return financeRepositoryServer.getOfferingsData(page, pageSize);
}

export async function getPledgesData(page: number = 1, pageSize: number = 20) {
  const { financeRepositoryServer } =
    await import("./repositories/financeRepository.server");
  return financeRepositoryServer.getPledgesData(page, pageSize);
}
