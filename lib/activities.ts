import { supabase } from "./supabase";
import type { Activity, ActivityStatus } from "@/types";

// Re-export for backward compatibility
export type { Activity };

export interface CreateActivityInput {
  name: string;
  description?: string;
  date?: string; // ISO date string (YYYY-MM-DD)
  location?: string;
  status: ActivityStatus;
  notes?: string;
}

/**
 * Create a new activity
 */
export async function createActivity(
  input: CreateActivityInput
): Promise<Activity> {
  const { data, error } = await supabase
    .from("activities")
    .insert({
      name: input.name,
      description: input.description,
      date: input.date,
      location: input.location,
      status: input.status,
      notes: input.notes,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as Activity;
}

/**
 * Get activity by ID
 */
export async function getActivityById(id: string): Promise<Activity | null> {
  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null; // Not found
    }
    throw error;
  }

  return data as Activity;
}

/**
 * Get all activities
 */
export async function getAllActivities(): Promise<Activity[]> {
  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data || []) as Activity[];
}

/**
 * Update an activity
 */
export async function updateActivity(
  id: string,
  input: Partial<CreateActivityInput>
): Promise<Activity> {
  const { data, error } = await supabase
    .from("activities")
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as Activity;
}

/**
 * Delete an activity
 */
export async function deleteActivity(id: string): Promise<void> {
  const { error } = await supabase.from("activities").delete().eq("id", id);

  if (error) {
    throw error;
  }
}
