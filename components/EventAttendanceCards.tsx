"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib";
import { EventCard } from "./EventCard";
import type { Event, EventStats } from "@/types";
import { useToastContext } from "@/components/ToastProvider";

interface EventWithStats extends Event {
  stats: EventStats;
}

interface EventAttendanceCardsProps {
  events: EventWithStats[];
  activeEventId?: string;
}

export function EventAttendanceCards({
  events: initialEvents,
  activeEventId: initialActiveEventId,
}: EventAttendanceCardsProps) {
  const [events] = useState<EventWithStats[]>(initialEvents);
  const [activeEventId, setActiveEventId] = useState<string | undefined>(
    initialActiveEventId
  );
  const [loadingEventId, setLoadingEventId] = useState<string | null>(null);
  const { success, error: showError } = useToastContext();

  // Refetch active event from database
  const refetchActiveEvent = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("id")
        .eq("is_active", true)
        .maybeSingle();

      if (error) {
        console.error("Error refetching active event:", error);
        return;
      }

      setActiveEventId(data?.id || undefined);
    } catch (err) {
      console.error("Failed to refetch active event:", err);
    }
  }, []);

  // Set up realtime subscription to sync with database changes
  useEffect(() => {
    const channel = supabase
      .channel("events_active_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "events",
        },
        async (payload) => {
          console.log(
            "Event change detected in EventAttendanceCards:",
            payload
          );
          // Refetch active event when any event's is_active changes
          await refetchActiveEvent();
        }
      )
      .subscribe((status) => {
        console.log("EventAttendanceCards subscription status:", status);
      });

    // Initial refetch to ensure we have the latest state
    refetchActiveEvent();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetchActiveEvent]);

  const handleSetActive = async (eventId: string) => {
    if (loadingEventId) return;

    setLoadingEventId(eventId);
    try {
      // First, deactivate all events
      const { error: deactivateError } = await supabase
        .from("events")
        .update({ is_active: false })
        .neq("id", eventId);

      if (deactivateError) throw deactivateError;

      // Then activate the selected event
      const { error: activateError } = await supabase
        .from("events")
        .update({ is_active: true })
        .eq("id", eventId);

      if (activateError) throw activateError;

      // Refetch the active event from database to ensure consistency
      const { data: activeEvent, error: fetchError } = await supabase
        .from("events")
        .select("id")
        .eq("is_active", true)
        .maybeSingle();

      if (fetchError) {
        console.error("Error fetching active event after update:", fetchError);
      }

      // Update state with the actual active event from database
      setActiveEventId(activeEvent?.id || eventId);
      success("Event Activated", "The active event has been updated.", 2000);
    } catch (err: any) {
      console.error("Error setting active event:", err);
      showError(
        "Failed to Set Active Event",
        err.message || "An error occurred while setting the active event.",
        4000
      );
    } finally {
      setLoadingEventId(null);
    }
  };

  const handleDeactivate = async () => {
    if (loadingEventId || !activeEventId) return;

    setLoadingEventId(activeEventId);
    try {
      // Deactivate all events (Supabase requires a WHERE clause)
      const { error: deactivateError } = await supabase
        .from("events")
        .update({ is_active: false })
        .eq("is_active", true);

      if (deactivateError) throw deactivateError;

      // Verify no active event exists in database
      const { data: activeEvent, error: fetchError } = await supabase
        .from("events")
        .select("id")
        .eq("is_active", true)
        .maybeSingle();

      if (fetchError) {
        console.error("Error verifying deactivation:", fetchError);
      }

      // Update state based on actual database state
      setActiveEventId(activeEvent?.id || undefined);
      success("Event Deactivated", "All events have been deactivated.", 2000);
    } catch (err: any) {
      console.error("Error deactivating event:", err);
      showError(
        "Failed to Deactivate Event",
        err.message || "An error occurred while deactivating the event.",
        4000
      );
    } finally {
      setLoadingEventId(null);
    }
  };

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <p className="text-lg">No events found.</p>
        <p className="text-sm mt-2">
          Please contact an admin to set up events.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          stats={event.stats}
          isActive={event.id === activeEventId}
          onSetActive={handleSetActive}
          onDeactivate={handleDeactivate}
          isLoading={loadingEventId === event.id}
        />
      ))}
    </div>
  );
}
