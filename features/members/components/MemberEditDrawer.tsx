"use client";

import React from "react";
import type { MemberFormData } from "../types/member.types";
import type { Member } from "@/types";
import { MemberForm } from "./MemberForm";

interface MemberEditDrawerProps {
  isOpen: boolean;
  formData: MemberFormData;
  editingMember: Member | null;
  onFormDataChange: <K extends keyof MemberFormData>(
    field: K,
    value: MemberFormData[K]
  ) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export function MemberEditDrawer({
  isOpen,
  formData,
  editingMember,
  onFormDataChange,
  onSubmit,
  onCancel,
}: MemberEditDrawerProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md h-full bg-gray-50 shadow-xl border-l border-gray-200 flex flex-col p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <MemberForm
          formData={formData}
          editingMember={editingMember}
          onFormDataChange={onFormDataChange}
          onSubmit={onSubmit}
          onCancel={onCancel}
        />
      </div>
    </div>
  );
}






