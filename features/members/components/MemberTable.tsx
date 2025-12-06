"use client";

import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import type { Member } from "@/types";
import type {
  SortConfig,
  SortKey,
  PaginationInfo,
} from "../types/member.types";
import { MemberRowActions } from "./MemberRowActions";

interface MemberTableProps {
  members: Member[];
  totalMembers: number; // Total unfiltered count
  loading: boolean;
  searchTerm: string;
  pagination: PaginationInfo | null;
  sortConfig: SortConfig | null;
  selectedIds: string[];
  openActionRowId: string | null;
  allVisibleSelected: boolean;
  hideAgeGroup?: boolean; // Hide Age Group column when specific tab is selected
  onSort: (key: SortKey) => void;
  onToggleSelect: (memberId: string) => void;
  onToggleSelectAll: () => void;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onSetOpenActionRowId: (id: string | null) => void;
  onEdit: (member: Member) => void;
  onDelete: (member: Member) => void;
}

const formatAddress = (member: Member) => {
  const barangay = member.barangay_name || "";
  const city = member.city_municipality_name || "";
  if (!barangay && !city) return "—";
  return `${barangay}${barangay && city ? ", " : ""}${city}`;
};

// Generate page numbers to display with ellipsis
const getPageNumbers = (
  currentPage: number,
  totalPages: number
): (number | string)[] => {
  const delta = 2; // Number of pages to show on each side of current page
  const range: (number | string)[] = [];
  const rangeWithDots: (number | string)[] = [];

  // Always show first page
  range.push(1);

  // Calculate start and end of range around current page
  let start = Math.max(2, currentPage - delta);
  let end = Math.min(totalPages - 1, currentPage + delta);

  // Adjust if we're near the start
  if (currentPage <= delta + 1) {
    end = Math.min(2 * delta + 2, totalPages - 1);
  }

  // Adjust if we're near the end
  if (currentPage >= totalPages - delta) {
    start = Math.max(2, totalPages - 2 * delta - 1);
  }

  // Add ellipsis before range if needed
  if (start > 2) {
    range.push("...");
  }

  // Add page numbers in range
  for (let i = start; i <= end; i++) {
    range.push(i);
  }

  // Add ellipsis after range if needed
  if (end < totalPages - 1) {
    range.push("...");
  }

  // Always show last page if there's more than one page
  if (totalPages > 1) {
    range.push(totalPages);
  }

  // Remove duplicates and clean up
  range.forEach((item, index) => {
    if (index === 0 || item !== range[index - 1]) {
      rangeWithDots.push(item);
    }
  });

  return rangeWithDots;
};

