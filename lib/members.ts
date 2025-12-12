import { supabase } from "./supabase";
import type { Member, MembershipType, ClassificationType } from "@/types";

// Re-export for backward compatibility
export type { Member };

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

/**
 * Get next member ID in sequence (JIL-LUNA-001 format)
 */
export async function getNextMemberId(): Promise<string> {
  const { data, error } = await supabase.rpc("get_next_member_id");

  if (error) {
    console.error("Error getting next member ID:", error);
    // Fallback: generate based on timestamp
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `JIL-LUNA-${timestamp}-${random}`;
  }

  return data || `JIL-LUNA-${Date.now()}`;
}

/**
 * Create a new member
 */
export async function createMember(input: CreateMemberInput): Promise<Member> {
  let memberId = input.member_id;

  // Auto-generate member ID if not provided
  if (!memberId) {
    memberId = await getNextMemberId();
  }

  // Normalize membership_type to ensure it matches DB constraint
  const normalizedMembershipType = (input.membership_type?.trim() ||
    "Attendee") as MembershipType;
  if (
    !["WSAM-LGAM", "LGAM", "WSAM", "Attendee"].includes(
      normalizedMembershipType
    )
  ) {
    throw new Error(
      `Invalid membership_type: ${input.membership_type}. Must be one of: WSAM-LGAM, LGAM, WSAM, Attendee`
    );
  }

  // Normalize classification if provided
  const normalizedClassification = input.classification
    ?.trim()
    .toUpperCase() as ClassificationType | undefined;
  if (
    normalizedClassification &&
    !["MEMBER", "WORKER", "PASTOR", "ATTENDEE"].includes(
      normalizedClassification
    )
  ) {
    throw new Error(
      `Invalid classification: ${input.classification}. Must be one of: MEMBER, WORKER, PASTOR, ATTENDEE`
    );
  }

  const { data, error } = await supabase
    .from("members")
    .insert({
      member_id: memberId,
      first_name: input.first_name,
      middle_name: input.middle_name,
      last_name: input.last_name,
      province_code: input.province_code,
      province_name: input.province_name,
      city_municipality_code: input.city_municipality_code,
      city_municipality_name: input.city_municipality_name,
      barangay_code: input.barangay_code,
      barangay_name: input.barangay_name,
      birthday: input.birthday,
      gender: input.gender,
      membership_type: normalizedMembershipType,
      classification: normalizedClassification,
      // age_category will be auto-calculated by trigger
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as Member;
}

/**
 * Get member by member_id
 */
export async function getMemberByMemberId(
  memberId: string
): Promise<Member | null> {
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .eq("member_id", memberId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null; // Not found
    }
    throw error;
  }

  return data as Member;
}

/**
 * Get all members
 */
export async function getAllMembers(): Promise<Member[]> {
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data || []) as Member[];
}

/**
 * Update a member
 */
export async function updateMember(
  id: string,
  input: Partial<CreateMemberInput>
): Promise<Member> {
  // Normalize membership_type if provided
  const updateData: any = { ...input };
  if (updateData.membership_type) {
    const normalized = updateData.membership_type.trim();
    if (!["WSAM-LGAM", "LGAM", "WSAM", "Attendee"].includes(normalized)) {
      throw new Error(
        `Invalid membership_type: ${updateData.membership_type}. Must be one of: WSAM-LGAM, LGAM, WSAM, Attendee`
      );
    }
    updateData.membership_type = normalized;
  }

  // Normalize classification if provided
  if (updateData.classification) {
    const normalized = updateData.classification.trim().toUpperCase();
    if (!["MEMBER", "WORKER", "PASTOR", "ATTENDEE"].includes(normalized)) {
      throw new Error(
        `Invalid classification: ${updateData.classification}. Must be one of: MEMBER, WORKER, PASTOR, ATTENDEE`
      );
    }
    updateData.classification = normalized;
  }

  const { data, error } = await supabase
    .from("members")
    .update({
      ...updateData,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as Member;
}

/**
 * Get member by ID (UUID)
 */
export async function getMemberById(id: string): Promise<Member | null> {
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null; // Not found
    }
    throw error;
  }

  return data as Member;
}

/**
 * Delete a member
 */
export async function deleteMember(id: string): Promise<void> {
  const { error } = await supabase.from("members").delete().eq("id", id);

  if (error) {
    throw error;
  }
}

/**
 * Bulk import members from CSV data
 */
export async function bulkImportMembers(
  members: CreateMemberInput[]
): Promise<{ success: number; errors: string[] }> {
  const errors: string[] = [];
  let success = 0;

  for (const member of members) {
    try {
      await createMember(member);
      success++;
    } catch (error: any) {
      errors.push(`${member.first_name} ${member.last_name}: ${error.message}`);
    }
  }

  return { success, errors };
}
