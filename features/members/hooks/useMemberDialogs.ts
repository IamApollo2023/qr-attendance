import { useState, useCallback } from "react";
import { getMemberById, type Member } from "@/lib";
import { useToastContext } from "@/components/ToastProvider";
import type { MemberFormData } from "../types/member.types";

interface UseMemberDialogsProps {
  handleEdit: (member: Member) => void;
  handleCancel: () => void;
  hasUnsavedChanges: () => boolean;
}

/**
 * Hook for managing member dialog state and operations
 * Single responsibility: Handle dialog open/close and edit operations
 */
export function useMemberDialogs({
  handleEdit,
  handleCancel,
  hasUnsavedChanges,
}: UseMemberDialogsProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);
  const { error: showError, showAlert } = useToastContext();

  const openCreateMember = useCallback(() => {
    // reset to create mode
    handleCancel();
    setIsAddDialogOpen(true);
  }, [handleCancel]);

  const handleEditWithDialog = useCallback(
    async (member: Member) => {
      try {
        // Fetch fresh member data from database
        const freshMember = await getMemberById(member.id);

        if (!freshMember) {
          showError("Error", "Member not found in database", 3000);
          return;
        }

        // Use fresh data to populate form
        handleEdit(freshMember);
        setIsEditDialogOpen(true);
      } catch (error: any) {
        console.error("Failed to fetch member:", error);
        showError(
          "Error",
          error?.message || "Failed to load member data",
          3000
        );
      }
    },
    [handleEdit, showError]
  );

  const handleEditDialogCancel = useCallback(async (): Promise<boolean> => {
    if (hasUnsavedChanges()) {
      const confirmed = await showAlert({
        type: "warning",
        title: "Discard changes?",
        message: "You have unsaved changes. Are you sure you want to cancel?",
        confirmText: "Yes, discard",
        cancelText: "No, keep editing",
      });

      // Explicitly check - if user chose to keep editing, return false to stay open
      if (confirmed === false) {
        return false; // User chose "No, keep editing" - stay in the form
      }

      // Only proceed if user explicitly confirmed (confirmed === true)
      if (confirmed !== true) {
        return false; // Safety check - if promise didn't resolve properly, don't close
      }
    }

    // User confirmed or no unsaved changes - close the dialog
    handleCancel();
    setIsEditDialogOpen(false);
    return true; // Return true to indicate dialog should close
  }, [hasUnsavedChanges, showAlert, handleCancel]);

  const handleAddDialogCancel = useCallback(async (): Promise<boolean> => {
    if (hasUnsavedChanges()) {
      const confirmed = await showAlert({
        type: "warning",
        title: "Discard changes?",
        message: "You have unsaved changes. Are you sure you want to cancel?",
        confirmText: "Yes, discard",
        cancelText: "No, keep editing",
      });

      // Explicitly check - if user chose to keep editing, return false to stay open
      if (confirmed === false) {
        return false; // User chose "No, keep editing" - stay in the form
      }

      // Only proceed if user explicitly confirmed (confirmed === true)
      if (confirmed !== true) {
        return false; // Safety check - if promise didn't resolve properly, don't close
      }
    }

    // User confirmed or no unsaved changes - close the dialog
    handleCancel();
    setIsAddDialogOpen(false);
    return true; // Return true to indicate dialog should close
  }, [hasUnsavedChanges, showAlert, handleCancel]);

  return {
    isEditDialogOpen,
    isAddDialogOpen,
    isSearchDialogOpen,
    isPrintDialogOpen,
    setIsEditDialogOpen,
    setIsAddDialogOpen,
    setIsSearchDialogOpen,
    setIsPrintDialogOpen,
    openCreateMember,
    handleEditWithDialog,
    handleEditDialogCancel,
    handleAddDialogCancel,
  };
}
