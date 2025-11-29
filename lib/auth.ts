import { supabase } from './supabase'

export type UserRole = 'scanner' | 'admin'

export interface UserProfile {
  id: string
  email: string
  role: UserRole
  created_at: string
  updated_at: string
}

/**
 * Get the current user's profile with role
 */
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return null
    }

    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error || !profile) {
      return null
    }

    return profile as UserProfile
  } catch (error) {
    console.error('Error getting user profile:', error)
    return null
  }
}

/**
 * Check if user has a specific role
 */
export async function hasRole(requiredRole: UserRole): Promise<boolean> {
  const profile = await getCurrentUserProfile()
  return profile?.role === requiredRole
}

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw error
  }

  return data
}

/**
 * Sign out
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) {
    throw error
  }
}

/**
 * Get current session
 */
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}


