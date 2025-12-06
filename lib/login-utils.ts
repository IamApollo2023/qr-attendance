/**
 * Shared login logic for admin and scanner login pages
 */

import { signIn, signOut, validateRole } from "@/lib/auth";
import type { LoginResult } from "@/types";

// Re-export for backward compatibility
export type { LoginResult };

/**
 * Handle login with role validation
 */
export async function handleLogin(
  email: string,
  password: string,
  requiredRole: "admin" | "scanner" | "finance"
): Promise<LoginResult> {
  try {
    // Sign in and get profile
    const { profile } = await signIn(email.trim(), password.trim());

    // Validate role
    await validateRole(profile, requiredRole);

    // Small delay to ensure cookies are set before redirect
    await new Promise((resolve) => setTimeout(resolve, 100));

    return { success: true };
  } catch (err: any) {
    // Sign out on any error to clear invalid session
    try {
      await signOut();
    } catch {
      // Ignore sign out errors
    }

    const errorMessage =
      err.message ||
      err.originalError?.message ||
      "Failed to sign in. Please check your credentials and ensure Email authentication is enabled in Supabase.";

    return { success: false, error: errorMessage };
  }
}
