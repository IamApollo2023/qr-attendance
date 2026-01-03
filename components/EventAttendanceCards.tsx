"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib";
import { EventCard } from "./EventCard";
import type { Event, EventStats } from "@/types";
import { useToastContext } from "@/components/ToastProvider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const { success, error: showError } = useToastContext();

  // Refetch events to get updated is_active status
  const refetchEvents = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error refetching events:", error);
        return;
      }

      // Note: We can't update events state directly since it's initialized from props
      // But we can update activeEventId which controls the isActive prop
    } catch (err) {
      console.error("Failed to refetch events:", err);
    }
  }, []);

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

          // Immediately update activeEventId based on payload if it's an is_active change
          const newData = payload.new as { id?: string; is_active?: boolean };
          const oldData = payload.old as { id?: string; is_active?: boolean };

          if (oldData?.is_active !== newData?.is_active) {
            // If an event was activated, set it as active
            if (newData?.is_active === true && newData?.id) {
              setActiveEventId(newData.id);
            }
            // If an event was deactivated and it was the current active one, clear it
            else if (
              newData?.is_active === false &&
              newData?.id === activeEventId
            ) {
              setActiveEventId(undefined);
            }
          }

          // Also refetch to ensure consistency
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
  }, [refetchActiveEvent, activeEventId]);

  const handleSetActive = async (eventId: string) => {
    if (loadingEventId) return;

    setLoadingEventId(eventId);
    try {
      // First, verify the event exists and we can read it
      const { data: existingEvent, error: checkError } = await supabase
        .from("events")
        .select("id, name, is_active")
        .eq("id", eventId)
        .maybeSingle();

      if (checkError) {
        console.error("Error checking event:", checkError);
        throw new Error(`Failed to verify event: ${checkError.message}`);
      }

      if (!existingEvent) {
        throw new Error(
          "Event not found. Please refresh the page and try again."
        );
      }

      console.log("Activating event:", {
        eventId,
        name: existingEvent.name,
        currentIsActive: existingEvent.is_active,
      });

      // Just activate the selected event - the database trigger will automatically
      // deactivate all other events
      const { data: updatedEvent, error: activateError } = await supabase
        .from("events")
        .update({ is_active: true })
        .eq("id", eventId)
        .select("id, is_active, name")
        .maybeSingle();

      if (activateError) {
        console.error("Error activating event:", {
          error: activateError,
          eventId,
          code: activateError.code,
          message: activateError.message,
          details: activateError.details,
          hint: activateError.hint,
        });
        throw activateError;
      }

      // Verify the update actually returned a row and changed is_active to true
      if (!updatedEvent) {
        throw new Error(
          "Update was blocked. Please check your permissions or try again."
        );
      }

      if (!updatedEvent.is_active) {
        console.error(
          "Update returned but is_active is not true:",
          updatedEvent
        );
        throw new Error("Failed to activate event. Update did not succeed.");
      }

      console.log("Event activated successfully:", {
        eventId: updatedEvent.id,
        name: updatedEvent.name,
        is_active: updatedEvent.is_active,
      });

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

  const handleDeactivateClick = () => {
    setShowDeactivateDialog(true);
  };

  const handleDeactivateConfirm = async () => {
    if (loadingEventId || !activeEventId) return;

    const deactivatingEventId = activeEventId; // Store the ID we're deactivating
    setShowDeactivateDialog(false);
    setLoadingEventId(deactivatingEventId);
    try {
      // Deactivate all events (Supabase requires a WHERE clause)
      const { error: deactivateError } = await supabase
        .from("events")
        .update({ is_active: false })
        .eq("is_active", true);

      if (deactivateError) throw deactivateError;

      // Immediately update state to reflect deactivation
      // This ensures UI updates immediately before real-time subscription fires
      setActiveEventId(undefined);

      // Verify no active event exists in database
      const { data: activeEvent, error: fetchError } = await supabase
        .from("events")
        .select("id")
        .eq("is_active", true)
        .maybeSingle();

      if (fetchError) {
        console.error("Error verifying deactivation:", fetchError);
      }

      // Double-check: if somehow an event is still active, update state
      // Otherwise, keep it as undefined (no active event)
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
      // Always clear loading state after operation completes
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

  // Find the active event name for the dialog
  const activeEvent = events.find((e) => e.id === activeEventId);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            stats={event.stats}
            isActive={event.id === activeEventId}
            onSetActive={handleSetActive}
            onDeactivate={handleDeactivateClick}
            isLoading={loadingEventId === event.id}
          />
        ))}
      </div>

      {/* Deactivate Confirmation Dialog */}
      <Dialog
        open={showDeactivateDialog}
        onOpenChange={setShowDeactivateDialog}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Deactivate Event</DialogTitle>
            <DialogDescription>
              Are you sure you want to deactivate{" "}
              <strong>{activeEvent?.name}</strong>? This will deactivate all
              events. You will need to activate an event before scanners can
              record attendance.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowDeactivateDialog(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleDeactivateConfirm}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
              disabled={loadingEventId !== null}
            >
              {loadingEventId ? "Deactivating..." : "Deactivate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