export function MemberTable({
  members,
  totalMembers,
  loading,
  searchTerm,
  pagination,
  sortConfig,
  selectedIds,
  openActionRowId,
  allVisibleSelected,
  hideAgeGroup = false,
  onSort,
  onToggleSelect,
  onToggleSelectAll,
  onPageChange,
  onPageSizeChange,
  onSetOpenActionRowId,
  onEdit,
  onDelete,
}: MemberTableProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex-1 flex flex-col min-h-0">
        <div className="p-6 md:p-12 text-center flex-1 flex items-center justify-center">
          <div className="text-gray-600 text-sm md:text-base">
            Loading members...
          </div>
        </div>
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex-1 flex flex-col min-h-0">
        <div className="p-6 md:p-12 text-center flex-1 flex items-center justify-center flex-col">
          <p className="text-gray-700 text-sm md:text-lg">No members found</p>
          <p className="text-gray-500 text-xs md:text-sm mt-2">
            {searchTerm
              ? "Try a different search term"
              : "Register your first member to get started"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 flex-1 flex flex-col min-h-0">
      <div
        className="overflow-x-auto overflow-y-hidden flex-1 min-h-0 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-gray-400"
        style={{ scrollbarWidth: "thin", scrollbarColor: "#cbd5e1 #f1f5f9" }}
      >
        <table
          className="w-full min-w-full"
          style={{ tableLayout: "auto", width: "100%" }}
        >
          <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
            <tr>
              <th
                className="px-4 py-2 md:px-4 md:py-3 text-left text-gray-700 font-semibold text-[10px] md:text-xs cursor-pointer select-none"
                onClick={() => onSort("member_id")}
              >
                <span className="inline-flex items-center gap-0.5 md:gap-1">
                  Member ID
                  {sortConfig?.key === "member_id" &&
                    (sortConfig.direction === "asc" ? (
                      <ChevronUp className="w-2.5 h-2.5 md:w-3 md:h-3" />
                    ) : (
                      <ChevronDown className="w-2.5 h-2.5 md:w-3 md:h-3" />
                    ))}
                </span>
              </th>
              <th
                className="px-4 py-2 md:px-4 md:py-3 text-left text-gray-700 font-semibold text-[10px] md:text-xs cursor-pointer select-none"
                onClick={() => onSort("first_name")}
              >
                <span className="inline-flex items-center gap-0.5 md:gap-1">
                  First Name
                  {sortConfig?.key === "first_name" &&
                    (sortConfig.direction === "asc" ? (
                      <ChevronUp className="w-2.5 h-2.5 md:w-3 md:h-3" />
                    ) : (
                      <ChevronDown className="w-2.5 h-2.5 md:w-3 md:h-3" />
                    ))}
                </span>
              </th>
              <th
                className="px-4 py-2 md:px-4 md:py-3 text-left text-gray-700 font-semibold text-[10px] md:text-xs cursor-pointer select-none"
                onClick={() => onSort("last_name")}
              >
                <span className="inline-flex items-center gap-0.5 md:gap-1">
                  Last Name
                  {sortConfig?.key === "last_name" &&
                    (sortConfig.direction === "asc" ? (
                      <ChevronUp className="w-2.5 h-2.5 md:w-3 md:h-3" />
                    ) : (
                      <ChevronDown className="w-2.5 h-2.5 md:w-3 md:h-3" />
                    ))}
                </span>
              </th>
              <th
                className="px-4 py-2 md:px-4 md:py-3 text-left text-gray-700 font-semibold text-[10px] md:text-xs mobile:hidden cursor-pointer select-none"
                onClick={() => onSort("address")}
              >
                <span className="inline-flex items-center gap-0.5 md:gap-1">
                  Address
                  {sortConfig?.key === "address" &&
                    (sortConfig.direction === "asc" ? (
                      <ChevronUp className="w-2.5 h-2.5 md:w-3 md:h-3" />
                    ) : (
                      <ChevronDown className="w-2.5 h-2.5 md:w-3 md:h-3" />
                    ))}
                </span>
              </th>
              {!hideAgeGroup && (
                <th
                  className="px-4 py-2 md:px-4 md:py-3 text-left text-gray-700 font-semibold text-[10px] md:text-xs mobile:hidden cursor-pointer select-none"
                  onClick={() => onSort("age_category")}
                >
                  <span className="inline-flex items-center gap-0.5 md:gap-1">
                    Age Group
                    {sortConfig?.key === "age_category" &&
                      (sortConfig.direction === "asc" ? (
                        <ChevronUp className="w-2.5 h-2.5 md:w-3 md:h-3" />
                      ) : (
                        <ChevronDown className="w-2.5 h-2.5 md:w-3 md:h-3" />
                      ))}
                  </span>
                </th>
              )}
              <th className="px-4 py-2 md:px-4 md:py-3 text-left text-gray-700 font-semibold text-[10px] md:text-xs">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {members.map((member) => {
              return (
                <tr
                  key={member.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 text-gray-900 font-mono font-semibold text-[10px] md:text-xs whitespace-nowrap">
                    {member.member_id}
                  </td>
                  <td className="px-4 py-3 text-gray-700 text-xs md:text-sm whitespace-nowrap">
                    {member.first_name}
                  </td>
                  <td className="px-4 py-3 text-gray-700 text-xs md:text-sm whitespace-nowrap">
                    {member.last_name}
                  </td>
                  <td className="px-4 py-2 md:px-4 md:py-3 text-gray-600 text-[10px] md:text-xs max-w-xs truncate mobile:hidden whitespace-nowrap">
                    {formatAddress(member)}
                  </td>
                  {!hideAgeGroup && (
                    <td className="px-4 py-2 md:px-4 md:py-3 mobile:hidden whitespace-nowrap">
                      <span className="px-1.5 md:px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] md:text-xs font-medium">
                        {member.age_category}
                      </span>
                    </td>
                  )}
                  <td className="px-4 py-2 md:px-4 md:py-3 whitespace-nowrap relative">
                    <MemberRowActions
                      member={member}
                      isOpen={openActionRowId === member.id}
                      onToggle={() =>
                        onSetOpenActionRowId(
                          openActionRowId === member.id ? null : member.id
                        )
                      }
                      onEdit={() => {
                        onEdit(member);
                        onSetOpenActionRowId(null);
                      }}
                      onDelete={() => {
                        onDelete(member);
                        onSetOpenActionRowId(null);
                      }}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="px-3 py-2 md:px-4 md:py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-gray-600 text-[10px] md:text-xs">
            {searchTerm ? (
              <>
                Showing {members.length} of {totalMembers} member
                {totalMembers !== 1 ? "s" : ""} (filtered)
              </>
            ) : (
              <>
                {pagination ? (
                  <>
                    Showing {(pagination.page - 1) * pagination.pageSize + 1} to{" "}
                    {Math.min(
                      pagination.page * pagination.pageSize,
                      pagination.total
                    )}{" "}
                    of {pagination.total} member
                    {pagination.total !== 1 ? "s" : ""}
                  </>
                ) : (
                  <>
                    Showing {members.length} member
                    {members.length !== 1 ? "s" : ""}
                  </>
                )}
              </>
            )}
          </p>

          {!searchTerm && pagination && (
            <div className="flex items-center gap-2 flex-wrap justify-center">
              {/* Page size selector */}
              <div className="flex items-center gap-1 md:gap-2">
                <span className="text-[10px] md:text-xs text-gray-600">
                  Show:
                </span>
                <select
                  value={pagination.pageSize}
                  onChange={(e) =>
                    onPageSizeChange?.(parseInt(e.target.value, 10))
                  }
                  className="text-[10px] md:text-xs border border-gray-300 rounded-lg px-1.5 md:px-2 py-1 bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  aria-label="Items per page"
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>

              {pagination.totalPages > 1 && (
                <div className="flex items-center gap-0.5 md:gap-1 flex-wrap justify-center">
                  {/* First page button */}
                  <button
                    onClick={() => onPageChange(1)}
                    disabled={pagination.page === 1 || loading}
                    className="p-1 md:p-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="First page"
                  >
                    <ChevronsLeft className="w-3 h-3 md:w-4 md:h-4 text-gray-700" />
                  </button>

                  {/* Previous page button */}
                  <button
                    onClick={() => onPageChange(pagination.page - 1)}
                    disabled={!pagination.hasPrevPage || loading}
                    className="p-1 md:p-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-3 h-3 md:w-4 md:h-4 text-gray-700" />
                  </button>

                  {/* Page number buttons */}
                  <div className="flex items-center gap-0.5 md:gap-1 mx-0.5 md:mx-1">
                    {getPageNumbers(pagination.page, pagination.totalPages).map(
                      (page, index) => {
                        if (page === "...") {
                          return (
                            <span
                              key={`ellipsis-${index}`}
                              className="px-1 md:px-2 text-gray-400 text-[10px] md:text-sm"
                            >
                              ...
                            </span>
                          );
                        }

                        const pageNum = page as number;
                        const isCurrentPage = pageNum === pagination.page;

                        return (
                          <button
                            key={pageNum}
                            onClick={() => onPageChange(pageNum)}
                            disabled={loading}
                            className={`min-w-[24px] md:min-w-[32px] h-6 md:h-8 px-1 md:px-2 text-[10px] md:text-sm font-medium rounded-lg transition-colors ${
                              isCurrentPage
                                ? "bg-blue-600 text-white border border-blue-600 hover:bg-blue-700"
                                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                            aria-label={`Page ${pageNum}`}
                            aria-current={isCurrentPage ? "page" : undefined}
                          >
                            {pageNum}
                          </button>
                        );
                      }
                    )}
                  </div>

                  {/* Next page button */}
                  <button
                    onClick={() => onPageChange(pagination.page + 1)}
                    disabled={!pagination.hasNextPage || loading}
                    className="p-1 md:p-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Next page"
                  >
                    <ChevronRight className="w-3 h-3 md:w-4 md:h-4 text-gray-700" />
                  </button>

                  {/* Last page button */}
                  <button
                    onClick={() => onPageChange(pagination.totalPages)}
                    disabled={
                      pagination.page === pagination.totalPages || loading
                    }
                    className="p-1 md:p-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Last page"
                  >
                    <ChevronsRight className="w-3 h-3 md:w-4 md:h-4 text-gray-700" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
