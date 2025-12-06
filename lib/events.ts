import { createClient } from "./supabase-server";
import type { Event, EventStats } from "@/types";

/**
 * Get all events
 * Returns events in a specific order: Worship Service, Night of Power, Life Group
 */
export async function getAllEvents(): Promise<Event[]> {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error("Authentication error in getAllEvents:", authError);
    // Return empty array if not authenticated rather than throwing
    return [];
  }

  const { data, error } = await supabase.from("events").select("*");

  if (error) {
    // Check if it's a table doesn't exist error
    if (error.code === "42P01" || error.message?.includes("does not exist")) {
      console.warn(
        "Events table does not exist. Please run the SQL migration: sql/events-table-setup.sql"
      );
      return [];
    }
    console.error("Error fetching events:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    throw error;
  }

  // Define the desired order
  const eventOrder = [
    "Worship Service",
    "Night of Power",
    "Life Group",
    "Youth Zone",
  ];

  // Sort events according to the specified order
  const sortedEvents = (data || []).sort((a, b) => {
    const indexA = eventOrder.indexOf(a.name);
    const indexB = eventOrder.indexOf(b.name);

    // If both events are in the order list, sort by their index
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }
    // If only one is in the list, prioritize it
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    // If neither is in the list, maintain original order
    return 0;
  });

  return sortedEvents as Event[];
}

/**
 * Get event by ID
 */
export async function getEventById(id: string): Promise<Event | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No rows returned
      return null;
    }
    console.error("Error fetching event by ID:", error);
    throw error;
  }

  return data as Event;
}

/**
 * Get event by name
 */
export async function getEventByName(name: string): Promise<Event | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("name", name)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No rows returned
      return null;
    }
    console.error("Error fetching event by name:", error);
    throw error;
  }

  return data as Event;
}

/**
 * Get the currently active event
 */
export async function getActiveEvent(): Promise<Event | null> {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error("Authentication error in getActiveEvent:", authError);
    return null;
  }

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("is_active", true)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No rows returned - no active event
      return null;
    }
    // Check if it's a table doesn't exist error
    if (error.code === "42P01" || error.message?.includes("does not exist")) {
      console.warn(
        "Events table does not exist. Please run the SQL migration: sql/events-table-setup.sql"
      );
      return null;
    }
    console.error("Error fetching active event:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    throw error;
  }

  return data as Event;
}

/**
 * Set an event as active (deactivates all others)
 * Note: The database trigger ensures only one event is active at a time
 */
export async function setActiveEvent(id: string): Promise<Event> {
  const supabase = await createClient();

  // First, deactivate all events
  const { error: deactivateError } = await supabase
    .from("events")
    .update({ is_active: false })
    .neq("id", id);

  if (deactivateError) {
    console.error("Error deactivating events:", deactivateError);
    throw deactivateError;
  }

  // Then activate the selected event
  const { data, error } = await supabase
    .from("events")
    .update({ is_active: true })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error setting active event:", error);
    throw error;
  }

  return data as Event;
}

/**
 * Get attendance statistics for an event
 */
export async function getEventStats(
  eventIdOrName: string
): Promise<EventStats> {
  const supabase = await createClient();

  // Get total count
  const { count: totalCount } = await supabase
    .from("qr_attendance")
    .select("*", { count: "exact", head: true })
    .eq("event_id", eventIdOrName);

  // Get today's count
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const { count: todayCount } = await supabase
    .from("qr_attendance")
    .select("*", { count: "exact", head: true })
    .eq("event_id", eventIdOrName)
    .gte("scanned_at", todayStart.toISOString())
    .lte("scanned_at", todayEnd.toISOString());

  // Get unique attendees count
  const { data: uniqueData } = await supabase
    .from("qr_attendance")
    .select("attendee_id", { count: "exact", head: false })
    .eq("event_id", eventIdOrName);

  const unique = new Set((uniqueData || []).map((r) => r.attendee_id)).size;

  return {
    total: totalCount || 0,
    today: todayCount || 0,
    unique,
  };
}

/**
 * Get all events with their statistics
 */
export async function getAllEventsWithStats(): Promise<
  Array<Event & { stats: EventStats }>
> {
  try {
    const events = await getAllEvents();

    // If no events, return empty array
    if (events.length === 0) {
      return [];
    }

    const eventsWithStats = await Promise.all(
      events.map(async (event) => {
        try {
          const stats = await getEventStats(event.name);
          return {
            ...event,
            stats,
          };
        } catch (error) {
          // If stats fail, return event with zero stats
          console.warn(`Failed to get stats for event ${event.name}:`, error);
          return {
            ...event,
            stats: {
              total: 0,
              today: 0,
              unique: 0,
            },
          };
        }
      })
    );

    return eventsWithStats;
  } catch (error) {
    console.error("Error in getAllEventsWithStats:", error);
    return [];
  }
}
