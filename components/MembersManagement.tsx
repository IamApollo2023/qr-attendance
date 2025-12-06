"use client";

import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from "react";
import { useRouter } from "next/navigation";
import { Download, Upload, Printer, UserPlus, Search } from "lucide-react";

import { deleteMember, type Member } from "@/lib";
import { useToastContext } from "@/components/ToastProvider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  useMembers,
  useMemberForm,
  useMemberFilters,
  useMemberSort,
  useCSVImport,
} from "@/features/members/hooks";
import {
  MemberTable,
  CSVImportModal,
  MemberSegmentSelector,
  MemberEditDrawer,
  MemberAddDialog,
  MemberSearchDialog,
  PrintDialog,
} from "@/features/members/components";
import type {
  MemberFilters as MemberFiltersType,
  SortConfig,
  SortKey,
} from "@/features/members/types/member.types";
import { exportMembersToCSV } from "@/features/members/utils/csvExport";
import type { MembersManagementProps } from "@/features/members/types/member.types";

export default function MembersManagement({
  initialData,
}: MembersManagementProps) {
  const router = useRouter();
  const { success, error: showError, showAlert } = useToastContext();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);

  // Members data management
  const { members, pagination, loading, loadMembers } = useMembers({
    initialMembers: initialData.members,
    initialPagination: initialData.pagination,
    onError: (error) => showError("Error", error, 3000),
  });

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
      setIsFormOpen(false);
      setIsAddDialogOpen(false);
    },
    onError: (error) => showError("Error", error, 3000),
    onMemberUpdated: () => {
      const currentPage = pagination?.page || 1;
      loadMembers(currentPage);
    },
  });

  // Filters
  const [filters, setFilters] = useState<MemberFiltersType>({
    searchTerm: "",
    gender: "all",
    ageCategory: "all",
    membershipType: "all",
  });

  // Separate search state for dialog (doesn't affect table)
  const [dialogSearchInput, setDialogSearchInput] = useState("");

  const { filteredMembers } = useMemberFilters({
    members,
    filters,
  });

  // Sorting
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const { sortedMembers } = useMemberSort({
    members: filteredMembers,
    sortConfig,
  });

  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [openActionRowId, setOpenActionRowId] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);

  // CSV Import
  const { handleFileUpload: handleCSVUpload } = useCSVImport({
    onSuccess: (message) => {
      success("Success!", message, 3000);
      setShowImportModal(false);
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
      setShowImportModal(false);
      const currentPage = pagination?.page || 1;
      loadMembers(currentPage);
    },
  });

  // Handlers
  const handlePageChange = useCallback(
    (newPage: number) => {
      if (newPage < 1 || (pagination && newPage > pagination.totalPages))
        return;
      const currentPageSize = pagination?.pageSize || 20;
      router.push(`/admin/members?page=${newPage}&pageSize=${currentPageSize}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [router, pagination]
  );

  const handlePageSizeChange = useCallback(
    (newPageSize: number) => {
      router.push(`/admin/members?page=1&pageSize=${newPageSize}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [router]
  );

  const handleDelete = useCallback(
    async (member: Member) => {
      const confirmed = await showAlert({
        type: "warning",
        title: "Delete Member?",
        message: `Are you sure you want to delete ${member.first_name} ${member.last_name} (${member.member_id})?`,
        confirmText: "Yes, delete it",
        cancelText: "Cancel",
      });

      if (confirmed) {
        try {
          await deleteMember(member.id);
          success("Deleted!", "Member deleted successfully", 2000);
          const currentPage = pagination?.page || 1;
          loadMembers(currentPage);
        } catch (error) {
          console.error("Failed to delete member:", error);
          showError("Error", "Failed to delete member", 3000);
        }
      }
    },
    [showAlert, success, showError, loadMembers, pagination]
  );

  const handleExport = useCallback(() => {
    exportMembersToCSV(members);
  }, [members]);

  const handleSort = useCallback((key: SortKey) => {
    setSortConfig((prev) => {
      if (!prev || prev.key !== key) {
        return { key, direction: "asc" };
      }
      if (prev.direction === "asc") {
        return { key, direction: "desc" };
      }
      return null; // third click clears sort
    });
  }, []);

  const toggleSelect = useCallback((memberId: string) => {
    setSelectedIds((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  }, []);

  const toggleSelectAllVisible = useCallback(() => {
    const visibleIds = sortedMembers.map((m) => m.member_id);
    const allSelected = visibleIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  }, [sortedMembers, selectedIds]);

  const allVisibleSelected =
    sortedMembers.length > 0 &&
    sortedMembers.every((m) => selectedIds.includes(m.member_id));

  // Segment tabs state: maps to ageCategory filter presets
  type SegmentKey = "ALL" | "MEN" | "WOMEN" | "YAN" | "KKB" | "KIDS";
  const [activeSegment, setActiveSegment] = useState<SegmentKey>("ALL");

  const handleSegmentChange = (segment: SegmentKey) => {
    setActiveSegment(segment);
    setFilters((prev) => {
      if (segment === "ALL") {
        return {
          ...prev,
          ageCategory: "all",
          gender: "all",
        };
      } else if (segment === "MEN") {
        return {
          ...prev,
          ageCategory: "Men",
          gender: "male",
        };
      } else if (segment === "WOMEN") {
        return {
          ...prev,
          ageCategory: "Women",
          gender: "female",
        };
      } else if (segment === "KIDS") {
        return {
          ...prev,
          ageCategory: "Children",
          gender: "all",
        };
      } else {
        // YAN, KKB
        return {
          ...prev,
          ageCategory: segment as MemberFiltersType["ageCategory"],
          gender: "all",
        };
      }
    });
  };

  const openCreateMember = () => {
    // reset to create mode
    handleCancel();
    setIsAddDialogOpen(true);
  };

  const handleEditWithDrawer = useCallback(
    (member: Member) => {
      handleEdit(member);
      setIsFormOpen(true);
    },
    [handleEdit]
  );

  // Check if form has unsaved changes
  const hasUnsavedChanges = useCallback(() => {
    // For adding: check if any required fields are filled
    if (!editingMember) {
      return !!(
        formData.first_name ||
        formData.last_name ||
        formData.birthday ||
        formData.province_code ||
        formData.city_municipality_code ||
        formData.barangay_code
      );
    }

    // For editing: check if form differs from original member
    const original = editingMember;
    return (
      formData.first_name !== original.first_name ||
      formData.middle_name !== (original.middle_name || "") ||
      formData.last_name !== original.last_name ||
      formData.birthday !== original.birthday.split("T")[0] ||
      formData.gender !== original.gender ||
      formData.membership_type !== original.membership_type ||
      formData.classification !== (original.classification || undefined) ||
      formData.province_code !== (original.province_code || "") ||
      formData.city_municipality_code !==
        (original.city_municipality_code || "") ||
      formData.barangay_code !== (original.barangay_code || "")
    );
  }, [formData, editingMember]);

  const handleDrawerCancel = useCallback(async () => {
    if (hasUnsavedChanges()) {
      const confirmed = await showAlert({
        type: "warning",
        title: "Discard changes?",
        message: "You have unsaved changes. Are you sure you want to cancel?",
        confirmText: "Yes, discard",
        cancelText: "No, keep editing",
      });

      if (!confirmed) {
        return; // User chose to keep editing
      }
    }

    handleCancel();
    setIsFormOpen(false);
  }, [hasUnsavedChanges, showAlert, handleCancel]);

  const handleAddDialogCancel = useCallback(async () => {
    if (hasUnsavedChanges()) {
      const confirmed = await showAlert({
        type: "warning",
        title: "Discard changes?",
        message: "You have unsaved changes. Are you sure you want to cancel?",
        confirmText: "Yes, discard",
        cancelText: "No, keep editing",
      });

      if (!confirmed) {
        return; // User chose to keep editing - don't close
      }
    }

    handleCancel();
    setIsAddDialogOpen(false);
  }, [hasUnsavedChanges, showAlert, handleCancel]);

  return (
    <div className="flex flex-1 flex-col print:hidden">
      <div className="@container/main flex flex-1 flex-col gap-3 py-3 md:gap-6 md:py-6">
        {/* Header */}
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
            <Button
              size="sm"
              onClick={openCreateMember}
              className="text-xs md:text-sm"
            >
              <UserPlus className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Add member</span>
              <span className="sm:hidden">Add</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleExport}
              disabled={members.length === 0}
              className="text-xs md:text-sm"
            >
              <Download className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowImportModal(true)}
              className="text-xs md:text-sm"
            >
              <Upload className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Import</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsSearchDialogOpen(true)}
              className="text-xs md:text-sm"
            >
              <Search className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Search</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsPrintDialogOpen(true)}
              className="text-xs md:text-sm"
            >
              <Printer className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Print</span>
            </Button>
          </div>
        </div>

        {/* CSV Import Modal */}
        <CSVImportModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onFileUpload={handleCSVUpload}
        />

        {/* Content */}
        <div className="flex min-h-0 flex-1 flex-col gap-3 px-4 md:gap-4 lg:px-6">
          {/* Search Dialog */}
          <MemberSearchDialog
            isOpen={isSearchDialogOpen}
            searchInput={dialogSearchInput}
            onSearchInputChange={setDialogSearchInput}
            onClose={() => {
              setIsSearchDialogOpen(false);
              setDialogSearchInput(""); // Clear search when closing
            }}
            allMembers={members}
            onMemberClick={(member) => handleEditWithDrawer(member)}
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
                onMembershipTypeChange={(type) =>
                  setFilters((prev) => ({ ...prev, membershipType: type }))
                }
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
                onViewQR={(member) => {
                  window.open(`/attendee?id=${member.member_id}`, "_blank");
                }}
                onEdit={handleEditWithDrawer}
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
        onClose={() => setIsPrintDialogOpen(false)}
      />

      <MemberAddDialog
        isOpen={isAddDialogOpen}
        formData={formData}
        onFormDataChange={updateFormField}
        onSubmit={handleSubmit}
        onCancel={handleAddDialogCancel}
      />

      <MemberEditDrawer
        isOpen={isFormOpen && !!editingMember}
        formData={formData}
        editingMember={editingMember}
        onFormDataChange={updateFormField}
        onSubmit={handleSubmit}
        onCancel={handleDrawerCancel}
      />
    </div>
  );
}
