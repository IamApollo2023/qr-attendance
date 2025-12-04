"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Download, Plus, Edit, Trash2, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, X } from "lucide-react";

import { deleteActivity, type Activity } from "@/lib/activities";
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
  useActivities,
  useActivityForm,
  useActivityFilters,
  useActivitySort,
} from "@/features/activities/hooks";
import { ActivityFilters } from "@/features/activities/components/ActivityFilters";
import { ActivityForm } from "@/features/activities/components/ActivityForm";
import type {
  ActivityFilters as ActivityFiltersType,
  SortConfig,
  SortKey,
} from "@/features/activities/types/activity.types";
import { exportActivitiesToCSV } from "@/features/activities/utils/csvExport";
import type { ActivitiesManagementProps } from "@/features/activities/types/activity.types";

export default function ActivitiesManagement({
  initialData,
}: ActivitiesManagementProps) {
  const router = useRouter();
  const { success, error: showError, showAlert } = useToastContext();

  const [isFormOpen, setIsFormOpen] = useState(false);

  // Activities data management
  const { activities, pagination, loading, loadActivities } = useActivities({
    initialActivities: initialData.activities,
    initialPagination: initialData.pagination,
    onError: (error) => showError("Error", error, 3000),
  });

  // Form management
  const {
    formData,
    editingActivity,
    handleSubmit,
    handleEdit,
    handleCancel,
    updateFormField,
  } = useActivityForm({
    onSuccess: (message) => {
      success(editingActivity ? "Updated!" : "Created!", message, 2000);
      const currentPage = pagination?.page || 1;
      loadActivities(currentPage);
      setIsFormOpen(false);
    },
    onError: (error) => showError("Error", error, 3000),
    onActivityUpdated: () => {
      const currentPage = pagination?.page || 1;
      loadActivities(currentPage);
    },
  });

  // Filters
  const [filters, setFilters] = useState<ActivityFiltersType>({
    searchTerm: "",
    status: "all",
  });

  // Debounced search input for better UX
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    const handle = setTimeout(() => {
      setFilters((prev) => ({ ...prev, searchTerm: searchInput }));
    }, 300);
    return () => clearTimeout(handle);
  }, [searchInput]);

  const { filteredActivities } = useActivityFilters({
    activities,
    filters,
  });

  // Sorting
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const { sortedActivities } = useActivitySort({
    activities: filteredActivities,
    sortConfig,
  });

  // Handlers
  const handlePageChange = useCallback(
    (newPage: number) => {
      if (newPage < 1 || (pagination && newPage > pagination.totalPages))
        return;
      router.push(`/admin/activities?page=${newPage}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [router, pagination]
  );

  const handleDelete = useCallback(
    async (activity: Activity) => {
      const confirmed = await showAlert({
        type: "warning",
        title: "Delete Activity?",
        message: `Are you sure you want to delete "${activity.name}"?`,
        confirmText: "Yes, delete it",
        cancelText: "Cancel",
      });

      if (confirmed) {
        try {
          await deleteActivity(activity.id);
          success("Deleted!", "Activity deleted successfully", 2000);
          const currentPage = pagination?.page || 1;
          loadActivities(currentPage);
        } catch (error) {
          console.error("Failed to delete activity:", error);
          showError("Error", "Failed to delete activity", 3000);
        }
      }
    },
    [showAlert, success, showError, loadActivities, pagination]
  );

  const handleExport = useCallback(() => {
    exportActivitiesToCSV(activities);
  }, [activities]);

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

  const openCreateActivity = () => {
    handleCancel();
    setIsFormOpen(true);
  };

  const handleEditWithDrawer = useCallback(
    (activity: Activity) => {
      handleEdit(activity);
      setIsFormOpen(true);
    },
    [handleEdit]
  );

  const handleDrawerCancel = () => {
    handleCancel();
    setIsFormOpen(false);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
        {/* Header */}
        <div className="flex flex-col gap-3 px-4 sm:flex-row sm:items-center sm:justify-between lg:px-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Activities</h1>
            <p className="text-sm text-muted-foreground">
              Manage church activities and events.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={openCreateActivity}>
              <Plus className="h-4 w-4" />
              <span>Add activity</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleExport}
              disabled={activities.length === 0}
            >
              <Download className="h-4 w-4" />
              <span className="mobile:hidden">Export</span>
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex min-h-0 flex-1 flex-col gap-4 px-4 lg:px-6">
          {/* Search + Filters */}
          <Card>
            <CardContent className="space-y-4 pt-4">
              <ActivityFilters
                filters={filters}
                onFiltersChange={(newFilters) =>
                  setFilters((prev) => ({ ...prev, ...newFilters }))
                }
                searchInput={searchInput}
                onSearchInputChange={setSearchInput}
              />
            </CardContent>
          </Card>

          {/* Activities Table */}
          <Card className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <CardContent className="flex min-h-0 flex-1 flex-col p-0">
              {loading ? (
                <div className="p-12 text-center flex-1 flex items-center justify-center">
                  <div className="text-gray-600">Loading activities...</div>
                </div>
              ) : sortedActivities.length === 0 ? (
                <div className="p-12 text-center flex-1 flex items-center justify-center flex-col">
                  <p className="text-gray-700 text-lg">No activities found</p>
                  <p className="text-gray-500 text-sm mt-2">
                    {filters.searchTerm
                      ? "Try a different search term"
                      : "Create your first activity to get started"}
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex-1 flex flex-col min-h-0">
                  <div className="overflow-x-auto flex-1 min-h-0">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                        <tr>
                          <th
                            className="px-4 py-3 text-left text-gray-700 font-semibold text-xs mobile:px-2 mobile:py-2 cursor-pointer select-none"
                            onClick={() => handleSort("name")}
                          >
                            <span className="inline-flex items-center gap-1">
                              Name
                              {sortConfig?.key === "name" &&
                                (sortConfig.direction === "asc" ? (
                                  <ChevronUp className="w-3 h-3" />
                                ) : (
                                  <ChevronDown className="w-3 h-3" />
                                ))}
                            </span>
                          </th>
                          <th className="px-4 py-3 text-left text-gray-700 font-semibold text-xs mobile:px-2 mobile:py-2 mobile:hidden">
                            Description
                          </th>
                          <th
                            className="px-4 py-3 text-left text-gray-700 font-semibold text-xs mobile:px-2 mobile:py-2 cursor-pointer select-none"
                            onClick={() => handleSort("date")}
                          >
                            <span className="inline-flex items-center gap-1">
                              Date
                              {sortConfig?.key === "date" &&
                                (sortConfig.direction === "asc" ? (
                                  <ChevronUp className="w-3 h-3" />
                                ) : (
                                  <ChevronDown className="w-3 h-3" />
                                ))}
                            </span>
                          </th>
                          <th className="px-4 py-3 text-left text-gray-700 font-semibold text-xs mobile:px-2 mobile:py-2 mobile:hidden">
                            Location
                          </th>
                          <th
                            className="px-4 py-3 text-left text-gray-700 font-semibold text-xs mobile:px-2 mobile:py-2 cursor-pointer select-none"
                            onClick={() => handleSort("status")}
                          >
                            <span className="inline-flex items-center gap-1">
                              Status
                              {sortConfig?.key === "status" &&
                                (sortConfig.direction === "asc" ? (
                                  <ChevronUp className="w-3 h-3" />
                                ) : (
                                  <ChevronDown className="w-3 h-3" />
                                ))}
                            </span>
                          </th>
                          <th className="px-4 py-3 text-right text-gray-700 font-semibold text-xs mobile:px-2 mobile:py-2">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {sortedActivities.map((activity) => (
                          <tr
                            key={activity.id}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-4 py-3 text-sm text-gray-900 mobile:px-2 mobile:py-2">
                              <div className="font-medium">{activity.name}</div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 mobile:px-2 mobile:py-2 mobile:hidden">
                              <div className="max-w-xs truncate">
                                {activity.description || "-"}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 mobile:px-2 mobile:py-2">
                              {formatDate(activity.date)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 mobile:px-2 mobile:py-2 mobile:hidden">
                              {activity.location || "-"}
                            </td>
                            <td className="px-4 py-3 text-sm mobile:px-2 mobile:py-2">
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  activity.status === "active"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {activity.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right text-sm mobile:px-2 mobile:py-2">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleEditWithDrawer(activity)}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                  title="Edit"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(activity)}
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {/* Pagination */}
                  {pagination && pagination.totalPages > 1 && (
                    <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 flex items-center justify-between mobile:flex-col mobile:gap-2">
                      <div className="text-sm text-gray-700 mobile:text-center">
                        Showing {((pagination.page - 1) * pagination.pageSize) + 1} to{" "}
                        {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{" "}
                        {pagination.total} activities
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePageChange(pagination.page - 1)}
                          disabled={!pagination.hasPrevPage}
                          className="p-1.5 text-gray-600 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          aria-label="Previous page"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-sm text-gray-700">
                          Page {pagination.page} of {pagination.totalPages}
                        </span>
                        <button
                          onClick={() => handlePageChange(pagination.page + 1)}
                          disabled={!pagination.hasNextPage}
                          className="p-1.5 text-gray-600 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          aria-label="Next page"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Drawer */}
      {isFormOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-sm"
          onClick={handleDrawerCancel}
        >
          <div
            className="w-full max-w-md h-full bg-gray-50 shadow-xl border-l border-gray-200 flex flex-col p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <ActivityForm
              formData={formData}
              editingActivity={editingActivity}
              onFormDataChange={updateFormField}
              onSubmit={handleSubmit}
              onCancel={handleDrawerCancel}
            />
          </div>
        </div>
      )}
    </div>
  );
}


