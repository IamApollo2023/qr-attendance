"use client";

import React, { useState, useCallback, useMemo } from "react";
import { Download, Upload, Printer, UserPlus, Search } from "lucide-react";

import { useToastContext } from "@/components/ToastProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  useMembers,
  useMemberForm,
  useMemberFilters,
  useMemberSort,
  useCSVImport,
  useMemberActions,
  useMemberSelection,
  useMemberDialogs,
  useMemberSegmentFilter,
  useMemberFiltersState,
  useMemberDialogHandlers,
} from "@/features/members/hooks";
import {
  MemberTable,
  CSVImportModal,
  MemberSegmentSelector,
  MemberEditDialog,
  MemberAddDialog,
  MemberSearchDialog,
  PrintDialog,
} from "@/features/members/components";
import type { SortConfig } from "@/features/members/types/member.types";
import { formValidation } from "@/features/members/utils/formValidation";
import type { MembersManagementProps } from "@/features/members/types/member.types";

/**
 * Main component for managing members
 * Single responsibility: Orchestrate member management features
 */
export default function MembersManagement({
  initialData,
}: MembersManagementProps) {
  const { success, error: showError, showAlert } = useToastContext();

  // Filter state management
  const {
    filters,
    setFilters,
    dateFilters,
    memoizedDateFilters,
    handleMembershipTypeChange,
    handleDateChange,
  } = useMemberFiltersState();

  // Members data management
  const { members, pagination, loading, loadMembers } = useMembers({
    initialMembers: initialData.members,
    initialPagination: initialData.pagination,
    onError: (error) => showError("Error", error, 3000),
    dateFilters,
  });

  // Reload members when date filters change (but not on initial mount)
  const isInitialMount = React.useRef(true);
  React.useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    const currentPage = pagination?.page || 1;
    loadMembers(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.dateAddedFrom, filters.dateAddedTo]);

  // Form management
  const {
    formData,
    editingMember,
    handleSubmit,
    handleEdit,
    handleCancel,
    updateFormField,
  } = useMemberForm({
    onSuccess: (message) => {
      success(editingMember ? "Updated!" : "Registered!", message, 2000);
      const currentPage = pagination?.page || 1;
      loadMembers(currentPage);
    },
    onError: (error) => showError("Error", error, 3000),
    onMemberUpdated: () => {
      const currentPage = pagination?.page || 1;
      loadMembers(currentPage);
    },
  });

  // Filtering and sorting
  const { filteredMembers } = useMemberFilters({ members, filters });
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const { sortedMembers } = useMemberSort({
    members: filteredMembers,
    sortConfig,
  });

  // Selection management
  const {
    selectedIds,
    allVisibleSelected: allVisibleSelectedRaw,
    toggleSelect,
    toggleSelectAllVisible: toggleSelectAllVisibleRaw,
  } = useMemberSelection(sortedMembers);

  // Wrap toggleSelectAllVisible to match MemberTable's expected signature
  const toggleSelectAllVisible = useCallback(() => {
    toggleSelectAllVisibleRaw(sortedMembers);
  }, [toggleSelectAllVisibleRaw, sortedMembers]);

  // Memoize allVisibleSelected to prevent recalculation on every render
  const allVisibleSelected = useMemo(
    () =>
      sortedMembers.length > 0 &&
      sortedMembers.every((m) => selectedIds.includes(m.member_id)),
    [sortedMembers, selectedIds]
  );

  // Segment filter management
  const { activeSegment, handleSegmentChange } =
    useMemberSegmentFilter(setFilters);

  // Dialog handlers
  const {
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
  } = useMemberDialogHandlers();

  // Member actions (delete, export, sort, pagination)
  const {
    handlePageChange,
    handlePageSizeChange,
    handleDelete,
    handleExport,
    handleSort,
  } = useMemberActions({
    members,
    pagination,
    loadMembers,
    setSortConfig,
  });

  // Dialog management (edit/add dialogs)
  const hasUnsavedChanges = useCallback(
    () => formValidation.hasUnsavedChanges(formData, editingMember),
    [formData, editingMember]
  );

  const {
    isEditDialogOpen,
    isAddDialogOpen,
    setIsEditDialogOpen,
    setIsAddDialogOpen,
    openCreateMember,
    handleEditWithDialog,
    handleEditDialogCancel,
    handleAddDialogCancel,
  } = useMemberDialogs({
    handleEdit,
    handleCancel,
    hasUnsavedChanges,
  });

  // CSV Import
  const { handleFileUpload: handleCSVUpload } = useCSVImport({
    onSuccess: (message) => {
      success("Success!", message, 3000);
      handleCloseImportModal();
      const currentPage = pagination?.page || 1;
      loadMembers(currentPage);
    },
    onError: async (error) => {
      await showAlert({
        type: "error",
        title: "Import Failed",
        message: error,
        confirmText: "OK",
      });
    },
    onPartialSuccess: async (successCount, errors) => {
      await showAlert({
        type: "warning",
        title: "Partial Success",
        html: `
          <p>Imported ${successCount} members successfully.</p>
          <p>${errors.length} errors occurred:</p>
          <ul style="text-align: left; max-height: 200px; overflow-y: auto; margin-top: 0.5rem;">
            ${errors
              .map((err) => `<li style="margin-bottom: 0.25rem;">${err}</li>`)
              .join("")}
          </ul>
        `,
        confirmText: "OK",
      });
      handleCloseImportModal();
      const currentPage = pagination?.page || 1;
      loadMembers(currentPage);
    },
  });

  // Additional state
  const [openActionRowId, setOpenActionRowId] = useState<string | null>(null);

  return (
    <div className="flex flex-1 flex-col print:hidden">
      <div className="@container/main flex flex-1 flex-col gap-3 py-3 md:gap-6 md:py-6">
        {/* Header */}
        <MembersManagementHeader
          onAddMember={openCreateMember}
          onExport={handleExport}
          onImport={handleOpenImportModal}
          onSearch={handleOpenSearchDialog}
          onPrint={handleOpenPrintDialog}
          canExport={members.length > 0}
        />

        {/* CSV Import Modal */}
        <CSVImportModal
          isOpen={showImportModal}
          onClose={handleCloseImportModal}
          onFileUpload={handleCSVUpload}
        />

        {/* Content */}
        <div className="flex min-h-0 flex-1 flex-col gap-3 px-4 md:gap-4 lg:px-6">
          {/* Search Dialog */}
          <MemberSearchDialog
            isOpen={isSearchDialogOpen}
            searchInput={dialogSearchInput}
            onSearchInputChange={setDialogSearchInput}
            onClose={handleCloseSearchDialog}
            allMembers={members}
            onMemberClick={handleEditWithDialog}
          />

          {/* Members Table with Selector */}
          <Card
            className="flex min-h-0 flex-1 flex-col overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-gray-400"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#cbd5e1 #f1f5f9",
            }}
          >
            <div className="flex-shrink-0">
              <MemberSegmentSelector
                activeSegment={activeSegment}
                onSegmentChange={handleSegmentChange}
                membershipType={filters.membershipType}
                onMembershipTypeChange={handleMembershipTypeChange}
                selectedDate={
                  filters.dateAddedFrom === filters.dateAddedTo
                    ? filters.dateAddedFrom
                    : undefined
                }
                onDateChange={handleDateChange}
              />
            </div>
            <CardContent className="flex min-h-0 flex-1 flex-col p-0">
              <MemberTable
                members={sortedMembers}
                totalMembers={members.length}
                loading={loading}
                searchTerm={filters.searchTerm}
                pagination={pagination}
                sortConfig={sortConfig}
                selectedIds={selectedIds}
                openActionRowId={openActionRowId}
                allVisibleSelected={allVisibleSelected}
                hideAgeGroup={activeSegment !== "ALL"}
                onSort={handleSort}
                onToggleSelect={toggleSelect}
                onToggleSelectAll={toggleSelectAllVisible}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                onSetOpenActionRowId={setOpenActionRowId}
                onEdit={handleEditWithDialog}
                onDelete={handleDelete}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Print Dialog */}
      <PrintDialog
        isOpen={isPrintDialogOpen}
        allMembers={members}
        dateFilters={memoizedDateFilters}
        onClose={handleClosePrintDialog}
      />

      {/* Add/Edit Dialogs */}
      <MemberAddDialog
        isOpen={isAddDialogOpen}
        formData={formData}
        onFormDataChange={updateFormField}
        onSubmit={handleSubmit}
        onCancel={handleAddDialogCancel}
      />

      <MemberEditDialog
        isOpen={isEditDialogOpen && !!editingMember}
        formData={formData}
        editingMember={editingMember}
        onFormDataChange={updateFormField}
        onSubmit={handleSubmit}
        onCancel={handleEditDialogCancel}
      />
    </div>
  );
}

