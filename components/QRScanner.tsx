"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Camera, CameraOff, CheckCircle2 } from "lucide-react";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";
import { supabase, AttendanceRecord } from "@/lib/supabase";
import { getCurrentUserProfile } from "@/lib/auth";

interface ScannedAttendee {
  attendee_id: string;
  scanned_at: string;
  name?: string;
}

interface QRScannerProps {
  eventId?: string;
  onScanSuccess?: (attendeeId: string) => void;
}

export default function QRScanner({ eventId, onScanSuccess }: QRScannerProps) {
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

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const profile = await getCurrentUserProfile();
        if (!profile || profile.role !== "scanner") {
          router.push("/scanner/login");
          return;
        }
        setAuthChecked(true);
      } catch (error) {
        console.error("Auth check failed:", error);
        router.push("/scanner/login");
      }
    };
    checkAuth();
  }, [router]);

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
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.2
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (err) {
      // Audio context might not be available, ignore
      console.warn("Could not play sound:", err);
    }
  };

  // Load existing attendance records on mount
  useEffect(() => {
    if (!authChecked) return;

    const loadExistingRecords = async () => {
      try {
        const { data: records, error } = await supabase
          .from("qr_attendance")
          .select("*")
          .eq("event_id", eventId || "default")
          .order("scanned_at", { ascending: false })
          .limit(50);

        if (error) throw error;

        const attendees: ScannedAttendee[] = (records || []).map((record) => ({
          attendee_id: record.attendee_id,
          scanned_at: record.scanned_at,
          name: record.attendee_id,
        }));
        setScannedAttendees(attendees);
      } catch (err) {
        console.error("Failed to load existing records:", err);
      }
    };

    loadExistingRecords();
  }, [eventId, authChecked]);

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
        // Check for duplicate in database
        const { data: existing, error: queryError } = await supabase
          .from("qr_attendance")
          .select("*")
          .eq("attendee_id", attendeeId)
          .eq("event_id", eventId || "default")
          .order("scanned_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (queryError && queryError.code !== "PGRST116") {
          throw queryError;
        }

        if (existing) {
          // Duplicate scan - show warning but don't add to list
          setError(
            `Attendee ${attendeeId} already scanned at ${new Date(
              existing.scanned_at
            ).toLocaleTimeString()}`
          );
          setTimeout(() => setError(null), 3000);
          setIsProcessing(false);
          return;
        }

        // Get current user ID for tracking who scanned
        const {
          data: { user },
        } = await supabase.auth.getUser();

        // Save to Supabase
        const attendanceRecord: AttendanceRecord = {
          attendee_id: attendeeId,
          scanned_at: new Date().toISOString(),
          event_id: eventId || "default",
        };

        // Add scanned_by if user is authenticated
        const recordToInsert: any = { ...attendanceRecord };
        if (user) {
          recordToInsert.scanned_by = user.id;
        }

        const { data: insertedRecord, error: insertError } = await supabase
          .from("qr_attendance")
          .insert([recordToInsert])
          .select()
          .single();

        if (insertError) {
          throw insertError;
        }

        // Add to local list
        const newAttendee: ScannedAttendee = {
          attendee_id: attendeeId,
          scanned_at: insertedRecord.scanned_at,
          name: attendeeId,
        };

        setScannedAttendees((prev) => [newAttendee, ...prev]);

        // Play success sound
        playSuccessSound();

        // Call callback if provided
        if (onScanSuccess) {
          onScanSuccess(attendeeId);
        }

        setError(null);
      } catch (err: any) {
        console.error("Error saving attendance:", err);
        setError(
          "Failed to save attendance: " + (err.message || "Unknown error")
        );
        setTimeout(() => setError(null), 3000);
      } finally {
        setIsProcessing(false);
      }
    },
    [eventId, onScanSuccess]
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

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Logo"
            width={32}
            height={32}
            className="rounded-full"
          />
          <h1 className="text-xl font-bold text-gray-900">
            Jesus is Lord Luna
          </h1>
        </div>
        <button
          onClick={toggleCamera}
          className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-gray-700"
          aria-label="Switch camera"
          title="Switch camera"
        >
          <Camera className="w-6 h-6" />
        </button>
      </div>

      {/* Camera View */}
      <div className="flex-1 relative bg-black overflow-hidden">
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
              {/* Scanning frame - responsive sizing */}
              <div className="w-64 h-64 sm:w-80 sm:h-80 border-4 border-green-500 rounded-lg shadow-lg">
                {/* Corner indicators */}
                <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-green-500 rounded-tl-lg"></div>
                <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-green-500 rounded-tr-lg"></div>
                <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-green-500 rounded-bl-lg"></div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-green-500 rounded-br-lg"></div>
              </div>
              {/* Scanning line animation */}
              <div className="absolute top-0 left-0 w-full h-1 bg-green-500 animate-pulse"></div>
              {/* Instruction text */}
              <div className="absolute -bottom-12 left-0 right-0 text-center">
                <p className="text-white text-sm font-medium bg-black/50 px-4 py-2 rounded-lg inline-block">
                  Position QR code within frame
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="absolute top-4 left-4 right-4 bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg z-10">
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Success Flash */}
        {isProcessing && (
          <div className="absolute inset-0 bg-green-500 opacity-30 animate-pulse pointer-events-none"></div>
        )}

        {/* Permission Prompt */}
        {hasPermission === false && (
          <div className="absolute inset-0 flex items-center justify-center bg-white p-4">
            <div className="text-center max-w-sm">
              <CameraOff className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h2 className="text-xl font-bold mb-2 text-gray-900">
                Camera Access Required
              </h2>
              <p className="text-gray-600 mb-4">
                Please allow camera access to scan QR codes for attendance.
              </p>
              <button
                onClick={requestCameraPermission}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
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
              className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-lg transition-colors shadow-lg"
            >
              Start Scanning
            </button>
          </div>
        )}
      </div>

      {/* Scanned Attendees List */}
      <div className="bg-white border-t border-gray-200 shadow-lg">
        <div className="px-4 py-2 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-700">
            Scanned Attendees ({scannedAttendees.length})
          </h2>
        </div>
        <div className="max-h-48 overflow-y-auto">
          {scannedAttendees.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500 text-sm">
              No attendees scanned yet. Point camera at QR code to begin.
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {scannedAttendees.map((attendee, index) => (
                <div
                  key={`${attendee.attendee_id}-${attendee.scanned_at}-${index}`}
                  className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {attendee.attendee_id}
                    </div>
                    <div className="text-xs text-gray-600">
                      {new Date(attendee.scanned_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="ml-4">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
