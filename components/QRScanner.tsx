"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Camera, CameraOff, CheckCircle2, List, X } from "lucide-react";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";
import { supabase, signOut, type AttendanceRecord } from "@/lib";
import { useToastContext } from "@/components/ToastProvider";
import { LogoutConfirmDialog } from "@/components/LogoutConfirmDialog";

interface ScannedAttendee {
  attendee_id: string;
  scanned_at: string;
  name?: string;
}

interface QRScannerProps {
  eventId?: string;
  eventName?: string;
  onScanSuccess?: (attendeeId: string) => void;
}

export default function QRScanner({
  eventId,
  eventName,
  onScanSuccess,
}: QRScannerProps) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scannedAttendees, setScannedAttendees] = useState<ScannedAttendee[]>(
    []
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [facingMode, setFacingMode] = useState<"environment" | "user">(
    "environment"
  );
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const processedCodesRef = useRef<Set<string>>(new Set());
  const { success, error: showError, warning, info } = useToastContext();
  const [lastSync, setLastSync] = useState(() => new Date());
  const [isListOpen, setIsListOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [currentEventId, setCurrentEventId] = useState<string | undefined>(
    eventId
  );
  const [currentEventName, setCurrentEventName] = useState<string | undefined>(
    eventName
  );
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  // Fetch scanned attendees from database
  const fetchScannedAttendees = useCallback(async () => {
    try {
      const { data: records, error } = await supabase
        .from("qr_attendance")
        .select(
          `
          attendee_id,
          scanned_at,
          member:members (
            first_name,
            last_name
          )
        `
        )
        .eq("event_id", currentEventId || "default")
        .order("scanned_at", { ascending: false })
        .limit(50);

      if (error) throw error;

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
      setScannedAttendees(attendees);
    } catch (err) {
      console.error("Failed to load existing records:", err);
    }
  }, [currentEventId]);

  // Auth is already verified by middleware - set authChecked immediately
  // This prevents redundant auth fetches
  useEffect(() => {
    setAuthChecked(true);
  }, []);

  // Detect mobile viewport with debounced resize listener
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkMobile();
    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkMobile, 150);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setLastSync(new Date());
      // Refresh scanned attendees list every 30 seconds to stay in sync with database
      if (authChecked) {
        fetchScannedAttendees();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [authChecked, fetchScannedAttendees]);

  // Initialize QR code reader
  useEffect(() => {
    if (!authChecked) return;

    codeReaderRef.current = new BrowserMultiFormatReader();
    return () => {
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
      }
    };
  }, [authChecked]);

  // Play success sound
  const playSuccessSound = () => {
    try {
      const audioContext = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // More pleasant success sound (two-tone chime)
      oscillator.frequency.value = 800;
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.15
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.15);

      // Second tone for chime effect
      setTimeout(() => {
        const oscillator2 = audioContext.createOscillator();
        const gainNode2 = audioContext.createGain();
        oscillator2.connect(gainNode2);
        gainNode2.connect(audioContext.destination);
        oscillator2.frequency.value = 1000;
        oscillator2.type = "sine";
        gainNode2.gain.setValueAtTime(0.25, audioContext.currentTime);
        gainNode2.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + 0.15
        );
        oscillator2.start(audioContext.currentTime);
        oscillator2.stop(audioContext.currentTime + 0.15);
      }, 100);
    } catch (err) {
      // Audio context might not be available, ignore
      console.warn("Could not play sound:", err);
    }
  };

  // Play error sound
  const playErrorSound = () => {
    try {
      const audioContext = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Lower, harsher tone for error
      oscillator.frequency.value = 400;
      oscillator.type = "sawtooth";

      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.3
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (err) {
      console.warn("Could not play error sound:", err);
    }
  };

  // Fetch active event from database
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

  // Set up realtime subscription for events table
  useEffect(() => {
    if (!authChecked) return;

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
          const oldData = payload.old as { is_active?: boolean; name?: string };
          const newData = payload.new as { is_active?: boolean; name?: string };

          // Process when is_active field changes
          if (oldData?.is_active !== newData?.is_active) {
            // Event became active - use payload directly
            if (newData?.is_active === true && newData?.name) {
              const oldEventName = currentEventName;
              setCurrentEventId(newData.name);
              setCurrentEventName(newData.name);

              // Show toast only if event actually changed
              if (oldEventName !== newData.name) {
                info(
                  "Event Updated",
                  `Active event changed to: ${newData.name}`,
                  3000
                );
              }
            }
            // Event became inactive - only refetch if it's the current active event
            // Otherwise, wait for the activation event (trigger ensures one is activated)
            else if (
              newData?.is_active === false &&
              newData?.name === currentEventName
            ) {
              // Current event was deactivated - show toast and refetch to get the new active event
              info(
                "Event Deactivated",
                `${newData.name} has been deactivated`,
                2000
              );
              // Refetch to get the new active event (trigger ensures one is activated)
              fetchActiveEvent();
            }
          }
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
  }, [authChecked, fetchActiveEvent, currentEventName, info]);

  // Update current event when props change (initial load)
  useEffect(() => {
    setCurrentEventId(eventId);
    setCurrentEventName(eventName);
  }, [eventId, eventName]);

  // Get gradient classes based on event name
  const getEventGradient = (eventName?: string): string => {
    switch (eventName) {
      case "Worship Service":
        return "bg-gradient-to-r from-[#1c2d44] via-[#274464] to-[#5b84ad]";
      case "Life Group":
        return "bg-gradient-to-r from-green-700 via-green-600 to-green-500";
      case "Night of Power":
        return "bg-gradient-to-r from-purple-900 via-purple-700 to-purple-600";
      case "Youth Zone":
        return "bg-gradient-to-r from-[#b89a0f] via-[#ffde17] to-[#d4b814]";
      default:
        return "bg-gradient-to-r from-[#1c2d44] via-[#274464] to-[#5b84ad]";
    }
  };

  // Load existing attendance records on mount and when currentEventId changes
  useEffect(() => {
    if (!authChecked) return;
    fetchScannedAttendees();
  }, [currentEventId, authChecked, fetchScannedAttendees]);

  // Handle successful scan
  const handleScanSuccess = useCallback(
    async (attendeeId: string) => {
      // Prevent duplicate scans within 2 seconds
      if (processedCodesRef.current.has(attendeeId)) {
        return;
      }

      processedCodesRef.current.add(attendeeId);
      setTimeout(() => {
        processedCodesRef.current.delete(attendeeId);
      }, 2000);

      setIsProcessing(true);

      try {
        // FIRST: Validate that member exists in members table (STRICT VALIDATION)
        const { data: member, error: memberError } = await supabase
          .from("members")
          .select("*")
          .eq("member_id", attendeeId)
          .single();

        if (memberError || !member) {
          // Member not registered - REJECT scan
          playErrorSound();
          showError(
            "Member Not Registered",
            `Member ID ${attendeeId} is not registered in the system. Please register the member first.`,
            4000
          );
          setIsProcessing(false);
          return;
        }

        // Check for duplicate in database
        const { data: existing, error: queryError } = await supabase
          .from("qr_attendance")
          .select("*")
          .eq("attendee_id", attendeeId)
          .eq("event_id", currentEventId || "default")
          .order("scanned_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (queryError && queryError.code !== "PGRST116") {
          throw queryError;
        }

        if (existing) {
          // Duplicate scan - show warning
          playErrorSound();
          warning(
            "Already Scanned",
            `${member.first_name} ${member.last_name} (${attendeeId}) was already scanned at ${new Date(
              existing.scanned_at
            ).toLocaleTimeString()}`,
            3000
          );
          setIsProcessing(false);
          return;
        }

        // Get current user ID for tracking who scanned
        const {
          data: { user },
        } = await supabase.auth.getUser();

        // Save to Supabase with member_id foreign key
        const attendanceRecord: AttendanceRecord = {
          attendee_id: attendeeId,
          scanned_at: new Date().toISOString(),
          event_id: currentEventId || "default",
        };

        // Add scanned_by and member_id if user is authenticated
        const recordToInsert: any = { ...attendanceRecord };
        if (user) {
          recordToInsert.scanned_by = user.id;
        }
        recordToInsert.member_id = member.id; // Link to members table

        const { data: insertedRecord, error: insertError } = await supabase
          .from("qr_attendance")
          .insert([recordToInsert])
          .select()
          .single();

        if (insertError) {
          throw insertError;
        }

        // Refetch from database to ensure consistency
        await fetchScannedAttendees();

        // Play success sound
        playSuccessSound();

        // Show success alert with member name
        success(
          "Attendance Recorded!",
          `${member.first_name} ${member.last_name} (${attendeeId}) scanned successfully`,
          2000
        );

        // Call callback if provided
        if (onScanSuccess) {
          onScanSuccess(attendeeId);
        }

        setError(null);
      } catch (err: any) {
        console.error("Error saving attendance:", err);
        const errorMessage =
          err.message || "Unknown error occurred while saving attendance";

        // Play error sound
        playErrorSound();

        // Show error alert
        showError("Scan Failed", errorMessage, 4000);

        setError(null);
      } finally {
        setIsProcessing(false);
      }
    },
    [currentEventId, onScanSuccess, fetchScannedAttendees]
  );

  // Request camera permission
  const requestCameraPermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
      });
      stream.getTracks().forEach((track) => track.stop());
      setHasPermission(true);
      setError(null);
    } catch (err: any) {
      setHasPermission(false);
      if (
        err.name === "NotAllowedError" ||
        err.name === "PermissionDeniedError"
      ) {
        setError(
          "Camera permission denied. Please allow camera access in your browser settings."
        );
      } else if (
        err.name === "NotFoundError" ||
        err.name === "DevicesNotFoundError"
      ) {
        setError("No camera found on this device.");
      } else {
        setError("Failed to access camera: " + err.message);
      }
    }
  }, [facingMode]);

  // Start scanning
  const startScanning = useCallback(async () => {
    if (!videoRef.current || !codeReaderRef.current) return;

    try {
      setError(null);
      setIsScanning(true);

      // Get available video devices
      const videoInputDevices =
        await codeReaderRef.current.listVideoInputDevices();

      if (videoInputDevices.length === 0) {
        setError("No camera devices found.");
        setIsScanning(false);
        return;
      }

      // Find device with matching facing mode
      let selectedDeviceId: string | undefined;
      for (const device of videoInputDevices) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { deviceId: { exact: device.deviceId } },
          });
          const track = stream.getVideoTracks()[0];
          const settings = track.getSettings();
          stream.getTracks().forEach((t) => t.stop());

          if (settings.facingMode === facingMode) {
            selectedDeviceId = device.deviceId;
            break;
          }
        } catch {
          // Continue to next device
        }
      }

      // If no exact match, use first available device
      if (!selectedDeviceId && videoInputDevices.length > 0) {
        selectedDeviceId = videoInputDevices[0].deviceId;
      }

      setHasPermission(true);

      // Start scanning using decodeFromVideoDevice
      codeReaderRef.current.decodeFromVideoDevice(
        selectedDeviceId ?? null,
        videoRef.current,
        async (result, error) => {
          if (result) {
            const attendeeId = result.getText();
            if (attendeeId) {
              await handleScanSuccess(attendeeId);
            }
          } else if (error && !(error instanceof NotFoundException)) {
            // NotFoundException is expected when no QR code is found
            console.error("Scan error:", error);
          }
        }
      );

      // Store the stream reference from the video element
      if (videoRef.current.srcObject) {
        streamRef.current = videoRef.current.srcObject as MediaStream;
      }
    } catch (err: any) {
      setIsScanning(false);
      if (
        err.name === "NotAllowedError" ||
        err.name === "PermissionDeniedError"
      ) {
        setError("Camera permission denied. Please allow camera access.");
        setHasPermission(false);
      } else if (
        err.name === "NotFoundError" ||
        err.name === "DevicesNotFoundError"
      ) {
        setError("No camera found on this device.");
      } else {
        setError("Failed to start camera: " + err.message);
      }
    }
  }, [facingMode, handleScanSuccess]);

  // Stop scanning
  const stopScanning = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
    }
    setIsScanning(false);
  }, []);

  // Toggle camera
  const toggleCamera = useCallback(() => {
    stopScanning();
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  }, [stopScanning]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, [stopScanning]);

  // Auto-start when permission is granted
  useEffect(() => {
    if (hasPermission === true && !isScanning) {
      startScanning();
    }
  }, [hasPermission, isScanning, startScanning]);

  if (!authChecked) {
    return (
      <div className="flex flex-col h-screen bg-gray-50 items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  // Attendees list content component (reusable)
  const AttendeesListContent = () => (
    <>
      <div
        className={`px-3 md:px-4 py-1.5 md:py-2 ${getEventGradient(currentEventName)} flex items-center justify-between flex-shrink-0`}
      >
        <h2 className="text-xs md:text-sm font-semibold text-white">
          Scanned Attendees ({scannedAttendees.length})
        </h2>
        {/* Close button for mobile drawer */}
        <button
          onClick={() => setIsListOpen(false)}
          className="md:hidden p-1 rounded-full hover:bg-white/20 transition-colors"
          aria-label="Close list"
        >
          <X className="w-4 h-4 text-white" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0">
        {scannedAttendees.length === 0 ? (
          <div className="px-3 md:px-4 py-6 md:py-8 text-center text-gray-500 text-xs md:text-sm">
            No attendees scanned yet. Point camera at QR code to begin.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {scannedAttendees.map((attendee, index) => (
              <div
                key={`${attendee.attendee_id}-${attendee.scanned_at}-${index}`}
                className="px-3 md:px-4 py-2 md:py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm md:text-base text-gray-900 truncate">
                    {attendee.name || attendee.attendee_id}
                  </div>
                  <div className="text-[10px] md:text-xs text-gray-600">
                    {attendee.attendee_id} •{" "}
                    {new Date(attendee.scanned_at).toLocaleString()}
                  </div>
                </div>
                <div className="ml-3 md:ml-4">
                  <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-green-500" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50 overflow-hidden">
      {/* Warning if no active event */}
      {!currentEventId && (
        <div className="bg-yellow-500 text-yellow-900 px-4 md:px-6 py-2 text-sm font-medium text-center">
          ⚠️ No active event set. Please contact an admin to set an active
          event.
        </div>
      )}

      {/* Header */}
      <div
        className={`${getEventGradient(currentEventName)} px-3 md:px-6 py-3 md:py-4 shadow-lg text-white flex-shrink-0 z-10`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Logo"
              width={40}
              height={40}
              className="rounded-2xl border border-white/40 w-9 h-9 md:w-10 md:h-10"
            />
            <div>
              <p className="text-[11px] uppercase tracking-[0.25em] text-white/70">
                QR Scanner
              </p>
              <h1 className="text-sm md:text-2xl font-semibold">
                Jesus is Lord Luna
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2">
            {/* Toggle list button with count badge */}
            <button
              onClick={() => setIsListOpen(!isListOpen)}
              className="relative rounded-full bg-white/15 hover:bg-white/25 p-1.5 md:p-2 transition-colors"
              aria-label="Toggle attendees list"
              title="Toggle attendees list"
            >
              <List className="w-4 h-4 md:w-5 md:h-5 text-white" />
              {scannedAttendees.length > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 md:h-5 md:w-5 rounded-full bg-emerald-500 text-white text-[10px] md:text-xs font-semibold flex items-center justify-center">
                  {scannedAttendees.length > 99
                    ? "99+"
                    : scannedAttendees.length}
                </span>
              )}
            </button>
            <button
              onClick={toggleCamera}
              className="rounded-full bg-white/15 hover:bg-white/25 p-1.5 md:p-2 transition-colors"
              aria-label="Switch camera"
              title="Switch camera"
            >
              <Camera className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </button>
            <button
              onClick={() => setShowLogoutDialog(true)}
              className="px-2.5 md:px-4 py-1.5 md:py-2 rounded-full bg-white text-[#1c2d44] text-xs md:text-sm font-semibold shadow-sm hover:shadow transition-shadow"
            >
              Sign Out
            </button>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] md:text-xs text-white/80">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1">
            <span
              className={`h-2 w-2 rounded-full ${error ? "bg-red-300" : "bg-emerald-300"} animate-pulse`}
            />
            {error ? "Error" : "Ready for next scan"}
          </span>
          <span className="inline-flex items-center gap-1">
            Event:
            <strong className="tracking-wide">
              {currentEventName || currentEventId || "No active event"}
            </strong>
          </span>
          <span className="hidden sm:inline-flex items-center gap-1">
            Last sync:
            <span className="font-medium">{lastSync.toLocaleTimeString()}</span>
          </span>
        </div>
      </div>

      {/* Camera View */}
      <div className="flex-1 relative bg-black overflow-hidden min-h-0">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
        />

        {/* Scanning Overlay */}
        {isScanning && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative">
              {/* Scanning frame - responsive sizing (no blur on video) */}
              <div className="relative w-[70vw] max-w-xs aspect-square rounded-[32px] border border-white/40 bg-white/5 shadow-2xl">
                <div className="absolute inset-4 rounded-3xl border border-dashed border-emerald-200/60" />
                {/* Corner indicators */}
                <div className="absolute inset-0">
                  <div className="absolute left-4 top-4 h-6 w-6 rounded-tl-3xl border-t-2 border-l-2 border-emerald-300" />
                  <div className="absolute right-4 top-4 h-6 w-6 rounded-tr-3xl border-t-2 border-r-2 border-emerald-300" />
                  <div className="absolute left-4 bottom-4 h-6 w-6 rounded-bl-3xl border-b-2 border-l-2 border-emerald-300" />
                  <div className="absolute right-4 bottom-4 h-6 w-6 rounded-br-3xl border-b-2 border-r-2 border-emerald-300" />
                </div>
                {/* Scanning line animation */}
                <div className="absolute inset-0 overflow-hidden rounded-[32px]">
                  <div className="absolute inset-x-4 h-1.5 bg-gradient-to-r from-transparent via-emerald-300 to-transparent rounded-full scanner-line" />
                </div>
              </div>
              {/* Instruction text */}
              <div className="absolute -bottom-12 left-0 right-0 text-center">
                <p className="text-white text-xs md:text-sm font-medium bg-black/60 px-3 md:px-4 py-1.5 md:py-2 rounded-full inline-flex items-center gap-2 justify-center">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" />
                  Align QR code within the glowing frame
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="absolute top-4 left-4 right-4 bg-red-600 text-white px-3 md:px-4 py-2 md:py-3 rounded-lg shadow-lg z-10">
            <p className="text-xs md:text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Success Flash */}
        {isProcessing && (
          <div className="absolute inset-0 bg-emerald-400/25 backdrop-blur-[1px] animate-pulse pointer-events-none" />
        )}

        {/* Permission Prompt */}
        {hasPermission === false && (
          <div className="absolute inset-0 flex items-center justify-center bg-white p-4">
            <div className="text-center max-w-sm">
              <CameraOff className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 text-gray-400" />
              <h2 className="text-base md:text-xl font-bold mb-2 text-gray-900">
                Camera Access Required
              </h2>
              <p className="text-gray-600 text-sm md:text-base mb-4">
                Please allow camera access to scan QR codes for attendance.
              </p>
              <button
                onClick={requestCameraPermission}
                className={`px-4 md:px-6 py-2 md:py-3 ${getEventGradient(currentEventName)} text-white rounded-lg text-sm md:text-base font-medium transition-all shadow-md hover:shadow-lg`}
              >
                Grant Camera Permission
              </button>
            </div>
          </div>
        )}

        {/* Start Button */}
        {hasPermission === null && !isScanning && (
          <div className="absolute inset-0 flex items-center justify-center bg-white">
            <button
              onClick={requestCameraPermission}
              className={`px-6 md:px-8 py-3 md:py-4 ${getEventGradient(currentEventName)} text-white rounded-lg font-medium text-sm md:text-lg transition-all shadow-lg hover:shadow-xl`}
            >
              Start Scanning
            </button>
          </div>
        )}
      </div>

      {/* Desktop Side Panel */}
      <div
        className={`hidden md:flex flex-col bg-white border-l border-gray-200 shadow-lg transition-all duration-300 ease-in-out flex-shrink-0 ${
          isListOpen ? "w-80" : "w-0"
        } ${isListOpen ? "" : "overflow-hidden"} h-full`}
      >
        {isListOpen && (
          <div className="flex flex-col h-full min-w-0">
            <AttendeesListContent />
          </div>
        )}
      </div>

      {/* Mobile Overlay Drawer */}
      <>
        {/* Backdrop */}
        <div
          className={`md:hidden fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
            isListOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setIsListOpen(false)}
        />
        {/* Drawer */}
        <div
          className={`md:hidden fixed inset-y-0 right-0 w-[85vw] max-w-sm bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out ${
            isListOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {isListOpen && (
            <div className="flex flex-col h-full min-w-0">
              <AttendeesListContent />
            </div>
          )}
        </div>
      </>

      {/* Mobile FAB (Floating Action Button) */}
      {!isListOpen && scannedAttendees.length > 0 && (
        <button
          onClick={() => setIsListOpen(true)}
          className={`md:hidden fixed bottom-4 right-4 h-14 w-14 rounded-full ${getEventGradient(currentEventName)} text-white shadow-lg flex items-center justify-center transition-all duration-200 z-30 hover:shadow-xl`}
          aria-label="View scanned attendees"
        >
          <div className="flex flex-col items-center">
            <List className="w-5 h-5" />
            <span className="text-[10px] font-semibold mt-0.5">
              {scannedAttendees.length > 99 ? "99+" : scannedAttendees.length}
            </span>
          </div>
        </button>
      )}

      {/* Logout Confirmation Dialog */}
      <LogoutConfirmDialog
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
        onConfirm={async () => {
          try {
            await signOut();
            router.push("/");
          } catch (error) {
            console.error("Sign out failed:", error);
            showError(
              "Sign Out Failed",
              "An error occurred while signing out. Please try again.",
              4000
            );
          }
        }}
      />
    </div>
  );
}
