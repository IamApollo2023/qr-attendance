import { supabase } from "../supabase";
import type { Member } from "@/types";
import { memberIdGenerator } from "./memberIdGenerator";
import {
  memberValidator,
  type CreateMemberInput,
  type UpdateMemberInput,
} from "./memberValidator";

/**
 * Service for member CRUD operations
 * Single responsibility: Handle all database operations for members
 */
export const memberService = {
  /**
   * Create a new member
   */
  async createMember(input: CreateMemberInput): Promise<Member> {
    let memberId = input.member_id;

    // Auto-generate member ID if not provided
    if (!memberId) {
      memberId = await memberIdGenerator.getNextMemberId();
    }

    // Normalize and validate input
    const { membership_type, classification } =
      memberValidator.normalizeCreateInput(input);

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
        membership_type,
        classification,
        // age_category will be auto-calculated by trigger
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as Member;
  },

  /**
   * Get member by member_id
   */
  async getMemberByMemberId(memberId: string): Promise<Member | null> {
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
  },

  /**
   * Get member by ID (UUID)
   */
  async getMemberById(id: string): Promise<Member | null> {
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
  },

  /**
   * Get all members
   */
  async getAllMembers(): Promise<Member[]> {
    const { data, error } = await supabase
      .from("members")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return (data || []) as Member[];
  },

  /**
   * Update a member
   */
  async updateMember(
    id: string,
    input: UpdateMemberInput
  ): Promise<Member> {
    // Normalize and validate input
    const normalized = memberValidator.normalizeUpdateInput(input);

    const updateData: any = { ...input, ...normalized };

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
  },

  /**
   * Delete a member
   */
  async deleteMember(id: string): Promise<void> {
    const { error } = await supabase.from("members").delete().eq("id", id);

    if (error) {
      throw error;
    }
  },

  /**
   * Bulk import members from CSV data
   */
  async bulkImportMembers(
    members: CreateMemberInput[]
  ): Promise<{ success: number; errors: string[] }> {
    const errors: string[] = [];
    let success = 0;

    for (const member of members) {
      try {
        await this.createMember(member);
        success++;
      } catch (error: any) {
        errors.push(
          `${member.first_name} ${member.last_name}: ${error.message}`
        );
      }
    }

    return { success, errors };
  },
};
