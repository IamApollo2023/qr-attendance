"use client";

import { useState, useCallback } from "react";
import { AlertOptions } from "@/components/ui";

export function useAlert() {
  const [alert, setAlert] = useState<AlertOptions | null>(null);

  const showAlert = useCallback((options: AlertOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setAlert({
        ...options,
        onConfirm: () => {
          options.onConfirm?.();
          resolve(true);
        },
        onCancel: () => {
          options.onCancel?.();
          resolve(false);
        },
      });
    });
  }, []);

  const closeAlert = useCallback(() => {
    setAlert(null);
  }, []);

  return {
    alert,
    showAlert,
    closeAlert,
  };
}