/**
 * Presentational component for members management header
 * Single responsibility: Render header UI
 */
function MembersManagementHeader({
  onAddMember,
  onExport,
  onImport,
  onSearch,
  onPrint,
  canExport,
}: {
  onAddMember: () => void;
  onExport: () => void;
  onImport: () => void;
  onSearch: () => void;
  onPrint: () => void;
  canExport: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 px-4 sm:flex-row sm:items-center sm:justify-between lg:px-6">
      <div>
        <h1 className="text-lg md:text-3xl font-semibold tracking-tight">
          Members
        </h1>
        <p className="text-xs md:text-base text-muted-foreground">
          Manage registered members, filters, and QR codes.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={onAddMember} className="text-xs md:text-sm">
          <UserPlus className="h-3 w-3 md:h-4 md:w-4" />
          <span className="hidden sm:inline">Add member</span>
          <span className="sm:hidden">Add Member</span>
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onExport}
          disabled={!canExport}
          className="text-xs md:text-sm"
        >
          <Download className="h-3 w-3 md:h-4 md:w-4" />
          <span className="hidden sm:inline">Export</span>
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onImport}
          className="text-xs md:text-sm"
        >
          <Upload className="h-3 w-3 md:h-4 md:w-4" />
          <span className="hidden sm:inline">Import</span>
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onSearch}
          className="text-xs md:text-sm"
        >
          <Search className="h-3 w-3 md:h-4 md:w-4" />
          <span className="hidden sm:inline">Search</span>
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onPrint}
          className="text-xs md:text-sm"
        >
          <Printer className="h-3 w-3 md:h-4 md:w-4" />
          <span className="hidden sm:inline">Print</span>
        </Button>
      </div>
    </div>
  );
}
