"use client";

import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import type { Member } from "@/types";
import type { SortConfig, SortKey, PaginationInfo } from "../types/member.types";
import { MemberRowActions } from "./MemberRowActions";
import { formatTimestamp } from "../utils/dateFormatters";

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
  onSort: (key: SortKey) => void;
  onToggleSelect: (memberId: string) => void;
  onToggleSelectAll: () => void;
  onPageChange: (page: number) => void;
  onSetOpenActionRowId: (id: string | null) => void;
  onViewQR: (member: Member) => void;
  onEdit: (member: Member) => void;
  onDelete: (member: Member) => void;
}

const formatBirthday = (dateString: string) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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
  onSort,
  onToggleSelect,
  onToggleSelectAll,
  onPageChange,
  onSetOpenActionRowId,
  onViewQR,
  onEdit,
  onDelete,
}: MemberTableProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex-1 flex flex-col min-h-0">
        <div className="p-12 text-center flex-1 flex items-center justify-center">
          <div className="text-gray-600">Loading members...</div>
        </div>
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex-1 flex flex-col min-h-0">
        <div className="p-12 text-center flex-1 flex items-center justify-center flex-col">
          <p className="text-gray-700 text-lg">No members found</p>
          <p className="text-gray-500 text-sm mt-2">
            {searchTerm
              ? "Try a different search term"
              : "Register your first member to get started"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex-1 flex flex-col min-h-0">
      <div className="overflow-x-auto flex-1 min-h-0">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left text-gray-700 font-semibold text-xs w-8 mobile:px-2 mobile:py-2">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={onToggleSelectAll}
                  className="h-3.5 w-3.5 text-blue-600 border-gray-300 focus:ring-blue-500"
                  aria-label="Select all visible members"
                />
              </th>
              <th
                className="px-4 py-3 text-left text-gray-700 font-semibold text-xs mobile:px-2 mobile:py-2 cursor-pointer select-none"
                onClick={() => onSort("member_id")}
              >
                <span className="inline-flex items-center gap-1">
                  Member ID
                  {sortConfig?.key === "member_id" &&
                    (sortConfig.direction === "asc" ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    ))}
                </span>
              </th>
              <th
                className="px-4 py-3 text-left text-gray-700 font-semibold text-xs mobile:px-2 mobile:py-2 cursor-pointer select-none"
                onClick={() => onSort("name")}
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
              <th
                className="px-4 py-3 text-left text-gray-700 font-semibold text-xs mobile:px-2 mobile:py-2 mobile:hidden cursor-pointer select-none"
                onClick={() => onSort("address")}
              >
                <span className="inline-flex items-center gap-1">
                  Address
                  {sortConfig?.key === "address" &&
                    (sortConfig.direction === "asc" ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    ))}
                </span>
              </th>
              <th
                className="px-4 py-3 text-left text-gray-700 font-semibold text-xs mobile:px-2 mobile:py-2 cursor-pointer select-none"
                onClick={() => onSort("birthday")}
              >
                <span className="inline-flex items-center gap-1">
                  Birthday
                  {sortConfig?.key === "birthday" &&
                    (sortConfig.direction === "asc" ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    ))}
                </span>
              </th>
              <th
                className="px-4 py-3 text-left text-gray-700 font-semibold text-xs mobile:px-2 mobile:py-2 mobile:hidden cursor-pointer select-none"
                onClick={() => onSort("age_category")}
              >
                <span className="inline-flex items-center gap-1">
                  Age Group
                  {sortConfig?.key === "age_category" &&
                    (sortConfig.direction === "asc" ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    ))}
                </span>
              </th>
              <th
                className="px-4 py-3 text-left text-gray-700 font-semibold text-xs mobile:px-2 mobile:py-2 mobile:hidden cursor-pointer select-none"
                onClick={() => onSort("created_at")}
              >
                <span className="inline-flex items-center gap-1">
                  Created
                  {sortConfig?.key === "created_at" &&
                    (sortConfig.direction === "asc" ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    ))}
                </span>
              </th>
              <th
                className="px-4 py-3 text-left text-gray-700 font-semibold text-xs mobile:px-2 mobile:py-2 mobile:hidden cursor-pointer select-none"
                onClick={() => onSort("updated_at")}
              >
                <span className="inline-flex items-center gap-1">
                  Updated
                  {sortConfig?.key === "updated_at" &&
                    (sortConfig.direction === "asc" ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    ))}
                </span>
              </th>
              <th className="px-4 py-3 text-left text-gray-700 font-semibold text-xs mobile:px-2 mobile:py-2">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {members.map((member) => (
              <tr
                key={member.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-3 mobile:px-2 mobile:py-2">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(member.member_id)}
                    onChange={() => onToggleSelect(member.member_id)}
                    className="h-3.5 w-3.5 text-blue-600 border-gray-300 focus:ring-blue-500"
                    aria-label={`Select ${member.member_id}`}
                  />
                </td>
                <td className="px-4 py-3 text-gray-900 font-mono font-semibold text-xs mobile:px-2 mobile:py-2">
                  {member.member_id}
                </td>
                <td className="px-4 py-3 text-gray-700 text-sm mobile:px-2 mobile:py-2">
                  {member.first_name} {member.last_name}
                </td>
                <td className="px-4 py-3 text-gray-600 text-xs max-w-xs truncate mobile:px-2 mobile:py-2 mobile:hidden">
                  {member.address}
                </td>
                <td className="px-4 py-3 text-gray-600 text-xs mobile:px-2 mobile:py-2">
                  {formatBirthday(member.birthday)}
                </td>
                <td className="px-4 py-3 mobile:px-2 mobile:py-2 mobile:hidden">
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                    {member.age_category}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600 text-xs mobile:px-2 mobile:py-2 mobile:hidden">
                  {formatTimestamp(member.created_at)}
                </td>
                <td className="px-4 py-3 text-gray-600 text-xs mobile:px-2 mobile:py-2 mobile:hidden">
                  {formatTimestamp(member.updated_at)}
                </td>
                <MemberRowActions
                  member={member}
                  isOpen={openActionRowId === member.id}
                  onToggle={() =>
                    onSetOpenActionRowId(
                      openActionRowId === member.id ? null : member.id
                    )
                  }
                  onViewQR={() => {
                    window.open(`/attendee?id=${member.member_id}`, "_blank");
                    onSetOpenActionRowId(null);
                  }}
                  onEdit={() => {
                    onEdit(member);
                    onSetOpenActionRowId(null);
                  }}
                  onDelete={() => {
                    onDelete(member);
                    onSetOpenActionRowId(null);
                  }}
                />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 mobile:px-2 mobile:py-2">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-gray-600 text-xs">
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
                    of {pagination.total} member{pagination.total !== 1 ? "s" : ""}
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

          {!searchTerm && pagination && pagination.totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={!pagination.hasPrevPage || loading}
                className="p-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-xs text-gray-700 px-2">
                Page {pagination.page} of {pagination.totalPages}
              </span>

              <button
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={!pagination.hasNextPage || loading}
                className="p-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

