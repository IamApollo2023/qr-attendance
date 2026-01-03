import type { MemberFormData } from "../types/member.types";
import type { Member } from "@/lib";

/**
 * Utility functions for member form validation
 * Single responsibility: Validate member form data and check for unsaved changes
 */
export const formValidation = {
  /**
   * Check if form has unsaved changes
   */
  hasUnsavedChanges(
    formData: MemberFormData,
    editingMember: Member | null
  ): boolean {
    // For adding: check if any required fields are filled
    if (!editingMember) {
      return !!(
        formData.first_name ||
        formData.last_name ||
        formData.birthday ||
        formData.province_code ||
        formData.city_municipality_code ||
        formData.barangay_code
      );
    }

    // For editing: check if form differs from original member
    const original = editingMember;
    const originalBirthday = original.birthday
      ? original.birthday.split("T")[0]
      : "";
    return (
      formData.first_name !== original.first_name ||
      formData.middle_name !== (original.middle_name || "") ||
      formData.last_name !== original.last_name ||
      formData.birthday !== originalBirthday ||
      formData.gender !== original.gender ||
      formData.membership_type !== original.membership_type ||
      formData.classification !== (original.classification || undefined) ||
      formData.province_code !== (original.province_code || "") ||
      formData.city_municipality_code !==
        (original.city_municipality_code || "") ||
      formData.barangay_code !== (original.barangay_code || "")
    );
  },
};
