import { useState, useCallback } from "react";

/**
 * Hook for managing dialog open/close handlers
 * Single responsibility: Handle dialog state and provide stable handlers
 */
export function useMemberDialogHandlers() {
  const [showImportModal, setShowImportModal] = useState(false);
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);
  const [dialogSearchInput, setDialogSearchInput] = useState("");

  // Memoize dialog handlers to prevent child re-renders
  const handleOpenImportModal = useCallback(() => {
    setShowImportModal(true);
  }, []);

  const handleCloseImportModal = useCallback(() => {
    setShowImportModal(false);
  }, []);

  const handleOpenSearchDialog = useCallback(() => {
    setIsSearchDialogOpen(true);
  }, []);

  const handleCloseSearchDialog = useCallback(() => {
    setIsSearchDialogOpen(false);
    setDialogSearchInput(""); // Clear search when closing
  }, []);

  const handleOpenPrintDialog = useCallback(() => {
    setIsPrintDialogOpen(true);
  }, []);

  const handleClosePrintDialog = useCallback(() => {
    setIsPrintDialogOpen(false);
  }, []);

  return {
    showImportModal,
    isSearchDialogOpen,
    isPrintDialogOpen,
    dialogSearchInput,
    setDialogSearchInput,
    handleOpenImportModal,
    handleCloseImportModal,
    handleOpenSearchDialog,
    handleCloseSearchDialog,
    handleOpenPrintDialog,
    handleClosePrintDialog,
  };
}
