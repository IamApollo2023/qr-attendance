"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MoreVertical } from "lucide-react";
import type { Member } from "@/types";

interface MemberRowActionsProps {
  member: Member;
  isOpen: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function MemberRowActions({
  member,
  isOpen,
  onToggle,
  onEdit,
  onDelete,
}: MemberRowActionsProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ top: 0, right: 0 });

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right,
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node) &&
        !(e.target as HTMLElement).closest("[data-dropdown-menu]")
      ) {
        onToggle();
      }
    };

    const handleScroll = () => {
      if (isOpen && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setPosition({
          top: rect.bottom + 4,
          right: window.innerWidth - rect.right,
        });
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleScroll);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleScroll);
    };
  }, [isOpen, onToggle]);

  const dropdownContent = isOpen ? (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onToggle}
        aria-hidden="true"
      />
      {/* Dropdown */}
      <div
        data-dropdown-menu
        className="fixed w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
        style={{
          top: `${position.top}px`,
          right: `${position.right}px`,
        }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle(); // Close dropdown first
            onEdit();
          }}
          className="w-full px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 rounded-t-lg text-left transition-colors"
        >
          Edit
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle(); // Close dropdown first
            onDelete();
          }}
          className="w-full px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-b-lg text-left transition-colors"
        >
          Delete
        </button>
      </div>
    </>
  ) : null;

  return (
    <div className="relative text-center">
      <div className="flex justify-center items-center">
        <button
          ref={buttonRef}
          onClick={onToggle}
          className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="More actions"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>
      {typeof window !== "undefined" && isOpen
        ? createPortal(dropdownContent, document.body)
        : null}
    </div>
  );
}
