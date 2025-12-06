"use client";

import React, { useState, useEffect, useRef } from "react";
import type { MemberFormData } from "../types/member.types";
import type { Member } from "@/types";
import { MemberLocationFields } from "@/components/MemberLocationFields";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DateInput } from "@/components/ui/date-input";

interface MemberEditDialogProps {
  isOpen: boolean;
  formData: MemberFormData;
  editingMember: Member | null;
  onFormDataChange: <K extends keyof MemberFormData>(
    field: K,
    value: MemberFormData[K]
  ) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void | Promise<boolean | void>; // Return true to close, false/void to stay open
}

export function MemberEditDialog({
  isOpen,
  formData,
  editingMember,
  onFormDataChange,
  onSubmit,
  onCancel,
}: MemberEditDialogProps) {
  const [internalOpen, setInternalOpen] = useState(isOpen);
  const isClosingRef = useRef(false);

  useEffect(() => {
    if (!isClosingRef.current) {
      setInternalOpen(isOpen);
    }
  }, [isOpen]);

  const handleCancel = async () => {
    isClosingRef.current = true;
    const shouldClose = await onCancel();
    // If onCancel returns true, close the dialog
    // If it returns false or undefined, keep it open
    if (shouldClose === true) {
      setInternalOpen(false);
    }
    isClosingRef.current = false;
  };

  const handleOpenChange = async (open: boolean) => {
    if (!open && !isClosingRef.current) {
      // Intercept close attempt - show confirmation first
      await handleCancel();
    } else if (open) {
      setInternalOpen(true);
    }
  };

  if (!editingMember) return null;

  return (
    <Dialog open={internalOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Member</DialogTitle>
          <DialogDescription>
            Update member information. Fill in all required fields.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-3 mt-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              First Name *
            </label>
            <input
              type="text"
              required
              value={formData.first_name}
              onChange={(e) => onFormDataChange("first_name", e.target.value)}
              className="w-full px-3 py-3 text-base min-h-[44px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 md:py-2 md:text-sm"
              style={{ fontSize: "16px" }}
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
              className="w-full px-3 py-3 text-base min-h-[44px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 md:py-2 md:text-sm"
              style={{ fontSize: "16px" }}
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
              className="w-full px-3 py-3 text-base min-h-[44px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 md:py-2 md:text-sm"
              style={{ fontSize: "16px" }}
            />
          </div>
          <MemberLocationFields
            formData={formData}
            onFormDataChange={onFormDataChange}
          />
          <div className="space-y-3">
            <DateInput
              label="Birthday *"
              required
              value={formData.birthday}
              onChange={(e) => onFormDataChange("birthday", e.target.value)}
            />
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
                className="w-full px-3 py-3 text-base min-h-[44px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white md:py-2 md:text-sm"
                style={{ fontSize: "16px" }}
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
                className="w-full px-3 py-3 text-base min-h-[44px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white md:py-2 md:text-sm"
                style={{ fontSize: "16px" }}
              >
                <option value="">None</option>
                <option value="MEMBER">MEMBER</option>
                <option value="WORKER">WORKER</option>
                <option value="PASTOR">PASTOR</option>
              </select>
            </div>
          </div>
          <DialogFooter className="mt-6 gap-3">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
