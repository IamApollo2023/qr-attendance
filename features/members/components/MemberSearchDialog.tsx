"use client";

import React, { useMemo } from "react";
import type { Member } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { SearchInput } from "@/components/ui";

interface MemberSearchDialogProps {
  isOpen: boolean;
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  onClose: () => void;
  allMembers: Member[];
  onMemberClick?: (member: Member) => void;
}

export function MemberSearchDialog({
  isOpen,
  searchInput,
  onSearchInputChange,
  onClose,
  allMembers,
  onMemberClick,
}: MemberSearchDialogProps) {
  // Filter members based on dialog search (independent from table filters)
  const filteredMembers = useMemo(() => {
    if (!searchInput.trim()) {
      return [];
    }
    const searchLower = searchInput.toLowerCase();
    return allMembers.filter((member) => {
      const searchTarget =
        `${member.first_name} ${member.middle_name || ""} ${member.last_name} ${member.member_id} ${member.barangay_name || ""} ${member.city_municipality_name || ""}`.toLowerCase();
      return searchTarget.includes(searchLower);
    });
  }, [allMembers, searchInput]);

  const formatAddress = (member: Member) => {
    const barangay = member.barangay_name || "";
    const city = member.city_municipality_name || "";
    if (!barangay && !city) return "—";
    return `${barangay}${barangay && city ? ", " : ""}${city}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Search Members</DialogTitle>
          <DialogDescription>
            Search for members by name, ID, or other details.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 flex-shrink-0">
          <SearchInput
            wrapperClassName="w-full"
            placeholder="Search members..."
            value={searchInput}
            onChange={(e) => onSearchInputChange(e.target.value)}
            autoFocus
          />
        </div>
        <div className="mt-4 flex-1 overflow-y-auto min-h-0">
          {filteredMembers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-gray-600 text-sm md:text-base">
                {searchInput.trim()
                  ? "No members found"
                  : "Start typing to search for members"}
              </p>
              {searchInput.trim() && (
                <p className="text-gray-500 text-xs md:text-sm mt-2">
                  Try a different search term
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredMembers.map((member) => (
                <div
                  key={member.id}
                  onClick={() => {
                    onMemberClick?.(member);
                    onClose();
                  }}
                  className="p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-semibold text-xs md:text-sm text-gray-900">
                          {member.member_id}
                        </span>
                        <span className="px-1.5 md:px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] md:text-xs font-medium">
                          {member.age_category}
                        </span>
                      </div>
                      <p className="text-sm md:text-base font-medium text-gray-900">
                        {member.first_name} {member.middle_name}{" "}
                        {member.last_name}
                      </p>
                      <p className="text-xs md:text-sm text-gray-600 mt-1 truncate">
                        {formatAddress(member)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
