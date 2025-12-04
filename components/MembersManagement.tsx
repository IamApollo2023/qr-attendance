"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Download, Upload, Printer, UserPlus } from "lucide-react";

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
  MemberFilters,
  MemberTable,
  CSVImportModal,
  PrintQRModal,
  MemberSegmentsTabs,
  MemberEditDrawer,
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

  // Debounced search input for better UX
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    const handle = setTimeout(() => {
      setFilters((prev) => ({ ...prev, searchTerm: searchInput }));
    }, 300);
    return () => clearTimeout(handle);
  }, [searchInput]);

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
      router.push(`/admin/members?page=${newPage}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [router, pagination]
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

  // Print handler
  const [printHandler, setPrintHandler] = useState<(() => void) | null>(null);

  const handleBatchPrint = useCallback(() => {
    printHandler?.();
  }, [printHandler]);

  const anySelected = selectedIds.length > 0;
  const allVisibleSelected =
    sortedMembers.length > 0 &&
    sortedMembers.every((m) => selectedIds.includes(m.member_id));

  // Segment tabs state: maps to ageCategory filter presets
  type SegmentKey = "ALL" | "MEN" | "WOMEN" | "YAN" | "KKB" | "KIDS";
  const [activeSegment, setActiveSegment] = useState<SegmentKey>("ALL");

  const handleSegmentChange = (segment: SegmentKey) => {
    setActiveSegment(segment);
    setFilters((prev) => ({
      ...prev,
      ageCategory:
        segment === "ALL"
          ? "all"
          : segment === "KIDS"
            ? "Children"
            : (segment as MemberFiltersType["ageCategory"]),
    }));
  };

  // Quick stats derived from full members list
  const { totalMembers, typeCounts } = useMemo(() => {
    const total = members.length;
    const counts: Record<string, number> = {
      MEMBER: 0,
      WORKER: 0,
      PASTOR: 0,
    };
    members.forEach((m) => {
      counts[m.membership_type] = (counts[m.membership_type] || 0) + 1;
    });
    return {
      totalMembers: total,
      typeCounts: counts,
    };
  }, [members]);

  const openCreateMember = () => {
    // reset to create mode
    handleCancel();
    setIsFormOpen(true);
  };

  const handleEditWithDrawer = useCallback(
    (member: Member) => {
      handleEdit(member);
      setIsFormOpen(true);
    },
    [handleEdit]
  );

  const handleDrawerCancel = () => {
    handleCancel();
    setIsFormOpen(false);
  };

  return (
    <div className="flex flex-1 flex-col print:hidden">
      <div className="@container/main flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
      {/* Header */}
        <div className="flex flex-col gap-3 px-4 sm:flex-row sm:items-center sm:justify-between lg:px-6">
        <div>
            <h1 className="text-2xl font-semibold tracking-tight">Members</h1>
            <p className="text-sm text-muted-foreground">
              Manage registered members, filters, and QR codes.
          </p>
        </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={openCreateMember}>
              <UserPlus className="h-4 w-4" />
              <span>Add member</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
            onClick={handleExport}
            disabled={members.length === 0}
          >
              <Download className="h-4 w-4" />
            <span className="mobile:hidden">Export</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
            onClick={() => setShowImportModal(true)}
          >
              <Upload className="h-4 w-4" />
            <span className="mobile:hidden">Import</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
            onClick={handleBatchPrint}
            disabled={!anySelected}
          >
              <Printer className="h-4 w-4" />
              <span className="mobile:hidden">Print selected</span>
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
        <div className="flex min-h-0 flex-1 flex-col gap-4 px-4 lg:px-6">
        {/* Quick Stats */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total members</CardDescription>
                <CardTitle className="text-2xl font-semibold">
                  {totalMembers}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Members</CardDescription>
                <CardTitle className="text-xl font-semibold">
                  {typeCounts.MEMBER || 0}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Workers</CardDescription>
                <CardTitle className="text-xl font-semibold">
              {typeCounts.WORKER || 0}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Pastors</CardDescription>
                <CardTitle className="text-xl font-semibold">
              {typeCounts.PASTOR || 0}
                </CardTitle>
              </CardHeader>
            </Card>
        </div>

        {/* Search + Filters */}
          <Card>
            <CardContent className="space-y-4 pt-4">
        <MemberFilters
          filters={filters}
          onFiltersChange={(newFilters) =>
            setFilters((prev) => ({ ...prev, ...newFilters }))
          }
          searchInput={searchInput}
          onSearchInputChange={setSearchInput}
        />
        <MemberSegmentsTabs
          activeSegment={activeSegment}
          onSegmentChange={handleSegmentChange}
        />
            </CardContent>
          </Card>

        {/* Members Table */}
          <Card className="flex min-h-0 flex-1 flex-col overflow-hidden">
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
          onSort={handleSort}
          onToggleSelect={toggleSelect}
          onToggleSelectAll={toggleSelectAllVisible}
          onPageChange={handlePageChange}
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

      {/* Print QR layout (only mount when something is selected to avoid unexpected print behavior) */}
      {anySelected && (
        <PrintQRModal
          members={members}
          selectedIds={selectedIds}
          onPrintHandlerReady={setPrintHandler}
        />
      )}

      <MemberEditDrawer
        isOpen={isFormOpen}
        formData={formData}
        editingMember={editingMember}
        onFormDataChange={updateFormField}
        onSubmit={handleSubmit}
        onCancel={handleDrawerCancel}
      />
    </div>
  );
}
