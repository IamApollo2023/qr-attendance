import { useState, useCallback, useEffect, useRef } from "react";
import { supabase } from "@/lib";

export interface ScannedAttendee {
  attendee_id: string;
  scanned_at: string;
  name?: string;
}

/**
 * Hook for managing scanned attendees list
 * Single responsibility: Fetch and manage the list of scanned attendees
 * Ensures only data for the currently active event is displayed
 */
export function useScannedAttendees(eventId?: string, activatedAt?: string) {
  const [scannedAttendees, setScannedAttendees] = useState<ScannedAttendee[]>(
    []
  );
  const [totalScannedCount, setTotalScannedCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const previousEventIdRef = useRef<string | undefined>(eventId);
  const currentFetchEventIdRef = useRef<string | undefined>(eventId);

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/39a2ccae-d45f-4181-af1c-1cb7d7f33d6d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useScannedAttendees.ts:18',message:'Hook initialized/re-rendered',data:{eventId,previousEventId:previousEventIdRef.current,scannedAttendeesCount:scannedAttendees.length,totalCount:totalScannedCount},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion

  /**
   * Fetch scanned attendees from database
   */
  const fetchScannedAttendees = useCallback(async () => {
    // Use the current eventId from ref to avoid stale closures
    const fetchForEventId = previousEventIdRef.current;

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/39a2ccae-d45f-4181-af1c-1cb7d7f33d6d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useScannedAttendees.ts:30',message:'fetchScannedAttendees called',data:{fetchForEventId,currentEventIdRef:previousEventIdRef.current,propEventId:eventId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion

    if (!fetchForEventId) {
      // Clear data if no event is active
      setScannedAttendees([]);
      setTotalScannedCount(0);
      return;
    }

    // Track which event this fetch is for
    currentFetchEventIdRef.current = fetchForEventId;

    setIsLoading(true);
    try {
      // Build query - filter by event_id and optionally by activation timestamp
      let countQuery = supabase
        .from("qr_attendance")
        .select("*", { count: "exact", head: true })
        .eq("event_id", fetchForEventId);

      // Only show records scanned after event activation
      // Use activatedAt from closure (passed as parameter)
      if (activatedAt) {
        countQuery = countQuery.gte("scanned_at", activatedAt);
      }

      // Get total count first
      const { count, error: countError } = await countQuery;

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/39a2ccae-d45f-4181-af1c-1cb7d7f33d6d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useScannedAttendees.ts:50',message:'Count query executed',data:{fetchForEventId,activatedAt,count,countError:countError?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion

      // Check if event changed during fetch - if so, discard results
      if (currentFetchEventIdRef.current !== previousEventIdRef.current) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/39a2ccae-d45f-4181-af1c-1cb7d7f33d6d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useScannedAttendees.ts:53',message:'Event changed during count fetch - discarding',data:{currentFetch:currentFetchEventIdRef.current,previous:previousEventIdRef.current},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        // #endregion
        return;
      }

      if (countError) throw countError;

      // Check again before setting count
      if (currentFetchEventIdRef.current !== previousEventIdRef.current) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/39a2ccae-d45f-4181-af1c-1cb7d7f33d6d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useScannedAttendees.ts:60',message:'Event changed before setting count - discarding',data:{currentFetch:currentFetchEventIdRef.current,previous:previousEventIdRef.current},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        // #endregion
        return;
      }

      setTotalScannedCount(count || 0);
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/39a2ccae-d45f-4181-af1c-1cb7d7f33d6d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useScannedAttendees.ts:64',message:'Total count set',data:{count,fetchForEventId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion

      // Build query - filter by event_id and optionally by activation timestamp
      let recordsQuery = supabase
        .from("qr_attendance")
        .select(
          `
          attendee_id,
          scanned_at,
          event_id,
          member:members (
            first_name,
            last_name
          )
        `
        )
        .eq("event_id", fetchForEventId);

      // Only show records scanned after event activation
      // Use activatedAt from closure (passed as parameter)
      if (activatedAt) {
        recordsQuery = recordsQuery.gte("scanned_at", activatedAt);
      }

      // Fetch all scanned attendees (removed limit to show all)
      const { data: records, error } = await recordsQuery
        .order("scanned_at", { ascending: false });

      // Check if event changed during fetch - if so, discard results
      if (currentFetchEventIdRef.current !== previousEventIdRef.current) {
        return;
      }

      if (error) throw error;

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/39a2ccae-d45f-4181-af1c-1cb7d7f33d6d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useScannedAttendees.ts:87',message:'Records fetched from database',data:{fetchForEventId,activatedAt,recordsCount:records?.length,firstRecord:records?.[0] ? {attendee_id:records[0].attendee_id,event_id:records[0].event_id,scanned_at:records[0].scanned_at} : null,allEventIds:records?.slice(0,5).map((r:any)=>r.event_id),allAttendeeIds:records?.slice(0,5).map((r:any)=>r.attendee_id)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion

      const attendees: ScannedAttendee[] = (records || []).map(
        (record: any) => ({
          attendee_id: record.attendee_id,
          scanned_at: record.scanned_at,
          name:
            record.member && record.member.first_name && record.member.last_name
              ? `${record.member.first_name} ${record.member.last_name}`
              : record.attendee_id,
        })
      );

      // Final check before setting state - ensure event hasn't changed
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/39a2ccae-d45f-4181-af1c-1cb7d7f33d6d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useScannedAttendees.ts:100',message:'Before setting scannedAttendees',data:{fetchForEventId,attendeesCount:attendees.length,currentFetch:currentFetchEventIdRef.current,previous:previousEventIdRef.current,willSet:currentFetchEventIdRef.current === previousEventIdRef.current,firstAttendee:attendees[0]?.attendee_id,firstAttendeeName:attendees[0]?.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      if (currentFetchEventIdRef.current === previousEventIdRef.current) {
        setScannedAttendees(attendees);
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/39a2ccae-d45f-4181-af1c-1cb7d7f33d6d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useScannedAttendees.ts:102',message:'scannedAttendees state updated',data:{attendeesCount:attendees.length,fetchForEventId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
      } else {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/39a2ccae-d45f-4181-af1c-1cb7d7f33d6d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useScannedAttendees.ts:105',message:'Event changed - NOT setting scannedAttendees',data:{currentFetch:currentFetchEventIdRef.current,previous:previousEventIdRef.current,attendeesCount:attendees.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        // #endregion
      }
    } catch (err: any) {
      console.error("Failed to load existing records:", err);
      // Only clear/update if this fetch is still for the current event
      if (currentFetchEventIdRef.current === previousEventIdRef.current) {
        setScannedAttendees([]);
        setTotalScannedCount(0);
      }
    } finally {
      // Only update loading state if this fetch is still for the current event
      if (currentFetchEventIdRef.current === previousEventIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [activatedAt]); // Include activatedAt so callback uses latest activation timestamp

  /**
   * Clear data immediately when event changes or activation timestamp changes
   * This ensures no stale data from previous events/activations is displayed
   * This effect runs FIRST (before the fetch effect) to ensure clearing happens synchronously
   */
  useEffect(() => {
    // If event changed or activation timestamp changed, immediately clear the list
    const eventChanged = previousEventIdRef.current !== eventId;
    if (eventChanged) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/39a2ccae-d45f-4181-af1c-1cb7d7f33d6d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useScannedAttendees.ts:126',message:'Event changed - clearing effect triggered',data:{from:previousEventIdRef.current,to:eventId,activatedAt,currentScannedCount:scannedAttendees.length,currentTotalCount:totalScannedCount},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      console.log("Event changed, clearing scanned attendees:", {
        from: previousEventIdRef.current,
        to: eventId,
        activatedAt,
      });
      // Immediately clear the list - this happens synchronously
      setScannedAttendees([]);
      setTotalScannedCount(0);
      previousEventIdRef.current = eventId;
      currentFetchEventIdRef.current = eventId;
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/39a2ccae-d45f-4181-af1c-1cb7d7f33d6d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useScannedAttendees.ts:135',message:'Clearing complete - refs updated',data:{previousEventIdRef:previousEventIdRef.current,currentFetchEventIdRef:currentFetchEventIdRef.current},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
    } else {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/39a2ccae-d45f-4181-af1c-1cb7d7f33d6d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useScannedAttendees.ts:137',message:'Event unchanged - clearing effect skipped',data:{eventId,previousEventId:previousEventIdRef.current,activatedAt},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
    }
  }, [eventId, activatedAt, scannedAttendees.length, totalScannedCount]);

  /**
   * Auto-refresh scanned attendees list
   * This effect runs AFTER the clearing effect to ensure data is cleared first
   */
  useEffect(() => {
    if (!eventId) {
      // Clear data if no event is active
      setScannedAttendees([]);
      setTotalScannedCount(0);
      return;
    }

    // Use a microtask to ensure this runs after the clearing effect
    // This guarantees the list is cleared before we fetch new data
    Promise.resolve().then(() => {
      // Double-check event is still the same before fetching
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/39a2ccae-d45f-4181-af1c-1cb7d7f33d6d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useScannedAttendees.ts:155',message:'Fetch effect - checking before fetch',data:{eventId,previousEventIdRef:previousEventIdRef.current,willFetch:previousEventIdRef.current === eventId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      if (previousEventIdRef.current === eventId) {
        console.log("Fetching scanned attendees for event:", eventId);
        fetchScannedAttendees();
      } else {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/39a2ccae-d45f-4181-af1c-1cb7d7f33d6d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useScannedAttendees.ts:160',message:'Fetch skipped - event mismatch',data:{eventId,previousEventIdRef:previousEventIdRef.current},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        // #endregion
      }
    });

    // Refresh every 30 seconds, but only for the current event
    const interval = setInterval(() => {
      // Double-check event hasn't changed before fetching
      const currentEventId = previousEventIdRef.current;
      if (currentEventId === eventId && currentFetchEventIdRef.current === eventId) {
        fetchScannedAttendees();
      }
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [eventId, activatedAt, fetchScannedAttendees]);

  return {
    scannedAttendees,
    totalScannedCount,
    isLoading,
    fetchScannedAttendees,
  };
}
