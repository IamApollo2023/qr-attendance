"use client";

import { useState, useCallback } from "react";
import { Toast, ToastType } from "@/components/ui";

let toastIdCounter = 0;

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (
      type: ToastType,
      title: string,
      message?: string,
      duration: number = 3000
    ) => {
      const id = `toast-${++toastIdCounter}`;
      const toast: Toast = { id, type, title, message, duration };
      setToasts((prev) => [...prev, toast]);
      return id;
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback(
    (title: string, message?: string, duration?: number) => {
      return showToast("success", title, message, duration);
    },
    [showToast]
  );

  const error = useCallback(
    (title: string, message?: string, duration?: number) => {
      return showToast("error", title, message, duration);
    },
    [showToast]
  );

  const warning = useCallback(
    (title: string, message?: string, duration?: number) => {
      return showToast("warning", title, message, duration);
    },
    [showToast]
  );

  const info = useCallback(
    (title: string, message?: string, duration?: number) => {
      return showToast("info", title, message, duration);
    },
    [showToast]
  );

  return {
    toasts,
    success,
    error,
    warning,
    info,
    removeToast,
  };
}
