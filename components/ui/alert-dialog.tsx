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
    warning: "bg-yellow-600 hover:bg-yellow-700",
    error: "bg-red-600 hover:bg-red-700",
    info: "bg-blue-600 hover:bg-blue-700",
  };

  const handleConfirm = () => {
    alert.onConfirm?.();
    onClose();
  };

  const handleCancel = () => {
    alert.onCancel?.();
    onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 z-50 p-0 m-0 bg-transparent outline-none"
    >
      <div
        className="fixed inset-0 flex items-center justify-center p-4 backdrop-blur-sm"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            handleCancel();
          }
        }}
      >
        <div
          className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95"
          onClick={(e) => e.stopPropagation()}
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
            <div className="flex gap-3 justify-end mt-6">
              {alert.cancelText && (
                <button
                  onClick={handleCancel}
                  className="px-4 md:px-6 py-2 md:py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors text-xs md:text-sm"
                >
                  {alert.cancelText}
                </button>
              )}
              <button
                onClick={handleConfirm}
                className={`px-4 md:px-6 py-2 md:py-2.5 text-white rounded-lg font-medium transition-colors text-xs md:text-sm ${
                  buttonColors[alert.type || "warning"]
                }`}
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
