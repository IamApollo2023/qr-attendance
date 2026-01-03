import { useState, useRef, useCallback, useEffect } from "react";

/**
 * Hook for managing camera access and video stream
 * Single responsibility: Handle camera permissions, stream management, and facing mode
 */
export function useCameraManagement() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">(
    "environment"
  );
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Request camera permission and start stream
   */
  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setHasPermission(true);
        setIsScanning(true);
      }
    } catch (err: any) {
      console.error("Error accessing camera:", err);
      setHasPermission(false);
      setIsScanning(false);
      if (err.name === "NotAllowedError") {
        setError("Camera permission denied");
      } else if (err.name === "NotFoundError") {
        setError("No camera found");
      } else {
        setError("Failed to access camera");
      }
    }
  }, [facingMode]);

  /**
   * Stop camera stream
   */
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  }, []);

  /**
   * Toggle between front and back camera
   */
  const toggleFacingMode = useCallback(() => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  }, []);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    videoRef,
    facingMode,
    hasPermission,
    isScanning,
    error,
    startCamera,
    stopCamera,
    toggleFacingMode,
  };
}
