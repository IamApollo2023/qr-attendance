import type { MembershipType, ClassificationType } from "@/types";

export interface CreateMemberInput {
  first_name: string;
  middle_name?: string;
  last_name: string;
  province_code?: string;
  province_name?: string;
  city_municipality_code?: string;
  city_municipality_name?: string;
  barangay_code?: string;
  barangay_name?: string;
  birthday: string; // ISO date string (YYYY-MM-DD)
  gender: "male" | "female";
  membership_type: MembershipType;
  classification?: ClassificationType;
  member_id?: string; // Optional, will auto-generate if not provided
}

export interface UpdateMemberInput extends Partial<CreateMemberInput> {}

/**
 * Service for validating member data
 * Single responsibility: Validate member input data
 */
export const memberValidator = {
  /**
   * Validate and normalize membership type
   */
  validateMembershipType(membershipType: string | undefined): MembershipType {
    const normalized = (membershipType?.trim() || "Attendee") as MembershipType;
    if (!["WSAM-LGAM", "LGAM", "WSAM", "Attendee"].includes(normalized)) {
      throw new Error(
        `Invalid membership_type: ${membershipType}. Must be one of: WSAM-LGAM, LGAM, WSAM, Attendee`
      );
    }
    return normalized;
  },

  /**
   * Validate and normalize classification
   */
  validateClassification(
    classification: string | undefined
  ): ClassificationType | undefined {
    if (!classification) return undefined;

    const normalized = classification
      .trim()
      .toUpperCase() as ClassificationType;
    if (!["MEMBER", "WORKER", "PASTOR", "ATTENDEE"].includes(normalized)) {
      throw new Error(
        `Invalid classification: ${classification}. Must be one of: MEMBER, WORKER, PASTOR, ATTENDEE`
      );
    }
    return normalized;
  },

  /**
   * Normalize member input for creation
   */
  normalizeCreateInput(input: CreateMemberInput): {
    membership_type: MembershipType;
    classification?: ClassificationType;
  } {
    return {
      membership_type: this.validateMembershipType(input.membership_type),
      classification: this.validateClassification(input.classification),
    };
  },

  /**
   * Normalize member input for update
   */
  normalizeUpdateInput(input: UpdateMemberInput): {
    membership_type?: MembershipType;
    classification?: ClassificationType;
  } {
    const result: {
      membership_type?: MembershipType;
      classification?: ClassificationType;
    } = {};

    if (input.membership_type !== undefined) {
      result.membership_type = this.validateMembershipType(
        input.membership_type
      );
    }

    if (input.classification !== undefined) {
      result.classification = this.validateClassification(input.classification);
    }

    return result;
  },
};
