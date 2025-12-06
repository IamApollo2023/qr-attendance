"use client";

import { useEffect, useRef } from "react";

export type AlertType = "warning" | "error" | "info";

export interface AlertOptions {
  type?: AlertType;
  title: string;
  message?: string;
  html?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface AlertDialogProps {
  alert: AlertOptions | null;
  onClose: () => void;
}

export function AlertDialog({ alert, onClose }: AlertDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (alert) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [alert]);

  if (!alert) return null;

  const buttonColors = {
    warning: "bg-orange-600 hover:bg-orange-700 active:bg-orange-800",
    error: "bg-red-600 hover:bg-red-700 active:bg-red-800",
    info: "bg-blue-600 hover:bg-blue-700 active:bg-blue-800",
  };

  const handleConfirm = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    e?.preventDefault();
    // Call onConfirm first (this resolves the promise)
    alert.onConfirm?.();
    // Use Promise.resolve to ensure promise resolves before closing
    Promise.resolve().then(() => {
      onClose();
    });
  };

  const handleCancel = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    e?.preventDefault();
    // Call onCancel first (this resolves the promise with false)
    alert.onCancel?.();
    // Use Promise.resolve to ensure promise resolves before closing
    Promise.resolve().then(() => {
      onClose();
    });
  };

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 z-50 p-0 m-0 bg-transparent outline-none"
      style={{ pointerEvents: "auto" }}
    >
      <div
        className="fixed inset-0 flex items-center justify-center p-4 backdrop-blur-sm"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            e.stopPropagation();
            handleCancel(e);
          }
        }}
        style={{ pointerEvents: "auto" }}
      >
        <div
          className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 relative z-10"
          onClick={(e) => e.stopPropagation()}
          style={{ pointerEvents: "auto" }}
        >
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {alert.title}
            </h3>
            {alert.message && (
              <p className="text-gray-600 text-sm mb-4">{alert.message}</p>
            )}
            {alert.html && (
              <div
                className="text-gray-600 text-sm mb-4"
                dangerouslySetInnerHTML={{ __html: alert.html }}
              />
            )}
            <div className="flex gap-3 justify-end mt-6 relative z-20">
              {alert.cancelText && (
                <button
                  onClick={handleCancel}
                  type="button"
                  className="px-4 py-3 min-h-[44px] bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-700 rounded-lg font-medium transition-colors text-base md:text-sm md:py-2 md:min-h-0 relative z-30"
                  style={{ touchAction: "manipulation", pointerEvents: "auto" }}
                >
                  {alert.cancelText}
                </button>
              )}
              <button
                onClick={handleConfirm}
                type="button"
                className={`px-4 py-3 min-h-[44px] text-white rounded-lg font-medium transition-colors text-base md:text-sm md:py-2 md:min-h-0 relative z-30 ${
                  buttonColors[alert.type || "warning"]
                }`}
                style={{ touchAction: "manipulation", pointerEvents: "auto" }}
              >
                {alert.confirmText || "OK"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </dialog>
  );
}
