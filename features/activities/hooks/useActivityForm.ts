import { useState, useCallback } from "react";
import {
  createActivity,
  updateActivity,
  type Activity,
} from "@/lib/activities";
import type { ActivityFormData } from "../types/activity.types";
import type { ActivityStatus } from "@/types";

interface UseActivityFormProps {
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
  onActivityUpdated?: () => void;
}

/**
 * Hook for managing activity form state and submission
 */
export function useActivityForm({
  onSuccess,
  onError,
  onActivityUpdated,
}: UseActivityFormProps = {}) {
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [formData, setFormData] = useState<ActivityFormData>({
    name: "",
    description: "",
    date: "",
    location: "",
    status: "active",
    notes: "",
  });

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      try {
        if (editingActivity) {
          // Update existing activity
          await updateActivity(editingActivity.id, {
            name: formData.name,
            description: formData.description || undefined,
            date: formData.date || undefined,
            location: formData.location || undefined,
            status: formData.status,
            notes: formData.notes || undefined,
          });

          onSuccess?.("Activity updated successfully");
          onActivityUpdated?.();
        } else {
          // Create new activity
          await createActivity({
            name: formData.name,
            description: formData.description || undefined,
            date: formData.date || undefined,
            location: formData.location || undefined,
            status: formData.status,
            notes: formData.notes || undefined,
          });

          onSuccess?.("Activity created successfully");
          onActivityUpdated?.();
        }

        // Reset form
        resetForm();
      } catch (error: any) {
        console.error("Failed to save activity:", error);
        const errorMessage = error?.message || "Failed to save activity";
        onError?.(errorMessage);
      }
    },
    [editingActivity, formData, onSuccess, onError, onActivityUpdated]
  );

  const handleEdit = useCallback((activity: Activity) => {
    setEditingActivity(activity);
    setFormData({
      name: activity.name,
      description: activity.description || "",
      date: activity.date ? activity.date.split("T")[0] : "", // Convert to YYYY-MM-DD format
      location: activity.location || "",
      status: activity.status,
      notes: activity.notes || "",
    });
  }, []);

  const handleCancel = useCallback(() => {
    setEditingActivity(null);
    resetForm();
  }, []);

  const resetForm = useCallback(() => {
    setFormData({
      name: "",
      description: "",
      date: "",
      location: "",
      status: "active",
      notes: "",
    });
    setEditingActivity(null);
  }, []);

  const updateFormField = useCallback(
    <K extends keyof ActivityFormData>(
      field: K,
      value: ActivityFormData[K]
    ) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  return {
    formData,
    editingActivity,
    handleSubmit,
    handleEdit,
    handleCancel,
    updateFormField,
    setFormData,
  };
}
