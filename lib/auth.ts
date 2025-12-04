import { supabase } from "./supabase";
import type { UserRole, UserProfile } from "@/types";

// Re-export for backward compatibility
export type { UserRole, UserProfile };

/**
 * Get the current user's profile with role
 */
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    const { data: profile, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error || !profile) {
      return null;
    }

    return profile as UserProfile;
  } catch (error) {
    console.error("Error getting user profile:", error);
    return null;
  }
}

/**
 * Check if user has a specific role
 */
export async function hasRole(requiredRole: UserRole): Promise<boolean> {
  const profile = await getCurrentUserProfile();
  return profile?.role === requiredRole;
}

/**
 * Sign in with email and password
 * Returns auth data and user profile
 */
export async function signIn(
  email: string,
  password: string
): Promise<{
  user: { id: string; email?: string };
  session: { access_token: string; refresh_token: string };
  profile: UserProfile | null;
}> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Provide user-friendly error messages
    let errorMessage = error.message;

    if (error.message === "Invalid login credentials") {
      errorMessage =
        "Invalid email or password. Please check your credentials.";
    } else if (error.message.includes("Email not confirmed")) {
      errorMessage = "Please verify your email address before signing in.";
    } else if (error.message.includes("Email provider is not enabled")) {
      errorMessage =
        "Email authentication is not enabled. Please contact your administrator.";
    } else if (error.status === 400) {
      errorMessage =
        "Authentication failed. Please check your email and password, or ensure the Email provider is enabled in Supabase.";
    }

    const enhancedError = new Error(errorMessage);
    (enhancedError as any).originalError = error;
    throw enhancedError;
  }

  if (!data?.user) {
    throw new Error("Authentication failed. No user data returned.");
  }

  // Fetch user profile
  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", data.user.id)
    .single();

  if (profileError) {
    console.warn("Profile not found after sign-in:", profileError);
  }

  return {
    user: data.user,
    session: data.session!,
    profile: (profile as UserProfile) || null,
  };
}

/**
 * Sign out
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}

/**
 * Get current session
 */
export async function getSession() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

/**
 * Validate user role and throw if invalid
 */
export async function validateRole(
  profile: UserProfile | null,
  requiredRole: UserRole
): Promise<void> {
  if (!profile) {
    throw new Error(
      "User profile not found. Please contact your administrator."
    );
  }

  if (profile.role !== requiredRole) {
    throw new Error(
      `Access denied. ${requiredRole.charAt(0).toUpperCase() + requiredRole.slice(1)} role required.`
    );
  }
}
