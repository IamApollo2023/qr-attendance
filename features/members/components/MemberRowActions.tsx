"use client";

import { MoreVertical } from "lucide-react";
import type { Member } from "@/types";

interface MemberRowActionsProps {
  member: Member;
  isOpen: boolean;
  onToggle: () => void;
  onViewQR: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function MemberRowActions({
  member,
  isOpen,
  onToggle,
  onViewQR,
  onEdit,
  onDelete,
}: MemberRowActionsProps) {
  return (
    <div className="relative text-center">
      <div className="flex justify-center items-center">
        <button
          onClick={onToggle}
          className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="More actions"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>
      {isOpen && (
        <div className="absolute right-4 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
          <button
            onClick={onViewQR}
            className="w-full px-3 py-2 text-xs text-blue-700 hover:bg-blue-50 rounded-t-lg text-left"
          >
            View QR
          </button>
          <button
            onClick={onEdit}
            className="w-full px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 text-left"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="w-full px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-b-lg text-left"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
