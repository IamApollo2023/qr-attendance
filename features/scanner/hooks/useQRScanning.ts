import { useRef, useEffect, useCallback } from "react";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";

/**
 * Hook for QR code scanning logic
 * Single responsibility: Handle QR code reading and decoding
 */
export function useQRScanning(
  videoRef: React.RefObject<HTMLVideoElement>,
  isScanning: boolean,
  onScanSuccess: (code: string) => void,
  onScanError?: (error: string) => void
) {
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Initialize QR code reader
   */
  useEffect(() => {
    codeReaderRef.current = new BrowserMultiFormatReader();
    return () => {
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
      }
    };
  }, []);

  /**
   * Start scanning for QR codes
   */
  const startScanning = useCallback(() => {
    if (!codeReaderRef.current || !videoRef.current || !isScanning) return;

    const scan = async () => {
      try {
        const result = await codeReaderRef.current!.decodeFromVideoDevice(
          null,
          videoRef.current!,
          (result, error) => {
            if (result) {
              const code = result.getText();
              onScanSuccess(code);
            } else if (error && !(error instanceof NotFoundException)) {
              // NotFoundException is expected when no code is found
              onScanError?.(error.message);
            }
          }
        );
      } catch (err: any) {
        console.error("Scan error:", err);
        onScanError?.(err.message || "Scan failed");
      }
    };

    scan();
  }, [videoRef, isScanning, onScanSuccess, onScanError]);

  /**
   * Stop scanning
   */
  const stopScanning = useCallback(() => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
    }
  }, []);

  /**
   * Auto-start scanning when camera is ready
   */
  useEffect(() => {
    if (isScanning) {
      startScanning();
    } else {
      stopScanning();
    }
    return () => {
      stopScanning();
    };
  }, [isScanning, startScanning, stopScanning]);

  return {
    startScanning,
    stopScanning,
  };
}
