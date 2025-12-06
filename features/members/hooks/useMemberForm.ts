import { useState, useCallback } from "react";
import { createMember, updateMember, type Member } from "@/lib";
import type { MemberFormData } from "../types/member.types";
import type { MembershipType } from "@/types";

interface UseMemberFormProps {
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
  onMemberUpdated?: () => void;
}

/**
 * Hook for managing member form state and submission
 */
export function useMemberForm({
  onSuccess,
  onError,
  onMemberUpdated,
}: UseMemberFormProps = {}) {
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [formData, setFormData] = useState<MemberFormData>({
    first_name: "",
    middle_name: "",
    last_name: "",
    province_code: "",
    province_name: "",
    city_municipality_code: "",
    city_municipality_name: "",
    barangay_code: "",
    barangay_name: "",
    birthday: "",
    gender: "male",
    membership_type: "Attendee",
    member_id: "",
  });

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      try {
        if (editingMember) {
          // Update existing member
          await updateMember(editingMember.id, {
            first_name: formData.first_name,
            middle_name: formData.middle_name || undefined,
            last_name: formData.last_name,
            province_code: formData.province_code || undefined,
            province_name: formData.province_name || undefined,
            city_municipality_code:
              formData.city_municipality_code || undefined,
            city_municipality_name:
              formData.city_municipality_name || undefined,
            barangay_code: formData.barangay_code || undefined,
            barangay_name: formData.barangay_name || undefined,
            birthday: formData.birthday,
            gender: formData.gender,
            membership_type: formData.membership_type as MembershipType,
            classification: formData.classification,
          });

          onSuccess?.("Member updated successfully");
          onMemberUpdated?.();
        } else {
          // Create new member
          await createMember({
            first_name: formData.first_name,
            middle_name: formData.middle_name || undefined,
            last_name: formData.last_name,
            province_code: formData.province_code || undefined,
            province_name: formData.province_name || undefined,
            city_municipality_code:
              formData.city_municipality_code || undefined,
            city_municipality_name:
              formData.city_municipality_name || undefined,
            barangay_code: formData.barangay_code || undefined,
            barangay_name: formData.barangay_name || undefined,
            birthday: formData.birthday,
            gender: formData.gender,
            membership_type: formData.membership_type as MembershipType,
            classification: formData.classification,
            member_id: formData.member_id || undefined, // Auto-generate if empty
          });

          onSuccess?.("Member registered successfully");
          onMemberUpdated?.();
        }

        // Reset form
        resetForm();
      } catch (error: any) {
        console.error("Failed to save member:", error);
        const errorMessage = error?.message || "Failed to save member";
        onError?.(errorMessage);
      }
    },
    [editingMember, formData, onSuccess, onError, onMemberUpdated]
  );

  const handleEdit = useCallback((member: Member) => {
    setEditingMember(member);
    setFormData({
      first_name: member.first_name,
      middle_name: member.middle_name || "",
      last_name: member.last_name,
      province_code: member.province_code || "",
      province_name: member.province_name || "",
      city_municipality_code: member.city_municipality_code || "",
      city_municipality_name: member.city_municipality_name || "",
      barangay_code: member.barangay_code || "",
      barangay_name: member.barangay_name || "",
      birthday: member.birthday.split("T")[0], // Convert to YYYY-MM-DD format
      gender: member.gender,
      membership_type: member.membership_type,
      classification: member.classification,
      member_id: member.member_id,
    });
  }, []);

  const handleCancel = useCallback(() => {
    setEditingMember(null);
    resetForm();
  }, []);

  const resetForm = useCallback(() => {
    setFormData({
      first_name: "",
      middle_name: "",
      last_name: "",
      province_code: "",
      province_name: "",
      city_municipality_code: "",
      city_municipality_name: "",
      barangay_code: "",
      barangay_name: "",
      birthday: "",
      gender: "male",
      membership_type: "Attendee",
      classification: undefined,
      member_id: "",
    });
    setEditingMember(null);
  }, []);

  const updateFormField = useCallback(
    <K extends keyof MemberFormData>(field: K, value: MemberFormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  return {
    formData,
    editingMember,
    handleSubmit,
    handleEdit,
    handleCancel,
    updateFormField,
    setFormData,
  };
}
