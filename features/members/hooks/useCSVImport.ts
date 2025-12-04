import { useCallback } from "react";
import { bulkImportMembers } from "@/lib";
import type { CreateMemberInput } from "@/lib/members";

interface UseCSVImportProps {
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
  onPartialSuccess?: (success: number, errors: string[]) => void;
}

/**
 * Hook for handling CSV import functionality
 */
export function useCSVImport({
  onSuccess,
  onError,
  onPartialSuccess,
}: UseCSVImportProps = {}) {
  const handleFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const lines = text.split("\n").filter((line) => line.trim());

        if (lines.length < 2) {
          throw new Error("CSV must have at least a header row and one data row");
        }

        const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

        // Expected headers: first_name, last_name, province_code, city_municipality_code, barangay_code, birthday, gender, membership_type
        const requiredHeaders = [
          "first_name",
          "last_name",
          "province_code",
          "city_municipality_code",
          "barangay_code",
          "birthday",
          "gender",
          "membership_type",
        ];
        const missingHeaders = requiredHeaders.filter(
          (h) => !headers.includes(h)
        );

        if (missingHeaders.length > 0) {
          throw new Error(
            `Missing required columns: ${missingHeaders.join(", ")}`
          );
        }

        const membersToImport: CreateMemberInput[] = [];

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(",").map((v) => v.trim());
          const row: any = {};

          headers.forEach((header, index) => {
            row[header] = values[index] || "";
          });

          if (
            !row.first_name ||
            !row.last_name ||
            !row.province_code ||
            !row.city_municipality_code ||
            !row.barangay_code ||
            !row.birthday ||
            !row.gender ||
            !row.membership_type
          ) {
            continue; // Skip incomplete rows
          }

          // Validate gender
          const gender = row.gender.toLowerCase();
          if (gender !== "male" && gender !== "female") {
            continue; // Skip invalid gender
          }

          // Normalize membership_type: map old values to new simplified values
          let membership_type = row.membership_type.trim().toUpperCase();
          if (
            membership_type === "MEMBER (SELDOMLY ATTENDS)" ||
            membership_type === "MEMBER (REGULARLY ATTENDS)"
          ) {
            membership_type = "MEMBER";
          }
          // Validate membership_type
          if (!["MEMBER", "WORKER", "PASTOR"].includes(membership_type)) {
            continue; // Skip invalid membership type
          }

          // Format birthday (expecting YYYY-MM-DD)
          let birthday = row.birthday;
          if (birthday.includes("/")) {
            // Convert MM/DD/YYYY or DD/MM/YYYY to YYYY-MM-DD
            const parts = birthday.split("/");
            if (parts.length === 3) {
              birthday = `${parts[2]}-${parts[0].padStart(
                2,
                "0"
              )}-${parts[1].padStart(2, "0")}`;
            }
          }

          membersToImport.push({
            first_name: row.first_name,
            last_name: row.last_name,
            province_code: row.province_code,
            city_municipality_code: row.city_municipality_code,
            barangay_code: row.barangay_code,
            birthday: birthday,
            gender: gender as "male" | "female",
            membership_type: membership_type as "MEMBER" | "WORKER" | "PASTOR",
            member_id: row.member_id || undefined,
          });
        }

        if (membersToImport.length === 0) {
          throw new Error("No valid members found in CSV");
        }

        const result = await bulkImportMembers(membersToImport);

        if (result.errors.length > 0) {
          onPartialSuccess?.(result.success, result.errors);
        } else {
          onSuccess?.(`Imported ${result.success} members successfully`);
        }
      } catch (error: any) {
        console.error("Failed to import CSV:", error);
        const errorMessage =
          error?.message || "Failed to import CSV file";
        onError?.(errorMessage);
      }
    },
    [onSuccess, onError, onPartialSuccess]
  );

  return {
    handleFileUpload,
  };
}




