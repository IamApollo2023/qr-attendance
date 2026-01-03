// Legacy barrel export for backward compatibility
// All functionality has been moved to focused services:
// - lib/services/memberIdGenerator.ts - ID generation
// - lib/services/memberValidator.ts - Validation logic
// - lib/services/memberService.ts - CRUD operations

import type { Member } from "@/types";
import { memberService } from "./services/memberService";
import { memberIdGenerator } from "./services/memberIdGenerator";
import type {
  CreateMemberInput,
  UpdateMemberInput,
} from "./services/memberValidator";

// Re-export types for backward compatibility
export type { Member };
export type { CreateMemberInput, UpdateMemberInput };

// Re-export functions for backward compatibility
export const getNextMemberId = () => memberIdGenerator.getNextMemberId();
export const createMember = (input: CreateMemberInput) =>
  memberService.createMember(input);
export const getMemberByMemberId = (memberId: string) =>
  memberService.getMemberByMemberId(memberId);
export const getAllMembers = () => memberService.getAllMembers();
export const updateMember = (id: string, input: UpdateMemberInput) =>
  memberService.updateMember(id, input);
export const getMemberById = (id: string) => memberService.getMemberById(id);
export const deleteMember = (id: string) => memberService.deleteMember(id);
export const bulkImportMembers = (members: CreateMemberInput[]) =>
  memberService.bulkImportMembers(members);
