"use client";

import { X } from "lucide-react";
import { MemberLocationFields } from "@/components/MemberLocationFields";
import type { MemberFormData } from "../types/member.types";
import type { Member } from "@/types";

interface MemberFormProps {
  formData: MemberFormData;
  editingMember: Member | null;
  onFormDataChange: <K extends keyof MemberFormData>(
    field: K,
    value: MemberFormData[K]
  ) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export function MemberForm({
  formData,
  editingMember,
  onFormDataChange,
  onSubmit,
  onCancel,
}: MemberFormProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 h-full overflow-y-auto flex-1 min-h-0">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">
          {editingMember ? "Edit Member" : "Add Member"}
        </h2>
        {editingMember && (
          <button
            onClick={onCancel}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"
            title="Cancel editing"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            First Name *
          </label>
          <input
            type="text"
            required
            value={formData.first_name}
            onChange={(e) => onFormDataChange("first_name", e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Middle Name
          </label>
          <input
            type="text"
            value={formData.middle_name}
            onChange={(e) => onFormDataChange("middle_name", e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Last Name *
          </label>
          <input
            type="text"
            required
            value={formData.last_name}
            onChange={(e) => onFormDataChange("last_name", e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <MemberLocationFields
          formData={formData}
          onFormDataChange={onFormDataChange}
        />
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Birthday *
            </label>
            <input
              type="date"
              required
              value={formData.birthday}
              onChange={(e) => onFormDataChange("birthday", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <span className="block text-xs font-medium text-gray-700 mb-1">
              Gender *
            </span>
            <div className="flex items-center gap-4">
              <label className="inline-flex items-center gap-1.5 text-xs text-gray-700">
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={formData.gender === "male"}
                  onChange={(e) =>
                    onFormDataChange(
                      "gender",
                      e.target.value as "male" | "female"
                    )
                  }
                  className="h-3.5 w-3.5 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span>Male</span>
              </label>
              <label className="inline-flex items-center gap-1.5 text-xs text-gray-700">
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={formData.gender === "female"}
                  onChange={(e) =>
                    onFormDataChange(
                      "gender",
                      e.target.value as "male" | "female"
                    )
                  }
                  className="h-3.5 w-3.5 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span>Female</span>
              </label>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Membership Type *
            </label>
            <select
              required
              value={formData.membership_type}
              onChange={(e) =>
                onFormDataChange(
                  "membership_type",
                  e.target.value as MemberFormData["membership_type"]
                )
              }
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="WSAM-LGAM">WSAM-LGAM</option>
              <option value="LGAM">LGAM</option>
              <option value="WSAM">WSAM</option>
              <option value="Attendee">Attendee</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Classification
            </label>
            <select
              value={formData.classification || ""}
              onChange={(e) =>
                onFormDataChange(
                  "classification",
                  e.target.value
                    ? (e.target.value as MemberFormData["classification"])
                    : undefined
                )
              }
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">None</option>
              <option value="MEMBER">MEMBER</option>
              <option value="WORKER">WORKER</option>
              <option value="PASTOR">PASTOR</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            className="flex-1 px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            {editingMember ? "Update" : "Add"}
          </button>
          {editingMember && (
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-2 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
