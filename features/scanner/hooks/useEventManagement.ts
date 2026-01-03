import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/lib";

/**
 * Hook for managing active event
 * Single responsibility: Fetch and track the currently active event
 */
export function useEventManagement(
  initialEventId?: string,
  initialEventName?: string
) {
  const [currentEventId, setCurrentEventId] = useState<string | undefined>(
    initialEventId
  );
  const [currentEventName, setCurrentEventName] = useState<string | undefined>(
    initialEventName
  );

  /**
   * Fetch active event from database
   */
  const fetchActiveEvent = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("name, id")
        .eq("is_active", true)
        .maybeSingle();

      if (error) {
        console.error("Error fetching active event:", error);
        return;
      }

      if (data) {
        setCurrentEventId(data.name);
        setCurrentEventName(data.name);
      } else {
        setCurrentEventId(undefined);
        setCurrentEventName(undefined);
      }
    } catch (err) {
      console.error("Failed to fetch active event:", err);
    }
  }, []);

  /**
   * Set up real-time subscription for events table
   */
  useEffect(() => {
    const channel = supabase
      .channel("events_changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "events",
        },
        (payload) => {
          const oldData = payload.old as {
            is_active?: boolean;
            name?: string;
          };
          const newData = payload.new as {
            is_active?: boolean;
            name?: string;
          };

          // Process when is_active field changes
          if (oldData?.is_active !== newData?.is_active) {
            // Event became active
            if (newData?.is_active === true && newData?.name) {
              const oldEventName = currentEventName;
              setCurrentEventId(newData.name);
              setCurrentEventName(newData.name);

              // Return info for toast notification
              if (oldEventName !== newData.name) {
                return {
                  type: "info" as const,
                  title: "Event Updated",
                  message: `Active event changed to: ${newData.name}`,
                };
              }
            }
            // Event became inactive
            else if (
              newData?.is_active === false &&
              newData?.name === currentEventName
            ) {
              // Refetch to get the new active event
              fetchActiveEvent();
              return {
                type: "info" as const,
                title: "Event Deactivated",
                message: `${newData.name} has been deactivated`,
              };
            }
          }
          return null;
        }
      )
      .subscribe((status) => {
        console.log("Events subscription status:", status);
      });

    // Initial fetch
    fetchActiveEvent();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchActiveEvent, currentEventName]);

  /**
   * Update current event when props change
   */
  useEffect(() => {
    setCurrentEventId(initialEventId);
    setCurrentEventName(initialEventName);
  }, [initialEventId, initialEventName]);

  return {
    currentEventId,
    currentEventName,
    fetchActiveEvent,
  };
}
